// src/api.js
import axios from 'axios';

const API_URL = 'https://1283-64-43-22-202.ngrok-free.app';

export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
