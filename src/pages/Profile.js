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
    const [isLoading, setIsLoading] = useState(false); // прелоадер
    const [uploadedImage, setUploadedImage] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);

    const { addTemporaryNotification } = useNotification();
    const { translate } = useTranslation();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://192.168.2.100:8080/profile/refresh-profile-data`, {
                    method: 'GET',
                    headers: {
                        'X-USER-ID': userId,
                        'X-SECURITY-KEY': localStorage.getItem('accessKey'),
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    const username = localStorage.getItem('username');
    
                    const imgRes = await fetch(`http://192.168.2.100:8080/profile/get-avatar/${username}`);
                    const blob = await imgRes.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result;
    
                        setProfileData({
                            fullName: data.fullName || 'none',
                            username: data.username || 'none',
                            photo: base64,
                            description: data.description || ''
                        });
                        setIsLoading(false);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    addTemporaryNotification(translate('profile_error'), 'error');
                    setIsLoading(false);
                }
            } catch (error) {
                addTemporaryNotification(translate('profile_error'), 'error');
                setIsLoading(false);
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
            addTemporaryNotification(translate('unsupported_file_format'), 'error');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setUploadedImage({ url: imageUrl });
        setOriginalFile(file);
        setShowCropper(true);
    };

    const handleCropSave = ({ blob, fileUrl }) => {
        if (!originalFile) return;

        const extension = originalFile.name.split('.').pop().toLowerCase();
        const timestamp = Date.now();
        const newFilename = `${timestamp}.${extension}`;

        const renamedFile = new File([blob], newFilename, { type: blob.type });

        const formData = new FormData();
        formData.append('avatar', renamedFile);
        formData.append('userId', userId);
        formData.append('securityKey', localStorage.getItem('securityKey'));

        fetch('http://192.168.2.100:8080/profile/update-avatar', {
            method: 'POST',
            headers: {
                'X-USER-ID': userId,
                'X-SECURITY-KEY': localStorage.getItem('accessKey'),
            },
            body: formData
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    localStorage.setItem("userAvatar", base64);
                    localStorage.setItem("userAvatarName", newFilename);
                    setProfileData(prev => ({ ...prev, photo: base64 }));
                    addTemporaryNotification(translate('photo_update_success'), 'success');
                    setShowCropper(false);
                    setShowPhotoModal(false);
                };
                reader.readAsDataURL(renamedFile);
            })
            .catch(() => {
                addTemporaryNotification(translate('photo_update_failed'), 'error');
            });
    };

    const handleCropCancel = () => {
        setShowCropper(false);
    };

    const handleRefreshAvatar = async () => {
        try {
            const username = localStorage.getItem('username');
            const imgRes = await fetch(`http://192.168.2.100:8080/profile/get-avatar/${username}`);
            const blob = await imgRes.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                localStorage.setItem("userAvatar", base64);
                setProfileData(prev => ({ ...prev, photo: base64 }));
                addTemporaryNotification(translate('photo_update_success'), 'success');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            addTemporaryNotification(translate('photo_update_failed'), 'error');
        }
    };

    return (
        <div className="content">
            {isAuthenticated ? (
                <>
                    <h1>{translate('profile')}</h1>
                    <div className="profile-container">
                        <div className="profile-photo"
                            onClick={() => setShowPhotoModal(true)}
                            title={translate('click_to_change')}
                        >
                            {isLoading ? (
                                <div className="avatar-loader"></div>
                            ) : (
                                <div className="avatar-wrapper">
                                    <img
                                        src={profileData.photo}
                                        alt="Profile"
                                        className="profile-photo-img clickable-avatar"
                                    />
                                    <div className="avatar-overlay">{translate('change_photo')}</div>
                                </div>
                            )}
                        </div>
                        <ul className="profile-details">
                            <li id="fullname">{profileData.fullName}</li>
                            <li id="username">@ {profileData.username}</li>
                            <li id="description">{profileData.description}</li>
                            <li>
                                <button className="edit-profile-button">{translate('edit_profile')}</button>
                            </li>
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