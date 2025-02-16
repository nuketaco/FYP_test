// src/CameraComponent.js
import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, TextField } from '@mui/material';

const CameraComponent = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [uploadError, setUploadError] = useState('');

  // Start the video stream with the selected camera
  useEffect(() => {
    const startCamera = async () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Capture the current video frame
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
  };

  // Switch camera: toggle between 'environment' and 'user'
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle image upload from gallery
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* Live viewfinder */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', borderRadius: 8, backgroundColor: '#000' }}
        />
        {/* Hidden canvas for capturing image */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="secondary" onClick={captureImage}>
          Capture Photo
        </Button>
        <Button variant="outlined" onClick={switchCamera}>
          Switch Camera
        </Button>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" hidden accept="image/*" onChange={handleUpload} />
        </Button>
      </Box>
      {uploadError && (
        <Box sx={{ mt: 1 }}>
          <TextField error value={uploadError} helperText={uploadError} variant="standard" fullWidth />
        </Box>
      )}
    </Box>
  );
};

export default CameraComponent;
