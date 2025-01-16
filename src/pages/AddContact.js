import React, { useState } from 'react';
import CustomNotification from '../components/CustomNotification'; 
import '../styles/addContact.css'; 

import defaultProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function AddContact() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [hasSearched, setHasSearched] = useState(false); 

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    const usernamePattern = /^[a-zA-Z]+$/; 

    if (searchTerm.length < 3) {
      setNotification({ message: 'Пожалуйста, введите минимум 3 символа для поиска.', type: 'error' });
      return;
    }

    if (!usernamePattern.test(searchTerm)) {
      setNotification({ message: 'Имя пользователя может содержать только латинские буквы без специальных символов!', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/users/search?query=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setResults(data);
      } else {
        setNotification({ message: 'Ошибка при поиске пользователей!', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Ошибка сервера. Попробуйте позже!', type: 'error' });
    }
    setHasSearched(true);
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setResults([]);
  };

  const sendFriendRequest = async () => {
    try {
      const response = await fetch(`http://localhost:8080/friends/add/${selectedUser.id}`, { 
        method: 'POST' });
      if (response.ok) {
        setNotification({ message: 'Запрос в друзья отправлен!', type: 'success' });
      } else {
        setNotification({ message: 'Не удалось отправить запрос в друзья!', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Ошибка сервера. Попробуйте позже!', type: 'error' });
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="add-contact-container">
      <h1>Find Friends</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter username"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>

      {notification && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      {hasSearched && results.length > 0 ? (
        <ul className="search-result">
          {results.map(user => (
            <li key={user.id} onClick={() => handleUserSelect(user)} className="search-item">
              {user.username} - {user.fullName}
            </li>
          ))}
        </ul>
      ) : (
        hasSearched && <p>No users found with that username.</p>
      )}

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedUser.fullName}</h2>
            <img src={selectedUser.photo || defaultProfilePhoto} alt="User" className="user-photo" />
            <p>Username: {selectedUser.username}</p>
            <textarea placeholder="Write something about yourself..." className="user-description" />
            <div className="modal-actions">
              <button onClick={sendFriendRequest} className="modal-button">Send Friend Request</button>
              <button className="modal-button">Start Chat</button>
            </div>
            <button onClick={closeModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddContact;