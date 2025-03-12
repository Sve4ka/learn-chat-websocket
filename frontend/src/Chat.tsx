import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useWebSocket from './useWebSocket';

interface Message {
    sender_name: string;
    sender_id: number;
    text: string;
    timestamp: string;
}

interface Chat {
    id: number;
    name: string;
}

const Chat: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const { isConnected, messages, sendMessage } = useWebSocket(currentChat ? currentChat.id : null); // Передача динамического URL
    const userId = JSON.parse(localStorage.getItem('userId') || "0");
    const navigate = useNavigate();
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const [chatsLoading, setChatsLoading] = useState(false); // Состояние загрузки чатов
    const [chatsError, setChatsError] = useState<string | null>(null); // Состояние ошибки чатов
    const [messagesLoading, setMessagesLoading] = useState(false); // Состояние загрузки сообщений
    const [messagesError, setMessagesError] = useState<string | null>(null); // Состояние ошибки сообщений
    const [isCreatingChat, setIsCreatingChat] = useState(false); // Состояние создания чата
    const [newChatNameInput, setNewChatNameInput] = useState(''); // Состояние для ввода имени нового чата
// Перенаправление на страницу логина, если userId отсутствует
    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);
    // Получение списка чатов
    useEffect(() => {
        const fetchChats = async () => {
            setChatsLoading(true); // Начало загрузки
            setChatsError(null); // Сброс ошибок
            try {
                const response = await fetch('http://localhost:8080/ws/chat');
                if (!response.ok) {
                    throw new Error(`Не удалось получить чаты: ${response.status}`);
                }
                const data: { chats: Chat[] } = await response.json();
                setChats(data.chats);
            } catch (error: any) {
                console.error('Ошибка получения чатов:', error);
                setChatsError(error.message); // Установка сообщения об ошибке
            } finally {
                setChatsLoading(false); // Завершение загрузки в любом случае
            }
        };

        fetchChats();
    }, []);

    useEffect(() => {
        console.log(allMessages)
    }, [allMessages]);

    // Получение сообщений чата при его выборе
    useEffect(() => {
        if (currentChat) {
            const fetchOldMessages = async () => {
                setMessagesLoading(true); // Начало загрузки сообщений
                setMessagesError(null); // Сброс ошибок сообщений
                try {
                    const response = await fetch(`http://localhost:8080/ws/chat/messages/${currentChat.id}`);
                    if (!response.ok) {
                        throw new Error(`Не удалось получить старые сообщения: ${response.status}`);
                    }
                    const data: { messages: Message[] } = await response.json();
                    setAllMessages(data.messages);
                } catch (error: any) {
                    console.error('Ошибка получения старых сообщений:', error);
                    setMessagesError(error.message); // Установка сообщения об ошибке
                } finally {
                    setMessagesLoading(false); // Завершение загрузки сообщений
                }
            };
            fetchOldMessages();
        } else {
            setAllMessages([]); // Очистка сообщений при сбросе чата
        }
    }, [currentChat]);

    // Объединение старых и новых сообщений
    useEffect(() => {
        if (messages.length > 0) {
            setAllMessages((prevMessages) => {
                console.log(prevMessages)
                const safePrevMessages = prevMessages || []; // Инициализация prevMessages как пустого массива
                const uniqueNewMessages = messages.filter(newMessage =>
                    !safePrevMessages.some(existingMessage => existingMessage.timestamp === newMessage.timestamp && existingMessage.text === newMessage.text)
                );
                return [...safePrevMessages, ...uniqueNewMessages];
            });
        }
    }, [messages]);


    // Обработка отправки сообщений
    const handleSendMessage = () => {
        if (inputText.trim() && isConnected) {
            const message: Message = {
                sender_name: "you",
                sender_id: userId,
                text: inputText,
                timestamp: new Date().toString(),
            };
            console.log(message);
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

    // Создание нового чата
    const handleCreateChat = async () => {
        setIsCreatingChat(true); // Начало создания чата
        setChatsError(null); // Сброс ошибок
        try {
            const response = await fetch('http://localhost:8080/ws/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newChatNameInput.trim() || "New Chat" }), // Используем введенное имя или "New Chat" по умолчанию
            });
            if (!response.ok) {
                throw new Error(`Не удалось создать чат: ${response.status}`);
            }
            const newChat = await response.json();
            setChats((prevChats) => [...prevChats, newChat]);
            setNewChatNameInput(''); // Очистка поля ввода имени
        } catch (error: any) {
            console.error('Ошибка создания чата:', error);
            setChatsError(error.message); // Установка ошибки
        } finally {
            setIsCreatingChat(false); // Завершение создания чата
        }
    };

    return (
        <div>
            <div>
                <h3>Чаты</h3>
                {chatsError &&
                    <p style={{color: 'red'}}>Ошибка загрузки чатов: {chatsError}</p>} {/* Отображение ошибки чатов */}
                {chatsLoading && <p>Загрузка чатов...</p>} {/* Состояние загрузки чатов */}
                <ul>
                    {chats.map(chat => (
                        <li key={chat.id} onClick={() => setCurrentChat(chat)} style={{
                            cursor: 'pointer',
                            fontWeight: currentChat?.id === chat.id ? 'bold' : 'normal'
                        }}> {/* Выделение выбранного чата */}
                            {chat.name}
                        </li>
                    ))}
                </ul>
                <div>
                    <input
                        type="text"
                        placeholder="Имя нового чата"
                        value={newChatNameInput}
                        onChange={(e) => setNewChatNameInput(e.target.value)}
                    />
                    <button onClick={handleCreateChat}
                            disabled={isCreatingChat}> {/* Кнопка создания чата, disabled во время создания */}
                        {isCreatingChat ? 'Создание...' : 'Создать чат'}
                    </button>
                    {chatsError && <p style={{color: 'red'}}>Ошибка создания
                        чата: {chatsError}</p>} {/* Отображение ошибки создания чата */}
                </div>
            </div>

            {currentChat && (
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <h2>{currentChat.name}</h2>
                    {messagesError && <p style={{ color: 'red' }}>Ошибка загрузки сообщений: {messagesError}</p>} {/* Отображение ошибки сообщений */}
                    {messagesLoading && <p>Загрузка сообщений...</p>} {/* Состояние загрузки сообщений */}
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
                        {/* Отображение сообщений */}
                        {allMessages && allMessages.length > 0 ? (
                            allMessages.map((msg, index) => (
                                <div key={index} style={{ margin: '5px 0', textAlign: msg.sender_id === userId ? 'right' : 'left' }}>
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
                            ))
                        ) : (
                            <p>Нет сообщений</p>
                        )}
                    </div>

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
            )}
        </div>
    );
};

export default Chat;
