const fs = require('fs');
let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Create task
file = file.replace(
  /sendSuccess\(res, \{ task: newTask \}, 'Task created successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.TASK_CREATED,
      entity: 'Task',
      entityId: newTask._id,
      metadata: { title: newTask.title }
    }, req);
    sendSuccess(res, { task: newTask }, 'Task created successfully', 201);`
);

// Update task
file = file.replace(
  /sendSuccess\(res, \{ task: updatedTask \}, 'Task updated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.TASK_UPDATED,
      entity: 'Task',
      entityId: updatedTask._id
    }, req);
    sendSuccess(res, { task: updatedTask }, 'Task updated successfully', 200);`
);

fs.writeFileSync('src/controllers/task.controller.ts', file);
