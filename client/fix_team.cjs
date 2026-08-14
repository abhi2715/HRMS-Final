const fs = require('fs');
let content = fs.readFileSync('src/pages/team-lead/TeamDailyProgressPage.tsx', 'utf8');

// Fix Column<DailyProgressRecord>[]
content = content.replace(/const allColumns = \[/g, "import { Column } from '../../components/ui/Table/Table';\n\n  const allColumns: Column<DailyProgressRecord>[] = [");

// Fix render
content = content.replace(/render: \(val: any\) => `\$\{val.firstName\} \$\{val.lastName\}`/g, "render: (record: DailyProgressRecord) => `${record.employee.firstName} ${record.employee.lastName}`");
content = content.replace(/render: \(val: string\) => <StatusPill label=\{val.toUpperCase\(\)\} status=\{statusColors\[val\] \|\| 'secondary'\} \/>/g, "render: (record: DailyProgressRecord) => <StatusPill label={record.status.toUpperCase()} status={statusColors[record.status] || 'secondary'} />");
content = content.replace(/render: \(val: string\) => <span className="truncate max-w-xs block" title=\{val\}>\{val \|\| '-'\.toUpperCase\(\)\}<\/span>/g, "render: (record: DailyProgressRecord) => <span className=\"truncate max-w-xs block\" title={record.workCompleted}>{record.workCompleted || '-'}</span>");
content = content.replace(/render: \(val: string\) => val \? <StatusPill label="Blocked" status="danger" \/> : '-'/g, "render: (record: DailyProgressRecord) => record.blockers ? <StatusPill label=\"Blocked\" status=\"danger\" /> : '-'");
content = content.replace(/render: \(_: any, record: DailyProgressRecord\) => \(/g, "render: (record: DailyProgressRecord) => (");

// Remove the label="Blocked" from StatusPill since it's now just children
content = content.replace(/<StatusPill label=\{record.status.toUpperCase\(\)\}/g, "<StatusPill");
content = content.replace(/<StatusPill label="Blocked"/g, "<StatusPill");
content = content.replace(/<StatusPill status=\{statusColors\[record.status\] \|\| 'secondary'\} \/>/g, "<StatusPill status={statusColors[record.status] || 'secondary'}>{record.status.toUpperCase()}</StatusPill>");
content = content.replace(/<StatusPill status="danger" \/>/g, "<StatusPill status=\"danger\">Blocked</StatusPill>");

content = content.replace(/render: \(val: string\) => <span className="truncate max-w-xs block" title=\{val\}>\{val \|\| '-'\}.toUpperCase\(\)<\/span>/g, "render: (record: DailyProgressRecord) => <span className=\"truncate max-w-xs block\" title={record.workCompleted}>{record.workCompleted || '-'}</span>");
content = content.replace(/render: \(val: string\) => <span className="truncate max-w-xs block" title=\{val\}>\{val \|\| '-'\}<\/span>/g, "render: (record: DailyProgressRecord) => <span className=\"truncate max-w-xs block\" title={record.workCompleted}>{record.workCompleted || '-'}</span>");

// missedColumns
content = content.replace(/const missedColumns = \[/g, "  const missedColumns: Column<any>[] = [");

// blockedColumns
content = content.replace(/const blockedColumns = \[/g, "  const blockedColumns: Column<DailyProgressRecord>[] = [");

// Fix render
content = content.replace(/render: \(_: any, record: DailyProgressRecord\) => \(/g, "render: (record: DailyProgressRecord) => (");

// Fix Tables
content = content.replace(/<Table columns=\{allColumns\} data=\{records\} isLoading=\{loading\} \/>/g, "<Table columns={allColumns} data={records} keyExtractor={(item) => item._id} isLoading={loading} />");
content = content.replace(/<Table columns=\{missedColumns\} data=\{missed\} isLoading=\{loading\} \/>/g, "<Table columns={missedColumns} data={missed} keyExtractor={(item) => item._id} isLoading={loading} />");
content = content.replace(/<Table columns=\{blockedColumns\} data=\{blocked\} isLoading=\{loading\} \/>/g, "<Table columns={blockedColumns} data={blocked} keyExtractor={(item) => item._id} isLoading={loading} />");

fs.writeFileSync('src/pages/team-lead/TeamDailyProgressPage.tsx', content);

// Also fix StatusPill in MyDailyProgress
let content2 = fs.readFileSync('src/pages/employee/MyDailyProgressPage.tsx', 'utf8');
content2 = content2.replace(/<StatusPill label=\{record.status.toUpperCase\(\)\} status=\{statusColors\[record.status\] \|\| 'secondary'\} \/>/g, "<StatusPill status={statusColors[record.status] || 'secondary'}>{record.status.toUpperCase()}</StatusPill>");
content2 = content2.replace(/<StatusPill label="Blocked" status="danger" \/>/g, "<StatusPill status=\"danger\">Blocked</StatusPill>");
content2 = content2.replace(/import \{ Column \} from/g, '');
content2 = content2.replace(/export default function/g, "import { Column } from '../../components/ui/Table/Table';\n\nexport default function");
fs.writeFileSync('src/pages/employee/MyDailyProgressPage.tsx', content2);
