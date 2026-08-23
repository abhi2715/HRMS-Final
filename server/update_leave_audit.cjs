const fs = require('fs');
let file = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Apply leave
file = file.replace(
  /sendSuccess\(res, \{ leaveRequest: newLeave \}, 'Leave request submitted successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.LEAVE_REQUEST_SUBMITTED,
      entity: 'LeaveRequest',
      entityId: newLeave._id
    }, req);
    sendSuccess(res, { leaveRequest: newLeave }, 'Leave request submitted successfully', 201);`
);

// Cancel leave
file = file.replace(
  /sendSuccess\(res, \{ leaveRequest: leave \}, 'Leave request cancelled successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.LEAVE_REQUEST_CANCELLED,
      entity: 'LeaveRequest',
      entityId: leave._id
    }, req);
    sendSuccess(res, { leaveRequest: leave }, 'Leave request cancelled successfully', 200);`
);

// Respond to leave (Approve/Reject)
file = file.replace(
  /sendSuccess\(res, \{ leaveRequest: leave \}, \`Leave request \$\{status\} successfully\`, 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: status === 'approved' ? AuditAction.LEAVE_REQUEST_APPROVED : AuditAction.LEAVE_REQUEST_REJECTED,
      entity: 'LeaveRequest',
      entityId: leave._id,
      metadata: { reason: rejectionReason }
    }, req);
    sendSuccess(res, { leaveRequest: leave }, \`Leave request \${status} successfully\`, 200);`
);

fs.writeFileSync('src/controllers/leave.controller.ts', file);
