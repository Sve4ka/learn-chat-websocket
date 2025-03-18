import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useWebSocket from './useWebSocket';
import URL from "./api.ts"

interface Message {
    sender_name: string;
    sender_id: number;
    type: 'text' | 'image';
    content: string;
    timestamp: string;
}

interface Chat {
    id: number;
    name: string;
}

const MessageComponent: React.FC<{
    msg: Message,
    userId: number
}> = ({ msg, userId }) => {
    const isUser = msg.sender_id === userId;

    return (
        <div className={`message ${isUser ? 'sent' : 'received'}`}>
            <div className="message-content">
                <div className="message-header">
                    {isUser ? "you" : msg.sender_name} • {msg.timestamp}
                </div>
                {msg.type === 'image' ? (
                    <img
                        src={msg.content}
                        alt="sent content"
                        className="message-image"
                    />
                ) : (
                    <div className="message-text">{msg.content}</div>
                )}
            </div>
        </div>
    );
};

const Chat: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const {isConnected, messages, sendMessage} = useWebSocket(currentChat ? currentChat.id : null); // Передача динамического URL
    const userId = JSON.parse(localStorage.getItem('userId') || "0");
    const navigate = useNavigate();
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const [chatsError, setChatsError] = useState<string | null>(null); // Состояние ошибки чатов
    const [messagesLoading, setMessagesLoading] = useState(false); // Состояние загрузки сообщений
    const [messagesError, setMessagesError] = useState<string | null>(null); // Состояние ошибки сообщений
    const [isCreatingChat, setIsCreatingChat] = useState(false); // Состояние создания чата
    const [newChatNameInput, setNewChatNameInput] = useState(''); // Состояние для ввода имени нового чата
    const [newUserId, setNewUserId] = useState(''); // Новое состояние для ввода ID пользователя
    const [addUserError, setAddUserError] = useState<string | null>(null); // Ошибка добавления пользователя
    const [showScrollButton, setShowScrollButton] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isChatListVisible, setIsChatListVisible] = useState(true);
// Перенаправление на страницу логина, если userId отсутствует


    const checkScrollPosition = useCallback(() => {
        if (messageContainerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = messageContainerRef.current;
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
            setShowScrollButton(!isNearBottom);
        }
    }, []);


    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверка размера файла (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Максимальный размер файла 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            sendMessage({
                sender_name: "you",
                sender_id: userId,
                type: 'image',
                content: base64String,
                timestamp: new Date().toString()
            });
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    // Получение списка чатов
    useEffect(() => {
        void fetchChats();
    }, []);

    // Получение сообщений чата при его выборе
    useEffect(() => {
        if (currentChat) {
            void fetchOldMessages();
        } else {
            setAllMessages([]); // Очистка сообщений при сбросе чата
        }
        scrollToBottom();
        void fetchChats();
    }, [currentChat]);

    // Объединение старых и новых сообщений
    useEffect(() => {
        if (messages.length > 0) {
            setAllMessages((prevMessages) => {
                const safePrevMessages = prevMessages || []; // Инициализация prevMessages как пустого массива
                const uniqueNewMessages = messages.filter(newMessage =>
                    !safePrevMessages.some(existingMessage => existingMessage.timestamp === newMessage.timestamp && existingMessage.content === newMessage.content)
                );
                setTimeout(() => {
                    checkScrollPosition();
                    if (messageContainerRef.current) {
                        const {scrollTop, scrollHeight, clientHeight} = messageContainerRef.current;
                        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 300;
                        if (isNearBottom) {
                            scrollToBottom();
                        }
                    }
                }, 50);



                return [...safePrevMessages, ...uniqueNewMessages];
            });
        }

        fetchChats();
    }, [messages]);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [checkScrollPosition]);


    const ScrollToBottomButton = () => (
        <button
            className="scroll-bottom-button"
            onClick={scrollToBottom}
            style={{display: showScrollButton ? 'block' : 'none'}}
        >
            ↓
        </button>
    );

    // Обработка отправки сообщений
    const handleSendMessage = () => {
        if (inputText.trim() && isConnected) {
            sendMessage({
                sender_name: "you",
                sender_id: userId,
                type: 'text',
                content: inputText,
                timestamp: new Date().toString()
            });
            setInputText('');
        }
    };

    const fetchOldMessages = async () => {
        setMessagesLoading(true); // Начало загрузки сообщений
        setMessagesError(null); // Сброс ошибок сообщений
        if (currentChat) {
            try {
                const response = await fetch(`${URL.API}/ws/chat/messages/${currentChat.id}`);
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
        } else {
            setAllMessages([]); // Очистка сообщений при сбросе чата
        }
    };

    const fetchChats = async () => {
        setChatsError(null); // Сброс ошибок
        try {
            const response = await fetch(`${URL.API}/ws/chat/user/${userId}`);
            if (!response.ok) {
                throw new Error(`Не удалось получить чаты: ${response.status}`);
            }
            const data: { chats: Chat[] } = await response.json();
            setChats(data.chats);
        } catch (error: any) {
            console.error('Ошибка получения чатов:', error);
            setChatsError(error.message); // Установка сообщения об ошибке
        }
    };

    const scrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTo({
                top: messageContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
            setShowScrollButton(false);
        }
    }, []);
    // Создание нового чата
    const handleCreateChat = async () => {
        setIsCreatingChat(true); // Начало создания чата
        setChatsError(null); // Сброс ошибок
        try {
            const response = await fetch(`${URL.API}/ws/chat/${userId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name: newChatNameInput.trim() || "New Chat"}), // Используем введенное имя или "New Chat" по умолчанию
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

    // Функция для добавления пользователя в чат
    const handleAddUser = async () => {
        if (!currentChat || !newUserId) return;

        try {
            const response = await fetch(
                `${URL.API}/ws/chat/add/${currentChat.id}/${newUserId}`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            setNewUserId('');
            setAddUserError(null);
        } catch (error: any) {
            console.error('Ошибка добавления пользователя:', error);
            setAddUserError(error.message);
        }
    };

    return (
        <div className="chat-container">
            <button
                className="toggle-chat-list-button"
                onClick={() => setIsChatListVisible(!isChatListVisible)}
            >
                {isChatListVisible ? '◀' : '▶'}
            </button>
            {/* Список чатов */}
            {isChatListVisible && (
                <div className={`chat-list ${isChatListVisible ? 'visible' : 'hidden'}`}>
                <h3>Чаты {chatsError && (
                    <div className="error-message">{chatsError}</div>
                )}</h3>


                <div className="add-user-form">
                    <input
                        type="text"
                        placeholder="Имя нового чата"
                        value={newChatNameInput}
                        onChange={(e) => setNewChatNameInput(e.target.value)}
                        className="input-field"
                    />
                    <button
                        onClick={handleCreateChat}
                        disabled={isCreatingChat}
                        className="button"
                    >
                        {isCreatingChat ? 'Создание...' : 'Создать чат'}
                    </button>
                </div>
                <ul>
                    {chats.map(chat => (
                        <li
                            key={chat.id}
                            onClick={() => setCurrentChat(chat)}
                            className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                        >
                            {chat.name}
                        </li>
                    ))}
                </ul>


                {chatsError && (
                    <div className="error-message">{chatsError}</div>
                )}
            </div>)}

            {/* Содержимое чата */}
            {currentChat && (
                <div className="chat-content">
                    <div className="pad">
                        <h2>{currentChat.name}</h2>

                        {currentChat.name !== "Избранное" && (
                            <div className="add-user-form">
                                <input
                                    type="text"
                                    placeholder="Добавить пользователя по ID"
                                    value={newUserId}
                                    onChange={(e) => setNewUserId(e.target.value)}
                                    className="input-field"
                                />
                                <button
                                    onClick={handleAddUser}
                                    className="button"
                                >
                                    Добавить
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="message-list" ref={messageContainerRef}>
                        {addUserError && (
                            <div className="error-message">{addUserError}</div>
                        )}
                        {messagesError && (
                            <div className="error-message">Ошибка загрузки сообщений: {messagesError}</div>
                        )}
                        {messagesLoading && (
                            <div className="loading-indicator">Загрузка сообщений...</div>
                        )}

                        {allMessages === null || allMessages.length <= 0 ? (
                                <div className="loading-indicator">Нет сообщений</div>
                            )
                            :
                            (
                                allMessages.map((msg, index) => (
                                    <MessageComponent
                                        key={index}
                                        msg={msg}
                                        userId={userId}
                                    />
                                ))
                            )}
                        <ScrollToBottomButton/>
                    </div>

                    <div className="message-input-container">
                        {/* Кнопка для выбора изображения */}
                        <button
                            type="button"
                            className="button icon-button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📎
                        </button>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{display: 'none'}}
                            onChange={handleFileSelect}
                        />

                        {/* Поле ввода текста */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Введите сообщение..."
                            className="input-field"
                        />

                        <button
                            onClick={handleSendMessage}
                            disabled={!isConnected}
                            className="button"
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
