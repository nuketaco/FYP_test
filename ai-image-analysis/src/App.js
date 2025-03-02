// src/App.js
import React, { useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import CameraComponent from './CameraComponent';
import { analyzeImage } from './api';

function App() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [backendResult, setBackendResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCapture = (dataUrl) => {
    setCapturedImage(dataUrl);
    // Clear previous results when a new image is captured
    setBackendResult(null);
    setError(null);
  };

  const sendToBackend = async () => {
    if (!capturedImage) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert dataURL to Blob
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], "capture.png", { type: "image/png" });
      
      // Use the analyzeImage function from api.js
      const result = await analyzeImage(file);
      setBackendResult(result);
    } catch (error) {
      console.error('Error sending image:', error);
      setError('Failed to analyze image. Please try again or check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!backendResult) return null;
    
    return (
      <Paper elevation={3} sx={{ mt: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          Analysis Results:
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {backendResult.description && (
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {backendResult.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          {backendResult.confidence && (
            <Typography variant="body2" color="text.secondary">
              <strong>Confidence:</strong> {(backendResult.confidence * 100).toFixed(1)}%
            </Typography>
          )}
          
          {backendResult.timestamp && (
            <Typography variant="body2" color="text.secondary">
              {new Date(backendResult.timestamp).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
        AI Image Analysis
      </Typography>
      
      <CameraComponent onCapture={handleCapture} />
      
      {capturedImage && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6">Captured Image:</Typography>
          <img 
            src={capturedImage} 
            alt="Captured" 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </Box>
      )}
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={sendToBackend} 
          disabled={!capturedImage || loading}
          sx={{ 
            minWidth: '180px',
            py: 1.5,
            px: 3,
            fontSize: '1rem'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'ANALYZE IMAGE'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {renderResult()}
    </Container>
  );
}

export default App;