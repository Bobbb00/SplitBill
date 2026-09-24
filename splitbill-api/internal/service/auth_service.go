package service

import (
	"context"
	"errors"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/repository"
	jwtPkg "github.com/Bobbb00/splitbill-api/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailTaken         = errors.New("email is already registered")
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
	GetProfile(ctx context.Context, userID int64) (*dto.UserResponse, error)
}

type authService struct {
	userRepo   repository.UserRepository
	jwtManager *jwtPkg.JWTManager
}

func NewAuthService(userRepo repository.UserRepository, jwtManager *jwtPkg.JWTManager) AuthService {
	return &authService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

func (s *authService) Register(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error) {
	// Check if email is already taken
	existing, _ := s.userRepo.FindByEmail(ctx, req.Email)
	if existing != nil {
		return nil, ErrEmailTaken
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	userID, err := s.userRepo.Create(ctx, user)
	if err != nil {
		if errors.Is(err, repository.ErrEmailAlreadyExists) {
			return nil, ErrEmailTaken
		}
		return nil, err
	}

	user.ID = userID

	return &dto.UserResponse{
		ID:             user.ID,
		Name:           user.Name,
		Email:          user.Email,
		AvatarURL:      user.AvatarURL,
		TelegramChatID: user.TelegramChatID,
		CreatedAt:      user.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}

func (s *authService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := s.jwtManager.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		User: dto.UserResponse{
			ID:             user.ID,
			Name:           user.Name,
			Email:          user.Email,
			AvatarURL:      user.AvatarURL,
			TelegramChatID: user.TelegramChatID,
			CreatedAt:      user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		},
		Token: token,
	}, nil
}

func (s *authService) GetProfile(ctx context.Context, userID int64) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	resp := toUserResponse(user)
	return &resp, nil
}

func toUserResponse(user *model.User) dto.UserResponse {
	return dto.UserResponse{
		ID:             user.ID,
		Name:           user.Name,
		Email:          user.Email,
		AvatarURL:      user.AvatarURL,
		TelegramChatID: user.TelegramChatID,
		CreatedAt:      user.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
