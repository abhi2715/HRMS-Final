import { useEffect, useState } from 'react';
import { healthService, type HealthResponse } from '../services/health.service';
import './DashboardPage.css';

/**
 * Dashboard page — Phase 1 version.
 *
 * Shows a system status overview with live backend connectivity check.
 * Will evolve into a role-adaptive dashboard as modules are built.
 */
export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const response = await healthService.check();
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError('Unable to connect to the backend server.');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Welcome to your HRMS platform</p>
        </div>
      </div>

      <div className="dashboard__grid">
        {/* System Status Card */}
        <div className="status-card">
          <div className="status-card__header">
            <h2 className="status-card__title">System Status</h2>
            <div className={`status-indicator ${loading ? 'status-indicator--loading' : error ? 'status-indicator--error' : 'status-indicator--success'}`}>
              <span className="status-indicator__dot" />
              <span className="status-indicator__text">
                {loading ? 'Checking...' : error ? 'Offline' : 'Operational'}
              </span>
            </div>
          </div>

          {loading && (
            <div className="status-card__body">
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
              <div className="skeleton skeleton--line skeleton--medium" />
            </div>
          )}

          {error && (
            <div className="status-card__body">
              <div className="status-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {health && !error && (
            <div className="status-card__body">
              <div className="status-row">
                <span className="status-row__label">Server</span>
                <span className="status-row__value status-row__value--success">{health.status}</span>
              </div>
              <div className="status-row">
                <span className="status-row__label">Database</span>
                <span className={`status-row__value ${health.database.status === 'connected' ? 'status-row__value--success' : 'status-row__value--error'}`}>
                  {health.database.status}
                </span>
              </div>
              <div className="status-row">
                <span className="status-row__label">Environment</span>
                <span className="status-row__value">{health.environment}</span>
              </div>
              <div className="status-row">
                <span className="status-row__label">Memory</span>
                <span className="status-row__value">{health.memory.used} / {health.memory.total} {health.memory.unit}</span>
              </div>
              <div className="status-row">
                <span className="status-row__label">Uptime</span>
                <span className="status-row__value">{formatUptime(health.uptime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Getting Started Card */}
        <div className="getting-started-card">
          <div className="getting-started-card__header">
            <h2 className="getting-started-card__title">Getting Started</h2>
            <p className="getting-started-card__subtitle">Set up your organization</p>
          </div>
          <div className="getting-started-card__body">
            <div className="setup-step">
              <div className="setup-step__number">1</div>
              <div className="setup-step__content">
                <h3 className="setup-step__title">Authentication System</h3>
                <p className="setup-step__description">Configure login, roles, and permissions</p>
              </div>
              <span className="setup-step__badge setup-step__badge--pending">Upcoming</span>
            </div>
            <div className="setup-step">
              <div className="setup-step__number">2</div>
              <div className="setup-step__content">
                <h3 className="setup-step__title">Add Employees</h3>
                <p className="setup-step__description">Register your team members in the system</p>
              </div>
              <span className="setup-step__badge setup-step__badge--pending">Upcoming</span>
            </div>
            <div className="setup-step">
              <div className="setup-step__number">3</div>
              <div className="setup-step__content">
                <h3 className="setup-step__title">Create Teams</h3>
                <p className="setup-step__description">Organize employees into functional teams</p>
              </div>
              <span className="setup-step__badge setup-step__badge--pending">Upcoming</span>
            </div>
            <div className="setup-step">
              <div className="setup-step__number">4</div>
              <div className="setup-step__content">
                <h3 className="setup-step__title">Configure Modules</h3>
                <p className="setup-step__description">Set up tasks, attendance, leave, and payroll</p>
              </div>
              <span className="setup-step__badge setup-step__badge--pending">Upcoming</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
