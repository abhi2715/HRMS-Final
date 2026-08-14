const fs = require('fs');

// 1. Delete MyLeavePage.tsx
if (fs.existsSync('src/pages/employee/MyLeavePage.tsx')) {
  fs.unlinkSync('src/pages/employee/MyLeavePage.tsx');
}

// Helper to fix a file
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix verbatim module syntax for Column and Models
  content = content.replace(/import \{ .*Column.* \} from '\.\.\/\.\.\/components\/ui\/Table\/Table';/g, "import type { Column } from '../../components/ui/Table/Table';\nimport { Table } from '../../components/ui/Table/Table';");
  // Also remove Table from previous imports if they were in the same line
  content = content.replace(/import \{ Table \} from '\.\.\/\.\.\/components\/ui\/Table\/Table';\nimport type \{ Column \}/g, "import type { Column }");

  // Fix PageHeader
  content = content.replace(/description="[^"]*"/g, "");
  content = content.replace(/action=\{/g, "actions={");

  // Fix Columns
  content = content.replace(/accessor: 'name'/g, "key: 'name', render: (item) => item.name");
  content = content.replace(/accessor: 'defaultAllocation'/g, "key: 'alloc', render: (item) => item.defaultAllocation");
  content = content.replace(/accessor: 'allocation'/g, "key: 'alloc', render: (item) => item.allocation");
  content = content.replace(/accessor: 'used'/g, "key: 'used', render: (item) => item.used");
  content = content.replace(/accessor: 'available'/g, "key: 'available', render: (item) => item.available");
  content = content.replace(/accessor: 'days'/g, "key: 'days', render: (item) => item.days");
  content = content.replace(/accessor: 'reason'/g, "key: 'reason', render: (item) => item.reason");
  
  // Custom accessors (lambdas)
  content = content.replace(/accessor: \(([^)]+)\) =>/g, "key: '$1', render: ($1) =>");

  // Fix emptyMessage in Table
  content = content.replace(/emptyMessage="([^"]*)"/g, 'emptyStateDescription="$1"');
  
  // Fix Input type textarea
  content = content.replace(/<Input\n\s*label="Reason"\n\s*as="textarea"\n\s*rows=\{3\}\n\s*value=\{formData\.reason\}\n\s*onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, reason: e\.target\.value \}\)\}\n\s*required\n\s*\/>/g, 
    `<div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-gray-700">Reason</label><textarea className="input-field min-h-[80px] p-2 border rounded" rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required /></div>`);
    
  fs.writeFileSync(filePath, content);
}

fixFile('src/pages/employee/MyLeavesPage.tsx');
fixFile('src/pages/team-lead/TeamLeavesPage.tsx');
fixFile('src/pages/admin/AdminLeaveConfigPage.tsx');
