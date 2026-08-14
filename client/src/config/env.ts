/**
 * Centralized environment configuration.
 *
 * All Vite env vars must be prefixed with VITE_.
 * This module provides typed access with fallbacks.
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'HRMS',
  environment: import.meta.env.MODE || 'development',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
