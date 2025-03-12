package routers

import (
	"backend/internal/delivery/middleware"
	"backend/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func InitRouting(r *gin.Engine, db *sqlx.DB, logger *log.Logs, middlewareStruct middleware.Middleware) {
	_ = RegisterUserRouter(r, db, logger)
	_ = RegisterChatRouter(r, db, logger)
}
