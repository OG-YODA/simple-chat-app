import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

const MessageContext = createContext();

export const useMessages = () => useContext(MessageContext);

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

function messageReducer(state, action) {
  switch (action.type) {
    case "LOAD_MESSAGES":
      return { ...state, messages: [...action.payload, ...state.messages] };
    case "APPEND_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "EDIT_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        ),
      };
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload ? { ...msg, isDeleted: true } : msg
        ),
      };
    case "CLEAR_MESSAGES":
      return { ...initialState };
    default:
      return state;
    case "REPLACE_TEMP_MESSAGE":
        return {
            ...state,
            messages: state.messages.map((msg) =>
            msg.tempId === action.payload.tempId ? { ...msg, ...action.payload } : msg
            ),
        };
    case "UPDATE_MESSAGE_STATUS":
        return {
            ...state,
            messages: state.messages.map(msg => 
              msg.tempId === action.payload.tempId ? { ...msg, status: action.payload.status } : msg
            )
        };
  }
}

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const [stompClient, setStompClient] = useState(null);
  
  const userId = localStorage.getItem("userId");
  const accessKey = localStorage.getItem("accessKey");

  const WS_URL = process.env.REACT_APP_WS_URL || "http://192.168.2.100:8080/ws";


  useEffect(() => {});

  const connectAndSubscribe = (chatId) => {
    if ( !userId || !accessKey) {
      console.log("User Id:", userId, "Access Key:", accessKey);
      console.log("Missing chatId or user credentials, skipping WebSocket connection");
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;
    let client = null;
    let subscription = null;

    const socket = new SockJS(`${WS_URL}`);
    client = Stomp.over(socket);
    client.reconnect_delay = 0; // disable built-in reconnect

    client.connect(
      { userId, accessKey },
      (frame) => {
        console.log("STOMP chat connection established:", frame);
        setStompClient(client);

        const destination = `/chat/${chatId}`;
        subscription = client.subscribe(destination, (msg) => {
          try {
            const parsed = JSON.parse(msg.body);
            dispatch({ type: "APPEND_MESSAGE", payload: parsed });
          } catch (err) {
            console.error("Error parsing chat message:", err);
          }
        });
      },
      (error) => {
        console.error("Chat STOMP error:", error);
        if (attempts < maxAttempts) {
          attempts++;
          console.log(`Retrying chat connection in 5s (attempt ${attempts})`);
          setTimeout(connectAndSubscribe, 5000);
        } else {
          console.error("Max chat connection attempts reached");
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        console.log("Unsubscribed from chat channel");
      }
      if (client && client.connected) {
        client.disconnect(() => {
          console.log("Chat STOMP disconnected");
        });
      }
    };
  };

  // Завантаження старих повідомлень (пагінація)
  const loadOlderMessages = async (lastTimestamp, chatId) => {
    try {
      const url = `/api/chats/${chatId}/messages?before=${lastTimestamp}`
        
      const response = await fetch(url);
      const data = await response.json();
  
      if (Array.isArray(data)) {
        dispatch({ type: "LOAD_MESSAGES", payload: data });
      }
    } catch (error) {
      console.error("Помилка при завантаженні повідомлень:", error);
    }
  };

  const handleSendMessage = (message) => {
    if (!stompClient || !stompClient.connected) {
      console.warn("WebSocket is not connected yet. Message not sent.");
      return;
    }
    const tempId = crypto.randomUUID();
    const messageWithTempId = { ...message, tempId };
    console.log("Sending message:", messageWithTempId);
  
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(messageWithTempId));
    //dispatch({ type: "APPEND_MESSAGE", payload: messageWithTempId });
  };

  // Редагування повідомлення
  const handleEditMessage = (messageId, newContent) => {
    stompClient.send("/app/chat/edit", {}, JSON.stringify({ id: messageId, content: newContent }));
    dispatch({ type: "EDIT_MESSAGE", payload: { id: messageId, content: newContent, isEdited: true } });
  };

  // Видалення повідомлення
  const handleDeleteMessage = (messageId) => {
    stompClient.send("/app/chat/delete", {}, JSON.stringify({ id: messageId }));
    dispatch({ type: "DELETE_MESSAGE", payload: messageId });
  };

  // Очищення при закритті чату
  const clearMessages = () => {
    dispatch({ type: "CLEAR_MESSAGES" });
  };

  return (
    <MessageContext.Provider
      value={{
        messages: state.messages,
        handleSendMessage,
        handleEditMessage,
        handleDeleteMessage,
        loadOlderMessages,
        clearMessages,
        connectAndSubscribe,
        stompClient,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};