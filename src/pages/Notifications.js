import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNotification } from "../components/NotificationProvider";
import { useTranslation } from "../context/TranslationContext";

import "../styles/notifications.css";

function Notifications() {
    const { isAuthenticated, userId } = useContext(AuthContext);
    const { notifications, addNotification, showNotification, addTemporaryNotification } = useNotification();
    const { translate } = useTranslation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("useEffect вызван");

        checkServer();

        fetchNotifications();
    }, [userId]);

    const checkServer = async () => {
        console.log("Проверка соединения с сервером...");
        try {
            const response = await fetch("http://192.168.2.100:8080/notifications/test");
            console.log("Ответ от сервера получен:", response);
            if (response.ok) {
                console.log("Сервер доступен");
            } else {
                console.log(`Сервер недоступен (код ${response.status})`);
            }
        } catch (error) {
            console.error("Ошибка соединения с сервером:", error);
        }
    };

    const fetchNotifications = async () => {
        if (loading || !userId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://192.168.2.100:8080/notifications/get/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch notifications");
    
            const data = await response.json(); // Получаем массив уведомлений из JSON
            console.log("Fetched notifications:", data);
    
            showNotifications(data); // Передаём данные в showNotifications
    
        } catch (error) {
            addTemporaryNotification(translate("notification-load-error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const showNotifications = (data) => {
        console.log("Showing notifications:", data);
        data.forEach(notif => notifications.push(notif)); // Добавляем уведомления в notifications
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
                    <button className="refresh-btn" onClick={fetchNotifications} disabled={loading}>
                        {translate(loading ? "Loading..." : "Refresh Notifications")}
                    </button>
                    <button className="test-temp-btn" onClick={addTestTemporaryNotification}>
                        Добавить временное уведомление
                    </button>
                    <button className="test-persist-btn" onClick={addTestPersistentNotification}>
                        Добавить постоянное уведомление
                    </button>
                    <div className="notifications-container">
                        {Array.isArray(notifications) && notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className="notification-block">
                                    <span className="notif-id">ID: {notif.id}</span>
                                    <p className="notif-message">{notif.message}</p>
                                    <span className="notif-type">{translate(notif.type)}</span>
                                    <span className="notif-time">{new Date(notif.timestamp).toLocaleString()}</span>
                                    {notif.type === "friendRequest" && notif.additional?.link && (
                                        <a href={notif.additional.link} className="notif-link">
                                            {translate("View Request")}
                                        </a>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>{translate("empty-notifications-list")}</p>
                        )}
                    </div>
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