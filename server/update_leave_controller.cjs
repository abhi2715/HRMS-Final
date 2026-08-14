const fs = require('fs');
let file = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { notificationService } from '../services/notification.service';\nimport { NotificationType } from '../../../shared/types/enums';`
);

// Add to applyLeave
const applyInsertion = `await newLeave.save();

    // In a real app we might lookup the user's manager.
    // For now we can notify the team lead if we can find one for the user, 
    // or just notify the Admin as a fallback, or we just leave it for the manager fetching logic.
    // Let's assume the Team Lead of the user's team gets notified.
    
    // We will do a background lookup for the Team Lead
    const team = await mongoose.model('Team').findOne({ members: req.user?.id });
    if (team && team.manager) {
      await notificationService.sendNotification({
        recipientId: team.manager.toString(),
        title: 'New Leave Request',
        message: \`\${req.user?.firstName} \${req.user?.lastName} applied for leave.\`,
        type: NotificationType.LEAVE,
        relatedEntityId: newLeave._id.toString(),
        entityModel: 'LeaveRequest'
      });
    }`;
file = file.replace(/await newLeave\.save\(\);/, applyInsertion);

// Add to respondToLeave
const respondInsertion = `await leave.save();

    // Notify the employee
    await notificationService.sendNotification({
      recipientId: leave.employee.toString(),
      title: \`Leave Request \${status === 'approved' ? 'Approved' : 'Rejected'}\`,
      message: \`Your leave request from \${new Date(leave.startDate).toLocaleDateString()} to \${new Date(leave.endDate).toLocaleDateString()} has been \${status}.\`,
      type: NotificationType.LEAVE,
      relatedEntityId: leave._id.toString(),
      entityModel: 'LeaveRequest'
    });`;
file = file.replace(/await leave\.save\(\);/, respondInsertion);

fs.writeFileSync('src/controllers/leave.controller.ts', file);
