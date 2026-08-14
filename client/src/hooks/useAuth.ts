import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, logoutThunk, clearError } from '../store/slices/authSlice';
import type { LoginRequest } from '../types/auth.types';

/**
 * Custom hook for authentication actions and state.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    (credentials: LoginRequest) => dispatch(loginThunk(credentials)),
    [dispatch]
  );

  const logout = useCallback(
    () => dispatch(logoutThunk()),
    [dispatch]
  );

  const dismissError = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    dismissError,
  };
}
