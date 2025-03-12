import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
    sender_name: string;
    sender_id: number;
    text: string;
    timestamp: string;
}

const useWebSocket = (chatId: number | null) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    // Установить соединение WebSocket при изменении chatId
    const connect = useCallback(() => {
        if (chatId === null) {
            return; // Не подключаться, если нет выбранного чата
        }

        const url = `ws://localhost:8080/ws/chat/${chatId}`;
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
        };

        socketRef.current.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                setMessages(() => [data]);
            } catch (error) {
                setMessages(() => [event.data]);
            }
        };

        socketRef.current.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
        };

        socketRef.current.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
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
            socketRef.current.close();
        }
    }, []);

    useEffect(() => {
        if (chatId !== null) {
            connect(); // Подключаемся к WebSocket, если выбран чат
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close(); // Закрываем соединение при переключении чатов
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

