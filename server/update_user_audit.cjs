const fs = require('fs');
let file = fs.readFileSync('src/controllers/user.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// User Creation
file = file.replace(
  /sendSuccess\(res, \{ user: userResponse \}, 'User created successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.USER_CREATED,
      entity: 'User',
      entityId: user._id,
      metadata: { email: user.email, role: user.role }
    }, req);
    sendSuccess(res, { user: userResponse }, 'User created successfully', 201);`
);

// Role Change
file = file.replace(
  /sendSuccess\(res, \{ user: userResponse \}, 'User role updated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.ROLE_CHANGED,
      entity: 'User',
      entityId: user._id,
      metadata: { newRole: role }
    }, req);
    sendSuccess(res, { user: userResponse }, 'User role updated successfully', 200);`
);

// Deactivate
file = file.replace(
  /sendSuccess\(res, \{ user: userResponse \}, 'User deactivated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.USER_DEACTIVATED,
      entity: 'User',
      entityId: user._id
    }, req);
    sendSuccess(res, { user: userResponse }, 'User deactivated successfully', 200);`
);

// Activate
file = file.replace(
  /sendSuccess\(res, \{ user: userResponse \}, 'User activated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.USER_ACTIVATED,
      entity: 'User',
      entityId: user._id
    }, req);
    sendSuccess(res, { user: userResponse }, 'User activated successfully', 200);`
);

fs.writeFileSync('src/controllers/user.controller.ts', file);
