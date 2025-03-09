import React, { useState } from 'react';
import { useNotification } from '../components/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';

import '../styles/addContact.css'; 

import defaultProfilePhoto from '../assets/media/pics/user-no-profile-pics.png';

function AddContact() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [hasSearched, setHasSearched] = useState(false); 
  const { addNotification } = useNotification();
  const { translate } = useTranslation();

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    const usernamePattern = /^[a-zA-Z]+$/; 

    if (searchTerm.length < 3) {
      addNotification(translate('friend_request_typo_min_signs'), 'error');
      return;
    }

    if (!usernamePattern.test(searchTerm)) {
      addNotification(translate('friend_request_typo_latin'), 'error');
      return;
    }

    try {
      const response = await fetch(`http://192.168.2.100:8080/users/search?query=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setResults(data);
      }
    } catch (error) {}
    setHasSearched(true);
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setResults([]);
  };

  const sendFriendRequest = async () => {
    try {
      const response = await fetch(`http://192.168.2.100:8080/friends/add/${selectedUser.id}`, { 
        method: 'POST' });
      if (response.ok) {
        addNotification(translate('friend_request_sent'), 'success');
      } else {
        addNotification(translate('firend_request_error'), 'error');
      }
    } catch (error) {
      addNotification(translate('friend_request_server_error'), 'error');
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="add-contact-container">
      <h1>{translate('find_friends')}</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={translate('search_enter_username')}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">{translate('search')}</button>
      </div>

      {hasSearched && results.length > 0 ? (
        <ul className="search-result">
          {results.map(user => (
            <li key={user.id} onClick={() => handleUserSelect(user)} className="search-item">
              {user.username} - {user.fullName}
            </li>
          ))}
        </ul>
      ) : (
        hasSearched && <p>{translate('friend_request_error_not_found')}</p>
      )}

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedUser.fullName}</h2>
            <img src={selectedUser.photo || defaultProfilePhoto} alt="User" className="user-photo" />
            <p>{translate('username')} {selectedUser.username}</p>
            <div className="modal-actions">
              <button onClick={sendFriendRequest} className="modal-button">{translate('friend_send_request')}</button>
              <button className="modal-button">{translate('send_message')}</button>
            </div>
            <button onClick={closeModal} className="close-button">{translate('close')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddContact;