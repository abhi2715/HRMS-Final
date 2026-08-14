const fs = require('fs');

// 1. weeklyReportApi.ts
let apiFile = fs.readFileSync('src/services/weeklyReportApi.ts', 'utf8');
apiFile = apiFile.replace(/import type \{ Team \} from '\.\.\/types\/team\.types';/, "import type { Team } from './teamsApi';");
fs.writeFileSync('src/services/weeklyReportApi.ts', apiFile);

// 2. CeoWeeklyReportsPage.tsx
let ceoPage = fs.readFileSync('src/pages/ceo/CeoWeeklyReportsPage.tsx', 'utf8');
ceoPage = ceoPage.replace(/import \{ weeklyReportApi, WeeklyReport \} from '\.\.\/\.\.\/services\/weeklyReportApi';/, "import { weeklyReportApi } from '../../services/weeklyReportApi';\nimport type { WeeklyReport } from '../../services/weeklyReportApi';");
ceoPage = ceoPage.replace(/import type \{ Team \} from '\.\.\/\.\.\/types\/team\.types';/, "import type { Team } from '../../services/teamsApi';");
fs.writeFileSync('src/pages/ceo/CeoWeeklyReportsPage.tsx', ceoPage);

// 3. TeamWeeklyReportsPage.tsx
let leadPage = fs.readFileSync('src/pages/team-lead/TeamWeeklyReportsPage.tsx', 'utf8');
leadPage = leadPage.replace(/import \{ weeklyReportApi, WeeklyReport \} from '\.\.\/\.\.\/services\/weeklyReportApi';/, "import { weeklyReportApi } from '../../services/weeklyReportApi';\nimport type { WeeklyReport } from '../../services/weeklyReportApi';");
leadPage = leadPage.replace(/import \{ teamApi \} from '\.\.\/\.\.\/services\/teamApi';/, "import { teamsApi } from '../../services/teamsApi';");
leadPage = leadPage.replace(/import type \{ Team \} from '\.\.\/\.\.\/types\/team\.types';/, "import type { Team } from '../../services/teamsApi';");
leadPage = leadPage.replace(/const teams = await teamApi\.getTeams\(\);/, "const teams = await teamsApi.getTeams();");
leadPage = leadPage.replace(/teams\.find\(t => true\)/, "teams.find(() => true)");
leadPage = leadPage.replace(/render: \(item\) => \(/, "render: () => (");
fs.writeFileSync('src/pages/team-lead/TeamWeeklyReportsPage.tsx', leadPage);

// 4. WeeklyReportSubmitPage.tsx
let submitPage = fs.readFileSync('src/pages/team-lead/WeeklyReportSubmitPage.tsx', 'utf8');
submitPage = submitPage.replace(/import \{ weeklyReportApi, WeeklyReportMetrics \} from '\.\.\/\.\.\/services\/weeklyReportApi';/, "import { weeklyReportApi } from '../../services/weeklyReportApi';\nimport type { WeeklyReportMetrics } from '../../services/weeklyReportApi';");
submitPage = submitPage.replace(/description="Provide narrative context to accompany the automatically derived team metrics\."/, "");
submitPage = submitPage.replace(/const \[notes, setNotes\] = useState\(''\);/, "");
submitPage = submitPage.replace(/notes,/g, "");
fs.writeFileSync('src/pages/team-lead/WeeklyReportSubmitPage.tsx', submitPage);

