// src/components/Camera.js
import React, { useState } from 'react';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

const CameraComponent = ({ onCapture }) => {
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  const handleTakePhoto = (dataUri) => {
    onCapture(dataUri);
  };

  const handleSwitchCamera = () => {
    setIsFrontCamera((prev) => !prev);
  };

  return (
    <div>
      <Camera
        onTakePhoto={handleTakePhoto}
        idealFacingMode={isFrontCamera ? 'user' : 'environment'}
      />
      <button onClick={handleSwitchCamera}>
        Switch to {isFrontCamera ? 'Rear' : 'Front'} Camera
      </button>
    </div>
  );
};

export default CameraComponent;
