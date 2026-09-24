package service

import (
	context "context"

	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/repository"
)

type DashboardService interface {
	GetDashboardSummary(ctx context.Context, groupID, userID int64) (*dto.DashboardSummaryResponse, error)
	GetDashboardCharts(ctx context.Context, groupID, userID int64) (*dto.DashboardChartsResponse, error)
}

type dashboardService struct {
	groupRepo     repository.GroupRepository
	dashboardRepo repository.DashboardRepository
}

func NewDashboardService(groupRepo repository.GroupRepository, dashboardRepo repository.DashboardRepository) DashboardService {
	return &dashboardService{groupRepo: groupRepo, dashboardRepo: dashboardRepo}
}

func (s *dashboardService) GetDashboardSummary(ctx context.Context, groupID, userID int64) (*dto.DashboardSummaryResponse, error) {
	IsMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return nil, err
	}

	if !IsMember {
		return nil, ErrNotMember
	}

	summary, err := s.dashboardRepo.GetBalanceSummary(ctx, groupID, userID)
	if err != nil {
		return nil, err
	}

	return summary, nil
}
func (s *dashboardService) GetDashboardCharts(ctx context.Context, groupID, userID int64) (*dto.DashboardChartsResponse, error) {
	IsMember, err := s.groupRepo.IsMember(ctx, groupID, userID)
	if err != nil {
		return nil, err
	}
	if !IsMember {
		return nil, ErrNotMember
	}

	catBreakdown, err := s.dashboardRepo.GetCategoryBreakdown(ctx, groupID)
	if err != nil {
		return nil, err
	}

	monthlyTrend, err := s.dashboardRepo.GetMonthlyTrend(ctx, groupID)
	if err != nil {
		return nil, err
	}

	return &dto.DashboardChartsResponse{
		CategoryBreakdown: catBreakdown,
		MonthlyTrend:      monthlyTrend,
	}, nil
}
