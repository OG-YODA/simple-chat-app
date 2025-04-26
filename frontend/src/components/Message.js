import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import '../styles/message.css'; // Можно добавить стили для сообщений

const Message = ({ message }) => {
  const { translate } = useTranslation();
  const isCurrentUser = message.senderNickname === localStorage.getItem("username");

  const {
    id,
    content,
    senderUsername,
    chatId,
    timestamp,
    sent,
    delivered,
    read,
    isEdited,
    isDeleted,
  } = message;

  // Функция для отображения статусов (галочки)
  const renderStatus = () => {
    const statuses = [];

    // Отображение статуса "отправлено"
    if (sent) {
      statuses.push(
        <span key="sent" className="status-icon sent">✔</span>
      );
    }

    // Отображение статуса "доставлено"
    if (delivered) {
      statuses.push(
        <span key="delivered" className="status-icon delivered">✔✔</span>
      );
    }

    // Отображение статуса "прочитано"
    if (read) {
      statuses.push(
        <span key="read" className="status-icon read">✔✔</span>
      );
    }

    return statuses;
  };

  return (
    <div className={`message ${isDeleted ? 'deleted' : ''}`}  id={id} data-chatid={chatId}
    style={{
      maxWidth: '50%',
      alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
      backgroundColor: isCurrentUser ? '#007bff' : '#f1f1f1',
      color: isCurrentUser ? 'white' : 'black',
      padding: '8px 12px',
      borderRadius: '12px',
      marginBottom: '10px'
    }}>
      {/* Содержимое сообщения */}
      <div className="message-content">
        <p>{content}</p>
        {isEdited && <div className="edited-message">{translate('edited_message')}</div>}
      </div>

      {/* Информация о сообщении */}
      <div className="message-info">
        <span className="sender-name">{senderUsername}</span>
        <span className="timestamp">{new Date(timestamp).toLocaleString()}</span>
      </div>

      {/* Статусы сообщений */}
      <div className="message-status">
        {renderStatus()}
      </div>
    </div>
  );
};

export default Message;