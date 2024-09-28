import React from 'react';
import '../styles/home.css';

function FriendIcon({ friend, onClick }) {
  return (
    <div className="friend-icon" onClick={() => onClick(friend)}>
      <img
        src={friend.avatar || 'https://via.placeholder.com/50'}
        alt={friend.name}
        className="avatar"
      />
    </div>
  );
}

export default FriendIcon;