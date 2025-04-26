import React, { useEffect, useState } from 'react';
import '../styles/notification.css';
import closeIcon from '../assets/media/pics/close.png';

const CustomNotification = ({ message, type, onClose, style, id }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Таймер для плавного исчезновения
    const fadeTimer = setTimeout(() => setFade(true), 4800); // 4.5 секунды до исчезновения
    // Таймер для удаления уведомления
    const closeTimer = setTimeout(() => onClose(id), 5000); // Удаляем уведомление через 5 секунд

    // Чистим таймеры при размонтировании компонента
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [id, onClose]); // Используем id для независимости таймеров

  return (
    <div className={`notification ${type} ${fade ? 'fade-out' : ''}`} style={style}>
      <p>{message}</p>
      <button className="close-btn" onClick={() => onClose(id)}>
        <img src={closeIcon} alt="X" width="32" height="32" />
      </button>
      <div className="progress-bar"></div>
    </div>
  );
};

export default CustomNotification;