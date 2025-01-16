import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null); // Для хранения ID пользователя
    const navigate = useNavigate();

    // Проверка наличия токена при загрузке страницы
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUserId = localStorage.getItem('userId');

        if (token&&storedUserId) {
            setAuthenticated(true); // Если токен есть, устанавливаем состояние авторизованным
            setUserId(storedUserId);
        }
        console.log("User ID:", userId);
    }, []);

    // Функция логина
    const login = (token, userId) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userId);
        setAuthenticated(true);
        setUserId(userId); // Сохраняем ID пользователя
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setAuthenticated(false);
        setUserId(null); // Сбрасываем ID пользователя
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;