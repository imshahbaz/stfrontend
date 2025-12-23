import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, 
    withCredentials: true,
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle session expiry (401 errors)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If the token is expired or invalid, clear state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-expired'));
        }
        return Promise.reject(error);
    }
);

// Auth API methods
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  updateUsername: (email, username) => api.patch('/api/auth/username', { email, username }),
};

// User API methods
export const userAPI = {
  signup: (email, password) => api.post('/signup', { email, password }),
  verifyOtp: (email, otp) => api.post('/verify-otp', { email, otp }),
};

// Strategy API methods
export const strategyAPI = {
  getStrategies: () => api.get('/api/strategy'),
  fetchWithMargin: (strategyName) => api.get(`/api/chartink/fetchWithMargin?strategy=${encodeURIComponent(strategyName)}`),
};

// Margin API methods
export const marginAPI = {
  getAllMargins: () => api.get('/api/margin/all'),
  loadFromCsv: (formData) => api.post('/api/margin/load-from-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
