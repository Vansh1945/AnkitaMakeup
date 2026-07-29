import axios from 'axios';

// Get API base URL from env or fallback to localhost port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Necessary to send JWT stored in HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Can append custom authorization headers dynamically if needed)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Converts nested error responses to unified API messages)
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Custom formatted error response
    return Promise.reject({
      message,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export default api;
