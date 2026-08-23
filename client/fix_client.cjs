const fs = require('fs');

// 1. App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import AuditLogsPage from '\.\/pages\/admin\/AuditLogsPage';/, ''); // Remove any bad default imports if they exist
fs.writeFileSync('src/App.tsx', app);

// 2. AuditLogsPage.tsx
let audit = fs.readFileSync('src/pages/admin/AuditLogsPage.tsx', 'utf8');
audit = audit.replace(/import \{ auditApi, AuditLog, AuditPagination \} from '\.\.\/\.\.\/services\/auditApi';/, "import { auditApi } from '../../services/auditApi';\nimport type { AuditLog, AuditPagination } from '../../services/auditApi';");

// 3. Fix Button icon prop
audit = audit.replace(/<Button type="submit" className="flex-1" icon=\{<Search size=\{16\} \/>\}>Filter<\/Button>/, '<Button type="submit" className="flex-1 flex items-center justify-center gap-2"><Search size={16} />Filter</Button>');

fs.writeFileSync('src/pages/admin/AuditLogsPage.tsx', audit);
