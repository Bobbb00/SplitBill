package repository

import (
	"context"
	"database/sql"

	"github.com/Bobbb00/splitbill-api/internal/model/dto"
)

type DashboardRepository interface {
	GetBalanceSummary(ctx context.Context, groupID, userID int64) (*dto.DashboardSummaryResponse, error)
	GetCategoryBreakdown(ctx context.Context, groupID int64) ([]dto.CategoryBreakdown, error)
	GetMonthlyTrend(ctx context.Context, groupID int64) ([]dto.MonthlyTrend, error)
}

type dashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) DashboardRepository {
	return &dashboardRepository{db: db}
}

func (r *dashboardRepository) GetBalanceSummary(ctx context.Context, groupID, userID int64) (*dto.DashboardSummaryResponse, error) {
	summary := &dto.DashboardSummaryResponse{}

	queryPiutang := `SELECT COALESCE(SUM(es.amount_owed), 0)
		FROM expenses e
		JOIN expense_splits es ON e.id = es.expense_id
		WHERE e.group_id = ? AND e.paid_by = ? AND es.user_id != ? AND es.is_paid = false`

	err := r.db.QueryRowContext(ctx, queryPiutang, groupID, userID, userID).Scan(&summary.TotalPiutang)
	if err != nil {
		return nil, err
	}

	queryUtang := `SELECT COALESCE(SUM(es.amount_owed), 0)
			FROM expenses e
			JOIN expense_splits es ON e.id = es.expense_id
			WHERE e.group_id = ? AND es.user_id = ? AND es.is_paid = false`
	err = r.db.QueryRowContext(ctx, queryUtang, groupID, userID).Scan(&summary.TotalUtang)
	if err != nil {
		return nil, err
	}

	return summary, nil
}
func (r *dashboardRepository) GetCategoryBreakdown(ctx context.Context, groupID int64) ([]dto.CategoryBreakdown, error) {
	query := `
		SELECT c.id, c.name, c.color, COALESCE(SUM(e.amount), 0)
		FROM categories c
		LEFT JOIN expenses e ON c.id = e.category_id AND e.group_id = ?
		GROUP BY c.id, c.name, c.color
		HAVING COALESCE(SUM(e.amount), 0) > 0
		ORDER BY COALESCE(SUM(e.amount), 0) DESC`

	rows, err := r.db.QueryContext(ctx, query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []dto.CategoryBreakdown
	for rows.Next() {
		var b dto.CategoryBreakdown
		if err := rows.Scan(&b.CategoryID, &b.CategoryName, &b.Color, &b.TotalAmount); err != nil {
			return nil, err
		}
		res = append(res, b)
	}
	return res, rows.Err()
}

func (r *dashboardRepository) GetMonthlyTrend(ctx context.Context, groupID int64) ([]dto.MonthlyTrend, error) {
	query := `
		SELECT DATE_FORMAT(created_at, '%b') as month, SUM(amount) as total_amount
		FROM expenses
		WHERE group_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
		GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
		ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC`

	rows, err := r.db.QueryContext(ctx, query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []dto.MonthlyTrend
	for rows.Next() {
		var t dto.MonthlyTrend
		if err := rows.Scan(&t.Month, &t.TotalAmount); err != nil {
			return nil, err
		}
		res = append(res, t)
	}
	return res, rows.Err()
}
