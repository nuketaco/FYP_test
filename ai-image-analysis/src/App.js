// src/App.js
import React, { useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import CameraComponent from './CameraComponent';
import axios from 'axios';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [backendResult, setBackendResult] = useState('');

  // Replace this with your ngrok HTTPS URL (e.g., https://xxxxx.ngrok.io)
  const API_ENDPOINT = '  https://1694-64-43-22-202.ngrok-free.app';

  const handleCapture = (dataUrl) => {
    setCapturedImage(dataUrl);
  };

  const sendToBackend = async () => {
    if (!capturedImage) return;
    // Convert dataURL to Blob
    const blob = await fetch(capturedImage).then(r => r.blob());
    const formData = new FormData();
    formData.append('image', blob, 'capture.png');

    try {
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBackendResult(JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      setBackendResult('Error sending image.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        AI Image Analysis
      </Typography>
      <CameraComponent onCapture={handleCapture} />
      {capturedImage && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Captured Image:</Typography>
          <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: '400px' }} />
        </Box>
      )}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={sendToBackend} disabled={!capturedImage}>
          Analyze Image
        </Button>
      </Box>
      {backendResult && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Backend Result:</Typography>
          <Typography variant="body1">{backendResult}</Typography>
        </Box>
      )}
    </Container>
  );
}

export default App;

