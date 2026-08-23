const fs = require('fs');

let file = fs.readFileSync('src/controllers/leave.controller.ts', 'utf8');

// Patch getTeamRequests
file = file.replace(
  /\/\/ Validate team access \(team lead is assigned to this team\)\n\s+const user = await User\.findById\(req\.user\?\._id\);\n\s+if \(!user \|\| user\.team\?\.toString\(\) !== teamId\) \{\n\s+\/\/ In a real scenario, you'd check if user is admin or actual team lead\.\n\s+\/\/ Assuming authorization middleware already ensures they have LEAVE_VIEW_TEAM\.\n\s+\/\/ We will allow if they are in the team \(which for Leads means they manage it\)\.\n\s+\}/,
  `// Security Audit: Validate team access (IDOR Protection)
    const user = await User.findById(req.user?._id);
    if (!user || user.team?.toString() !== teamId) {
      if (req.user?.role === 'TEAM_LEAD' || req.user?.role === 'EMPLOYEE') {
        return res.status(403).json({ message: 'You can only view leave requests for your own team' });
      }
    }`
);

// Patch processLeaveRequest
// Change findById(id) to populate('employee')
file = file.replace(
  /const request = await LeaveRequest\.findById\(id\)\.session\(session\);/,
  `const request = await LeaveRequest.findById(id).populate('employee').session(session);`
);

// Add IDOR check after `if (!request) { ... }`
file = file.replace(
  /if \(!request\) \{\n\s+await session\.abortTransaction\(\);\n\s+session\.endSession\(\);\n\s+return sendError\(res, 'Leave request not found', 404\);\n\s+\}/,
  `if (!request) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Leave request not found', 404);
    }

    // Security Audit: IDOR Protection
    const approver = await User.findById(req.user?._id).session(session);
    if (req.user?.role === 'TEAM_LEAD') {
      if ((request.employee as any).team?.toString() !== approver?.team?.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: 'You can only approve leaves for employees in your team' });
      }
    }`
);

// In processLeaveRequest, request.employee is now populated, so we need to access its _id when checking balance
file = file.replace(
  /employee: request\.employee,/,
  `employee: (request.employee as any)._id,`
);

// And for AuditLog targetUser
file = file.replace(
  /targetUser: request\.employee,/,
  `targetUser: (request.employee as any)._id,`
);

fs.writeFileSync('src/controllers/leave.controller.ts', file);
