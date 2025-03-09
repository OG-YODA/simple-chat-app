import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

function ImageCropper({ imageSrc, onSave, onCancel }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        isDragging.current = true;
        startPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging.current) {
            setPosition({
                x: e.clientX - startPos.current.x,
                y: e.clientY - startPos.current.y,
            });
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleWheel = (e) => {
        setScale((prevScale) => Math.max(0.5, Math.min(3, prevScale - e.deltaY * 0.001)));
    };

    return (
        <div className="cropper-modal">
            <div
                className="crop-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <img
                    src={imageSrc}
                    alt="Crop"
                    className="crop-image"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    }}
                />
            </div>
            <div className="crop-controls">
                <button onClick={onCancel} className="cancel-button">Cancel</button>
                <button onClick={() => onSave(position, scale)}>Save</button>
            </div>
        </div>
    );
}

ImageCropper.propTypes = {
    imageSrc: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ImageCropper;