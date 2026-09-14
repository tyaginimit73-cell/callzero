import axios from 'axios';

/** Axios instance wired to the Vite dev proxy (relative '/api' URLs). */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HTTP-only cookie on every request
  timeout: 15000,
});

// Global response interceptor producing consistent errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const err = new Error(
      error.response?.data?.message || error.message || 'Network error'
    );
    err.code = error.response?.data?.code || (error.code === 'ERR_NETWORK' ? 'NETWORK' : 'API_ERROR');
    err.status = error.response?.status;
    err.details = error.response?.data?.details;
    if (error.code === 'ERR_NETWORK') err.message = 'Network unreachable. Check your internet connection.';
    return Promise.reject(err);
  }
);

export default api;
