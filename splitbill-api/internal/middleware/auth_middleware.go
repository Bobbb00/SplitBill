package middleware

import (
	"strings"

	jwtPkg "github.com/Bobbb00/splitbill-api/pkg/jwt"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	jwtManager *jwtPkg.JWTManager
}

func NewAuthMiddleware(jwtManager *jwtPkg.JWTManager) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager: jwtManager,
	}
}

func (m *AuthMiddleware) Authenticate(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return response.Error(c, 401, "Authorization header is required")
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Error(c, 401, "Authorization header is invalid")
		}
		claims, err := m.jwtManager.ValidateToken(parts[1])
		if err != nil {
			return response.Error(c, 401, "Invalid or expired token")
		}
		c.Set("user_id", claims.UserId)
		c.Set("user_email", claims.Email)

		return next(c)
	}
}
