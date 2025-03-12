package models

import "time"

type Chat struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type MessageGet struct {
	Text       string `json:"text"`
	SenderID   int    `json:"sender_id"`   // Тип должен совпадать с клиентом
	SenderName string `json:"sender_name"` // Добавьте если используется
	Timestamp  string `json:"timestamp"`
}

type MessageBase struct {
	Text       string    `json:"text"`
	SenderID   int       `json:"sender_id"`   // Тип должен совпадать с клиентом
	SenderName string    `json:"sender_name"` // Добавьте если используется
	Timestamp  time.Time `json:"timestamp"`
}

type Message struct {
	MessageBase
	ID int `json:"id"`
}
type AddUserChat struct {
	ChatID int `json:"chat_id"`
	UserID int `json:"user_id"`
}

type AllChat struct {
	Chat
	Messages []Message `json:"messages"`
}
