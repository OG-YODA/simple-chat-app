import React, { useState, useEffect, useContext } from 'react';
import { useNotification } from '../components/NotificationProvider';
import { useTranslation } from '../context/TranslationContext';
import AuthContext from '../context/AuthContext';
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
    const [originalFile, setOriginalFile] = useState(null);

    const { addNotification } = useNotification();
    const { translate } = useTranslation();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://192.168.2.100:8080/profile/refreshProfileData/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    const serverPhotoName = data.photoName;

                    const localAvatarName = localStorage.getItem("userAvatarName");
                    const localAvatar = localStorage.getItem("userAvatar");

                    let photoToUse = defaultProfilePhoto;

                    if (localAvatarName === serverPhotoName) {
                        photoToUse = localAvatar;
                    } else if (serverPhotoName) {
                        const imgRes = await fetch(`http://192.168.2.100:8080/users/getAvatar/${userId}`);
                        const blob = await imgRes.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result;
                            localStorage.setItem("userAvatar", base64);
                            localStorage.setItem("userAvatarName", serverPhotoName);
                            setProfileData({
                                fullName: data.fullName || 'none',
                                username: data.username || 'none',
                                photo: base64,
                                description: data.description || 'none'
                            });
                        };
                        reader.readAsDataURL(blob);
                        return;
                    }

                    setProfileData({
                        fullName: data.fullName || 'none',
                        username: data.username || 'none',
                        photo: photoToUse,
                        description: data.description || 'none'
                    });
                } else {
                    addNotification(translate('profile_error'), 'error');
                }
            } catch (error) {
                addNotification(translate('profile_error'), 'error');
            }
        };

        if (isAuthenticated && userId) {
            fetchData();
        }
    }, [isAuthenticated, userId]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!allowedTypes.includes(file.type)) {
            addNotification(translate('unsupported_file_format'), 'error');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setUploadedImage({ url: imageUrl });
        setOriginalFile(file);
        setShowCropper(true);
    };

    const handleCropSave = (croppedBlob) => {
        if (!originalFile) return;

        const extension = originalFile.name.split('.').pop().toLowerCase();
        const timestamp = Date.now();
        const newFilename = `${timestamp}.${extension}`;

        const renamedFile = new File([croppedBlob], newFilename, { type: croppedBlob.type });

        const formData = new FormData();
        formData.append('avatar', renamedFile);
        formData.append('userId', userId);
        formData.append('securityKey', localStorage.getItem('securityKey'));

        fetch('http://192.168.2.100:8080/profile/update-avatar', {
            method: 'POST',
            body: formData
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                // Преобразуем отправленный файл в base64 и сохраняем
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    localStorage.setItem("userAvatar", base64);
                    localStorage.setItem("userAvatarName", newFilename);
                    setProfileData(prev => ({ ...prev, photo: base64 }));
                    addNotification(translate('photo_update_success'), 'success');
                    setShowCropper(false);
                    setShowPhotoModal(false);
                };
                reader.readAsDataURL(renamedFile);
            })
            .catch(() => {
                addNotification(translate('photo_update_failed'), 'error');
            });
    };

    const handleCropCancel = () => {
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
                                <input type="file" id="fileInput" onChange={handleFileChange} accept="image/*" />
                                <button className="close-modal" onClick={() => setShowPhotoModal(false)}>
                                    {translate('close')}
                                </button>
                            </div>
                        </div>
                    )}

                    {showCropper && uploadedImage && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <ImageCropper
                                    imageSrc={uploadedImage.url}
                                    onSave={handleCropSave}
                                    onCancel={handleCropCancel}
                                />
                            </div>
                        </div>
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