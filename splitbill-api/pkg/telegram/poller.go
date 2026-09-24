package telegram

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// Struktur data balasan dari Telegram
type UpdateResponse struct {
	Ok     bool `json:"ok"`
	Result []struct {
		UpdateID int `json:"update_id"`
		Message  struct {
			Chat struct {
				ID int64 `json:"id"`
			} `json:"chat"`
			Text string `json:"text"`
		} `json:"message"`
	} `json:"result"`
}

// StartPolling menjalankan loop di background untuk membaca pesan baru
func StartPolling(saveChatIDFunc func(userID string, chatID int64) error) {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		log.Println("Warning: TELEGRAM_BOT_TOKEN kosong, bot tidak aktif.")
		return
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates", token)
	offset := 0

	// Gunakan 'go' untuk menjalankan fungsi ini di background (Goroutine)
	go func() {
		log.Println("🤖 Telegram Bot Polling started...")

		for {
			// Meminta pesan baru, jika tidak ada, tunggu sampai 10 detik (Long Polling)
			reqURL := fmt.Sprintf("%s?offset=%d&timeout=10", url, offset)
			resp, err := http.Get(reqURL)
			if err != nil {
				time.Sleep(5 * time.Second) // tunggu sebentar jika error jaringan
				continue
			}

			var data UpdateResponse
			if err := json.NewDecoder(resp.Body).Decode(&data); err == nil && data.Ok {
				for _, update := range data.Result {
					offset = update.UpdateID + 1 // Tandai pesan ini sudah dibaca

					text := update.Message.Text
					chatID := update.Message.Chat.ID

					// Jika ada pesan masuk "/start {ID_USER}"
					if strings.HasPrefix(text, "/start ") {
						userIDStr := strings.TrimPrefix(text, "/start ")

						// Panggil fungsi callback untuk simpan ke database!
						err := saveChatIDFunc(userIDStr, chatID)
						if err == nil {
							_ = SendMessage(fmt.Sprintf("%d", chatID), "✅ Selamat! Akun SplitBill Anda berhasil dihubungkan dengan Telegram.")
						} else {
							_ = SendMessage(fmt.Sprintf("%d", chatID), "❌ Gagal menghubungkan akun. User ID tidak valid.")
						}
					}
				}
			}
			resp.Body.Close()
		}
	}()
}
