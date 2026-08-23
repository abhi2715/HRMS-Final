const fs = require('fs');

// 1. leave.controller.ts (remove duplicate import)
let leaveCtrl = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');
leaveCtrl = leaveCtrl.replace(/import \{ AuditAction \} from '\.\.\/models\/AuditLog\.model';/, ''); // run it once to remove one
fs.writeFileSync('src/controllers/leave.controller.ts', leaveCtrl);

// 2. Helper to replace details -> metadata, targetUser -> entity: 'User', entityId: ..., etc.
function fixLegacy(text) {
  let res = text.replace(/details:/g, 'metadata:');
  res = res.replace(/targetUser: ([\w\.]+),?/g, "entity: 'User',\n      entityId: $1,");
  res = res.replace(/targetTeam: ([\w\.]+),?/g, "entity: 'Team',\n      entityId: $1,");
  return res;
}

let taskCtrl = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');
taskCtrl = fixLegacy(taskCtrl);
fs.writeFileSync('src/controllers/task.controller.ts', taskCtrl);

let teamCtrl = fs.readFileSync('src/controllers/team.controller.ts', 'utf8');
teamCtrl = fixLegacy(teamCtrl);
fs.writeFileSync('src/controllers/team.controller.ts', teamCtrl);

let userCtrl = fs.readFileSync('src/controllers/user.controller.ts', 'utf8');
userCtrl = fixLegacy(userCtrl);
fs.writeFileSync('src/controllers/user.controller.ts', userCtrl);

