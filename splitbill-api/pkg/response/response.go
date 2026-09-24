package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type APIResponse struct {
	Succes  bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(c echo.Context, statusCode int, message string, data interface{}) error {
	return c.JSON(statusCode, APIResponse{
		Succes:  true,
		Message: message,
		Data:    data,
	})
}

func Error(c echo.Context, statusCode int, message string) error {
	return c.JSON(statusCode, APIResponse{
		Succes:  false,
		Message: message,
	})
}

func ValidationError(c echo.Context, errors interface{}) error {
	return c.JSON(http.StatusBadRequest, APIResponse{
		Succes:  false,
		Message: "Validation failed",
		Errors:  errors,
	})
}
