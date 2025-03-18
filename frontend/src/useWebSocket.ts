import { useEffect, useRef, useState, useCallback } from 'react';

import URL from "./api.ts"

interface Message {
    sender_name: string;
    sender_id: number;
    type: 'text' | 'image';
    content: string;
    timestamp: string;
}

const useWebSocket = (chatId: number | null) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const isClosingRef = useRef(false); // Флаг процесса закрытия

    // Установить соединение WebSocket при изменении chatId
    const connect = useCallback(() => {
        const safeCloseSocket = (code = 1000) => {
            if (socketRef.current) {
                isClosingRef.current = true; // Помечаем закрытие как инициированное пользователем
                socketRef.current.close(code);
            }
        };
        if (chatId === null) return;

        // Закрываем предыдущее соединение только если chatId изменился
        if (socketRef.current && socketRef.current.url !== `${URL.WS}/ws/chat/${chatId}`) {
            safeCloseSocket(1000);
        }

        const url = `${URL.WS}/ws/chat/${chatId}`;
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
            isClosingRef.current = false;
        };

        socketRef.current.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                setMessages(() => [data]);
            } catch (error) {
                setMessages(() => [event.data]);
            }
        };

        socketRef.current.onclose = (event: CloseEvent) => {
            if (event.code === 1000) {
                setIsConnected(false);

                console.log('WebSocket disconnected');
                isClosingRef.current = false;
                return;

            } // Нормальное закрытие

            setTimeout(() => {
                reconnectAttempts.current += 1;
                connect();
            }, Math.min(1000 * reconnectAttempts.current, 10000));
        };

        socketRef.current.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
            isClosingRef.current = false;
        };
    }, [chatId]); // Переподключение при изменении chatId

    const sendMessage = useCallback((message: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const data = typeof message === 'string' ? message : JSON.stringify(message);
            socketRef.current.send(data);
        } else {
            console.error('WebSocket is not connected');
        }
    }, []);

    const closeConnection = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close(1000);
        }
    }, []);

    useEffect(() => {
        if (chatId !== null) {
            connect(); // Подключаемся к WebSocket, если выбран чат
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close(1000); // Закрываем соединение при переключении чатов
            }
        };
    }, [chatId, connect]); // Переподключение, если chatId изменился

    return {
        isConnected,
        messages,
        sendMessage,
        closeConnection,
    };
};

export default useWebSocket;