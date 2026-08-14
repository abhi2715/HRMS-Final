const fs = require('fs');

let controller = fs.readFileSync('src/controllers/payroll.controller.ts', 'utf8');

// Fix req.user.userId -> req.user.id
controller = controller.replace(/req\.user\?\.userId/g, 'req.user?.id');

// Fix sendSuccess(res, 200, 'msg', data) -> sendSuccess(res, data, 'msg', 200)
controller = controller.replace(/sendSuccess\(res,\s*200,\s*'([^']+)',\s*({[^}]+})\)/g, "sendSuccess(res, $2, '$1', 200)");
controller = controller.replace(/sendSuccess\(res,\s*201,\s*'([^']+)',\s*({[^}]+})\)/g, "sendSuccess(res, $2, '$1', 201)");

// Fix sendError(res, 500, 'msg') -> sendError(res, 'msg', 500)
controller = controller.replace(/sendError\(res,\s*(\d+),\s*'([^']+)'\)/g, "sendError(res, '$2', $1)");

fs.writeFileSync('src/controllers/payroll.controller.ts', controller);
