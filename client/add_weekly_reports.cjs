const fs = require('fs');

// 1. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
app = `import { TeamWeeklyReportsPage } from './pages/team-lead/TeamWeeklyReportsPage';
import { WeeklyReportSubmitPage } from './pages/team-lead/WeeklyReportSubmitPage';
import { CeoWeeklyReportsPage } from './pages/ceo/CeoWeeklyReportsPage';\n` + app;

// Add routes
app = app.replace(
  /<Route path=\{ROUTES\.REPORTS\} element=\{<div style=\{\{ padding: '2rem' \}\}><h1>Reports Module \(Coming Soon\)<\/h1><\/div>\} \/>/g,
  `<Route path={ROUTES.WEEKLY_REPORTS} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><TeamWeeklyReportsPage /></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_SUBMIT} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><WeeklyReportSubmitPage /></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_ORG} element={<RoleGuard permission={Permission.WEEKLY_REPORT_VIEW}><CeoWeeklyReportsPage /></RoleGuard>} />
          <Route path={ROUTES.REPORTS} element={<div style={{ padding: '2rem' }}><h1>Reports Module (Coming Soon)</h1></div>} />`
);

fs.writeFileSync('src/App.tsx', app);

// 2. Update AppLayout.tsx
let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');

const weeklyReportMenuStr = `{can(Permission.WEEKLY_REPORT_VIEW) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Reporting</span>
              
              {can(Permission.WEEKLY_REPORT_SUBMIT) && (
                <NavLink to={ROUTES.WEEKLY_REPORTS} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu}>
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
                <NavLink to={ROUTES.WEEKLY_REPORTS_ORG} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu}>
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
          
          {can(Permission.ANALYTICS_VIEW_SELF) && (`;

layout = layout.replace(/{can\(Permission\.ANALYTICS_VIEW_SELF\) && \(/, weeklyReportMenuStr);
fs.writeFileSync('src/layouts/AppLayout.tsx', layout);
