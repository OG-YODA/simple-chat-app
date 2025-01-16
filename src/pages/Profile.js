import React, { useState, useEffect, useContext } from 'react';
import CustomNotification from '../components/CustomNotification';
import AuthContext from '../context/AuthContext';
import '../styles/profile.css';

// Импортируем иконки
import defaultProfilePhoto from '../assets/media/pics/profile-no-photo-512.png';
import logoutIcon from '../assets/media/pics/exit.png';

function Profile() {
    const { isAuthenticated, userId, logout } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        fullName: null,
        username: null,
        photo: defaultProfilePhoto,
        description: null
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/users/profile/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    console.log("Received data:", data);
    
                    setProfileData({
                        fullName: data.fullName || 'Имя не указано',
                        username: data.username || 'Ник не указан',
                        photo: data.photo || defaultProfilePhoto,  
                        description: data.description || 'Нету описания'
                    });
                } else {
                    const errorData = await response.json();
                    setNotification({ message: `Ошибка: ${errorData.message}`, type: 'error' });
                    setProfileData({
                        fullName: 'Имя не указано',
                        username: 'Ник не указан',
                        photo: defaultProfilePhoto,
                        description: 'Нету описания'
                    });
                }
            } catch (error) {
                setNotification({ message: 'Ошибка при загрузке данных. Попробуйте позже!', type: 'error' });
                setProfileData({
                    fullName: 'Имя не указано',
                    username: 'Ник не указан',
                    photo: defaultProfilePhoto,
                    description: 'Нету описания'
                });
            }
        };
    
        if (isAuthenticated && userId) {
            fetchData();
        }
    }, [isAuthenticated, userId]);

    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <div className="content">
            {notification && (
                <CustomNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
            {isAuthenticated ? (
                <>
                    <h1>Profile</h1>
                    <div className="profile-container">
                        <div className="profile-photo">
                            <img
                                src={profileData.photo}
                                alt="Profile"
                                className="profile-photo-img"
                            />
                        </div>
                        <ul className="profile-details">
                            <li id="fullname">Имя: {profileData.fullName}</li>
                            <li id="username">Ник: {profileData.username}</li>
                        </ul>
                    </div>
                    <button onClick={logout} className="logout-button">
                        <img src={logoutIcon} alt="Logout" width="64" height="64" />
                    </button>
                </>
            ) : (
                <div className="banner">
                    <h1>You are not authorized to see this page!</h1>
                </div>
            )}
        </div>
    );
}

export default Profile;