package service

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/repository"
	"github.com/Bobbb00/splitbill-api/pkg/telegram"
)

var (
	ErrExpenseNotFound = errors.New("Expenses not found")
	ErrNotMember       = errors.New("Anda bukan anggota grup ini")
	ErrForbidden       = errors.New("Akses ditolak")
)

type ExpenseService interface {
	CreateExpense(ctx context.Context, groupID, userID int64, req dto.CreateExpenseRequest) (*model.Expense, error)
	ListExpensesByGroup(ctx context.Context, groupID, userID int64) ([]dto.ExpenseResponse, error)
	DeleteExpense(ctx context.Context, groupID, userID, expenseID int64) error
	UpdateExpense(ctx context.Context, groupID, userID, expenseID int64, req dto.CreateExpenseRequest) error
	SettleSplit(ctx context.Context, groupID, userID, expenseID, targetUserID int64) error
}

type expenseService struct {
	expenseRepo repository.ExpenseRepository
	groupRepo   repository.GroupRepository
	userRepo    repository.UserRepository
}

func NewExpenseService(expenseRepo repository.ExpenseRepository, groupRepo repository.GroupRepository, userRepo repository.UserRepository) ExpenseService {
	return &expenseService{expenseRepo: expenseRepo, groupRepo: groupRepo, userRepo: userRepo}
}

func (s *expenseService) CreateExpense(ctx context.Context, groupID, userID int64, req dto.CreateExpenseRequest) (*model.Expense, error) {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrNotMember
	}

	// 1. Validasi Total Split == Total Pengeluaran
	var totalSplit float64
	for _, split := range req.Splits {
		totalSplit += split.Amount
	}
	// Pakai math.Abs untuk mengabaikan selisih desimal sangat kecil (floating point issue)
	if math.Abs(totalSplit-req.Amount) > 0.01 {
		return nil, errors.New("total pembagian (splits) harus sama dengan total pengeluaran")
	}

	expense := &model.Expense{
		GroupID:     groupID,
		PaidBy:      req.PaidBy,
		Description: req.Description,
		Amount:      req.Amount,
		CategoryID:  req.CategoryID,
	}

	// 2. Mapping DTO ke Model
	var expenseSplits []model.ExpenseSplit
	for _, splitReq := range req.Splits {
		expenseSplits = append(expenseSplits, model.ExpenseSplit{
			UserID:     splitReq.UserID,
			AmountOwed: splitReq.Amount,
			IsPaid:     splitReq.UserID == req.PaidBy, // otomatis lunas jika dia yang nalangin
		})
	}

	createdExpense, err := s.expenseRepo.Create(ctx, expense, expenseSplits)
	if err != nil {
		return nil, err
	}

	go func() {
		// 1. Cari tahu nama orang yang menalangi (Payer)
		payer, err := s.userRepo.FindByID(context.Background(), req.PaidBy)
		payerName := "Seseorang"
		if err == nil && payer != nil {
			payerName = payer.Name
		}
		// 2. Looping kirim pesan
		for _, split := range expenseSplits {
			if split.IsPaid {
				continue
			}
			user, err := s.userRepo.FindByID(context.Background(), split.UserID)
			if err != nil {
				continue
			}
			if user.TelegramChatID == nil {
				continue
			}
			// 3. Update isi pesannya!
			msg := fmt.Sprintf("💸 Hei %s!\n\nAda tagihan baru sebesar Rp%.0f untuk '%s'.\n\nYuk segera dilunasin dan bayar ke: *%s* ya!",
				user.Name, split.AmountOwed, createdExpense.Description, payerName)

			_ = telegram.SendMessage(*user.TelegramChatID, msg)
		}
	}()

	return createdExpense, nil
}

func (s *expenseService) ListExpensesByGroup(ctx context.Context, groupID, userID int64) ([]dto.ExpenseResponse, error) {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrNotMember
	}

	return s.expenseRepo.ListByGroup(ctx, groupID)
}

func (s *expenseService) DeleteExpense(ctx context.Context, groupID, userID, expenseID int64) error {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return err
	}

	if !isMember {
		return ErrForbidden
	}

	return s.expenseRepo.DeleteExpense(ctx, expenseID)
}

func (s *expenseService) UpdateExpense(ctx context.Context, groupID, userID, expenseID int64, req dto.CreateExpenseRequest) error {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return ErrNotMember
	}

	// 1. Validasi Total Split == Total Pengeluaran
	var totalSplit float64
	for _, split := range req.Splits {
		totalSplit += split.Amount
	}
	// Pakai math.Abs untuk mengabaikan selisih desimal sangat kecil (floating point issue)
	if math.Abs(totalSplit-req.Amount) > 0.01 {
		return errors.New("total pembagian (splits) harus sama dengan total pengeluaran")
	}

	expense := &model.Expense{
		ID:          expenseID, // PENTING: Harus ada ID untuk Update
		GroupID:     groupID,
		PaidBy:      req.PaidBy,
		Description: req.Description,
		Amount:      req.Amount,
		CategoryID:  req.CategoryID,
	}

	// 2. Mapping DTO ke Model
	var expenseSplits []model.ExpenseSplit
	for _, splitReq := range req.Splits {
		expenseSplits = append(expenseSplits, model.ExpenseSplit{
			UserID:     splitReq.UserID,
			AmountOwed: splitReq.Amount,
			IsPaid:     splitReq.UserID == req.PaidBy, // otomatis lunas jika dia yang nalangin
		})
	}

	// PENTING: Panggil UpdateExpense, bukan Create
	return s.expenseRepo.UpdateExpense(ctx, expense, expenseSplits)
}

func (s *expenseService) SettleSplit(ctx context.Context, groupID, userID, expenseID, targetUserID int64) error {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return err
	}
	if !isMember {
		return ErrNotMember
	}

	return s.expenseRepo.SettleSplit(ctx, expenseID, targetUserID)
}
