import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    const isAuthEndpoint = config?.url?.includes('/auth/');
    if (response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('klikpanel_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
