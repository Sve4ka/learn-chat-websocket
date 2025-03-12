package routers

import (
	"backend/internal/delivery/handlers"
	"backend/internal/repository/chat"
	"backend/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func RegisterChatRouter(r *gin.Engine, db *sqlx.DB, logger *log.Logs) *gin.RouterGroup {
	chatRouter := r.Group("/ws")

	chatRepo := chat.InitChatRepository(db)
	chatHandler := handlers.InitChatHandler(chatRepo, logger)
	chatRouter.GET("/chat", chatHandler.WSEndpoint)
	chatRouter.GET("/messages", chatHandler.GetOldMessages)
	return chatRouter
}
