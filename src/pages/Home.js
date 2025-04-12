import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';
import ChatWindow from '../components/ChatWindow';
import AuthContext from '../context/AuthContext';

import '../styles/home.css';

import addUserIcon from '../assets/media/pics/user-add.png';
import userNoProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function Home() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { isAuthenticated, userId } = React.useContext(AuthContext); // Получаем userId из контекста
  const { addTemporaryNotification } = useNotification();
  const { translate } = useTranslation();

  // Функция загрузки друзей с бэкенда
  useEffect(() => {
    const fetchFriends = async () => {
      console.log("Fetching friends from the server...");
      const userId = localStorage.getItem('userId'); // Получаем userId из localStorage
      
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      try {
        const response = await fetch(`http://192.168.2.100:8080/users/friends/${userId}`); // Передаем ID пользователя в URL
        if (!response.ok) {
          console.error('Failed to fetch friends. Response not OK:', response);
          throw new Error('Server responded with error');
        }
    
        const text = await response.text();  // Прочитаем ответ как текст
        try {
          const data = JSON.parse(text);  // Попробуем преобразовать в JSON
          console.log("Successfully fetched friends:", data);  // Логируем полученные данные
          const friendsData = data.map(friend => ({
            ...friend,
            avatar: friend.photo || userNoProfilePhoto // если фото нет, ставим заглушку
          }));
          console.log("Friends data mapped:", friendsData);  // Логируем преобразованные данные
          setFriends(friendsData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          addTemporaryNotification(translate('friends_list_notification_error'), 'error');
          setFriends([]);
        }
      } catch (error) {
        console.error('An error occurred during friends list loading. More:', error);  // Логируем ошибку
        addTemporaryNotification(translate('friends_list_notification_error'), 'error');
        setFriends([]); // В случае ошибки очищаем список
      }
    };

    fetchFriends(); // Вызовем загрузку данных при монтировании компонента
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
          <p>{translate('no_friends')}</p> // Если друзей нет, показываем сообщение
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