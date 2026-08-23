const fs = require('fs');
let file = fs.readFileSync('src/controllers/team.controller.ts', 'utf8');

// Add imports
file = file.replace(
  /import \{ sendSuccess, sendError \} from '\.\.\/utils\/response';/,
  `import { sendSuccess, sendError } from '../utils/response';\nimport { logAudit } from '../services/audit.service';\nimport { AuditAction } from '../models/AuditLog.model';`
);

// Create team
file = file.replace(
  /sendSuccess\(res, \{ team \}, 'Team created successfully', 201\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.TEAM_CREATED,
      entity: 'Team',
      entityId: team._id,
      metadata: { name: team.name }
    }, req);
    sendSuccess(res, { team }, 'Team created successfully', 201);`
);

// Update team
file = file.replace(
  /sendSuccess\(res, \{ team: updatedTeam \}, 'Team updated successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.TEAM_UPDATED,
      entity: 'Team',
      entityId: updatedTeam._id
    }, req);
    sendSuccess(res, { team: updatedTeam }, 'Team updated successfully', 200);`
);

// Assign manager
file = file.replace(
  /sendSuccess\(res, \{ team: updatedTeam \}, 'Manager assigned successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.TEAM_LEAD_ASSIGNED,
      entity: 'Team',
      entityId: updatedTeam._id,
      metadata: { managerId }
    }, req);
    sendSuccess(res, { team: updatedTeam }, 'Manager assigned successfully', 200);`
);

// Assign employees
file = file.replace(
  /sendSuccess\(res, \{ team: updatedTeam \}, 'Employees assigned successfully', 200\);/,
  `await logAudit({
      actor: req.user?.id as string,
      action: AuditAction.EMPLOYEE_ASSIGNED_TO_TEAM,
      entity: 'Team',
      entityId: updatedTeam._id,
      metadata: { employeeIds }
    }, req);
    sendSuccess(res, { team: updatedTeam }, 'Employees assigned successfully', 200);`
);

fs.writeFileSync('src/controllers/team.controller.ts', file);
