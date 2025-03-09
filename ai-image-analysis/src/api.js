// src/api.js
import axios from 'axios';

// Use environment variable if available, otherwise use your ngrok URL
// For local development without ngrok, use http://localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'https://05cc-51-37-98-249.ngrok-free.app';

// Helper function to determine if we should use the /analyze endpoint
// or the root endpoint based on the API URL
const getEndpoint = () => {
  // If using ngrok (your current setup), keep the root endpoint for compatibility
  if (API_URL.includes('ngrok')) {
    return API_URL;
  }
  // If using localhost or other server, use the /analyze endpoint
  return `${API_URL}/analyze`;
};

export const analyzeImage = async (imageFile) => {
  const endpoint = getEndpoint();
  
  console.log(`Sending image to: ${endpoint}`);
  
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/test`);
    return response.data;
  } catch (error) {
    console.error('Error testing connection:', error);
    throw error;
  }
};