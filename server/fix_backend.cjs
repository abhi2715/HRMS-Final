const fs = require('fs');

// Fix leaveAdmin.controller.ts
let contentAdmin = fs.readFileSync('src/controllers/leaveAdmin.controller.ts', 'utf8');
contentAdmin = contentAdmin.replace(/import \{ AuditLog, AuditAction \} from '\.\.\/models\/AuditLog\.model';/g, "import AuditLog, { AuditAction } from '../models/AuditLog.model';");
contentAdmin = contentAdmin.replace(/import \{ successResponse, errorResponse \} from '\.\.\/utils\/response';/g, "import { sendSuccess, sendError } from '../utils/response';");
contentAdmin = contentAdmin.replace(/return successResponse\(/g, "return sendSuccess(");
contentAdmin = contentAdmin.replace(/return errorResponse\(/g, "return sendError(");
contentAdmin = contentAdmin.replace(/return sendError\(res, '([^\']+)', (\d+)\);/g, "return sendError(res, '$1', $2);");
fs.writeFileSync('src/controllers/leaveAdmin.controller.ts', contentAdmin);

// Fix leave.controller.ts
let contentLeave = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');
contentLeave = contentLeave.replace(/import \{ User \} from '\.\.\/models\/User\.model';/g, "import User from '../models/User.model';");
contentLeave = contentLeave.replace(/import \{ AuditLog, AuditAction \} from '\.\.\/models\/AuditLog\.model';/g, "import AuditLog, { AuditAction } from '../models/AuditLog.model';");
contentLeave = contentLeave.replace(/import \{ successResponse, errorResponse \} from '\.\.\/utils\/response';/g, "import { sendSuccess, sendError } from '../utils/response';");
contentLeave = contentLeave.replace(/return successResponse\(/g, "return sendSuccess(");
contentLeave = contentLeave.replace(/return errorResponse\(/g, "return sendError(");
contentLeave = contentLeave.replace(/return sendError\(res, '([^\']+)', (\d+)\);/g, "return sendError(res, '$1', $2);");
contentLeave = contentLeave.replace(/return sendError\(res, `([^\`]+)`, (\d+)\);/g, "return sendError(res, `$1`, $2);");
contentLeave = contentLeave.replace(/const memberIds = teamMembers\.map\(m => m\._id\);/g, "const memberIds = teamMembers.map((m: any) => m._id);");
fs.writeFileSync('src/controllers/leave.controller.ts', contentLeave);

// Fix leave.routes.ts
let contentRoutes = fs.readFileSync('src/routes/leave.routes.ts', 'utf8');
contentRoutes = contentRoutes.replace(/import \{ requireAuth, authorize \} from '\.\.\/middleware\/auth\.middleware';/g, "import { authenticate, authorize } from '../middleware/auth.middleware';");
contentRoutes = contentRoutes.replace(/router\.use\(requireAuth\);/g, "router.use(authenticate);");
fs.writeFileSync('src/routes/leave.routes.ts', contentRoutes);

// Fix dailyProgress.controller.ts
let contentProgress = fs.readFileSync('src/controllers/dailyProgress.controller.ts', 'utf8');
contentProgress = contentProgress.replace(/DAILY_PROGRESS_EDITED/g, "DAILY_PROGRESS_UPDATED");
fs.writeFileSync('src/controllers/dailyProgress.controller.ts', contentProgress);

