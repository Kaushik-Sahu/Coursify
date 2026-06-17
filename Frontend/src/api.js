import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Your backend URL from .env
  withCredentials: true, // To send cookies with requests
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/signup') || originalRequest.url.includes('/refresh')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const userType = localStorage.getItem('type');
        let refreshUrl;
        if (userType === 'superadmin') {
          refreshUrl = '/superadmin/refresh';
        } else if (userType === 'admin') {
          refreshUrl = '/admin/refresh';
        } else {
          refreshUrl = '/users/refresh';
        }

        const { data } = await api.post(refreshUrl);
        localStorage.setItem('accessToken', data.accessToken);
        // Update the Authorization header for the retried request
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken; // Also update default for future requests
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Unable to refresh token', refreshError);
        const userType = localStorage.getItem('type');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('type');
        // Redirect superadmin to their login page, others to home
        window.location.href = userType === 'superadmin' ? '/superadmin/login' : '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
