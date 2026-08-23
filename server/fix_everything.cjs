const fs = require('fs');

let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

// 1. Fix Audit Logs
file = file.replace(
  /action: AuditAction\.TASK_CREATED,\n\s+performedBy: userId,\n\s+targetUser: assignedTo,\n\s+targetTask: newTask\._id,\n\s+targetTeam: newTask\.team,\n\s+details: \{ title, priority: newTask\.priority \},/g,
  `action: AuditAction.TASK_CREATED,
      actor: userId,
      entity: 'Task',
      entityId: newTask._id,
      metadata: { title, priority: newTask.priority },`
);

file = file.replace(
  /action: AuditAction\.TASK_STATUS_CHANGED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+targetUser: task\.assignedTo,\n\s+details: changes,/g,
  `action: AuditAction.TASK_STATUS_CHANGED,
        actor: userId,
        entity: 'Task',
        entityId: task._id,
        metadata: changes,`
);

file = file.replace(
  /action: AuditAction\.TASK_UPDATED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+details: changes,/g,
  `action: AuditAction.TASK_UPDATED,
        actor: userId,
        entity: 'Task',
        entityId: task._id,
        metadata: changes,`
);

file = file.replace(
  /action: AuditAction\.TASK_DELETED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+targetUser: task\.assignedTo,\n\s+details: \{ title: task\.title \},/g,
  `action: AuditAction.TASK_DELETED,
      actor: userId,
      entity: 'Task',
      entityId: task._id,
      metadata: { title: task.title },`
);

file = file.replace(
  /action: AuditAction\.TASK_COMMENT_ADDED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+details: \{ commentPreview: text\.substring\(0, 100\) \},/g,
  `action: AuditAction.TASK_COMMENT_ADDED,
      actor: userId,
      entity: 'Task',
      entityId: task._id,
      metadata: { commentPreview: text.substring(0, 100) },`
);

fs.writeFileSync('src/controllers/task.controller.ts', file);
