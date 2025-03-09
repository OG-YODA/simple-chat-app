import React, { useState, useEffect } from 'react';
import FriendIcon from '../components/FriendIcon';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';

import '../styles/home.css';

import addUserIcon from '../assets/media/pics/user-add.png';
import userNoProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function Home() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [errors, setErrors] = useState({});
  const { addTemporaryNotification } = useNotification();
  const { translate } = useTranslation();

  // Функция загрузки друзей с бэкенда
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends'); 
        if (!response.ok) throw new Error(translate('friends_list_notification_error'));
        
        const data = await response.json();
        const friendsData = data.map(friend => ({
          ...friend,
          avatar: friend.avatar || userNoProfilePhoto
        }));
        
        setFriends(friendsData);
      } catch (error) {
        console.error('An error occured during friends list loading. More:', error);
        addTemporaryNotification(translate('friends_list_notification_error'), 'error' );
        setFriends([]);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  const handleAddFriendClick = () => {
    navigate('/add-contact');
  };

  return (
    <div className="home-page">
      {/* Левая панель с аватарами друзей */}
      <div className="friends-column">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <FriendIcon key={friend.id} friend={friend} onClick={handleFriendClick} />
          ))
        ) : (
          <p></p>
        )}
        {/* Иконка "добавить друга" */}
        <div className="friend-icon add-friend" onClick={handleAddFriendClick}>
          <img src={addUserIcon} width="32" height="32" />
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