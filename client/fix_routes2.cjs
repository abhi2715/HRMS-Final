const fs = require('fs');

// 2. AppLayout.tsx
let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');
layout = layout.replace(
  /{ name: 'Leave', href: ROUTES\.LEAVE, icon: CalendarDays, requiredPermission: Permission\.LEAVE_VIEW_SELF },/g,
  "{ name: 'My Leaves', href: ROUTES.LEAVE_MY, icon: CalendarDays, requiredPermission: Permission.LEAVE_VIEW_SELF },\n    { name: 'Team Leaves', href: ROUTES.LEAVE_TEAM, icon: Users, requiredPermission: Permission.LEAVE_VIEW_TEAM },\n    { name: 'Leave Config', href: ROUTES.LEAVE_ADMIN, icon: Settings, requiredPermission: Permission.LEAVE_MANAGE_TYPES },"
);
fs.writeFileSync('src/layouts/AppLayout.tsx', layout);
