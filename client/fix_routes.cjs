const fs = require('fs');

// 1. utils/constants.ts
let consts = fs.readFileSync('src/utils/constants.ts', 'utf8');
if (!consts.includes('LEAVE_MY:')) {
  consts = consts.replace(/LEAVE: '\/leave',/, "LEAVE_MY: '/leave/my',\n  LEAVE_TEAM: '/leave/team',\n  LEAVE_ADMIN: '/leave/admin',");
  fs.writeFileSync('src/utils/constants.ts', consts);
}

// 2. AppLayout.tsx
let layout = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf8');
layout = layout.replace(
  /{ name: 'Leave', href: ROUTES\.LEAVE, icon: CalendarDays, requiredPermission: Permission\.LEAVE_VIEW_SELF },/g,
  "{ name: 'My Leaves', href: ROUTES.LEAVE_MY, icon: CalendarDays, requiredPermission: Permission.LEAVE_VIEW_SELF },\n    { name: 'Team Leaves', href: ROUTES.LEAVE_TEAM, icon: Users, requiredPermission: Permission.LEAVE_VIEW_TEAM },\n    { name: 'Leave Config', href: ROUTES.LEAVE_ADMIN, icon: Settings, requiredPermission: Permission.LEAVE_MANAGE_TYPES },"
);
fs.writeFileSync('src/components/layout/AppLayout.tsx', layout);

// 3. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('MyLeavesPage')) {
  app = `import { MyLeavesPage } from './pages/employee/MyLeavesPage';
import { TeamLeavesPage } from './pages/team-lead/TeamLeavesPage';
import { AdminLeaveConfigPage } from './pages/admin/AdminLeaveConfigPage';
` + app;

  app = app.replace(/<Route path=\{ROUTES\.LEAVE\} element=\{<div>Leave Management \(Coming Soon\)<\/div>\} \/>/g, 
    `<Route element={<ProtectedRoute requiredPermission={Permission.LEAVE_VIEW_SELF} />}><Route path={ROUTES.LEAVE_MY} element={<MyLeavesPage />} /></Route>
           <Route element={<ProtectedRoute requiredPermission={Permission.LEAVE_VIEW_TEAM} />}><Route path={ROUTES.LEAVE_TEAM} element={<TeamLeavesPage />} /></Route>
           <Route element={<ProtectedRoute requiredPermission={Permission.LEAVE_MANAGE_TYPES} />}><Route path={ROUTES.LEAVE_ADMIN} element={<AdminLeaveConfigPage />} /></Route>`);
           
  fs.writeFileSync('src/App.tsx', app);
}

