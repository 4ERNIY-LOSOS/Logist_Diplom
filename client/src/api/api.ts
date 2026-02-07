import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration (optional, can be more sophisticated)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear localStorage and redirect to login
      localStorage.removeItem('jwt_token');
      // Optionally, redirect to login page
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  },
);

export default api;
