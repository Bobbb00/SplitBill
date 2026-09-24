package handler

import (
	"errors"
	"net/http"

	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/service"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register Add New User
// @Summary Register a new user
// @Description Register a new user into the SplitBill system
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Registration Data"
// @Success 201 {object} response.APIResponse "message: User registered successfully"
// @Failure 400 {object} response.APIResponse "message: Invalid request body"
// @Failure 409 {object} response.APIResponse "message: Email is already registered"
// @Failure 500 {object} response.APIResponse "message: Internal server error"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c echo.Context) error {
	var req dto.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}
	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}
	user, err := h.authService.Register(c.Request().Context(), req)
	if err != nil {
		if err == service.ErrEmailTaken {
			return response.Error(c, http.StatusConflict, "Email is already registered")
		}
		return response.Error(c, http.StatusInternalServerError, "Internal server error")
	}
	return response.Success(c, http.StatusCreated, "User registered successfully", user)
}

// Login - POST /api/v1/auth/login
// @Summary Login user
// @Description Authenticate a user and return a JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Credentials"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c echo.Context) error {
	var req dto.LoginRequest

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request body")
	}

	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}

	result, err := h.authService.Login(c.Request().Context(), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			return response.Error(c, http.StatusUnauthorized, "Invalid email or password")
		}
		return response.Error(c, http.StatusInternalServerError, "Failed to login")
	}
	return response.Success(c, http.StatusOK, "Login successful", result)
}

// GetProfile - GET /api/v1/auth/me
func (h *AuthHandler) GetProfile(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	profile, err := h.authService.GetProfile(c.Request().Context(), userID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to get profile")
	}
	return response.Success(c, http.StatusOK, "Profile fetched successfully", profile)
}

func formatValidationErrors(err error) map[string]string {
	errs := make(map[string]string)
	for _, e := range err.(validator.ValidationErrors) {
		field := e.Field()
		switch e.Tag() {
		case "required":
			errs[field] = field + " is required"
		case "email":
			errs[field] = field + " must be an email"
		case "min":
			errs[field] = field + " must be at least " + e.Param() + " characters"
		case "max":
			errs[field] = field + " must be at most " + e.Param() + " characters"
		default:
			errs[field] = field + " is invalid"
		}
	}
	return errs
}
