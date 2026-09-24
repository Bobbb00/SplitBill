package handler

import (
	"net/http"
	"strconv"

	"github.com/Bobbb00/splitbill-api/internal/service"
	"github.com/labstack/echo/v4"
)

type ExportHandler struct {
	exportService service.ExportService
}

func NewExportHandler(exportService service.ExportService) *ExportHandler {
	return &ExportHandler{exportService: exportService}
}

// @Summary Export Group Expenses to CSV
// @Description Download a CSV file containing all expenses for a group
// @Tags Export
// @Produce text/csv
// @Security BearerAuth
// @Param id path int true "Group ID"
// @Success 200 {file} file "CSV File"
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /export/group/{id}/csv [get]
func (h *ExportHandler) DownloadCSV(c echo.Context) error {
	groupID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest,
			map[string]string{"message": "ID grup tidak valid"})
	}

	data, err := h.exportService.GenerateGroupReportCSV(groupID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError,
			map[string]string{"message": "Gagal membuat file CSV"})
	}

	c.Response().Header().Set("Content-Type", "text/csv")
	c.Response().Header().Set("Content-Disposition", `attachment; filename="laporan_grup.csv"`)
	return c.Blob(http.StatusOK, "text/csv", data)
}

func (h *ExportHandler) DownloadPDF(c echo.Context) error {
	groupID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest,
			map[string]string{"message": "ID grup tidak valid"})
	}

	data, err := h.exportService.GenerateGroupReportPDF(groupID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Gagal generate PDF"})
	}

	c.Response().Header().Set("Content-Type", "application/pdf")
	c.Response().Header().Set("Content-Disposition", `attachment; filename="laporan_grup.pdf"`)
	return c.Blob(http.StatusOK, "application/pdf", data)
}
