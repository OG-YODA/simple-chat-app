import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomNotification from './CustomNotification';
import '../styles/notification.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type) => {
    setNotifications((prev) => {
      const updated = [{ id: Date.now(), message, type }, ...prev]; // Новые уведомления добавляем в начало списка

      if (updated.length > 5) {
        updated.pop(); // Удаляем самое старое уведомление
      }
      return updated;
    });
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <div className="notification-container">
        {notifications
          .filter((notification) => notification) // Исключаем null/undefined
          .map((notification, index) => (
            <CustomNotification
              key={notification.id}
              id={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={removeNotification}
              style={{ bottom: `${index * 70}px` }} // Смещение по индексу
            />
          ))}
      </div>
      {children}
    </NotificationContext.Provider>
  );
};

// Хук для использования уведомлений
export const useNotification = () => {
  return useContext(NotificationContext);
};