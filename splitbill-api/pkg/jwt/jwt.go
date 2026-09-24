package jwt

import (
	"errors"
	"fmt"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

var ErrInvalidToken = errors.New("invalid or expired token")

type Claims struct {
	UserId int64  `json:"user_id"`
	Email  string `json:"email"`
	jwtlib.RegisteredClaims
}

type JWTManager struct {
	secretkey  []byte
	expiration time.Duration
}

func NewJWTManager(secret string, expirationHours int) *JWTManager {
	return &JWTManager{
		secretkey:  []byte(secret),
		expiration: time.Duration(expirationHours) * time.Hour,
	}
}

func (m *JWTManager) GenerateToken(userId int64, email string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserId: userId,
		Email:  email,
		RegisteredClaims: jwtlib.RegisteredClaims{
			Issuer:    "splitbil-api",
			IssuedAt:  jwtlib.NewNumericDate(now),
			ExpiresAt: jwtlib.NewNumericDate(now.Add(m.expiration)),
			NotBefore: jwtlib.NewNumericDate(now),
		},
	}

	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString(m.secretkey)
}

func (m *JWTManager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwtlib.ParseWithClaims(tokenString, &Claims{}, func(token *jwtlib.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwtlib.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return m.secretkey, nil
	})
	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}
