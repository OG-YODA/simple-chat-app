import React, { useState, useEffect, useContext } from 'react';
import { useNotification } from '../components/NotificationProvider';
import AuthContext from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';

import ImageCropper from '../components/ImageCropper';
import '../styles/profile.css';

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
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const { addNotification } = useNotification();
    const { translate } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Проверяем локальное хранилище
                const cachedData = localStorage.getItem(`profileData_${userId}`);
                if (cachedData) {
                    setProfileData(JSON.parse(cachedData));
                    return;
                }

                const response = await fetch(`http://192.168.2.100:8080/users/profile/${userId}`);
                if (response.ok) {
                    const data = await response.json();

                    console.log("Received data:", data);

                    const newData = {
                        fullName: data.fullName || 'none',
                        username: data.username || 'none',
                        photo: data.photo || defaultProfilePhoto,
                        description: data.description || 'none'
                    };
                    setProfileData(newData);
                    localStorage.setItem(`profileData_${userId}`, JSON.stringify(newData));
                } else {
                    const errorData = await response.json();
                    addNotification(translate('profile_error'), 'error');
                    setProfileData({
                        fullName: 'none',
                        username: 'none',
                        photo: defaultProfilePhoto,
                        description: 'none'
                    });
                }
            } catch (error) {
                addNotification(translate('profile_error'), 'error');
                setProfileData({
                    fullName: 'none',
                    username: 'none',
                    photo: defaultProfilePhoto,
                    description: 'none'
                });
            }
        };

        if (isAuthenticated && userId) {
            fetchData();
        }
    }, [isAuthenticated, userId]);

    const handlePhotoSubmit = async (sourceType) => {
        try{
            const formData = new FormData();

            if (sourceType === 'storage') {
                const fileInput = document.getElementById('fileInput');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const imageUrl = URL.createObjectURL(file);
                    setUploadedImage(imageUrl);
                    setShowPhotoModal(false);
                    setShowCropper(true);
                    formData.append('file', fileInput.files[0]);
                }
            }

            const response = await fetch(`http://192.168.2.100:8080/users/setProfilePic/${sourceType}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const updatedPhoto = await response.json();
                setProfileData((prevData) => ({ ...prevData, photo: updatedPhoto.photo }));
                // Обновляем локальное хранилище
                localStorage.setItem(`profileData_${userId}`, JSON.stringify({ ...profileData, photo: updatedPhoto.photo }));
                addNotification(translate('photo_update_success'), 'success');
                setShowPhotoModal(false);
            } else {
                addNotification(translate('photo_update_failed'), 'error');
            }

        } catch (error) {
            addNotification(translate('photo_update_failed'), 'error');
        }
    };

    const handleCropSave = (croppedPosition, croppedScale) => {
        // Здесь ты можешь дополнительно обработать `croppedPosition` и `croppedScale`,
        // например, отправить их на сервер или сохранить локально.
        setProfileData((prevData) => ({ ...prevData, photo: uploadedImage }));
        addNotification(translate('photo_updated_success'), 'success');
        setShowCropper(false);
    };

    return (
        <div className="content">
            {isAuthenticated ? (
                <>
                    <h1>{translate('profile')}</h1>
                    <div className="profile-container">
                        <div className="profile-photo">
                            <img src={profileData.photo} alt="Profile" className="profile-photo-img" />
                        </div>
                        <button className="add-photo-button" onClick={() => setShowPhotoModal(true)}>
                            {translate('add_photo')}
                        </button>
                        <ul className="profile-details">
                            <li id="fullname">{profileData.fullName}</li>
                            <li id="username">@ {profileData.username}</li>
                        </ul>
                    </div>
                    <button onClick={logout} className="logout-button">
                        <img src={logoutIcon} alt="Logout" width="64" height="64" />
                    </button>

                    {showPhotoModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>{translate('choose_photo_source')}</h2>
                                <input type="file" id="fileInput" />
                                <button onClick={() => handlePhotoSubmit('local')}>
                                    {translate('upload_from_device')}
                                </button>
                                <button className="close-modal" onClick={() => setShowPhotoModal(false)}>
                                    {translate('close')}
                                </button>
                            </div>
                        </div>
                    )}

                    {showCropper && (
                        <ImageCropper
                            imageSrc={uploadedImage}
                            onSave={handleCropSave}
                            onCancel={() => setShowCropper(false)}
                        />
                    )}
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