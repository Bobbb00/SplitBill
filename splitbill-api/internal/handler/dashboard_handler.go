package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Bobbb00/splitbill-api/internal/service"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/labstack/echo/v4"
)

type DashboardHandler struct {
	dashboardService service.DashboardService
}

func NewDashboardHandler(dashboardService service.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

// @Summary Get Dashboard Summary
// @Description Get summary of user's financial status across all groups
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /dashboard [get]
func (h *DashboardHandler) GetDashboardSummary(c echo.Context) error {
	userID := c.Get("user_id").(int64)

	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}

	summary, err := h.dashboardService.GetDashboardSummary(c.Request().Context(), groupID, userID)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, "Anda bukan anggota grup ini")
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal mengambil ringkasan dashboard")
	}

	return response.Success(c, http.StatusOK, "Berhasil mengambil ringkasan dashboard", summary)
}

func (h *DashboardHandler) GetDashboardCharts(c echo.Context) error {
	userID := c.Get("user_id").(int64)

	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}

	charts, err := h.dashboardService.GetDashboardCharts(c.Request().Context(), groupID, userID)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, "Anda bukan anggota grup ini")
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal mengambil grafik dashboard")
	}

	return response.Success(c, http.StatusOK, "Berhasil mengambil grafik dashboard", charts)
}
