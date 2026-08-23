const fs = require('fs');

let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

const idorCheck = `
    const userRole = req.user!.role;
    const userId = req.user!.id;
    const leadUser = await User.findById(userId);

    if (userRole === UserRole.EMPLOYEE) {
      if (task.assignedTo.toString() !== userId) {
        return res.status(403).json({ message: 'Employees can only modify their own tasks' });
      }
    } else if (userRole === UserRole.TEAM_LEAD) {
      if (
        task.createdBy.toString() !== userId &&
        task.assigner?.toString() !== userId &&
        task.assignedTo.toString() !== userId &&
        task.team?.toString() !== leadUser?.team?.toString()
      ) {
        return res.status(403).json({ message: 'Team Leads can only modify tasks within their team' });
      }
    }
`;

// Patch updateTask
file = file.replace(
  /const task = await Task\.findById\(taskId\);\n\s+if \(!task\) return res\.status\(404\)\.json\(\{ message: 'Task not found' \}\);\n\n\s+const changes: Record<string, any> = \{\};/,
  `const task = await Task.findById(taskId);\n    if (!task) return res.status(404).json({ message: 'Task not found' });\n\n    // Security Audit: IDOR Protection${idorCheck}\n    const changes: Record<string, any> = {};`
);

// Patch deleteTask
file = file.replace(
  /const task = await Task\.findById\(taskId\);\n\s+if \(!task\) return res\.status\(404\)\.json\(\{ message: 'Task not found' \}\);/,
  `const task = await Task.findById(taskId);\n    if (!task) return res.status(404).json({ message: 'Task not found' });\n\n    // Security Audit: IDOR Protection${idorCheck}`
);

// Patch addComment
file = file.replace(
  /const task = await Task\.findById\(taskId\);\n\s+if \(!task\) return res\.status\(404\)\.json\(\{ message: 'Task not found' \}\);\n\n\s+task\.comments\.push\(\{/,
  `const task = await Task.findById(taskId);\n    if (!task) return res.status(404).json({ message: 'Task not found' });\n\n    // Security Audit: IDOR Protection${idorCheck}\n    task.comments.push({`
);

fs.writeFileSync('src/controllers/task.controller.ts', file);
