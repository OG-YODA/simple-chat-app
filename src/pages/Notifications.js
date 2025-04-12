import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import ThemeContext from '../context/ThemeContext';
import { useNotification } from "../components/NotificationProvider";
import { useTranslation } from "../context/TranslationContext";

import refreshButtonDark from "../assets/media/pics/reload.png";
import refreshButtonLight from "../assets/media/pics/reload_light.png";

import "../styles/notifications.css";

function Notifications() {
    const { isAuthenticated, userId} = useContext(AuthContext);
    const { notifications, addNotification, addTemporaryNotification } = useNotification();
    const { translate } = useTranslation();
    const { theme } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);
    const [notifLoaded, setNotifLoaded] = useState(false);

    const icons = {
        refresh: {
            light: require("../assets/media/pics/reload.png"),
            dark: require("../assets/media/pics/reload_light.png"),
        }
    };

    const refreshButton = icons.refresh[theme];

    useEffect(() => {
        if (!notifLoaded){
            fetchNotifications();
            setNotifLoaded(true);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        if (loading || !userId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://192.168.2.100:8080/notifications/get/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch notifications");
    
            const data = await response.json(); // Получаем массив уведомлений из JSON
            console.log("Fetched notifications:", data);
    
            updateNotifications(data); // Передаём данные в showNotifications
    
        } catch (error) {
            addTemporaryNotification(translate("notification-load-error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const updateNotifications = (data) => {
        console.log("Updating notifications list...");
        notifications.length = 0; // Полностью очищаем массив перед обновлением
        data.forEach(notif => notifications.push(notif)); // Добавляем новые уведомления
    };

    const handleFriendRequestResponse = async (requestId, accepted) => {
        try {
            const url = `http://192.168.2.100:8080/friends/respond?requestId=${requestId}&accepted=${accepted}`;
    
            const response = await fetch(url, {
                method: "POST"
            });
    
            const result = await response.text();
    
            if (response.ok) {
                addTemporaryNotification(result, "success");
                fetchNotifications(); // Обновим список после ответа
            } else {
                addTemporaryNotification(result || "Ошибка обработки запроса", "error");
            }
        } catch (err) {
            console.error("Error responding to friend request:", err);
            addTemporaryNotification("Ошибка при ответе на запрос в друзья", "error");
        }
    };

    // Функция для рендеринга контента уведомлений
    const renderNotificationContent = (notif) => {
        switch (notif.type) {
            case "friend_request":
                let additional = {};
                try {
                    additional = JSON.parse(notif.additional);
                } catch (e) {
                    console.error("Parse error - additional:", e);
                }

                return (
                    <>
                        <p className="notif-message">
                            {translate("friend-request")
                                .replace("{firstName}", additional.senderName || " ? ")
                                .replace("{lastName}", additional.senderSurname || " ? ")}
                        </p>
                        <div className="friend-request-actions">
                            <button onClick={() => handleFriendRequestResponse(additional.requestId, true)} className="accept-btn">
                                {translate("accept")}
                            </button>
                            <button onClick={() => handleFriendRequestResponse(additional.requestId, false)} className="decline-btn">
                                {translate("decline")}
                            </button>
                        </div>
                    </>
                );
            case "message":
                return (
                    <>
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-type">{translate("message")}</span>
                    </>
                );
            // Добавляем другие типы уведомлений по мере необходимости
            default:
                return (
                    <>
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-type">{translate(notif.type)}</span>
                    </>
                );
        }
    };

    const addTestTemporaryNotification = () => {
        addTemporaryNotification("Это тестовое уведомление", "success");
    };

    const addTestPersistentNotification = async () => {
        try {
            const response = await fetch("http://192.168.2.100:8080/notifications/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, message: "Это тестовое уведомление", type: "test" })
            });
            if (!response.ok) throw new Error("Failed to add notification");
            const data = await response.json();
            addNotification(data);
            addTemporaryNotification("Уведомление успешно добавлено", "success");
        } catch (error) {
            addTemporaryNotification("Ошибка при отправке уведомления", "error");
        }
    };

    console.log("notifications in component:", notifications);
    return (
        <div className="content">
            {isAuthenticated ? (
                <>
                    <div className="notifications-container">
                        {Array.isArray(notifications) && notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className="notification-block">
                                    {renderNotificationContent(notif)}
                                    <span className="notif-time">{new Date(notif.timestamp).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p>{translate("empty-notifications-list")}</p>
                        )}
                    </div>
                    <button className="refresh-btn" onClick={fetchNotifications} disabled={loading}>
                        {translate(loading ? "Loading..." : "")}
                        <img src={refreshButton} alt="Refresh" width="32" height="32"/>
                    </button>
                    <button className="test-temp-btn" onClick={addTestTemporaryNotification}>
                        Добавить временное уведомление
                    </button>
                    <button className="test-persist-btn" onClick={addTestPersistentNotification}>
                        Добавить постоянное уведомление
                    </button>
                </>
            ) : (
                <div className="banner">
                    <h1>{translate("You are not authorised to see this page!")}</h1>
                </div>
            )}
        </div>
    );
}

export default Notifications;