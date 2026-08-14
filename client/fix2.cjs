const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Input as="textarea" -> textarea
  content = content.replace(/<Input\s+as="textarea"/g, '<textarea className="input w-full p-2 border rounded-md"');
  // the ending tags
  // For standard Input, it was <Input /> but for textarea it's often <Input as="textarea" ... />
  // This is tricky using regex, I will just do a simpler search/replace for the textarea block.
  content = content.replace(/<Input\n\s*as="textarea"([^>]*)\/>/g, '<textarea className="input w-full p-2 border rounded-md mt-1" $1 />');

  // fix loading -> isLoading in Button
  content = content.replace(/loading=\{/g, 'isLoading={');
  content = content.replace(/<Button([^>]*) loading([^>]*)>/g, '<Button$1 isLoading$2>');

  // fix label: -> header: in columns
  content = content.replace(/label: '/g, "header: '");

  // fix StatusPill variant= -> status=
  content = content.replace(/variant=\{statusColors\[val\] \|\| 'default'\}/g, "status={statusColors[val] || 'secondary'}");
  content = content.replace(/variant="error"/g, 'status="danger"'); // Or error? Let's check Badge. Badge has primary, secondary, success, danger, warning, info
  content = content.replace(/variant="default"/g, 'status="secondary"');

  // fix statusColors mapping
  content = content.replace(/draft: 'default',/g, "draft: 'secondary',");
  content = content.replace(/locked: 'error',/g, "locked: 'danger',");
  content = content.replace(/'default' \| 'success' \| 'warning' \| 'error' \| 'info'/g, "'secondary' | 'success' | 'warning' | 'danger' | 'info'");

  // fix tabs content
  // I need to add content: null to tabs if it's an array
  content = content.replace(/\{ id: 'all', label: 'All Updates' \}/g, "{ id: 'all', label: 'All Updates', content: null }");
  content = content.replace(/\{ id: 'missed', label: `Missed \(\$\{missed.length\}\)` \}/g, "{ id: 'missed', label: `Missed (${missed.length})`, content: null }");
  content = content.replace(/\{ id: 'blocked', label: `Blocked \(\$\{blocked.length\}\)` \}/g, "{ id: 'blocked', label: `Blocked (${blocked.length})`, content: null }");

  fs.writeFileSync(path, content);
}

fixFile('src/pages/ceo/CeoDailyProgressPage.tsx');
fixFile('src/pages/team-lead/TeamDailyProgressPage.tsx');
fixFile('src/pages/employee/MyDailyProgressPage.tsx');
