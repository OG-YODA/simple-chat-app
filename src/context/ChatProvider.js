import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketProvider';
import { useMessages } from './MessageProvider';
import { MessageProvider } from './MessageProvider';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isDraftBlocked, setIsDraftBlocked] = useState(false);
  const [draftMessage, setDraftMessage] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [blankChatUser, setBlankChatUser] = useState(null); // Для обрання пустого чату
  const [isActive, setIsActive] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null); // Для обрання чату
  const token = localStorage.getItem("accessKey");
  const userId = localStorage.getItem("userId");

  const [blankChat, setBlankChat] = useState({
    chatId: null,
    nickname: null
  });
  

  const { stompClient } = useWebSocket();
  const {
    messages,
    handleSendMessage,
    handleEditMessage,
    handleReceiveMessage,
    loadOlderMessages,
    handleLoadMore,
    clearMessages,
    connectAndSubscribe,
    
  } = useMessages(currentChatId || null);

  // Перевірка чату при його відкритті
  useEffect(() => {
    if (blankChat.nickname) {
      console.log("✅ Blank chat оновлено:", blankChat);
    }
  }, [blankChat]);

  const handleChatOpen = async (chat) => {
    const partner = getChatPartner(chat);
    setChatPartner(partner);
    setSelectedChat({
      chatId: chat.chatId,
      nickname: partner?.username || chat.nickname,
    });

    connectAndSubscribe(chat.chatId);
  };

  const getChatPartner = (chat) => {
    const participants = chat.participants || [];
    const myUserName = localStorage.getItem("username");
    return participants.find((participant) => participant.username !== myUserName) || null;
  }

  const handleChatCreate = async () => {
    if (!draftMessage || !chatPartner) return;
  
    const created = await createChatOnServer(chatPartner, userId); // 👈 Додайте userId
    if (created.success && created.chatId) {
      setCurrentChatId(created.chatId);
      setIsDraftBlocked(false);
      
      // Оновлюємо blankChat з новим chatId
      setBlankChat(prev => ({
        ...prev,
        chatId: created.chatId,
      }));
  
      // Оновлюємо selectedChat, якщо це blankChat
      setSelectedChat(prev => 
        prev?.chatId === null && prev?.nickname === chatPartner 
          ? { ...prev, chatId: created.chatId } 
          : prev
      );
  
      await handleSendMessage({
        ...draftMessage,
        chatId: created.chatId,
      });
      setDraftMessage(null);
    }
  };

  const handleSend = async (messageData) => {
    if (!currentChatId) {
      setDraftMessage(messageData);
      await handleChatCreate();
    } else {
      await handleSendMessage({ ...messageData, chatId: currentChatId });
    }
  };

  const showLastMessage = () => {
    const chatMessages = messages[messages.length-1] || [];
    return chatMessages.length ? chatMessages[chatMessages.length - 1] : null;
  };

  const openBlankChat = (username) => {
    const newBlankChat = ({
      chatId: null,// null
      nickname: username,
    });

    setBlankChat(newBlankChat); // 1. Встановлюємо новий стан
    setChatPartner(username);   // 2. Оновлюємо партнера
    setSelectedChat(newBlankChat); // 3. Використовуємо ТЕ ЖЕ значення для selectedChat
    console.log("Opening blank chat with:", username, "Chat data:", blankChat);
  };

  const handleCloseChat = () => {
    console.log("Closing chat:", selectedChat);
    setSelectedChat(null);
    setChatPartner(null);
    setCurrentChatId(null);
    setIsDraftBlocked(false);
    clearMessages();
  };

  const checkIfChatExists = async (nickname, myUserId) => {
    try {
      const url = new URL("http://192.168.2.100:8080/chat/check");
      url.searchParams.append("username", nickname);
      url.searchParams.append("userId2", myUserId);
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          return { exists: false };
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const chatId = await response.text(); // бо бекенд просто повертає chatId як текст

    // Оновлюємо blankChat, якщо він активний
    setBlankChat(prev => {
      if (prev?.nickname === nickname && prev?.chatId === null) {
        return { ...prev, chatId };
      }
      return prev;
    });

    // Оновлюємо selectedChat, якщо це blankChat
    setSelectedChat(prev => {
      if (prev?.nickname === nickname && prev?.chatId === null) {
        return { ...prev, chatId };
      }
      return prev;
    });

    if (
      selectedChat?.chatId === null &&
      selectedChat?.nickname === nickname &&
      chatId
    ) {
      handleChatOpen({ chatId, nickname });
    }

      return { exists: true, chatId };
    } catch (error) {
      console.error("Помилка при перевірці чату:", error);
      return { exists: false };
    }
  };
  
  const createChatOnServer = async (nickname, myUserId) => {
    if (!nickname || !myUserId){
      console.error("Неправильні дані для створення чату:", nickname, myUserId);
      return { success: false };
    };
    console.log("Створення чату з:", nickname, "для користувача:", myUserId);
    try {
      const response = await fetch(`http://192.168.2.100:8080/chat/create?username=${nickname}&userId2=${myUserId}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();

      // Оновлюємо blankChat, якщо він активний
    setBlankChat(prev => {
      if (prev?.nickname === nickname && prev?.chatId === null) {
        return { ...prev, chatId: data.chatId };
      }
      return prev;
    });

    // Оновлюємо selectedChat, якщо це blankChat
    setSelectedChat(prev => {
      if (prev?.nickname === nickname && prev?.chatId === null) {
        return { ...prev, chatId: data.chatId };
      }
      return prev;
    });

    if (
      selectedChat?.chatId === null &&
      selectedChat?.nickname === chatPartner &&
      data.chatId
    ) {
      handleChatOpen({ chatId: data.chatId, nickname });
    }

      return { success: data.success, chatId: data.chatId || null };
    } catch (error) {
      console.error("Помилка при створенні чату:", error);
      return { success: false };
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatPartner,
        currentChatId,
        handleChatOpen,
        handleChatCreate,
        handleSend,
        isDraftBlocked,
        selectedChat,
        setSelectedChat,
        showLastMessage,
        checkIfChatExists, 
        createChatOnServer,
        getChatPartner,
        openBlankChat,
        handleCloseChat,
        setBlankChatUser, 
        chatPartner,
        currentChatId,
        setCurrentChatId,
        blankChat,
        setBlankChat,
      }}
    >
        {children}
    </ChatContext.Provider>
  );
};