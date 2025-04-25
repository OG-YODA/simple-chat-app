import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import AuthContext from "./AuthContext";

const WebSocketContext = createContext();
export const useWebSocket = () => {
    useContext(WebSocketContext);

    const context = useContext(WebSocketContext);

    

    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }

    return context;
};

export const WebSocketProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [connected, setConnected] = useState(false);
    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef([]);  // Используем useRef для подписок

    const WS_URL = process.env.REACT_APP_WS_URL || "http://192.168.2.100:8080/ws";

    useEffect(() => {
        if (!isAuthenticated) return;

        const userId = localStorage.getItem("userId");
        const accessKey = localStorage.getItem("accessKey");
        if (!userId || !accessKey) return;

        let attempts = 0;
        const maxAttempts = 3;

        return () => {
            // Отключаем WebSocket
            if (stompClientRef.current?.connected) {
                stompClientRef.current.disconnect(() => {
                    console.log("WebSocket отключён");
                    setConnected(false);
                });
            }
            
            // Отписываемся от всех подписок при размонтировании
            subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
            subscriptionsRef.current = [];  // Очищаем реф
        };
    }, [isAuthenticated]);

    const subscribe = useCallback((destination, callback) => {
        if (stompClientRef.current?.connected) {
            const sub = stompClientRef.current.subscribe(destination, (message) => {
                try {
                    callback(JSON.parse(message.body));
                } catch (error) {
                    console.error("Failed to parse message:", error);
                }
            });
            subscriptionsRef.current.push(sub);
            return () => sub.unsubscribe();
        }
        console.warn("STOMP connection not established");
        return () => {};
    }, []);

    const sendMessage = (destination, payload) => {
        if (stompClientRef.current?.connected) {
            stompClientRef.current.send(destination, {}, JSON.stringify(payload));
        } else {
            console.warn("WebSocket не подключён. Невозможно отправить сообщение.");
        }
    };

    return (
        <WebSocketContext.Provider
            value={{
                stompClient: stompClientRef.current,
                connected,
                subscribe,
                sendMessage,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};