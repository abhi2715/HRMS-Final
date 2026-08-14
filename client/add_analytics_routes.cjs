const fs = require('fs');

// 1. Update constants.ts
let constants = fs.readFileSync('src/utils/constants.ts', 'utf8');
constants = constants.replace(/ANALYTICS: '\/analytics',/, `ANALYTICS_ORG: '/analytics/org',
  ANALYTICS_TEAM: '/analytics/team',
  ANALYTICS_ME: '/analytics/me',`);
fs.writeFileSync('src/utils/constants.ts', constants);

// 2. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

const importAnalytics = `import { OrgAnalyticsPage } from './pages/analytics/OrgAnalyticsPage';
import { TeamAnalyticsPage } from './pages/analytics/TeamAnalyticsPage';
import { EmployeeAnalyticsPage } from './pages/analytics/EmployeeAnalyticsPage';\n`;
app = importAnalytics + app;

const routesReplacement = `<Route path={ROUTES.ANALYTICS_ORG} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_ORGANIZATION}><OrgAnalyticsPage /></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_TEAM} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_TEAM}><TeamAnalyticsPage /></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_ME} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_SELF}><EmployeeAnalyticsPage /></RoleGuard>} />
          `;
app = app.replace(
  /<Route path=\{ROUTES\.ANALYTICS\} element=\{<div style=\{\{ padding: '2rem' \}\}><h1>Analytics Module \(Coming Soon\)<\/h1><\/div>\} \/>/g,
  routesReplacement
);
fs.writeFileSync('src/App.tsx', app);

// 3. Update AppLayout.tsx
let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');
layout = layout.replace(/to=\{ROUTES\.ANALYTICS\}/, 'to={ROUTES.ANALYTICS_ME}');
layout = layout.replace(/<span>Analytics<\/span>/, '<span>My Analytics</span>');

const teamAnalyticsStr = `{can(Permission.ANALYTICS_VIEW_TEAM) && (
                <NavLink to={ROUTES.ANALYTICS_TEAM} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>Team Analytics</span>
                </NavLink>
              )}
              {can(Permission.ANALYTICS_VIEW_ORGANIZATION) && (
                <NavLink to={ROUTES.ANALYTICS_ORG} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <span>Org Analytics</span>
                </NavLink>
              )}`;

layout = layout.replace(
  /<\/NavLink>\s*\)\}\s*<\/div>\s*\)\}\s*\{isRole\(UserRole\.ADMIN\)/,
  `</NavLink>\n              )}\n              ${teamAnalyticsStr}\n            </div>\n          )}\n          \n          {isRole(UserRole.ADMIN)`
);

fs.writeFileSync('src/layouts/AppLayout.tsx', layout);
