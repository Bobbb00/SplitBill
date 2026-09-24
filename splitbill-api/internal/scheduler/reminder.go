package scheduler

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Bobbb00/splitbill-api/internal/repository"
	"github.com/Bobbb00/splitbill-api/pkg/telegram"
)

func StartDailyReminder(expenseRepo repository.ExpenseRepository) {
	// Untuk uji coba, kita atur alarm berbunyi setiap 1 MENIT!
	// Nanti kalau sudah aman, kita ganti menjadi (24 * time.Hour)
	ticker := time.NewTicker(24 * time.Hour)

	go func() {
		for {
			<-ticker.C // Kode ini akan "diam" (blocking) sampai ticker berdetak (tiap 1 menit)

			log.Println("⏰ [Scheduler] Bangun! Sedang mencari penunggak utang...")

			// Kita cari utang yang umurnya 0 hari (alias semua utang yang ada saat ini)
			// Nanti angka 0 ini kita ganti jadi 7
			bills, err := expenseRepo.GetUnpaidSplitOlderThan(context.Background(), 7)
			if err != nil {
				log.Println("Error saat mencari penunggak:", err)
				continue
			}

			// Looping kirim pesan
			for _, p := range bills {
				if p.TelegramChatID == nil {
					continue
				}

				pesan := fmt.Sprintf("🚨 PENGINGAT OTOMATIS!\n\nHei %s, catatan kami menunjukkan Anda belum melunasi patungan sebesar Rp%.0f untuk '%s'.\n\nJangan pura-pura lupa ya, yuk segera transfer ke *%s*! 💸",
					p.UserName, p.AmountOwed, p.Description, p.PayerName)

				_ = telegram.SendMessage(*p.TelegramChatID, pesan)
			}

			if len(bills) > 0 {
				log.Printf("⏰ [Scheduler] Selesai mengirim teror ke %d orang nakal.\n", len(bills))
			} else {
				log.Println("⏰ [Scheduler] Tidak ada penunggak. Semua orang baik-baik saja.")
			}
		}
	}()
}
