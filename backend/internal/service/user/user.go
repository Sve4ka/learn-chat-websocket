package user

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/pkg/cerr"
	"backend/pkg/log"
	"context"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

type ServUser struct {
	UserRepo repository.UserRepo
	log      *log.Logs
}

func InitUserService(userRepo repository.UserRepo, log *log.Logs) service.UserServ {
	return &ServUser{UserRepo: userRepo, log: log}
}

func (s ServUser) Create(ctx context.Context, user models.UserCreate) (int, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PWD), 10)
	if err != nil {
		s.log.Error(err.Error())
		return 0, err
	}
	newUser := models.UserCreate{
		UserBase: user.UserBase,
		PWD:      string(hashedPassword),
	}
	id, err := s.UserRepo.Create(ctx, newUser)
	if err != nil {
		s.log.Error(err.Error())
		return 0, err
	}
	s.log.Info(fmt.Sprintf("create user %v", id))
	return id, nil
}

func (s ServUser) Get(ctx context.Context, id int) (*models.User, error) {
	user, err := s.UserRepo.Get(ctx, id)
	if err != nil {
		s.log.Error(err.Error())
		return nil, err
	}
	s.log.Info(fmt.Sprintf("get user %v", id))
	return user, nil
}

func (s ServUser) GetAll(ctx context.Context) ([]models.User, error) {
	users, err := s.UserRepo.GetAll(ctx)
	if err != nil {
		s.log.Error(err.Error())
		return nil, err
	}
	s.log.Info("get users")
	return users, nil
}

func (s ServUser) Login(ctx context.Context, user models.UserLogin) (int, error) {
	id, pwd, err := s.UserRepo.GetPWDbyEmail(ctx, user.Email)
	if err != nil {
		s.log.Error(err.Error())
		return 0, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(pwd), []byte(user.PWD))
	if err != nil {
		s.log.Error(cerr.InvalidPWD(err).Error())
		return 0, cerr.InvalidPWD(err)
	}
	s.log.Info(fmt.Sprintf("login user %v", id))
	return id, nil
}

func (s ServUser) ChangePWD(ctx context.Context, user models.UserChangePWD) (int, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(user.NewPWD), 10)
	if err != nil {
		s.log.Error(cerr.Hash(err).Error())
		return 0, cerr.Hash(err)
	}
	newPWD := models.UserChangePWD{
		ID:     user.ID,
		NewPWD: string(hash),
	}
	id, err := s.UserRepo.ChangePWD(ctx, newPWD)
	if err != nil {
		s.log.Error(err.Error())
		return 0, err
	}
	s.log.Info(fmt.Sprintf("change pwd user %v", id))
	return id, nil
}

func (s ServUser) Delete(ctx context.Context, id int) error {
	err := s.UserRepo.Delete(ctx, id)
	if err != nil {
		s.log.Error(err.Error())
		return err
	}
	s.log.Info(fmt.Sprintf("delete user %v", id))
	return nil
}
