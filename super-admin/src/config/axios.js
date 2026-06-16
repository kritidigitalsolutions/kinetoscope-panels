/* ============================================================
   Config: axios.js
   Description: Centralized Axios instance with auth token,
                base URL from env, and interceptors
   ============================================================ */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor: Attach Bearer token ──────────────
api.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('kfpl_auth');
      if (authData) {
        const token = JSON.parse(authData)?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error('Failed to parse auth data', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 (session expired) ────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect to login
      localStorage.removeItem('kfpl_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/* ============ END: axios.js ============ */
