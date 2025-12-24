import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

// Interceptor to handle session expiry (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthMe = error.config?.url?.includes('/auth/me');
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-expired'));
      if (isAuthMe) {
        return Promise.resolve({ data: null });
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export const userPreferenceAPI = {
  updateUsername: (email, username) => api.patch('/api/user/username', { email, username }),
  updateTheme: (theme) => api.patch('/api/user/theme', { theme }),
}

// User API methods
export const userAPI = {
  signup: (email, password, confirmPassword) => api.post('/api/auth/signup', { email, password, confirmPassword }),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
};

// Strategy API methods
export const strategyAPI = {
  getStrategies: () => api.get('/api/strategy'),
  fetchWithMargin: (strategyName) => api.get(`/api/chartink/fetchWithMargin?strategy=${encodeURIComponent(strategyName)}`),
  createStrategy: (strategyData) => api.post('/api/strategy', strategyData),
  updateStrategy: (id, strategyData) => api.put(`/api/strategy/${id}`, strategyData),
  deleteStrategy: (id) => api.delete(`/api/strategy/${id}`),
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
