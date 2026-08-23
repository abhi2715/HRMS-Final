const fs = require('fs');
let file = fs.readFileSync('src/controllers/weeklyReport.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Submit report
file = file.replace(
  /sendSuccess\(res, \{ report: newReport \}, 'Weekly report submitted successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.REPORT_SUBMITTED,
      entity: 'WeeklyReport',
      entityId: newReport._id,
      metadata: { teamId: newReport.team }
    }, req);
    sendSuccess(res, { report: newReport }, 'Weekly report submitted successfully', 201);`
);

// Update report
file = file.replace(
  /sendSuccess\(res, \{ report: updatedReport \}, 'Weekly report updated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.REPORT_MODIFIED,
      entity: 'WeeklyReport',
      entityId: updatedReport._id
    }, req);
    sendSuccess(res, { report: updatedReport }, 'Weekly report updated successfully', 200);`
);

fs.writeFileSync('src/controllers/weeklyReport.controller.ts', file);
