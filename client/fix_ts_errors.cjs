const fs = require('fs');

// 1. EmployeeAnalyticsPage.tsx
let emp = fs.readFileSync('src/pages/analytics/EmployeeAnalyticsPage.tsx', 'utf8');
emp = emp.replace(/import \{ analyticsApi, EmployeeAnalytics \} from '\.\.\/\.\.\/services\/analyticsApi';/, "import { analyticsApi } from '../../services/analyticsApi';\nimport type { EmployeeAnalytics } from '../../services/analyticsApi';");
emp = emp.replace(/import \{ authService \} from '\.\.\/\.\.\/services\/auth\.service';/, "import { useAuth } from '../../hooks/useAuth';");
emp = emp.replace(/CheckCircle, Clock, AlertTriangle, Target, Timer, Calendar/, 'CheckCircle, AlertTriangle, Target, Timer, Calendar');
emp = emp.replace(/description="Your personal performance and attendance metrics over the selected period\."/, '');
emp = emp.replace(/padding="xl"/, 'padding="lg"');
emp = emp.replace(/const user = authService\.getCurrentUser\(\);/, "const { user } = useAuth();");
emp = emp.replace(/const EmployeeAnalyticsPage: React.FC = \(\) => \{/, "export const EmployeeAnalyticsPage: React.FC = () => {\n  const { user } = useAuth();");
// wait, `user` is already destructured above, let's just use it directly in `fetchAnalytics`.
emp = emp.replace(/const \{ user \} = useAuth\(\);\n  const fetchAnalytics = async \(\) => \{/, "const fetchAnalytics = async () => {");
fs.writeFileSync('src/pages/analytics/EmployeeAnalyticsPage.tsx', emp);

// 2. OrgAnalyticsPage.tsx
let org = fs.readFileSync('src/pages/analytics/OrgAnalyticsPage.tsx', 'utf8');
org = org.replace(/import \{ analyticsApi, OrgAnalytics \} from '\.\.\/\.\.\/services\/analyticsApi';/, "import { analyticsApi } from '../../services/analyticsApi';\nimport type { OrgAnalytics } from '../../services/analyticsApi';");
org = org.replace(/description="Real-time aggregation of organizational performance metrics\."/, '');
org = org.replace(/padding="xl"/, 'padding="lg"');
fs.writeFileSync('src/pages/analytics/OrgAnalyticsPage.tsx', org);

// 3. TeamAnalyticsPage.tsx
let team = fs.readFileSync('src/pages/analytics/TeamAnalyticsPage.tsx', 'utf8');
team = team.replace(/import \{ analyticsApi, TeamAnalytics \} from '\.\.\/\.\.\/services\/analyticsApi';/, "import { analyticsApi } from '../../services/analyticsApi';\nimport type { TeamAnalytics } from '../../services/analyticsApi';");
team = team.replace(/description="Performance and contribution metrics derived from real-time database records\."/, '');
team = team.replace(/padding="xl"/, 'padding="lg"');
fs.writeFileSync('src/pages/analytics/TeamAnalyticsPage.tsx', team);
