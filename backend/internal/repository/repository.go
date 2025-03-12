package repository

import (
	"backend/internal/models"
	"context"
)

type UserRepo interface {
	Create(ctx context.Context, user models.UserCreate) (int, error)
	Get(ctx context.Context, id int) (*models.User, error)
	GetAll(ctx context.Context) ([]models.User, error)
	GetPWDbyEmail(ctx context.Context, user string) (int, string, error)
	ChangePWD(ctx context.Context, user models.UserChangePWD) (int, error)
	Delete(ctx context.Context, id int) error
}

type ChatRepo interface {
	Create(ctx context.Context, chatName string) (int, error)
	AddUser(ctx context.Context, chatID int, userID int) (int, error)
	Message(ctx context.Context, message models.MessageBase) (*models.Message, error)
	Chat(ctx context.Context, chatID int) (*models.AllChat, error)
	GetAllMessage(ctx context.Context) ([]models.Message, error)
}
