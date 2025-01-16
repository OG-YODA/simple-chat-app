import React, { useEffect, useState } from 'react';
import '../styles/notification.css';

import closeIcon from '../assets/media/pics/close.png';

const CustomNotification = ({ message, type, onClose }) => {
  const [fade, setFade] = useState(false); // Управляем классом для исчезновения

  useEffect(() => {
    // Запускаем "испарение" через 3 секунды
    const fadeTimer = setTimeout(() => setFade(true), 2000); // Начинает исчезать через 2 сек.
    
    // Закрываем уведомление через 5 секунд
    const closeTimer = setTimeout(() => onClose(), 5000); // Уведомление полностью исчезнет через 5 сек.

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className={`notification ${type} ${fade ? 'fade-out' : ''}`}>
      <p>{message}</p>
      <button className="close-btn" onClick={onClose}>
        <img src={closeIcon} alt="X" width="32" height="32"/>
      </button>
    </div>
  );
};

export default CustomNotification;