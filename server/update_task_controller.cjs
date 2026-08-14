const fs = require('fs');
let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { notificationService } from '../services/notification.service';\nimport { NotificationType } from '../../../shared/types/enums';`
);

// Add to createTask
const createInsertion = `await newTask.save();
    
    // Notify the assigned employee
    await notificationService.sendNotification({
      recipientId: newTask.assignedTo.toString(),
      title: 'New Task Assigned',
      message: \`You have been assigned a new task: "\${newTask.title}"\`,
      type: NotificationType.TASK,
      relatedEntityId: newTask._id.toString(),
      entityModel: 'Task'
    });`;
file = file.replace(/await newTask\.save\(\);/, createInsertion);

// Add to updateTask
const updateInsertion = `const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    
    if (updatedTask && req.user) {
      // Notify the assigned employee if someone else updated it
      if (updatedTask.assignedTo.toString() !== req.user.id) {
        await notificationService.sendNotification({
          recipientId: updatedTask.assignedTo.toString(),
          title: 'Task Updated',
          message: \`The task "\${updatedTask.title}" has been updated.\`,
          type: NotificationType.TASK,
          relatedEntityId: updatedTask._id.toString(),
          entityModel: 'Task'
        });
      }
    }`;
file = file.replace(/const updatedTask = await Task\.findByIdAndUpdate\(id, updates, \{ new: true \}\);/, updateInsertion);

fs.writeFileSync('src/controllers/task.controller.ts', file);
