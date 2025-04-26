import React, { useEffect, useState, useRef } from "react";
import { useChat } from "../context/ChatProvider";
import { formatTime } from "../utils/formatTime";
import { useNotification } from "../context/NotificationProvider";
import ChatWindow from "./ChatWindow";

import "../styles/chatList.css"; // Импортируем стили для ChatList
import userNoProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

const ChatList = () => {
  const { addTemporaryNotification } = useNotification();
  const [chats, setChats] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const timersRef = useRef({});

  const { 
    setCurrentChatUser, 
    currentChatUser, 
    setCurrentChatId,
    selectedChat, 
    chatPartner,
    setSelectedChat, 
    getChatPartner,
    setChatPartner,
    isActive,
    setIsActive,
    handleChatOpen, 
    handleCloseChat } = useChat();

    useEffect(() => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
    
      const fetchChats = async () => {
        console.log("Starting chats fetch...");
        try {
          const url = new URL("http://192.168.2.100:8080/chat/user-chats");
          url.searchParams.append("userId", userId);
    
          console.log("Request URL:", url.toString());
          
          const response = await fetch(url, {
            method: "GET",
            headers: {
              'Authorization': localStorage.getItem("accessKey"),
            },
          });
    
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
    
          const data = await response.json();
          console.log("Received data:", data); // Логуємо отримані дані
          
          if (!Array.isArray(data)) {
            throw new Error("Expected array, got " + typeof data);
          }
    
          setChats(data);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
    
      fetchChats();
    }, []);

  const fetchAvatar = async (username) => {
    setAvatar(userNoProfilePhoto);
    try {
        if (username) {
          const imgRes = await fetch(`http://192.168.2.100:8080/profile/get-avatar/${username}`);
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            setAvatar(base64);
            console.log("Avatar loaded for:", username);
          } else {
            console.warn(`No avatar found for ${username}`);
          }
        }
      } catch (err) {
        console.error(`Error loading avatar for ${username}:`, err);
      }
  }

  return (
    <div className="chat-container">
      {!selectedChat ? (
        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => { handleChatOpen(chat);}}
              className="chat-item"
            >
              <div className="chat-item-content">
                <img
                  src={avatar || userNoProfilePhoto}
                  alt="Avatar"
                  className="chat-avatar"
                />
                <div className="chat-info">
                  <span className="chat-Id">{chat.chatId}</span>
                  <span className="chat-name">{getChatPartner(chat).username}</span>
                  <span className="chat-preview">
                    {chat.lastMessage || "Немає повідомлень"}
                  </span>
                </div>
              </div>
              <span className="chat-time">
                {formatTime(chat.lastMessageTimestamp)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <ChatWindow 
          chatId={selectedChat?.chatId}
          nickname={selectedChat?.nickname || chatPartner?.username}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default ChatList;