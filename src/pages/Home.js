import React, { useState } from 'react';
import FriendIcon from '../components/FriendIcon';
import ChatWindow from '../components/ChatWindow';
import '../styles/home.css';

function Home() {
  // Временно создаём список друзей, который позже будет заменён данными из базы
  const [friends, setFriends] = useState([
    { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/50' },
    { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/50' },
    { id: 3, name: 'Alex Green', avatar: 'https://via.placeholder.com/50' },
  ]);

  // Обработка клика по другу для открытия чата
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="home-page">
      {/* Левая панель с аватарами друзей */}
      <div className="friends-column">
        {friends.map((friend) => (
          <FriendIcon key={friend.id} friend={friend} onClick={handleFriendClick} />
        ))}
        {/* Иконка "добавить друга", которая всегда внизу */}
        <div className="friend-icon add-friend">
          <img src="https://via.placeholder.com/50" alt="Добавить друга" />
        </div>
      </div>

      {/* Правая панель для чата */}
      <div className="chat-container">
        {selectedFriend ? (
          <ChatWindow friend={selectedFriend} />
        ) : (
          <div className="chat-placeholder">
            <p>Выберите друга, чтобы открыть чат.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;