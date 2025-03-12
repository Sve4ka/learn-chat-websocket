package routers

import (
	"backend/internal/delivery/handlers"
	"backend/internal/repository/user"
	userserv "backend/internal/service/user"
	"backend/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterUserRouter(r *gin.Engine, db *sqlx.DB, logger *log.Logs) *gin.RouterGroup {
	userRouter := r.Group("/user")

	userRepo := user.InitUserRepository(db)
	userService := userserv.InitUserService(userRepo, logger)
	userHandler := handlers.InitUserHandler(userService)

	userRouter.POST("/", userHandler.Create)
	userRouter.POST("/login", userHandler.Login)
	userRouter.GET("/:id", userHandler.Get)
	userRouter.GET("/", userHandler.GetAll)
	userRouter.PUT("/pwd", userHandler.ChangePWD)
	userRouter.DELETE("/:id", userHandler.Delete)
	return userRouter
}
