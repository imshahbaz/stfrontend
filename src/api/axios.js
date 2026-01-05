import axios from 'axios';

const APP_KEY = import.meta.env.VITE_TRUECALLER_APP_KEY;
const APP_NAME = "Shahbaz Trades";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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
  clientConfig: () => api.get('/api/config/client/active')
};

export const userPreferenceAPI = {
  updateUsername: (userId, username, password) => api.patch('/api/user/username', { userId, username, password }),
  updateTheme: (theme) => api.patch('/api/user/theme', { theme }),
}

// User API methods
export const userAPI = {
  signup: (email, password, confirmPassword) => api.post('/api/auth/signup', { email, password, confirmPassword }),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  linkEmail: (userId, email, password, confirmPassword) => api.post('/api/user/send-update-otp', { userId, email, password, confirmPassword }),
  verifyUpdateOtp: (email, otp) => api.post('/api/user/verify-update-otp', { email, otp }),
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
  getAllIndices: () => api.get('/api/nse/allindices'),
};

// Margin API methods
export const marginAPI = {
  getAllMargins: () => api.get('/api/margin/all'),
  loadFromCsv: (formData) => api.post('/api/margin/load-from-csv', formData),
};

// Config API methods
export const configAPI = {
  getConfig: () => api.get('/api/config/active'),
  updateConfig: (configData) => api.patch('/api/config/update', configData),
  reloadConfig: () => api.post('/api/config/reload'),
};

export const priceActionAPI = {
  createOrderBlock: (obReq) => api.post('/api/price-action/ob', obReq),
  deleteOrderBlock: (obReq) => api.delete('/api/price-action/ob', { data: obReq }),
  getPriceActionBySymbol: (symbol) => api.get(`/api/price-action/${encodeURIComponent(symbol)}`),
  updateOrderBlock: (obReq) => api.patch('/api/price-action/ob', obReq),
  checkOrderBlock: () => api.get('/api/price-action/ob/mitigation'),
  refreshMitigationData: () => api.post('/api/price-action/ob/check'),

  //fvg
  createFVG: (fvgReq) => api.post('/api/price-action/fvg', fvgReq),
  deleteFVG: (fvgReq) => api.delete('/api/price-action/fvg', { data: fvgReq }),
  updateFVG: (fvgReq) => api.patch('/api/price-action/fvg', fvgReq),
  checkFVGMitigation: () => api.get('/api/price-action/fvg/mitigation'),
  refreshFvgMitigationData: () => api.post('/api/price-action/fvg/check'),
}

export const truecallerAPI = {
  getTruecallerStatus: (requestId) => api.get(`/api/auth/truecaller/status/${requestId}`),
  truecallerLogin: (requestId) => `truecallersdk://truesdk/web_verify?type=btmsheet&requestNonce=${requestId}&partnerKey=${APP_KEY}&partnerName=${APP_NAME}&lang=en&title=logIn&skipOption=useanothernum`,
}

export const googleAPI = {
  googleCallback: (code, random) => api.get("/api/auth/google/callback", {
    params: {
      code: code,
      state: random
    }
  }),
  googleTokenValidation: (token) => api.post("/api/auth/google/token",null, { params: { code: token, state: "validate" } })
}

export default api;