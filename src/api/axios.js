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
  fetchChartData: (symbol) => api.get(`/api/nse/history?symbol=${encodeURIComponent(symbol)}`),
  createStrategy: (strategyData) => api.post('/api/strategy', strategyData),
  updateStrategy: (strategyData) => api.put('/api/strategy', strategyData),
  deleteStrategy: (id) => api.delete('/api/strategy', {
    params: { id: id }
  }),
  getStrategiesAdmin: () => api.get('/api/strategy/admin'),
  getHeatMap: () => api.get('/api/nse/heatmap'),
  getAllIndices:()=> api.get('/api/nse/allindices'),
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

// Config API methods
export const configAPI = {
  getConfig: () => api.get('/api/config'),
  updateConfig: (configData) => api.patch('/api/config', configData),
  reloadConfig: () => api.post('/api/config'),
};

export const priceActionAPI = {
  createOrderBlock:(obReq)=> api.post('/api/price-action/ob', obReq),
  deleteOrderBlock:(obReq)=> api.delete('/api/price-action/ob',{data: obReq}),
  getOrderBlockBySymbol:(symbol)=> api.get(`/api/price-action/ob/${encodeURIComponent(symbol)}`),
  updateOrderBlock:(obReq)=> api.patch('/api/price-action/ob', obReq),
  checkOrderBlock:()=>api.post('/api/price-action/ob/check'),
}

export default api;
