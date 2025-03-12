package handlers

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/pkg/log"
	"context"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type ChatHandler struct {
	repo  repository.ChatRepo
	log   *log.Logs
	chats map[int]map[string]*websocket.Conn
	mutex sync.Mutex
}

func InitChatHandler(repo repository.ChatRepo, logs *log.Logs) ChatHandler {
	chats := make(map[int]map[string]*websocket.Conn)
	return ChatHandler{repo: repo, log: logs, chats: chats}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:   1024,
	WriteBufferSize:  1024,
	HandshakeTimeout: 60 * time.Second,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *ChatHandler) WSEndpoint(c *gin.Context) {
	id := c.Param("id")
	chatID, err := strconv.Atoi(id)
	if err != nil {
		h.log.Error(err.Error())
		c.JSON(418, gin.H{"error": err.Error()})
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.log.Error(err.Error())
		return
	}
	clientID := uuid.New().String()

	h.mutex.Lock()
	h.chats[chatID][clientID] = conn
	h.mutex.Unlock()
	done := make(chan struct{})
	h.reader(conn, clientID, done, chatID)

	go h.writePump(conn, clientID, done)
}

func (h *ChatHandler) reader(conn *websocket.Conn, clientID string, done chan<- struct{}, chatID int) {
	conn.SetReadLimit(1024 * 1024)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	defer func() {
		h.mutex.Lock()
		delete(h.chats[chatID], clientID)
		h.mutex.Unlock()
		conn.Close()
		close(done)
	}()

	for {
		var getMSG models.MessageGet
		var msg models.MessageBase
		err := conn.ReadJSON(&getMSG)
		if err != nil {
			h.log.Error(err.Error())
			break
		}

		parsedTime, err := time.Parse("02.01.2006, 15:04:05", getMSG.Timestamp)
		if err != nil {
			h.log.Error(err.Error())
			conn.WriteJSON(map[string]string{"error": "Invalid timestamp"})
			continue
		}

		msg = models.MessageBase{
			Text:       getMSG.Text,
			SenderID:   getMSG.SenderID,
			SenderName: getMSG.SenderName,
			Timestamp:  parsedTime,
		}
		if msg.Text == "" {
			conn.WriteJSON(map[string]string{"error": "Empty message"})
			continue
		}
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		chatMsg := models.MessageChatBase{
			ChatID:      chatID,
			MessageBase: msg,
		}
		newMsg, err := h.repo.ChatMessage(ctx, chatMsg)
		if err != nil {
			conn.WriteJSON(map[string]string{"error": "Cant save message"})
			continue
		}

		h.writer(newMsg, clientID)
	}
}

func (h *ChatHandler) writer(newMsg *models.MessageChat, senderID string) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	var wg sync.WaitGroup
	for _, client := range h.chats[newMsg.ChatID] {
		wg.Add(1)
		go h.send(client, newMsg, &wg)
	}
	wg.Wait()
}

func (h *ChatHandler) send(conn *websocket.Conn, message *models.MessageChat, wg *sync.WaitGroup) {
	conn.WriteJSON(message)
	wg.Done()
}

func (h *ChatHandler) writePump(conn *websocket.Conn, clientID string, done <-chan struct{}) {
	ticker := time.NewTicker(60 * time.Second)
	defer func() {
		ticker.Stop()
		conn.Close()
	}()

	for {
		select {
		case <-ticker.C:
			err := conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(60*time.Second))
			if err != nil {
				h.log.Error(err.Error())
				return
			}
		case <-done:
			return
		}
	}
}

func (h *ChatHandler) GetOldMessages(g *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	messages, err := h.repo.GetAllMessage(ctx)

	if err != nil {
		h.log.Error(err.Error())
		g.JSON(418, gin.H{"error": err.Error()})
		return
	}

	g.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *ChatHandler) GetChats(g *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	chats, err := h.repo.GetAllChats(ctx)

	if err != nil {
		h.log.Error(err.Error())
		g.JSON(418, gin.H{"error": err.Error()})
		return
	}
	g.JSON(http.StatusOK, gin.H{"chats": chats})
}

func (h *ChatHandler) GetMessages(g *gin.Context) {
	id := g.Param("id")
	aid, err := strconv.Atoi(id)
	if err != nil {
		h.log.Error(err.Error())
		g.JSON(418, gin.H{"error": err.Error()})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	messages, err := h.repo.Chat(ctx, aid)
	if err != nil {
		h.log.Error(err.Error())
		g.JSON(418, gin.H{"error": err.Error()})
	}

	g.JSON(http.StatusOK, messages.Messages)
}

func (h *ChatHandler) CreateChat(g *gin.Context) {
	var newChat models.NewChat

	if err := g.ShouldBindJSON(&newChat); err != nil {
		g.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	id, err := h.repo.Create(ctx, newChat.Name)
	if err != nil {
		h.log.Error(err.Error())
		g.JSON(418, gin.H{"error": err.Error()})
	}
	var chat models.Chat
	chat.ID = id
	chat.Name = newChat.Name
	g.JSON(http.StatusOK, chat)
}
