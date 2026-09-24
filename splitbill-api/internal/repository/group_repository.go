package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
)

var (
	ErrGroupNotFound = errors.New("Group Not Found")
)

type GroupRepository interface {
	Create(ctx context.Context, group *model.Group) (int64, error)
	FindByInviteCode(ctx context.Context, inviteCode string) (*model.Group, error)
	AddMember(ctx context.Context, member *model.GroupMember) error
	ListByUserID(ctx context.Context, userID int64) ([]*model.Group, error)
	FindByID(ctx context.Context, id int64) (*model.Group, error)
	ListMembers(ctx context.Context, groupID int64) ([]dto.GroupMemberResponse, error)
	IsMember(ctx context.Context, groupID, userID int64) (bool, error)
	RemoveMember(ctx context.Context, groupID, userID int64) error
	UpdateInviteCode(ctx context.Context, groupID int64, newCode string) error
	GetMemberRole(ctx context.Context, groupID, userID int64) (string, error)
	DeleteGroup(ctx context.Context, groupID int64) error
}

type groupRepository struct {
	db *sql.DB
}

func NewGroupRepository(db *sql.DB) GroupRepository {
	return &groupRepository{db: db}
}

func (r *groupRepository) IsMember(ctx context.Context, groupID, userID int64) (bool, error) {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?)"
	err := r.db.QueryRowContext(ctx, query, groupID, userID).Scan(&exists)
	return exists, err
}

func (r *groupRepository) RemoveMember(ctx context.Context, groupID, userID int64) error {
	query := "DELETE FROM group_members WHERE group_id = ? AND user_id = ?"
	_, err := r.db.ExecContext(ctx, query, groupID, userID)
	return err
}

func (r *groupRepository) UpdateInviteCode(ctx context.Context, groupID int64, newCode string) error {
	query := "UPDATE `groups` SET `invite_code` = ? WHERE `id` = ?"
	_, err := r.db.ExecContext(ctx, query, newCode, groupID)
	return err
}

func (r *groupRepository) GetMemberRole(ctx context.Context, groupID, userID int64) (string, error) {
	var role string
	query := "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?"
	err := r.db.QueryRowContext(ctx, query, groupID, userID).Scan(&role)
	return role, err
}

func (r *groupRepository) Create(ctx context.Context, group *model.Group) (int64, error) {
	query := "INSERT INTO `groups` (name, description, invite_code, created_by) VALUES (?, ?, ?, ?)"
	result, err := r.db.ExecContext(ctx, query, group.Name, group.Description, group.InviteCode, group.CreatedBy)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (r *groupRepository) FindByInviteCode(ctx context.Context, inviteCode string) (*model.Group, error) {
	var group model.Group
	query := "SELECT id, name, description, invite_code, created_by, created_at, updated_at FROM `groups` WHERE invite_code = ?"
	err := r.db.QueryRowContext(ctx, query, inviteCode).Scan(&group.ID, &group.Name, &group.Description, &group.InviteCode, &group.CreatedBy, &group.CreatedAt, &group.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (r *groupRepository) AddMember(ctx context.Context, member *model.GroupMember) error {
	query := `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, member.GroupID, member.UserID, member.Role)
	if err != nil {
		return err
	}
	return nil
}

func (r *groupRepository) ListByUserID(ctx context.Context, userID int64) ([]*model.Group, error) {
	query := "SELECT g.id, g.name, g.description, g.invite_code, g.created_by, g.created_at, g.updated_at FROM `groups` g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ?"

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []*model.Group
	for rows.Next() {
		var g model.Group
		err := rows.Scan(&g.ID, &g.Name, &g.Description, &g.InviteCode, &g.CreatedBy, &g.CreatedAt, &g.UpdatedAt)
		if err != nil {
			return nil, err
		}
		groups = append(groups, &g)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	return groups, nil
}

func (r *groupRepository) FindByID(ctx context.Context, id int64) (*model.Group, error) {
	var group model.Group
	query := "SELECT id, name, description, invite_code, created_by, created_at, updated_at FROM `groups` WHERE id = ?"
	err := r.db.QueryRowContext(ctx, query, id).Scan(&group.ID, &group.Name, &group.Description, &group.InviteCode, &group.CreatedBy, &group.CreatedAt, &group.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (r *groupRepository) ListMembers(ctx context.Context, groupID int64) ([]dto.GroupMemberResponse, error) {
	query := `
	SELECT 
    u.id, 
    u.name, 
    u.email, 
    gm.role 
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
	`

	rows, err := r.db.QueryContext(ctx, query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []dto.GroupMemberResponse
	for rows.Next() {
		var m dto.GroupMemberResponse
		err := rows.Scan(&m.UserID, &m.Name, &m.Email, &m.Role)
		if err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return members, nil
}

func (r *groupRepository) DeleteGroup(ctx context.Context, groupID int64) error {
	query := "DELETE FROM `groups` WHERE id = ?"
	_, err := r.db.ExecContext(ctx, query, groupID)
	if err != nil {
		return err
	}
	return nil
}
