import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebSocket from './useWebSocket';

interface Message {
    sender_name: string;
    sender_id: number;
    text: string;
    timestamp: string;
}

const Chat: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const { isConnected, messages, sendMessage } = useWebSocket('ws://localhost:8080/ws/chat');
    const userId = JSON.parse(localStorage.getItem('userId') || "0");
    const navigate = useNavigate();
    const messageContainerRef = useRef<HTMLDivElement>(null);

    // Перенаправление на страницу логина, если userId отсутствует
    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    // Получение старых сообщений при монтировании компонента
    useEffect(() => {
        const fetchOldMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8080/ws/messages`);
                if (response.ok) {
                    const data: { messages: Message[] } = await response.json();
                    setAllMessages(data.messages);
                } else {
                    console.error('Не удалось получить старые сообщения');
                }
            } catch (error) {
                console.error('Ошибка получения старых сообщений:', error);
            }
        };

        fetchOldMessages();
    }, []);

    // Объединение старых и новых сообщений
    useEffect(() => {
        const newMessages = messages.filter(newMessage =>
            !allMessages.some(existingMessage =>
                existingMessage.timestamp === newMessage.timestamp && existingMessage.text === newMessage.text
            )
        );
        setAllMessages((prevMessages) => [...prevMessages, ...newMessages]);
    }, [messages, allMessages]);

    // Обработка отправки сообщений
    const handleSendMessage = () => {
        if (inputText.trim() && isConnected) {
            const message: Message = {
                sender_name: "you",
                sender_id: userId,
                text: inputText,
                timestamp: new Date().toLocaleString(),
            };
            sendMessage(message);
            setInputText('');
        }
    };

    // Обработка нажатия клавиши Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div
                ref={messageContainerRef}
                style={{
                    height: '400px',
                    border: '1px solid #ccc',
                    overflowY: 'auto',
                    marginBottom: '10px',
                    padding: '10px',
                    position: 'relative',
                }}
            >
                {/* Статус отключения */}
                {!isConnected && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#ffebee',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '0.8em',
                        }}
                    >
                        Отключено
                    </div>
                )}

                {/* Отображение сообщений */}
                {allMessages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            margin: '5px 0',
                            textAlign: msg.sender_id === userId ? 'right' : 'left',
                        }}
                    >
                        <div
                            style={{
                                background: msg.sender_id === userId ? '#dcf8c6' : '#e3f2fd',
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'inline-block',
                                maxWidth: '80%',
                            }}
                        >
                            <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>
                                {msg.sender_id === userId ? "you" : msg.sender_name} • {msg.timestamp}
                            </div>
                            <div>{msg.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Поле ввода и кнопка "Отправить" */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                        flexGrow: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                    disabled={!isConnected}
                    placeholder="Введите ваше сообщение..."
                />
                <button
                    onClick={handleSendMessage}
                    style={{
                        padding: '8px 16px',
                        background: isConnected ? '#031777' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isConnected ? 'pointer' : 'not-allowed',
                    }}
                    disabled={!isConnected}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default Chat;