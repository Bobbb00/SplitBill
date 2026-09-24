package repository

import (
	"context"
	"database/sql"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
)

type UnpaidReminderInfo struct {
	UserName       string  `db:"user_name"`
	TelegramChatID *string `db:"telegram_chat_id"`
	Description    string  `db:"description"`
	AmountOwed     float64 `db:"amount_owed"`
	PayerName      string  `db:"payer_name"`
}

type ExpenseRepository interface {
	Create(ctx context.Context, expense *model.Expense, splits []model.ExpenseSplit) (*model.Expense, error)
	ListByGroup(ctx context.Context, groupID int64) ([]dto.ExpenseResponse, error)
	DeleteExpense(ctx context.Context, expenseID int64) error
	UpdateExpense(ctx context.Context, expense *model.Expense, splits []model.ExpenseSplit) error
	GetUnpaidSplitOlderThan(ctx context.Context, days int) ([]UnpaidReminderInfo, error)

	SettleSplit(ctx context.Context, expenseID, userID int64) error
}

type expenseRepository struct {
	db *sql.DB
}

func NewExpenseRepository(db *sql.DB) ExpenseRepository {
	return &expenseRepository{db: db}
}

func (r *expenseRepository) Create(ctx context.Context, expense *model.Expense, splits []model.ExpenseSplit) (*model.Expense, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Insert expense
	res, err := tx.ExecContext(ctx, "INSERT INTO expenses (group_id, paid_by, description, amount, category_id) VALUES(?, ?, ?, ?, ?)",
		expense.GroupID, expense.PaidBy, expense.Description, expense.Amount, expense.CategoryID)
	if err != nil {
		return nil, err
	}
	expenseID, _ := res.LastInsertId()
	expense.ID = expenseID

	// Insert splits (langsung pakai nominal dari parameter)
	for _, split := range splits {
		_, err = tx.ExecContext(ctx, "INSERT INTO expense_splits (expense_id, user_id, amount_owed, is_paid) VALUES(?, ?, ?, ?)",
			expenseID, split.UserID, split.AmountOwed, split.IsPaid)
		if err != nil {
			return nil, err
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}
	return expense, nil
}

func (r *expenseRepository) ListByGroup(ctx context.Context, groupID int64) ([]dto.ExpenseResponse, error) {
	query := `SELECT e.id, e.group_id, e.paid_by, u.name, e.description, e.amount, e.category_id, e.created_at FROM expenses e JOIN users u ON e.paid_by = u.id
	WHERE e.group_id = ?
	ORDER BY e.created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var expenses []dto.ExpenseResponse
	for rows.Next() {
		var e dto.ExpenseResponse
		err := rows.Scan(&e.ID, &e.GroupID, &e.PaidBy, &e.PaidByName, &e.Description, &e.Amount, &e.CategoryID, &e.CreatedAt)
		if err != nil {
			return nil, err
		}

		//Get splits
		splits, err := r.listSplitByExpenseID(ctx, e.ID)
		if err != nil {
			return nil, err
		}
		e.Splits = splits

		expenses = append(expenses, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return expenses, nil
}

func (r *expenseRepository) listSplitByExpenseID(ctx context.Context, expenseID int64) ([]dto.ExpenseSplitDetail, error) {
	query := `SELECT es.user_id, u.name, es.amount_owed, es.is_paid FROM expense_splits es JOIN users u ON es.user_id = u.id
	WHERE es.expense_id = ?`
	rows, err := r.db.QueryContext(ctx, query, expenseID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	var splits []dto.ExpenseSplitDetail
	for rows.Next() {
		var s dto.ExpenseSplitDetail
		err := rows.Scan(&s.UserID, &s.Name, &s.AmountOwed, &s.IsPaid)
		if err != nil {
			return nil, err
		}
		splits = append(splits, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return splits, nil
}

func (r *expenseRepository) DeleteExpense(ctx context.Context, expenseID int64) error {

	_, err := r.db.ExecContext(ctx, "DELETE FROM expenses WHERE id = ?", expenseID)
	if err != nil {
		return err
	}
	return nil
}

func (r *expenseRepository) UpdateExpense(ctx context.Context, expense *model.Expense, splits []model.ExpenseSplit) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Update expense
	_, err = tx.ExecContext(ctx, "UPDATE expenses SET description=?, amount=?, paid_by=?, category_id=? WHERE id=?",
		expense.Description, expense.Amount, expense.PaidBy, expense.CategoryID, expense.ID)
	if err != nil {
		return err
	}

	// 2. Delete old splits
	_, err = tx.ExecContext(ctx, "DELETE FROM expense_splits WHERE expense_id=?", expense.ID)
	if err != nil {
		return err
	}

	// 3. Insert new splits
	for _, split := range splits {
		_, err = tx.ExecContext(ctx, "INSERT INTO expense_splits (expense_id, user_id, amount_owed, is_paid) VALUES(?, ?, ?, ?)",
			expense.ID, split.UserID, split.AmountOwed, split.IsPaid)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *expenseRepository) SettleSplit(ctx context.Context, expenseID int64, userID int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, "UPDATE expense_splits SET is_paid = NOT is_paid WHERE expense_id=? AND user_id=?", expenseID, userID)
	if err != nil {
		return err
	}
	return tx.Commit()

}

func (r *expenseRepository) GetUnpaidSplitOlderThan(ctx context.Context, days int) ([]UnpaidReminderInfo, error) {
	query := `
		SELECT 
			u.name AS user_name,
			u.telegram_chat_id,
			e.description,
			es.amount_owed,
			p.name AS payer_name
		FROM expense_splits es
		JOIN expenses e ON es.expense_id = e.id
		JOIN users u ON es.user_id = u.id
		JOIN users p ON e.paid_by = p.id
		WHERE es.is_paid = false 
		  AND u.telegram_chat_id IS NOT NULL 
		  AND e.created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
	`

	// 1. Jalankan Query
	rows, err := r.db.QueryContext(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 2. Petakan hasil baris per baris secara manual
	var results []UnpaidReminderInfo
	for rows.Next() {
		var i UnpaidReminderInfo
		// PENTING: Urutan Scan harus sama persis dengan urutan SELECT di atas!
		err := rows.Scan(
			&i.UserName,
			&i.TelegramChatID,
			&i.Description,
			&i.AmountOwed,
			&i.PayerName,
		)
		if err != nil {
			return nil, err
		}
		results = append(results, i)
	}

	return results, nil
}
