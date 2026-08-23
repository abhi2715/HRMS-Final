import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { ROUTES } from '../utils/constants';
import { Permission } from '../utils/permissions';
import { UserRole } from '../types/auth.types';
import { TopNavigation } from '../components/layout/TopNavigation';
import { CommandPalette } from '../components/layout/CommandPalette';
import { AICopilot } from '../components/chat/AICopilot';
import { IconButton } from '../components/ui/Button/IconButton';
import { X } from 'lucide-react';
import './AppLayout.css';

/**
 * Main application layout.
 * Includes Sidebar, TopNavigation, CommandPalette, and main content area.
 */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const { can, isRole } = usePermissions();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '??';

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    ceo: 'CEO',
    team_lead: 'Team Lead',
    employee: 'Employee',
  };

  return (
    <div className="app-layout">
      {/* ── Mobile Sidebar Overlay ─────────────────────── */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} aria-hidden="true" />
      )}

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={clsx('sidebar', { 'sidebar--mobile-open': isMobileMenuOpen })}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#4F46E5" />
                <path d="M9 12h6v8H9zM17 8h6v12h-6z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="sidebar__logo-text">HRMS</span>
          </div>
          <IconButton
            icon={<X size={20} />}
            aria-label="Close menu"
            className="sidebar__close-btn"
            onClick={closeMobileMenu}
          />
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section">
            <span className="sidebar__section-label">Main</span>
            <NavLink to={ROUTES.DASHBOARD} end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
          </div>

          {can(Permission.USER_VIEW) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Organization</span>
              {can(Permission.USER_VIEW) && (
                <NavLink to={ROUTES.EMPLOYEES} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Employees</span>
                </NavLink>
              )}
              {can(Permission.TEAM_VIEW) && (
                <NavLink to={ROUTES.TEAMS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span>Teams</span>
                </NavLink>
              )}
              {can(Permission.USER_VIEW) && (
                <NavLink to={ROUTES.ORGANIZATION} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Organization</span>
                </NavLink>
              )}
              {user?.role === UserRole.TEAM_LEAD && (
                <NavLink to="/team-members" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Team Members</span>
                </NavLink>
              )}
            </div>
          )}

          <div className="sidebar__section">
            <span className="sidebar__section-label">Work</span>
            <NavLink to={ROUTES.TASKS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span>Tasks</span>
            </NavLink>
            <NavLink to={ROUTES.ATTENDANCE} end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>My Attendance</span>
            </NavLink>
            {(isRole(UserRole.TEAM_LEAD) || isRole(UserRole.ADMIN) || isRole(UserRole.CEO)) && (
              <NavLink to={ROUTES.ATTENDANCE_TEAM} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Team Attendance</span>
              </NavLink>
            )}
            {can(Permission.ATTENDANCE_VIEW_ORGANIZATION) && !isRole(UserRole.CEO) && (
              <NavLink to={ROUTES.ATTENDANCE_ORG} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Org Attendance</span>
              </NavLink>
            )}
            {can(Permission.ATTENDANCE_VIEW_ORGANIZATION) && isRole(UserRole.CEO) && (
              <NavLink to={ROUTES.ATTENDANCE_ANALYTICS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Attendance Analytics</span>
              </NavLink>
            )}
            
            <NavLink to={ROUTES.DAILY_PROGRESS} end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4" />
              </svg>
              <span>My Progress</span>
            </NavLink>
            {(isRole(UserRole.TEAM_LEAD) || isRole(UserRole.ADMIN) || isRole(UserRole.CEO)) && (
              <NavLink to={ROUTES.DAILY_PROGRESS_TEAM} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Team Progress</span>
              </NavLink>
            )}
            {can(Permission.ANALYTICS_VIEW_ORGANIZATION) && isRole(UserRole.CEO) && (
              <NavLink to={ROUTES.DAILY_PROGRESS_ORG} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Progress Analytics</span>
              </NavLink>
            )}

            {/* Leave Subsystem */}
            {can(Permission.LEAVE_VIEW_SELF) && (
              <NavLink to={ROUTES.LEAVE_MY} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>My Leaves</span>
              </NavLink>
            )}
            {can(Permission.LEAVE_VIEW_TEAM) && (
              <NavLink to={ROUTES.LEAVE_TEAM} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Team Leaves</span>
              </NavLink>
            )}
            {can(Permission.LEAVE_MANAGE_TYPES) && (
              <NavLink to={ROUTES.LEAVE_ADMIN} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                <span>Leave Config</span>
              </NavLink>
            )}
          </div>

          <div className="sidebar__section">
            <span className="sidebar__section-label">Personal</span>
            <NavLink to="/profile" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Profile</span>
            </NavLink>
          </div>

          {(isRole(UserRole.ADMIN) || can(Permission.PAYROLL_VIEW_SELF)) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Finance</span>
              <NavLink to={ROUTES.PAYROLL} end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>My Payroll</span>
              </NavLink>
              {can(Permission.PAYROLL_MANAGE) && (
                <NavLink to={ROUTES.PAYROLL_ADMIN} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Admin Payroll</span>
                </NavLink>
              )}
              {can(Permission.PAYROLL_VIEW_ORGANIZATION) && isRole(UserRole.CEO) && (
                <NavLink to={ROUTES.PAYROLL_ORG} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Org Payroll</span>
                </NavLink>
              )}
            </div>
          )}

          {can(Permission.WEEKLY_REPORT_VIEW) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Reporting</span>
              
              {can(Permission.WEEKLY_REPORT_SUBMIT) && (
                <NavLink to={ROUTES.WEEKLY_REPORTS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Team Reports</span>
                </NavLink>
              )}
              
              {can(Permission.WEEKLY_REPORT_VIEW) && isRole(UserRole.CEO) && (
                <NavLink to={ROUTES.WEEKLY_REPORTS_ORG} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Org Reports</span>
                </NavLink>
              )}
            </div>
          )}
          
          {can(Permission.ANALYTICS_VIEW_SELF) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Insights</span>
              <NavLink to={ROUTES.ANALYTICS_ME} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>My Analytics</span>
              </NavLink>
              {can(Permission.REPORT_VIEW) && (
                <NavLink to={ROUTES.REPORTS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>Reports</span>
                </NavLink>
              )}
            </div>
          )}

          {can(Permission.AUDIT_VIEW) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">System</span>
              <NavLink to={ROUTES.AUDIT_LOGS} className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`} onClick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Audit Logs</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User profile at bottom */}
        <div className="sidebar__footer">
          <div className="flex items-center gap-4">
            <div className="sidebar__user">
              <div className="sidebar__avatar">{initials}</div>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user?.firstName} {user?.lastName}</span>
                <span className="sidebar__user-role">{roleLabel[user?.role || ''] || user?.role}</span>
              </div>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Sign out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="app-layout__wrapper">
        <TopNavigation onMenuClick={toggleMobileMenu} />
        
        {/* ── Main Content ────────────────────────────── */}
        <main className="app-layout__main">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <AICopilot />
    </div>
  );
}
