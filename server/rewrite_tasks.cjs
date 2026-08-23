const fs = require('fs');

let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

const idorCheckClean = `
    const leadUser = await User.findById(userId);
    if (req.user!.role === UserRole.EMPLOYEE) {
      if (task.assignedTo.toString() !== userId) {
        return res.status(403).json({ message: 'Employees can only modify their own tasks' });
      }
    } else if (req.user!.role === UserRole.TEAM_LEAD) {
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

// It's easier to just fetch from git and start over.
// Let's do `git checkout src/controllers/task.controller.ts`
