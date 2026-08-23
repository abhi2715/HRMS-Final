const fs = require('fs');

let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

// createTask
file = file.replace(
  /action: AuditAction\.TASK_CREATED,\n\s+performedBy: userId,\n\s+targetTask: newTask\._id,\n\s+details: \{ title: newTask\.title, priority: newTask\.priority \},/,
  `action: AuditAction.TASK_CREATED,
      actor: userId,
      entity: 'Task',
      entityId: newTask._id,
      metadata: { title: newTask.title, priority: newTask.priority },`
);

// updateTask (status)
file = file.replace(
  /action: AuditAction\.TASK_STATUS_CHANGED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+details: changes,/,
  `action: AuditAction.TASK_STATUS_CHANGED,
        actor: userId,
        entity: 'Task',
        entityId: task._id,
        metadata: changes,`
);

// updateTask (assign)
file = file.replace(
  /action: AuditAction\.TASK_REASSIGNED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+targetUser: assignedTo,\n\s+details: \{\n\s+oldAssignee: task\.assignedTo\.toString\(\),\n\s+newAssignee: assignedTo,\n\s+\},/,
  `action: AuditAction.TASK_REASSIGNED,
        actor: userId,
        entity: 'Task',
        entityId: task._id,
        metadata: {
          oldAssignee: task.assignedTo.toString(),
          newAssignee: assignedTo,
        },`
);

// updateTask (update)
file = file.replace(
  /action: AuditAction\.TASK_UPDATED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+details: changes,/,
  `action: AuditAction.TASK_UPDATED,
        actor: userId,
        entity: 'Task',
        entityId: task._id,
        metadata: changes,`
);

// deleteTask
file = file.replace(
  /action: AuditAction\.TASK_DELETED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+targetUser: task\.assignedTo,\n\s+details: \{ title: task\.title \},/,
  `action: AuditAction.TASK_DELETED,
      actor: userId,
      entity: 'Task',
      entityId: task._id,
      metadata: { title: task.title },`
);

// addComment
file = file.replace(
  /action: AuditAction\.TASK_COMMENT_ADDED,\n\s+performedBy: userId,\n\s+targetTask: task\._id,\n\s+details: \{ commentPreview: text\.substring\(0, 100\) \},/,
  `action: 'TASK_COMMENT_ADDED' as AuditAction,
      actor: userId,
      entity: 'Task',
      entityId: task._id,
      metadata: { commentPreview: text.substring(0, 100) },`
);

fs.writeFileSync('src/controllers/task.controller.ts', file);
