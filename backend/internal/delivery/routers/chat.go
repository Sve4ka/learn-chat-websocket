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
	chatRouter.POST("/chat/:userID", chatHandler.CreateChat)
	chatRouter.GET("/chat/user/:id", chatHandler.GetChats)
	chatRouter.GET("/chat/:id", chatHandler.WSEndpoint)
	chatRouter.GET("/chat/messages/:id", chatHandler.GetMessages)
	chatRouter.POST("/chat/add/:idChat/:idUser", chatHandler.AddUser)
	return chatRouter
}
