package dto

type DashboardSummaryResponse struct {
	TotalUtang   float64 `json:"total_utang"`
	TotalPiutang float64 `json:"total_piutang"`
}
type CategoryBreakdown struct {
	CategoryID   int64   `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Color        string  `json:"color"`
	TotalAmount  float64 `json:"total_amount"`
}

type MonthlyTrend struct {
	Month       string  `json:"month"`
	TotalAmount float64 `json:"total_amount"`
}

type DashboardChartsResponse struct {
	CategoryBreakdown []CategoryBreakdown `json:"category_breakdown"`
	MonthlyTrend      []MonthlyTrend      `json:"monthly_trend"`
}
