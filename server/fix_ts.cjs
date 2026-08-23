const fs = require('fs');

// 1. Fix leave.controller.ts enum
let leave = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');
leave = leave.replace(/req\.user\?\.role === 'TEAM_LEAD'/g, 'req.user?.role === UserRole.TEAM_LEAD');
leave = leave.replace(/req\.user\?\.role === 'EMPLOYEE'/g, 'req.user?.role === UserRole.EMPLOYEE');
fs.writeFileSync('src/controllers/leave.controller.ts', leave);

// 2. Fix task.controller.ts declarations
let task = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');
task = task.replace(/const userRole = req\.user!\.role;\n\s+const userId = req\.user!\.id;\n\s+const leadUser = await User\.findById\(userId\);/g, 'const leadUser = await User.findById(userId);');

// Wait, let's see if updateTask already had `const userRole = req.user!.role;`
// It didn't have userRole but it had userId.
// Let's just fix it by renaming them in the patch block to avoid conflicts.
task = task.replace(/const userRole = req\.user!\.role;/g, 'const _userRole = req.user!.role;');
task = task.replace(/const userId = req\.user!\.id;/g, 'const _userId = req.user!.id;');
task = task.replace(/userId\)/g, '_userId)');
task = task.replace(/userId \}/g, '_userId }');
task = task.replace(/!== userId/g, '!== _userId');

// The easiest way is to just fetch task.controller.ts and fix the duplicates via a regex that targets the patch.
// Let's reset the file and apply the patch cleanly.
