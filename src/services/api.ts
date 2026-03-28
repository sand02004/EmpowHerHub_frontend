import axios from 'axios';

// Singleton API instance globally bound to the NestJS backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject real JWT tokens (skip DEMO sentinel)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Do not send the header if we're hitting auth routes (login/register)
    const isAuthRoute = config.url?.includes('auth/login') || config.url?.includes('auth/register');
    
    if (token && token !== 'DEMO' && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized.');
      localStorage.removeItem('token');
      localStorage.removeItem('empowher_role');
      localStorage.removeItem('empowher_status');
      localStorage.removeItem('empowher_assessment');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
