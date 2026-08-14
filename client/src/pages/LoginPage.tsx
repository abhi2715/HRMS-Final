import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import './LoginPage.css';

/**
 * Login page.
 *
 * Full-screen centered form with branding.
 * Redirects to dashboard (or intended URL) after successful login.
 */
export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error, dismissError } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dismissError();
    if (!email.trim() || !password.trim()) return;
    await login({ email: email.trim(), password });
  };

  return (
    <div className="login-page">
      {/* Left: Branding */}
      <div className="login-page__brand">
        <div className="login-page__brand-content">
          <div className="login-page__logo">
            <div className="login-page__logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#4F46E5" />
                <path d="M9 12h6v8H9zM17 8h6v12h-6z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="login-page__logo-text">HRMS</span>
          </div>
          <h1 className="login-page__brand-title">
            Human Resource<br />Management System
          </h1>
          <p className="login-page__brand-description">
            Manage your organization's workforce, teams, tasks, attendance, and payroll — all in one place.
          </p>
          <div className="login-page__brand-features">
            <div className="login-page__feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Employee & Team Management</span>
            </div>
            <div className="login-page__feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Task Tracking & Progress</span>
            </div>
            <div className="login-page__feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Attendance & Leave</span>
            </div>
            <div className="login-page__feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Analytics & Reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="login-page__form-section">
        <div className="login-page__form-container">
          <div className="login-page__form-header">
            <h2 className="login-page__form-title">Sign in</h2>
            <p className="login-page__form-subtitle">Enter your credentials to access the platform</p>
          </div>

          {error && (
            <div className="login-page__error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form className="login-page__form" onSubmit={handleSubmit} noValidate>
            <div className="login-page__field">
              <label className="login-page__label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                className="login-page__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-page__field">
              <label className="login-page__label" htmlFor="login-password">
                Password
              </label>
              <div className="login-page__password-wrapper">
                <input
                  id="login-password"
                  className="login-page__input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-page__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-page__submit"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <span className="login-page__spinner" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
