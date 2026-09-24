package dto

type CreateGroupRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
}

type JoinGroupRequest struct {
	InviteCode string `json:"invite_code" validate:"required,len=6"`
}

type GroupMemberResponse struct {
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}
