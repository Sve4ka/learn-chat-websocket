package models

import "time"

type NewChat struct {
	Name string `json:"name"`
}

type Chat struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type MessageGet struct {
	Type       string `json:"type"`
	Text       string `json:"content"`
	SenderID   int    `json:"sender_id"`   // Тип должен совпадать с клиентом
	SenderName string `json:"sender_name"` // Добавьте если используется
	Timestamp  string `json:"timestamp"`
}

type MessageBase struct {
	Type       string    `json:"type"`
	Text       string    `json:"content"`
	SenderID   int       `json:"sender_id"`   // Тип должен совпадать с клиентом
	SenderName string    `json:"sender_name"` // Добавьте если используется
	Timestamp  time.Time `json:"timestamp"`
}

type Message struct {
	ID int `json:"id"`
	MessageBase
}
type AddUserChat struct {
	ChatID int `json:"chat_id"`
	UserID int `json:"user_id"`
}

type AllChat struct {
	Chat
	Messages []Message `json:"messages"`
}

type MessageChatBase struct {
	ChatID int `json:"chat_id"`
	MessageBase
}

type MessageChat struct {
	ChatID int `json:"chat_id"`
	Message
}
