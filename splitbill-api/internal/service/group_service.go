package service

import (
	"context"
	"crypto/rand"
	"errors"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/repository"
)

var (
	ErrInvalidInviteCode = errors.New("Invite code tidak valid atau grup tidak ditemukan")
	ErrForbiddenAccess   = errors.New("Akses Ditolak! anda bukan anggota grup ini")
	ErrSelfRemoval       = errors.New("Tidak bisa menghapus diri sendiri")
)

type GroupService interface {
	CreateGroup(ctx context.Context, userID int64, name, description string) (*model.Group, error)
	JoinGroup(ctx context.Context, userID int64, inviteCode string) error
	ListGroupByUser(ctx context.Context, userID int64) ([]*model.Group, error)
	GetGroupDetail(ctx context.Context, groupID, userID int64) (*model.Group, []dto.GroupMemberResponse, error)
	RemoveMember(ctx context.Context, adminID, groupID, memberID int64) error
	RegenerateInviteCode(ctx context.Context, adminID, groupID int64) (string, error)
	DeleteGroup(ctx context.Context, adminID, groupID int64) error
}

type groupService struct {
	groupRepo repository.GroupRepository
}

func NewGroupService(groupRepo repository.GroupRepository) GroupService {
	return &groupService{groupRepo: groupRepo}
}

func generateInviteCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	rand.Read(b)
	for i := range b {
		b[i] = charset[int(b[i])%len(charset)]
	}
	return string(b)
}

func (s *groupService) ListGroupByUser(ctx context.Context, userID int64) ([]*model.Group, error) {
	return s.groupRepo.ListByUserID(ctx, userID)
}

func (s *groupService) CreateGroup(ctx context.Context, userID int64, name, description string) (*model.Group, error) {
	inviteCode := generateInviteCode()
	group := &model.Group{
		Name:        name,
		Description: description,
		InviteCode:  inviteCode,
		CreatedBy:   userID,
	}

	groupID, err := s.groupRepo.Create(ctx, group)
	if err != nil {
		return nil, err
	}
	group.ID = groupID

	member := &model.GroupMember{
		GroupID: groupID,
		UserID:  userID,
		Role:    "admin",
	}
	if err := s.groupRepo.AddMember(ctx, member); err != nil {
		return nil, err
	}

	return group, nil
}

func (s *groupService) JoinGroup(ctx context.Context, userID int64, inviteCode string) error {
	group, err := s.groupRepo.FindByInviteCode(ctx, inviteCode)
	if err != nil {
		if errors.Is(err, repository.ErrGroupNotFound) {
			return ErrInvalidInviteCode
		}
		return err
	}

	member := &model.GroupMember{
		GroupID: group.ID,
		UserID:  userID,
		Role:    "member",
	}

	if err := s.groupRepo.AddMember(ctx, member); err != nil {
		return err
	}
	return nil
}

func (s *groupService) GetGroupDetail(ctx context.Context, groupID int64, userID int64) (*model.Group, []dto.GroupMemberResponse, error) {
	isMember, err := s.groupRepo.IsMember(ctx, groupID, userID)

	if err != nil {
		return nil, nil, err

	}
	if !isMember {
		return nil, nil, ErrForbiddenAccess
	}

	group, err := s.groupRepo.FindByID(ctx, groupID)
	if err != nil {
		return nil, nil, err
	}

	members, err := s.groupRepo.ListMembers(ctx, groupID)
	if err != nil {
		return nil, nil, err
	}

	return group, members, nil
}

func (s *groupService) RemoveMember(ctx context.Context, requesterID, groupID, memberID int64) error {

	if requesterID == memberID {
		isMember, err := s.groupRepo.IsMember(ctx, groupID, requesterID)
		if err != nil {
			return err
		}
		if !isMember {
			return ErrForbiddenAccess
		}
		return s.groupRepo.RemoveMember(ctx, groupID, requesterID)
	}

	role, err := s.groupRepo.GetMemberRole(ctx, groupID, requesterID)
	if err != nil {
		return err
	}

	if role != "admin" {
		return ErrForbiddenAccess
	}

	return s.groupRepo.RemoveMember(ctx, groupID, memberID)
}

func (s *groupService) RegenerateInviteCode(ctx context.Context, adminID, groupID int64) (string, error) {
	role, err := s.groupRepo.GetMemberRole(ctx, groupID, adminID)
	if err != nil {
		return "", err
	}

	if role != "admin" {
		return "", ErrForbiddenAccess
	}

	newCode := generateInviteCode()

	if err := s.groupRepo.UpdateInviteCode(ctx, groupID, newCode); err != nil {
		return "", err
	}

	return newCode, nil
}

func (s *groupService) DeleteGroup(ctx context.Context, adminID, groupID int64) error {
	role, err := s.groupRepo.GetMemberRole(ctx, groupID, adminID)
	if err != nil {
		return err
	}

	if role != "admin" {
		return ErrForbiddenAccess
	}

	return s.groupRepo.DeleteGroup(ctx, groupID)
}
