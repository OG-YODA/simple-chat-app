import React, { createContext, useContext, useState, useEffect } from "react";
import CustomNotification from "../components/CustomNotification";
import AuthContext from "./AuthContext";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

import "../styles/notification.css";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [temporaryNotifications, setTemporaryNotifications] = useState([]);
    const {isAuthenticated} = useContext(AuthContext);
    const [isNotifPreloaded, setNotifPreloaded] = useState(false);
    const [ws, setWs] = useState(null);

    const WS_URL = process.env.REACT_APP_WS_URL || "http://192.168.2.100:8080/ws";
    const API_URL = process.env.REACT_APP_API_URL || "http://192.168.2.100:8080/notifications";

    useEffect(() => {
        console.log("useEffect triggered");
    
        if (isAuthenticated === true) {
            console.log("User is authenticated, connecting to WebSocket...");
            let attempts = 0;
            const maxAttempts = 3;
            let stompClient = null;
    
            const connectWebSocket = () => {
                console.log("Attempting to connect to WebSocket...", `Attempt ${attempts + 1}`);
                
                const userId = localStorage.getItem("userId");
                const accessKey = localStorage.getItem("accessKey");
                
                const socket = new SockJS(`${WS_URL}?userId=${userId}`);
                stompClient = Stomp.over(socket);
                stompClient.reconnect_delay = 0; // отключаем встроенный авто-реконнект
    
                stompClient.connect(
                    { userId, accessKey },
                    (frame) => {
                        console.log("STOMP connection established:", frame);
                        addTemporaryNotification("WebSocket connected", "success"); // Temporary notification on successful connection
                        console.log("userId used for WS connect:", userId);
                        setWs(stompClient);
    
                        stompClient.subscribe(`/user/${userId}/queue/messages`, (msg) => {
                            console.log("Got private message:", msg.body);
                            try {
                                const notification = JSON.parse(msg.body);
                                addTemporaryNotification(notification.message, "success"); // Show temporary notification
                            } catch (error) {
                                console.error("Error parsing WebSocket message:", error);
                            }
                        });
                    },
                    (error) => {
                        console.error("STOMP connection error:", error);
                        if (attempts < maxAttempts) {
                            attempts++;
                            console.log(`Reattempting STOMP connection in 5 seconds... (Attempt ${attempts})`);
                            setTimeout(connectWebSocket, 5000);
                        } else {
                            console.error("Max STOMP connection attempts reached. Stopping reconnection attempts.");
                        }
                    }
                );
            };
    
            connectWebSocket();
    
            return () => {
                if (stompClient && stompClient.connected) {
                    stompClient.disconnect(() => {
                        console.log("STOMP disconnected");
                    });
                }
            };
        } else {
            console.log("User is not authenticated, skipping WebSocket connection.");
        }
    }, [isAuthenticated]); // Add isAuthenticated dependency to reconnect when user logs in

    const fetchNotification = async () => {
        console.log("Fetching notifications");
        try {
            const response = await fetch(`${WS_URL}/recieve`);
            if (!response.ok) throw new Error("Failed to fetch notifications");
            const data = await response.json();
            console.log("Notifications fetched successfully:", data);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        };};

    const handleNewNotification = (notification) => {
        console.log("New notification received:", notification);
        if (!notification) {
            console.warn("Received undefined notification!");
            return;
        }
        setNotifications((prev) => {
            console.log("Previous notifications:", prev);
            return [...(prev || []), notification];
        });
        addTemporaryNotification(notification.message, notification.type);
    };

    const showNotification = (data) => {
        setNotifications(data); // Прямо устанавливаем уведомления из ответа в локальное состояние
    };

    const addNotification = async (userId, message, type) => {
        console.log("Adding notification:", { userId, message, type });
        try {
            const response = await fetch(`${API_URL}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, message, type }),
            });
            if (!response.ok) throw new Error("Failed to add notification");
            const data = await response.json();
            console.log("Notification added successfully:", data);
            handleNewNotification(data);
        } catch (error) {
            console.error("Ошибка при отправке уведомления:", error);
        }
    };

    const clearNotifications = () => {
        console.log("Clearing all notifications");
        setNotifications([]);
    };

    const addTemporaryNotification = (message, type) => {
        const id = Date.now();
        console.log("Adding temporary notification:", { id, message, type });
        setTemporaryNotifications((prev) => {
            const updated = [...(prev || []), { id, message, type }];
            console.log("Updated temporary notifications:", updated);
            return updated.length > 5 ? updated.slice(1) : updated;
        });
    };

    const removeNotification = (id) => {
        console.log("Removing notification with ID:", id);
        setNotifications((prev) => {
            const filtered = prev.filter((notification) => notification.id !== id);
            console.log("Updated notifications after removal:", filtered);
            return filtered;
        });
    };

    console.log("Rendering notifications:", notifications);

    return (
        <NotificationContext.Provider value={{notifications, temporaryNotifications, addTemporaryNotification, addNotification, clearNotifications, removeNotification}}> 
            <div className="notification-container">
                {Array.isArray(temporaryNotifications) && temporaryNotifications.length > 0 &&
                    temporaryNotifications.map((notification, index) => (
                        <CustomNotification
                            key={`temp-${notification.id}`}
                            id={notification.id}
                            message={notification.message}
                            type={notification.type}
                            onClose={() => 
                                setTemporaryNotifications(prev => prev.filter(n => n.id !== notification.id))
                            }
                            style={{ bottom: `${(temporaryNotifications.length - index - 1) * 60}px` }}
                        />
                    ))
                }
            </div>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);