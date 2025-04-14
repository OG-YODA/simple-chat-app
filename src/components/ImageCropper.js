import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

import '../styles/imageCropper.css'; // Импортируйте CSS файл для стилей компонента

function ImageCropper({ imageSrc, onSave, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSave = async () => {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage);
    };

    function getCroppedImg(imageSrc, pixelCrop) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = imageSrc;
    
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;
                const ctx = canvas.getContext('2d');
    
                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );
    
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        return reject(new Error('Canvas is empty'));
                    }
                    blob.name = 'cropped.jpeg';
                    const fileUrl = URL.createObjectURL(blob);
                    resolve({ blob, fileUrl });
                }, 'image/jpeg');
            };
    
            image.onerror = () => reject(new Error('Failed to load image'));
        });
    }

    return (
        <div className="cropper-wrapper">
            <div className="cropper-container">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="cover"
                    disableScrollZoom={true}
                />
            </div>
            <div className="cropper-controls">
                <button onClick={handleSave}>Сохранить</button>
                <button onClick={onCancel}>Отмена</button>
            </div>
        </div>
    );
}

export default ImageCropper;