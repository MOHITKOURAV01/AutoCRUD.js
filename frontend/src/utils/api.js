import axios from 'axios';

/**
 * Centalisrd axios instance for AutoCRUD.js backend communication.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for response handling/logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('📡 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
