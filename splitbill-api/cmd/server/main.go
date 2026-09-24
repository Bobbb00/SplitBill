package main

import (
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/Bobbb00/splitbill-api/config"
	"github.com/Bobbb00/splitbill-api/internal/handler"
	"github.com/Bobbb00/splitbill-api/internal/middleware"
	"github.com/Bobbb00/splitbill-api/internal/repository"
	"github.com/Bobbb00/splitbill-api/internal/router"
	"github.com/Bobbb00/splitbill-api/internal/scheduler"
	"github.com/Bobbb00/splitbill-api/internal/service"
	jwtPkg "github.com/Bobbb00/splitbill-api/pkg/jwt"
	"github.com/Bobbb00/splitbill-api/pkg/telegram"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

// @title SplitBill API
// @version 1.0
// @description This is a documentasion API full for SplitBill app with clean architecture and telegram integration.
// @termsOfService http://swagger.io/terms/

// @contact.name Bobbb00
// @contact.url https://github.com/Bobbb00/splitbill
// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apiKey BearerAuth
// @in header
// @name Authorization
func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// connect database
	db, err := sqlx.Connect("mysql", cfg.DSN())
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("✅ Database connected successfully")

	// init dependencies
	jwtManager := jwtPkg.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiration)

	userRepo := repository.NewUserRepository(db.DB)
	authService := service.NewAuthService(userRepo, jwtManager)
	authHandler := handler.NewAuthHandler(authService)

	groupRepo := repository.NewGroupRepository(db.DB)
	groupService := service.NewGroupService(groupRepo)
	groupHandler := handler.NewGroupHandler(groupService)

	expenseRepo := repository.NewExpenseRepository(db.DB)
	expenseService := service.NewExpenseService(expenseRepo, groupRepo, userRepo)
	expenseHandler := handler.NewExpenseHandler(expenseService)

	dashboardRepo := repository.NewDashboardRepository(db.DB)
	dashboardService := service.NewDashboardService(groupRepo, dashboardRepo)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)

	exportService := service.NewExportService(expenseRepo)
	exportHandler := handler.NewExportHandler(exportService)

	// init router
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// router & start server
	e := router.NewRouter(authHandler, authMiddleware, groupHandler, expenseHandler, dashboardHandler, exportHandler)
	// Start Telegram
	telegram.StartPolling(func(userIDStr string, chatID int64) error {
		userID, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			return fmt.Errorf("Invalid User ID")
		}
		err = userRepo.UpdateTelegramID(context.Background(), userID, chatID)
		if err != nil {
			return err
		}
		log.Printf("✅ User terhubung! UserID: %d, ChatID: %d\n", userID, chatID)

		return nil
	})

	// Start Scheduler
	scheduler.StartDailyReminder(expenseRepo)
	log.Println("✅ Daily Reminder Scheduler started")

	log.Printf("🚀 Server starting on port %s", cfg.ServerPort)
	go func() {
		if err := e.Start(fmt.Sprintf(":%s", cfg.ServerPort)); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout of 10 seconds.
	// Use a buffered channel to avoid missing signals as recommended for signal.Notify
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Println("Gracefully shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
	log.Println("Server stopped")
}
