const fs = require('fs');

// 1. Fix user.controller.ts
let userCtrl = fs.readFileSync('src/controllers/user.controller.ts', 'utf8');
userCtrl = userCtrl.replace(/performedBy/g, 'actor');
userCtrl = userCtrl.replace(/targetUser: (req\.params\.id|id|user\._id)/g, "entity: 'User',\n      entityId: $1");
fs.writeFileSync('src/controllers/user.controller.ts', userCtrl);

// 2. Fix team.controller.ts
let teamCtrl = fs.readFileSync('src/controllers/team.controller.ts', 'utf8');
teamCtrl = teamCtrl.replace(/performedBy/g, 'actor');
teamCtrl = teamCtrl.replace(/targetTeam: /g, "entity: 'Team',\n      entityId: ");
fs.writeFileSync('src/controllers/team.controller.ts', teamCtrl);

// 3. Fix task.controller.ts
let taskCtrl = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');
taskCtrl = taskCtrl.replace(/performedBy/g, 'actor');
taskCtrl = taskCtrl.replace(/targetTask: /g, "entity: 'Task',\n      entityId: ");
// Fix TASK_COMMENT_ADDED which was removed from AuditAction enum
taskCtrl = taskCtrl.replace(/AuditAction\.TASK_COMMENT_ADDED/g, "'TASK_COMMENT_ADDED'");
fs.writeFileSync('src/controllers/task.controller.ts', taskCtrl);

// 4. Fix dailyProgress.controller.ts
let dpCtrl = fs.readFileSync('src/controllers/dailyProgress.controller.ts', 'utf8');
dpCtrl = dpCtrl.replace(/performedBy/g, 'actor');
dpCtrl = dpCtrl.replace(/targetDailyProgress: /g, "entity: 'DailyProgress',\n      entityId: ");
dpCtrl = dpCtrl.replace(/AuditAction\.DAILY_PROGRESS_LOCKED/g, "'DAILY_PROGRESS_LOCKED'");
fs.writeFileSync('src/controllers/dailyProgress.controller.ts', dpCtrl);

// 5. Fix duplicate import in leave.controller.ts
let leaveCtrl = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');
// It might have `import { AuditAction } from '../models/AuditLog.model';` twice
const imports = Array.from(leaveCtrl.matchAll(/import \{ AuditAction \} from '\.\.\/models\/AuditLog\.model';/g));
if (imports.length > 1) {
  leaveCtrl = leaveCtrl.replace(/import \{ AuditAction \} from '\.\.\/models\/AuditLog\.model';/, '');
}
fs.writeFileSync('src/controllers/leave.controller.ts', leaveCtrl);

