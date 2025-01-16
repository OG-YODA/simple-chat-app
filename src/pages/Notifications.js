import React, { useState, useContext } from 'react'; // Добавляем useContext
import CustomNotification from '../components/CustomNotification'; // Для уведомлений
import AuthContext from '../context/AuthContext'; // Импортируем контекст
import '../styles/notifications.css';

function Notifications() {
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
        <div class="content">
            {isAuthenticated ? (
            <>
                <ul>
                    <li></li>
                </ul>
            </>
            ) :(
            <>
                <div class="banner">
                    <h1>You are not authorized to see this page!</h1>
                </div>
            </>
            )}
        </div>
    );
}

export default Notifications;