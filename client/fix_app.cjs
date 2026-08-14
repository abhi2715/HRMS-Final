const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = `import { MyPayrollPage } from './pages/employee/MyPayrollPage';
import { AdminPayrollPage } from './pages/admin/AdminPayrollPage';
import { CeoPayrollDashboard } from './pages/ceo/CeoPayrollDashboard';\n` + app;

app = app.replace(/<Route path=\{ROUTES\.PAYROLL\} element=\{<div style=\{\{ padding: '2rem' \}\}><h1>Payroll Module \(Coming Soon\)<\/h1><\/div>\} \/>/g, 
  `<Route element={<ProtectedRoute requiredPermission={Permission.PAYROLL_VIEW_SELF} />}><Route path={ROUTES.PAYROLL} element={<MyPayrollPage />} /></Route>
           <Route element={<ProtectedRoute requiredPermission={Permission.PAYROLL_MANAGE} />}><Route path={ROUTES.PAYROLL_ADMIN} element={<AdminPayrollPage />} /></Route>
           <Route element={<ProtectedRoute requiredPermission={Permission.PAYROLL_VIEW_ORGANIZATION} />}><Route path={ROUTES.PAYROLL_ORG} element={<CeoPayrollDashboard />} /></Route>`);
           
fs.writeFileSync('src/App.tsx', app);

let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');
layout = layout.replace(
  /{can\(Permission\.PAYROLL_VIEW_SELF\) && \(\n\s*<div className="sidebar__section">\n\s*<span className="sidebar__section-label">Finance<\/span>\n\s*<NavLink to=\{ROUTES\.PAYROLL\} className=\{\(\{ isActive \}\) => `sidebar__link \$\{isActive \? 'sidebar__link--active' : ''\}`\} onClick=\{closeMobileMenu\}>\n\s*<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">\n\s*<line x1="12" y1="1" x2="12" y2="23" \/>\n\s*<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" \/>\n\s*<\/svg>\n\s*<span>Payroll<\/span>\n\s*<\/NavLink>\n\s*<\/div>\n\s*\)}/g,
  `{can(Permission.PAYROLL_VIEW_SELF) && (
            <div className="sidebar__section">
              <span className="sidebar__section-label">Finance</span>
              <NavLink to={ROUTES.PAYROLL} end className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>My Payroll</span>
              </NavLink>
              {can(Permission.PAYROLL_MANAGE) && (
                <NavLink to={ROUTES.PAYROLL_ADMIN} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Admin Payroll</span>
                </NavLink>
              )}
              {can(Permission.PAYROLL_VIEW_ORGANIZATION) && isRole(UserRole.CEO) && (
                <NavLink to={ROUTES.PAYROLL_ORG} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Org Payroll</span>
                </NavLink>
              )}
            </div>
          )}`
);

// Fallback if regex failed
if (layout.indexOf('My Payroll') === -1) {
    layout = layout.replace(
    /({\(isRole\(UserRole\.ADMIN\) \|\| can\(Permission\.PAYROLL_VIEW_SELF\)\) && \([\s\S]*?Payroll<\/span>\n\s*<\/NavLink>)/g,
    `$1
              {can(Permission.PAYROLL_MANAGE) && (
                <NavLink to={ROUTES.PAYROLL_ADMIN} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Admin Payroll</span>
                </NavLink>
              )}
              {can(Permission.PAYROLL_VIEW_ORGANIZATION) && isRole(UserRole.CEO) && (
                <NavLink to={ROUTES.PAYROLL_ORG} className={({ isActive }) => \`sidebar__link \${isActive ? 'sidebar__link--active' : ''}\`} onClick={closeMobileMenu} style={{ paddingLeft: '40px' }}>
                  <span>Org Payroll</span>
                </NavLink>
              )}`
  );
  layout = layout.replace(/<span>Payroll<\/span>/, '<span>My Payroll</span>');
  layout = layout.replace(/<NavLink to=\{ROUTES\.PAYROLL\} className=/g, '<NavLink to={ROUTES.PAYROLL} end className=');
}

fs.writeFileSync('src/layouts/AppLayout.tsx', layout);
