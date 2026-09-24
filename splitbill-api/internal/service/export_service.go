package service

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"

	"github.com/Bobbb00/splitbill-api/internal/repository"
	"github.com/go-pdf/fpdf"
)

type ExportService interface {
	GenerateGroupReportCSV(groupID int) ([]byte, error)
	GenerateGroupReportPDF(groupID int) ([]byte, error)
}

type exportService struct {
	expenseRepo repository.ExpenseRepository
}

func NewExportService(er repository.ExpenseRepository) ExportService {
	return &exportService{expenseRepo: er}
}

func (s *exportService) GenerateGroupReportCSV(groupID int) ([]byte, error) {
	expenses, err := s.expenseRepo.ListByGroup(context.Background(), int64(groupID))
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	writer.Write([]string{"Deskripsi", "Nominal", "Kategori", "Dibayar Oleh (ID)", "Tanggal"})
	for _, exp := range expenses {
		row := []string{
			exp.Description,
			fmt.Sprintf("%f", exp.Amount),
			fmt.Sprintf("%d", exp.CategoryID),
			fmt.Sprintf("%d", exp.PaidBy),
			exp.CreatedAt,
		}
		writer.Write(row)
	}
	writer.Flush()

	return buf.Bytes(), nil
}

func (s *exportService) GenerateGroupReportPDF(groupID int) ([]byte, error) {
	expenses, err := s.expenseRepo.ListByGroup(context.Background(), int64(groupID))
	if err != nil {
		return nil, err
	}

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, fmt.Sprintf("Laporan Pengeluaran Grup #%d", groupID))

	pdf.Ln(12)
	pdf.SetFont("Arial", "B", 12)

	// Tulis Header Tabel PDF
	pdf.CellFormat(50, 10, "Deskripsi", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 10, "Nominal", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 10, "Tanggal", "1", 1, "C", false, 0, "")
	pdf.SetFont("Arial", "", 12)
	// Tulis Data Transaksi PDF
	for _, exp := range expenses {
		pdf.CellFormat(50, 10, exp.Description, "1", 0, "L", false, 0, "")
		pdf.CellFormat(40, 10, fmt.Sprintf("Rp %.2f", exp.Amount), "1", 0, "R", false, 0, "")
		pdf.CellFormat(40, 10, exp.CreatedAt, "1", 1, "C", false, 0, "")
	}
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
