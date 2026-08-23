const fs = require('fs');

let file = fs.readFileSync('src/controllers/auth.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Login
file = file.replace(
  /sendSuccess\(res, \{ user: userResponse, tokens \}, 'Login successful', 200\);/,
  `// Audit log
    await logAudit({
      actor: user._id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user._id,
      metadata: { email: user.email }
    }, req);

    sendSuccess(res, { user: userResponse, tokens }, 'Login successful', 200);`
);

// Logout
file = file.replace(
  /res\.json\(\{ message: 'Logout successful' \}\);/,
  `// Audit log
    if (req.user) {
      await logAudit({
        actor: req.user.id,
        action: AuditAction.LOGOUT,
        entity: 'User',
        entityId: req.user.id
      }, req);
    }
    res.json({ message: 'Logout successful' });`
);

fs.writeFileSync('src/controllers/auth.controller.ts', file);
