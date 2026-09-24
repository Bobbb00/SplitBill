package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/service"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/labstack/echo/v4"
)

type ExpenseHandler struct {
	expenseService service.ExpenseService
}

func NewExpenseHandler(expenseHandler service.ExpenseService) *ExpenseHandler {
	return &ExpenseHandler{expenseService: expenseHandler}
}

// @Summary Create Expense
// @Description Create a new expense within a group
// @Tags Expense
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateExpenseRequest true "Expense Data"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /expenses [post]
func (h *ExpenseHandler) CreateExpense(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}
	var req dto.CreateExpenseRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Format Request Json Tidak Valid")
	}

	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}

	expense, err := h.expenseService.CreateExpense(c.Request().Context(), groupID, userID, req)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal Membuat Pengeluaran")
	}

	return response.Success(c, http.StatusCreated, "Pengeluaran berhasil ditambahkan", expense)

}

func (h *ExpenseHandler) ListExpensesByGroup(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}

	userID := c.Get("user_id").(int64)

	expense, err := h.expenseService.ListExpensesByGroup(c.Request().Context(), groupID, userID)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal mengambil pengeluaran")
	}

	if expense == nil {
		expense = []dto.ExpenseResponse{}
	}
	return response.Success(c, http.StatusOK, "Pengeluaran Berhasil Diambil", expense)
}

func (h *ExpenseHandler) DeleteExpense(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}

	userID := c.Get("user_id").(int64)

	expenseID, err := strconv.ParseInt(c.Param("expense_id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Pengeluaran tidak valid")
	}

	err = h.expenseService.DeleteExpense(c.Request().Context(), groupID, userID, expenseID)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) || errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal Menghapus Pengeluaran")
	}

	return response.Success(c, http.StatusOK, "Pengeluaran Berhasil Dihapus", nil)
}

func (h *ExpenseHandler) UpdateExpense(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}
	expenseID, err := strconv.ParseInt(c.Param("expense_id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Pengeluaran tidak valid")
	}
	userID := c.Get("user_id").(int64)
	var req dto.CreateExpenseRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Format Request Json Tidak Valid")
	}

	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}

	err = h.expenseService.UpdateExpense(c.Request().Context(), groupID, userID, expenseID, req)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal Mengupdate Pengeluaran")
	}

	return response.Success(c, http.StatusOK, "Pengeluaran berhasil diupdate", nil)
}

func (h *ExpenseHandler) SettleSplit(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID grup tidak valid")
	}
	expenseID, err := strconv.ParseInt(c.Param("expense_id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Pengeluaran tidak valid")
	}
	targetUserID, err := strconv.ParseInt(c.Param("target_user_id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Target User tidak valid")
	}
	userID := c.Get("user_id").(int64)

	err = h.expenseService.SettleSplit(c.Request().Context(), groupID, userID, expenseID, targetUserID)
	if err != nil {
		if errors.Is(err, service.ErrNotMember) {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal Melakukan Pembayaran")
	}

	return response.Success(c, http.StatusOK, "Pembayaran berhasil dilakukan", nil)
}
