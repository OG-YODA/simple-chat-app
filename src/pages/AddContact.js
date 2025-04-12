import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNotification } from "../components/NotificationProvider";
import { useTranslation } from "../context/TranslationContext";

import "../styles/addContact.css";
import defaultProfilePhoto from "../assets/media/pics/user-no-profile-pics.png";

function AddContact() {
  const { isAuthenticated, userId } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const { addTemporaryNotification } = useNotification();
  const { translate } = useTranslation();

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    const usernamePattern = /^[a-zA-Z]+$/;

    if (searchTerm.trim().length < 2) {
      addTemporaryNotification(translate("friend_request_typo_min_signs"), "error");
      return;
    }

    if (!usernamePattern.test(searchTerm)) {
      addTemporaryNotification(translate("friend_request_typo_latin"), "error");
      return;
    }

    try {
      console.log("Searching for user:", searchTerm);
      const response = await fetch(`http://192.168.2.100:8080/friends/search?query=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setResults(data);
      }
    } catch (error) {
      console.log("Error searching for user!");
    }
    setHasSearched(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setResults([]);
  };

  const sendFriendRequest = async () => {
    if (!userId || !selectedUser?.username) return;
  
    try {
      const params = new URLSearchParams({
        senderId: userId,
        receiverUsername: selectedUser.username,
      });
  
      const response = await fetch(`http://192.168.2.100:8080/friends/send?${params.toString()}`, {
        method: "POST",
      });
  
      const result = await response.text();
      if (response.ok) {
        addTemporaryNotification(result, "success");
        setHasSentRequest(true);
      } else {
        addTemporaryNotification(result, "error");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      addTemporaryNotification("Ошибка при отправке запроса", "error");
    }
  };

  return (
    <div className="add-contact-container">
      <h1>{translate("find_friends")}</h1>

      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={translate("search_enter_username")}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          {translate("search")}
        </button>
      </div>

      {hasSearched && results.length > 0 ? (
        <ul className="search-result">
          {results.map((user) => (
            <li key={user.id} className="search-item" onClick={() => handleUserSelect(user)}>
              <img src={defaultProfilePhoto} alt="User" className="user-avatar" />
              <div className="user-info">
                <p className="user-fullname">{user.firstname} {user.lastname}</p>
                <p className="user-username">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        hasSearched && <p>{translate("friend_request_error_not_found")}</p>
      )}

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedUser.firstname} {selectedUser.lastname}</h2>
            <img src={selectedUser.photo || defaultProfilePhoto} alt="User" className="user-photo" />
            <p>@{selectedUser.username}</p>
            <div className="modal-actions">
              {hasSentRequest ? (
                <button className="modal-button" disabled>
                  {translate("friend_request_sent")}
                </button>
              ) : (
                <button className="modal-button" onClick={sendFriendRequest}>
                  {translate("friend_send_request")}
                </button>
              )}
              <button className="modal-button">
                {translate("send_message")}</button>
            </div>
            <button className="close-button" onClick={() => setSelectedUser(null)}>
              {translate("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddContact;