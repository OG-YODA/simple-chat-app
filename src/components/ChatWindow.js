import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatProvider';
import { useMessages } from '../context/MessageProvider';
import { useTranslation } from '../context/TranslationContext';
import Message from './Message';

import '../styles/chatWindow.css'; // Импортируем стили для ChatWindow

const ChatWindow = ({ chatId, nickname, onClose }) => {
  const { checkIfChatExists, createChatOnServer } = useChat();
  const [isExists, setExists] = useState(false);
  const [message, setMessage] = useState('');
  const { translate } = useTranslation();
  const inputRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const {
      messages,
      handleSendMessage,
      handleEditMessage,
      handleReceiveMessage,
      loadOlderMessages,
      handleLoadMore,
      clearMessages,
      fetchMessages,
      
    } = useMessages();

  useEffect(() => {
    console.log('ChatWindow mounted with chatId:', chatId);
    console.log('ChatWindow mounted with username:', nickname);
  
    if (inputRef.current) {
      inputRef.current.focus();
    }
  
    checkIfChatExists(nickname, userId).then((exists) => {
      console.log('Chat existence check between:', nickname, ' and you. Your ID:', userId);
      if (!exists.exists) {
        console.log('Chat does not exist!');
      } else {
        console.log('Chat already exists:', exists.chatId);
        setExists(true);
        loadOlderMessages(new Date().toISOString(), exists.chatId); // завантаження історії
      }
    });
  }, [chatId, nickname, userId]);

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    if (newMessage.length <= 1000) {
      setMessage(newMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!isExists) {
      console.log('Chat does not exist, creating new chat...', nickname, userId);
      createChatOnServer(nickname, userId).then((response) => {
        if (response.status === 200) {
          console.log('Chat created successfully!');
          setExists(true);
          loadOlderMessages(new Date().toISOString(), response.chatId); // завантажити новий чат
        } else {
          console.error('Error creating chat:', response.statusText);
        }
      });
    } else {
      if (message.trim()) {
        const newMessage = {
          id: Date.now().toString(),
          content: message,
          senderUsername: localStorage.getItem('username'),
          chatId: chatId,
          timestamp: new Date().toISOString(),
          sent: false,
          delivered: false,
          read: false,
          isEdited: false,
          isDeleted: false
        };

        console.log('Sending message:', newMessage);
        console.log('Chat ID:', chatId);
        console.log('Messages in state:', messages);
        handleSendMessage(newMessage, chatId);
        setMessage('');
      }
    }
  };

  const getTextAreaHeight = () => {
    const lineHeight = 20;
    const rows = Math.min(Math.ceil(message.length / 40), 4);
    return `${lineHeight * rows}px`;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button onClick={onClose} className="back-button">
          ← Back
        </button>
        <h3>{nickname}</h3>
      </div>
      
      <div className="messages-container">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))
        ) : (
          <p className="no-messages">{translate("no_messages")}</p>
        )}
      </div>

      <div className="message-input-container">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Напишіть повідомлення..."
          rows={1}
          style={{ height: getTextAreaHeight() }}
          maxLength={1000}
        />
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={message.trim() === ''}
        >
          {translate("send_message")}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;