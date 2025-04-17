import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));
    const [accessKey, setAccessKey] = useState(() => localStorage.getItem('accessKey'));
    const [isAuthenticated, setAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
    const [isNotifPreloaded, setNotifPreloaded] = useState(false);

    // Лог текущего состояния (не обязательно, но полезно)
    useEffect(() => {
        console.log('[AuthProvider] userId:', userId);
        console.log('[AuthProvider] username:', username);
        console.log('[AuthProvider] accessKey:', accessKey);
        console.log('[AuthProvider] isAuthenticated:', isAuthenticated);
    }, [userId, accessKey, isAuthenticated]);

    const login = (accessKey, userId, username) => {
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('accessKey', accessKey);
        localStorage.setItem('isAuthenticated', 'true');

        setUserId(userId);
        setUsername(username);
        setAccessKey(accessKey);
        setAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('accessKey');
        localStorage.removeItem('isAuthenticated');

        setUserId(null);
        setUsername(null);
        setAccessKey(null);
        setAuthenticated(false);
        setNotifPreloaded(false);

        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isNotifPreloaded,
                userId,
                accessKey,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;