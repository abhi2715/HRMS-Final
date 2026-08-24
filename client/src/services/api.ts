import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';

/**
 * Centralized Axios instance.
 *
 * - Base URL from environment config
 * - Credentials included for cookie-based refresh tokens
 * - Request interceptor attaches the access token
 * - Response interceptor handles 401 with token refresh + retry
 *
 * Token is stored in memory (not localStorage) for XSS protection.
 */

// In-memory token store
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

const api = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ─────────────────────────────────────
api.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    if (accessToken) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    return requestConfig;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Do not intercept 401s for login or refresh endpoints themselves!
    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // If 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${config.apiBaseUrl}/auth/refresh`,
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          { withCredentials: true }
        );

        const newToken = response.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Redirect to login if refresh fails and we are not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
