const fs = require('fs');
let file = fs.readFileSync('src/controllers/attendance.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Admin correct record
file = file.replace(
  /sendSuccess\(res, \{ attendance: record \}, 'Attendance record corrected successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.ATTENDANCE_CORRECTED,
      entity: 'Attendance',
      entityId: record._id,
      metadata: { newStatus: status }
    }, req);
    sendSuccess(res, { attendance: record }, 'Attendance record corrected successfully', 200);`
);

fs.writeFileSync('src/controllers/attendance.controller.ts', file);
