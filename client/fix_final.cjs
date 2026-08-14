const fs = require('fs');

function fix(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Typography -> h2/h4/p
  content = content.replace(/import \{ Typography \} from '\.\.\/\.\.\/components\/ui\/Typography\/Typography';\n/g, '');
  content = content.replace(/<Typography variant="h2">/g, '<h2 className="text-2xl font-bold text-gray-900">');
  content = content.replace(/<\/Typography>/g, '</h2>'); // this might close p or h4 too, but they will just be h2. Let's fix that.

  // Restore correct tags
  content = content.replace(/<Typography variant="h4" className="([^"]+)">([^<]+)<\/h2>/g, '<h4 className="text-xl font-bold $1">$2</h4>');
  content = content.replace(/<Typography variant="h4">([^<]+)<\/h2>/g, '<h4 className="text-xl font-bold">$1</h4>');
  content = content.replace(/<Typography variant="body" color="secondary" className="([^"]+)">([^<]+)<\/h2>/g, '<p className="text-gray-500 $1">$2</p>');
  content = content.replace(/<Typography variant="body" color="secondary">([^<]+)<\/h2>/g, '<p className="text-gray-500">$1</p>');
  content = content.replace(/<Typography variant="small" color="secondary">([^<]+)<\/h2>/g, '<p className="text-sm text-gray-500">$1</p>');

  // Columns import
  content = content.replace(/import \{ Table, Column \} from '\.\.\/\.\.\/components\/ui\/Table\/Table';/g, "import { Table } from '../../components/ui/Table/Table';\nimport type { Column } from '../../components/ui/Table/Table';");

  // MetricCard trend
  content = content.replace(/trend=\{summary\?\.rate === 100 \? \{ value: 0, label: 'Perfect', isPositive: true \} : undefined\}/g, "trend={summary?.rate === 100 ? { value: 0, label: 'Perfect' } : undefined}");
  content = content.replace(/trend=\{\{ value: 0, isPositive: true, label:/g, "trend={{ value: 0, label:");
  content = content.replace(/trend=\{summary && summary\.missedCount > 0 \? \{ value: -summary\.missedCount, label: 'requires attention', isPositive: false \} : undefined\}/g, "trend={summary && summary.missedCount > 0 ? { value: -summary.missedCount, label: 'requires attention' } : undefined}");
  content = content.replace(/trend=\{summary && summary\.missedCount > 0 \? \{ value: summary\.missedCount, label: 'requires attention', isPositive: false \} : undefined\}/g, "trend={summary && summary.missedCount > 0 ? { value: -summary.missedCount, label: 'requires attention' } : undefined}");
  content = content.replace(/trend=\{summary && summary\.blockedCount > 0 \? \{ value: -summary\.blockedCount, label: 'blocked issues', isPositive: false \} : undefined\}/g, "trend={summary && summary.blockedCount > 0 ? { value: -summary.blockedCount, label: 'blocked issues' } : undefined}");
  content = content.replace(/trend=\{summary && summary\.blockedCount > 0 \? \{ value: summary\.blockedCount, label: 'blocked issues', isPositive: false \} : undefined\}/g, "trend={summary && summary.blockedCount > 0 ? { value: -summary.blockedCount, label: 'blocked issues' } : undefined}");

  fs.writeFileSync(path, content);
}

fix('src/pages/ceo/CeoDailyProgressPage.tsx');
fix('src/pages/team-lead/TeamDailyProgressPage.tsx');
fix('src/pages/employee/MyDailyProgressPage.tsx');

