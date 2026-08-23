const fs = require('fs');
let file = fs.readFileSync('src/controllers/payroll.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Create payroll
file = file.replace(
  /sendSuccess\(res, \{ payroll: newPayroll \}, 'Salary record created successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.PAYROLL_CREATED,
      entity: 'Payroll',
      entityId: newPayroll._id,
      metadata: { employeeId: newPayroll.employee }
    }, req);
    sendSuccess(res, { payroll: newPayroll }, 'Salary record created successfully', 201);`
);

// Update payroll
file = file.replace(
  /sendSuccess\(res, \{ payroll: updatedPayroll \}, 'Salary record updated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.PAYROLL_MODIFIED,
      entity: 'Payroll',
      entityId: updatedPayroll._id,
      metadata: { employeeId: updatedPayroll.employee }
    }, req);
    sendSuccess(res, { payroll: updatedPayroll }, 'Salary record updated successfully', 200);`
);

fs.writeFileSync('src/controllers/payroll.controller.ts', file);
