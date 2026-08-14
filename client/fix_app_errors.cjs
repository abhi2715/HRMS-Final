const fs = require('fs');

// 1. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /<Route element=\{<ProtectedRoute requiredPermission=\{Permission\.PAYROLL_VIEW_SELF\} \/>\}><Route path=\{ROUTES\.PAYROLL\} element=\{<MyPayrollPage \/>\} \/><\/Route>/g,
  `<Route path={ROUTES.PAYROLL} element={<RoleGuard permission={Permission.PAYROLL_VIEW_SELF}><MyPayrollPage /></RoleGuard>} />`
);
app = app.replace(
  /<Route element=\{<ProtectedRoute requiredPermission=\{Permission\.PAYROLL_MANAGE\} \/>\}><Route path=\{ROUTES\.PAYROLL_ADMIN\} element=\{<AdminPayrollPage \/>\} \/><\/Route>/g,
  `<Route path={ROUTES.PAYROLL_ADMIN} element={<RoleGuard permission={Permission.PAYROLL_MANAGE}><AdminPayrollPage /></RoleGuard>} />`
);
app = app.replace(
  /<Route element=\{<ProtectedRoute requiredPermission=\{Permission\.PAYROLL_VIEW_ORGANIZATION\} \/>\}><Route path=\{ROUTES\.PAYROLL_ORG\} element=\{<CeoPayrollDashboard \/>\} \/><\/Route>/g,
  `<Route path={ROUTES.PAYROLL_ORG} element={<RoleGuard permission={Permission.PAYROLL_VIEW_ORGANIZATION}><CeoPayrollDashboard /></RoleGuard>} />`
);
// Make sure RoleGuard is imported
if (!app.includes('import RoleGuard')) {
  app = app.replace(/import ProtectedRoute from '\.\/components\/auth\/ProtectedRoute';/, "import ProtectedRoute from './components/auth/ProtectedRoute';\nimport RoleGuard from './components/auth/RoleGuard';");
}
// Make sure Permission is imported
if (!app.includes('import { Permission }')) {
  app = app.replace(/import \{ ROUTES \} from '\.\/utils\/constants';/, "import { ROUTES } from './utils/constants';\nimport { Permission } from './utils/permissions';");
}
fs.writeFileSync('src/App.tsx', app);

// 2. AdminPayrollPage.tsx
let adminPage = fs.readFileSync('src/pages/admin/AdminPayrollPage.tsx', 'utf8');
adminPage = adminPage.replace(/import \{ User \} from '\.\.\/\.\.\/types\/auth\.types';/, "import type { User } from '../../types/auth.types';");
adminPage = adminPage.replace(/description="Manage employee salary records and view historical changes\."/g, "");
adminPage = adminPage.replace(/<Card padding="xl">/g, '<Card padding="lg">');
fs.writeFileSync('src/pages/admin/AdminPayrollPage.tsx', adminPage);

