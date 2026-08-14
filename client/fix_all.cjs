const fs = require('fs');

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import MyLeavePage from '\.\/pages\/employee\/MyLeavePage';\n/g, '');
app = app.replace(/<Route path=\{ROUTES\.LEAVE\} element=\{<MyLeavePage \/>\} \/>/g, '');
fs.writeFileSync('src/App.tsx', app);

// Fix AppLayout.tsx
let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');
layout = layout.replace(
  /{ name: 'Leave', href: ROUTES\.LEAVE, icon: CalendarDays, requiredPermission: Permission\.LEAVE_VIEW_SELF },/g,
  ""
);
fs.writeFileSync('src/layouts/AppLayout.tsx', layout);

// Fix pages
const fixPage = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/import type \{ Column \}/g, "import { Table } from '../../components/ui/Table/Table';\nimport type { Column }");
  content = content.replace(/import \{ .*LeaveType.* \} from '\.\.\/\.\.\/services\/leaveApi';/g, "import { leaveApi } from '../../services/leaveApi';\nimport type { LeaveType, LeaveBalance, LeaveRequest } from '../../services/leaveApi';");
  fs.writeFileSync(path, content);
};

fixPage('src/pages/employee/MyLeavesPage.tsx');
fixPage('src/pages/team-lead/TeamLeavesPage.tsx');
fixPage('src/pages/admin/AdminLeaveConfigPage.tsx');
