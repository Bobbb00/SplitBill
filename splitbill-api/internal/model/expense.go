package model

import "time"

type Expense struct {
	ID          int64     `db:"id" json:"id"`
	GroupID     int64     `db:"group_id" json:"group_id"`
	CategoryID  int64     `db:"category_id" json:"category_id"`
	PaidBy      int64     `db:"paid_by" json:"paid_by"`
	Description string    `db:"description" json:"description"`
	Amount      float64   `db:"amount" json:"amount"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

type ExpenseSplit struct {
	ID         int64   `db:"id" json:"id"`
	ExpenseID  int64   `db:"expense_id" json:"expense_id"`
	UserID     int64   `db:"user_id" json:"user_id"`
	AmountOwed float64 `db:"amount_owed" json:"amount_owed"`
	IsPaid     bool    `db:"is_paid" json:"is_paid"`
}
