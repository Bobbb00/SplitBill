package model

import "time"

type User struct {
	ID             int64     `db:"id" json:"id"`
	Name           string    `db:"name" json:"name"`
	Email          string    `db:"email" json:"email"`
	PasswordHash   string    `db:"password_hash" json:"-"`
	AvatarURL      *string   `db:"avatar_url" json:"avatar_url"`
	TelegramChatID *string   `db:"telegram_chat_id" json:"telegram_chat_id,omitempty"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	UpdatedAt      time.Time `db:"updated_at" json:"updated_at"`
}
