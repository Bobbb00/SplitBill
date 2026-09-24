package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/Bobbb00/splitbill-api/internal/model"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) (int64, error)
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByID(ctx context.Context, id int64) (*model.User, error)
	UpdateTelegramID(ctx context.Context, userID int64, chatID int64) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *model.User) (int64, error) {
	query := `INSERT INTO users(name, email, password_hash) VALUES (?, ?, ?)`
	result, err := r.db.ExecContext(ctx, query, user.Name, user.Email, user.PasswordHash)
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate Entry") {
			return 0, ErrEmailAlreadyExists
		}
		return 0, err
	}
	return result.LastInsertId()

}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	query := `SELECT id, name, email, password_hash, avatar_url, telegram_chat_id, created_at, updated_at FROM users WHERE email = ?`
	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.AvatarURL, &user.TelegramChatID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*model.User, error) {
	var user model.User
	query := `SELECT id, name, email, password_hash, avatar_url, telegram_chat_id, created_at, updated_at FROM users WHERE id = ?`
	err := r.db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.AvatarURL, &user.TelegramChatID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdateTelegramID(ctx context.Context, userID int64, chatID int64) error {
	query := `UPDATE users SET telegram_chat_id = ? WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, chatID, userID)
	return err
}
