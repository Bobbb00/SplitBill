package dto

type CreateExpenseRequest struct {
	Description string               `json:"description" validate:"required,min=3,max=255"`
	CategoryID  int64                `json:"category_id" validate:"required"`
	Amount      float64              `json:"amount" validate:"required,gt=0"`
	PaidBy      int64                `json:"paid_by" validate:"required"`
	Splits      []SplitDetailRequest `json:"splits" validate:"required,min=1,dive"`
}

type ExpenseSplitDetail struct {
	UserID     int64   `json:"user_id"`
	Name       string  `json:"name"`
	AmountOwed float64 `json:"amount_owed"`
	IsPaid     bool    `json:"is_paid"`
}

type ExpenseResponse struct {
	ID          int64                `json:"id"`
	GroupID     int64                `json:"group_id"`
	CategoryID  int64                `json:"category_id"`
	PaidBy      int64                `json:"paid_by"`
	PaidByName  string               `json:"paid_by_name"`
	Description string               `json:"description"`
	Amount      float64              `json:"amount"`
	CreatedAt   string               `json:"created_at"`
	Splits      []ExpenseSplitDetail `json:"splits"`
}

type SplitDetailRequest struct {
	UserID int64   `json:"user_id" validate:"required"`
	Amount float64 `json:"amount" validate:"required,gte=0"`
}
