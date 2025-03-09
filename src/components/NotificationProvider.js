import React, { createContext, useContext, useState, useEffect } from "react";
import CustomNotification from "./CustomNotification";
import "../styles/notification.css";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [temporaryNotifications, setTemporaryNotifications] = useState([]);

    const WS_URL = process.env.REACT_APP_WS_URL || "ws://192.168.2.100:8080/ws/app/notifications";
    const API_URL = process.env.REACT_APP_API_URL || "http://192.168.2.100:8080/notifications";

    useEffect(() => {
        console.log("useEffect triggered");
    }, []);

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