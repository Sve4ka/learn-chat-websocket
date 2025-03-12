import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            setIsConnected(true);
            console.log('WebSocket connected');
        };

        socketRef.current.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, data]);
            } catch (error) {
                setMessages((prevMessages) => [...prevMessages, event.data]);
            }
        };

        socketRef.current.onclose = () => {
            setIsConnected(false);
            console.log('WebSocket disconnected');
        };

        socketRef.current.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
        };
    }, [url]);

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
        if (!isConnected) {
            const timeout = setTimeout(() => {
                connect(); // <-- Одиночный вызов!
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [isConnected, connect]);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return {
        isConnected,
        messages,
        sendMessage,
        closeConnection,
    };
};

export default useWebSocket;