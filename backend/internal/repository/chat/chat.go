package chat

import (
	"backend/internal/models"
	"backend/internal/repository"
	"backend/pkg/cerr"
	"context"
	"github.com/jmoiron/sqlx"
)

type RepoChat struct {
	db *sqlx.DB
}

func InitChatRepository(db *sqlx.DB) repository.ChatRepo {
	return RepoChat{db: db}
}

func (r RepoChat) Create(ctx context.Context, chatName string, userID int) (int, error) {
	var id int
	transaction, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return 0, cerr.Transaction(err)
	}
	row := transaction.QueryRowContext(ctx, "INSERT INTO chat (name) VALUES ($1) returning id", chatName)
	err = row.Scan(&id)
	if err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return 0, cerr.Rollback(err)
		}
		return 0, cerr.Scan(err)
	}
	row = transaction.QueryRowContext(ctx, "INSERT INTO chat_user (id_user, id_chat) VALUES ($1, $2) returning id_chat", userID, id)
	err = row.Scan(&id)
	if err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return 0, cerr.Rollback(err)
		}
		return 0, cerr.Scan(err)
	}
	if err = transaction.Commit(); err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return 0, cerr.Rollback(err)
		}
		return 0, cerr.Commit(err)
	}
	return id, nil
}

func (r RepoChat) AddUser(ctx context.Context, chatID int, userID int) (int, error) {
	transaction, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return 0, cerr.Transaction(err)
	}
	row := transaction.QueryRowContext(ctx, "INSERT INTO chat_user (id_user, id_chat) VALUES ($1, $2) returning id_chat", userID, chatID)
	err = row.Scan(&chatID)
	if err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return 0, cerr.Rollback(err)
		}
		return 0, cerr.Scan(err)
	}
	if err = transaction.Commit(); err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return 0, cerr.Rollback(err)
		}
		return 0, cerr.Commit(err)
	}
	return chatID, nil
}

func (r RepoChat) Message(ctx context.Context, message models.MessageBase) (*models.Message, error) {
	var id int
	var newMessage models.Message
	transaction, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, cerr.Transaction(err)
	}

	row := r.db.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", message.SenderID)
	err = row.Scan(&message.SenderName)
	if err != nil {
		return nil, cerr.Scan(err)
	}
	row = transaction.QueryRowContext(ctx, "INSERT INTO messages (id_user, name_user, text, time) values ($1, $2, $3, $4) returning id", message.SenderID, message.SenderName, message.Text, message.Timestamp)
	err = row.Scan(&id)
	if err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return nil, cerr.Rollback(err)
		}
		return nil, cerr.Scan(err)
	}
	if err = transaction.Commit(); err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return nil, cerr.Rollback(err)
		}
		return nil, cerr.Commit(err)
	}
	newMessage = models.Message{
		MessageBase: message,
		ID:          id,
	}
	return &newMessage, nil
}

func (r RepoChat) Chat(ctx context.Context, chatID int) (*models.AllChat, error) {
	var chat models.AllChat
	row := r.db.QueryRowContext(ctx, "SELECT name FROM chat WHERE id = $1", chatID)
	err := row.Scan(&chat.Name)
	if err != nil {
		return nil, cerr.Scan(err)
	}
	chat.ID = chatID
	rows, err := r.db.QueryContext(ctx, "SELECT id, id_user, name_user, text, time from messages where id_chat = $1", chatID)
	if err != nil {
		return nil, cerr.ExecContext(err)
	}
	for rows.Next() {
		var message models.Message
		err = rows.Scan(&message.ID, &message.SenderID, &message.SenderName, &message.Text, &message.Timestamp)
		if err != nil {
			return nil, cerr.Scan(err)
		}
		chat.Messages = append(chat.Messages, message)
	}
	return &chat, nil
}

func (r RepoChat) ChatMessage(ctx context.Context, message models.MessageChatBase) (*models.MessageChat, error) {
	var id int
	var newMessage models.MessageChat
	transaction, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, cerr.Transaction(err)
	}

	row := r.db.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", message.SenderID)
	err = row.Scan(&message.SenderName)
	if err != nil {
		return nil, cerr.Scan(err)
	}
	row = transaction.QueryRowContext(ctx, "INSERT INTO messages (id_user, name_user, text, time, id_chat) values ($1, $2, $3, $4, $5) returning id", message.SenderID, message.SenderName, message.Text, message.Timestamp, message.ChatID)
	err = row.Scan(&id)
	if err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return nil, cerr.Rollback(err)
		}
		return nil, cerr.Scan(err)
	}
	if err = transaction.Commit(); err != nil {
		if rbErr := transaction.Rollback(); rbErr != nil {
			return nil, cerr.Rollback(err)
		}
		return nil, cerr.Commit(err)
	}
	newMessage = models.MessageChat{
		ChatID: message.ChatID,
		Message: models.Message{
			ID:          id,
			MessageBase: message.MessageBase,
		},
	}
	return &newMessage, nil

}

func (r RepoChat) GetAllMessage(ctx context.Context) ([]models.Message, error) {
	var messages []models.Message
	rows, err := r.db.QueryContext(ctx, "SELECT id, id_user, name_user, text, time from messages")
	if err != nil {
		return nil, cerr.ExecContext(err)
	}
	for rows.Next() {
		var message models.Message
		err = rows.Scan(&message.ID, &message.SenderID, &message.SenderName, &message.Text, &message.Timestamp)
		if err != nil {
			return nil, cerr.Scan(err)
		}
		messages = append(messages, message)
	}
	return messages, nil

}

func (r RepoChat) GetAllChats(ctx context.Context) ([]models.Chat, error) {
	var chats []models.Chat
	rows, err := r.db.QueryContext(ctx, "SELECT id, name from chat")
	if err != nil {
		return nil, cerr.ExecContext(err)
	}
	for rows.Next() {
		var chat models.Chat
		err = rows.Scan(&chat.ID, &chat.Name)
		if err != nil {
			return nil, cerr.Scan(err)
		}
		chats = append(chats, chat)
	}
	return chats, nil
}

func (r RepoChat) GetUsersChats(ctx context.Context, userID int) ([]models.Chat, error) {
	var chats []models.Chat
	rows, err := r.db.QueryContext(ctx, "SELECT id_chat from chat_user where id_user = $1", userID)
	if err != nil {
		return nil, cerr.ExecContext(err)
	}
	for rows.Next() {
		var chat models.Chat
		err = rows.Scan(&chat.ID)
		if err != nil {
			return nil, cerr.Scan(err)
		}
		row := r.db.QueryRowContext(ctx, "SELECT name from chat where id = $1", chat.ID)
		err = row.Scan(&chat.Name)
		if err != nil {
			return nil, cerr.Scan(err)
		}
		chats = append(chats, chat)
	}
	return chats, nil

}
