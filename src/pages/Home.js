import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';

import ChatWindow from '../components/ChatWindow';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';

import '../styles/home.css';

import userNoProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function Home() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { isAuthenticated, userId } = React.useContext(AuthContext); // Получаем userId из контекста
  const { addTemporaryNotification } = useNotification();
  const { translate } = useTranslation();

  const icons ={
    addUser: {
      light: require("../assets/media/pics/user-add.png"),
      dark: require("../assets/media/pics/user-add_light.png"),
    }
  }

  const addUserIcon = icons.addUser[theme]; // Получаем иконку в зависимости от темы

  // Функция загрузки друзей с бэкенда
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
    setSelectedFriend(friend); // Обработка клика по другу
  };

  const handleAddFriendClick = () => {
    navigate('/add-contact'); // Переход на страницу добавления друга
  };

  return (
    <div className="home-page">
      {/* Левая панель с аватарами друзей */}
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
          <p></p>
        )}
        {/* Иконка "добавить друга" */}
        <div className="friend-icon add-friend" onClick={handleAddFriendClick}>
          <img src={addUserIcon} width="32" height="32" alt="Add friend" />
        </div>
      </div>

      {/* Правая панель для чата */}
      <div className="chat-container">
        {selectedFriend ? (
          <ChatWindow friend={selectedFriend} />
        ) : (
          <div className="chat-placeholder">
            <p>{translate('chat_window_select_to_open')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;