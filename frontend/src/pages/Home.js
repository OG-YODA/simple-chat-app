import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';
import ChatWindow from '../components/ChatWindow'; // Импортируем ChatWindow
import { useWebSocket } from '../context/WebSocketProvider';
import ChatList from "../components/ChatList";

import {useChat} from "../context/ChatProvider";
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

import '../styles/home.css';
import userNoProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function Home() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null); // Для модального вікна з профілем друга
  const { isAuthenticated } = React.useContext(AuthContext);
  const { addTemporaryNotification } = useNotification();
  const { translate } = useTranslation();

  const { 
    openBlankChat, 
    selectedChat, 
    setSelectedChat, 
    setBlankChatUser, 
    handleCloseChat, 
    handleChatSelect,
    chatPartner, 
    setChatPartner 
  } = useChat(); // Для відкриття чату з другом

  const icons = {
    addUser: {
      light: require("../assets/media/pics/user-add.png"),
      dark: require("../assets/media/pics/user-add_light.png"),
    }
  };

  const addUserIcon = icons.addUser[theme];

  useEffect(() => {
    const fetchFriends = async () => {
      console.log("Fetching friends from the server...");
      const userId = localStorage.getItem('userId');
  
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }
  
      try {
        const response = await fetch(`http://192.168.2.100:8080/users/friends/${userId}`);
        if (!response.ok) {
          console.error('Failed to fetch friends. Response not OK:', response);
          throw new Error('Server responded with error');
        }
  
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          console.log("Successfully fetched friends:", data);
  
          // Загружаем аватарки по username
          const friendsDataWithAvatars = await Promise.all(
            data.map(async (friend) => {
              let avatarBase64 = userNoProfilePhoto;
  
              try {
                if (friend.username) {
                  const imgRes = await fetch(`http://192.168.2.100:8080/profile/get-avatar/${friend.username}`);
                  if (imgRes.ok) {
                    const blob = await imgRes.blob();
                    const base64 = await new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result);
                      reader.onerror = reject;
                      reader.readAsDataURL(blob);
                    });
                    avatarBase64 = base64;
                  } else {
                    console.warn(`No avatar found for ${friend.username}`);
                  }
                }
              } catch (err) {
                console.error(`Error loading avatar for ${friend.username}:`, err);
              }
  
              return {
                ...friend,
                avatar: avatarBase64,
              };
            })
          );
  
          console.log("Friends data with avatars:", friendsDataWithAvatars);
          setFriends(friendsDataWithAvatars);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          addTemporaryNotification(translate('friends_list_notification_error'), 'error');
          setFriends([]);
        }
      } catch (error) {
        console.error('An error occurred during friends list loading. More:', error);
        addTemporaryNotification(translate('friends_list_notification_error'), 'error');
        setFriends([]);
      }
    };
  
    fetchFriends();
  }, []);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend); // 👉 відкриваємо профіль друга в модальному вікні
  };

  const handleAddFriendClick = () => {
    navigate('/add-contact');
  };

  if (!isAuthenticated) {
    // Якщо користувач не авторизований, редиректимо на сторінку входу
    return <div>{translate('please_log_in')}</div>;
  }

  return (
    <div className="home-page">
      {/* Ліва колонка — друзі */}
      <div className="friends-column">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.id} className="friend-item" onClick={() => handleFriendClick(friend)}>
              <div className="friend-avatar">
                <img src={friend.avatar} alt="avatar" className="avatar-img" />
              </div>
              <div className="friend-info">
                <p className="friend-name">{friend.firstname} {friend.lastname}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-friends-message">{translate('no_friends_found')}</p>
        )}

        {/* Додати друга */}
        <div className="friend-icon add-friend" onClick={handleAddFriendClick}>
          <img src={addUserIcon} width="32" height="32" alt="Add friend" />
        </div>
      </div>

      {/* Модальне вікно профілю друга */}
      {selectedFriend && (
        <div className="friend-profile-modal">
          <div className="modal-content">
            <h2>{selectedFriend.firstname} {selectedFriend.lastname}</h2>
            <img src={selectedFriend.photo || userNoProfilePhoto} alt="User" className="user-photo" />
            <p>@{selectedFriend.username}</p>
            <div className="modal-actions">
                <button className="modal-button" onClick={() => {
                  setSelectedFriend(null);
                  setSelectedChat(null);
                  setBlankChatUser(null);
                  openBlankChat(selectedFriend.username);
                }}>
                  {translate("send_message")}
                </button>
            </div>
            <button className="close-button" onClick={() => setSelectedFriend(null)}>
              {translate("close")}
            </button>
          </div>
        </div>
      )}

      <div className="chat-window-container">
        {selectedChat ? (
          <ChatWindow
            chatId= {selectedChat.chatId}
            nickname={selectedChat.nickname}
            onClose={handleCloseChat}
          />
        ) : (
          <ChatList onSelectChat={handleChatSelect} />
        )}
      </div>
    </div>
  );
}

export default Home;