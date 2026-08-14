const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Fix imports
  content = content.replace(/'\.\.\/\.\.\/components\/ui\/([^']+)'/g, "'../../components/ui/$1/$1'");
  
  // Fix type imports for dailyProgressApi and tasksApi
  content = content.replace(/import \{ dailyProgressApi, (.*?) \} from/g, 'import { dailyProgressApi } from');
  content = content.replace(/import type \{ (.*?) \} from '\.\.\/\.\.\/services\/dailyProgressApi'/g, ''); // in case we run it multiple times
  if (content.includes('OrgSummary')) {
    content = content.replace("import { dailyProgressApi } from '../../services/dailyProgressApi';", "import { dailyProgressApi } from '../../services/dailyProgressApi';\nimport type { OrgSummary } from '../../services/dailyProgressApi';");
  }
  if (content.includes('DailyProgressRecord')) {
    content = content.replace("import { dailyProgressApi } from '../../services/dailyProgressApi';", "import { dailyProgressApi } from '../../services/dailyProgressApi';\nimport type { DailyProgressRecord, SubmitProgressPayload } from '../../services/dailyProgressApi';");
  }
  
  if (content.includes('tasksApi,')) {
    content = content.replace(/import \{ tasksApi, (.*?) \} from/g, 'import { tasksApi } from');
    content = content.replace("import { tasksApi } from '../../services/tasksApi';", "import { tasksApi, TaskStatus } from '../../services/tasksApi';\nimport type { Task } from '../../services/tasksApi';");
  }

  // Fix any remaining type-only imports (just to be safe)

  // Fix Card
  content = content.replace(/<Card\.Header>/g, '<div className="p-4 border-b">');
  content = content.replace(/<\/Card\.Header>/g, '</div>');
  content = content.replace(/<Card\.Title>/g, '<h3 className="text-lg font-medium">');
  content = content.replace(/<\/Card\.Title>/g, '</h3>');
  content = content.replace(/<Card\.Body/g, '<div className="p-4"');
  content = content.replace(/<\/Card\.Body>/g, '</div>');
  content = content.replace(/<Card\.Footer/g, '<div className="p-4 border-t bg-gray-50"');
  content = content.replace(/<\/Card\.Footer>/g, '</div>');

  // Fix any implicit e: any in onChange
  content = content.replace(/onChange=\{\(e\) =>/g, 'onChange={(e: any) =>');
  content = content.replace(/render: \(_: any, record: any\)/g, 'render: (_: any, record: any)');

  fs.writeFileSync(path, content);
}

fixFile('src/pages/ceo/CeoDailyProgressPage.tsx');
fixFile('src/pages/team-lead/TeamDailyProgressPage.tsx');
fixFile('src/pages/employee/MyDailyProgressPage.tsx');
