package router

import (
	"golang.org/x/time/rate"

	"net/http"

	"github.com/Bobbb00/splitbill-api/internal/handler"
	"github.com/Bobbb00/splitbill-api/internal/middleware"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"

	// swagger
	_ "github.com/Bobbb00/splitbill-api/docs"
)

func NewRouter(
	// auth
	AuthHandler *handler.AuthHandler,
	AuthMiddleware *middleware.AuthMiddleware,
	// group
	GroupHandler *handler.GroupHandler,
	// expense
	ExpenseHandler *handler.ExpenseHandler,
	// dashboard
	DashboardHandler *handler.DashboardHandler,

	// export
	ExportHandler *handler.ExportHandler,
) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// global middleware
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.RateLimiter(echoMiddleware.NewRateLimiterMemoryStore(rate.Limit(20)))) // 20 requests per second
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	// Health Check
	e.GET("/health", func(c echo.Context) error {
		return response.Success(c, http.StatusOK, "healthy", map[string]string{
			"status":  "healthy",
			"version": "1.0.0",
		})
	})

	// API v1
	api := e.Group("/api/v1")
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// Public routes
	auth := api.Group("/auth")
	auth.POST("/register", AuthHandler.Register)
	auth.POST("/login", AuthHandler.Login)

	// Protected routes
	protected := api.Group("")
	protected.Use(AuthMiddleware.Authenticate)

	protected.GET("/auth/profile", AuthHandler.GetProfile)

	// group routes
	group := protected.Group("/groups")
	group.GET("", GroupHandler.ListGroupByUser)
	group.POST("", GroupHandler.CreateGroup)
	group.POST("/join", GroupHandler.JoinGroup)
	group.DELETE("/:id", GroupHandler.DeleteGroup)
	group.GET("/:id", GroupHandler.GetGroupDetail)
	group.DELETE("/:id/members/:userID", GroupHandler.RemoveMember)
	group.PUT("/:id/regenerate-code", GroupHandler.RegenerateInviteCode)

	// Expense Routes
	group.POST("/:id/expenses", ExpenseHandler.CreateExpense)
	group.GET("/:id/expenses", ExpenseHandler.ListExpensesByGroup)
	group.DELETE("/:id/expenses/:expense_id", ExpenseHandler.DeleteExpense)
	group.PUT("/:id/expenses/:expense_id", ExpenseHandler.UpdateExpense)
	group.PUT("/:id/expenses/:expense_id/settle/:target_user_id", ExpenseHandler.SettleSplit)

	// dashboard
	group.GET("/:id/dashboard", DashboardHandler.GetDashboardSummary)
	group.GET("/:id/dashboard/charts", DashboardHandler.GetDashboardCharts)

	// export
	protected.GET("/groups/:id/export/csv", ExportHandler.DownloadCSV)
	protected.GET("/groups/:id/export/pdf", ExportHandler.DownloadPDF)

	return e
}
