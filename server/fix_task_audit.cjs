const fs = require('fs');

let file = fs.readFileSync('src/controllers/task.controller.ts', 'utf8');

// Replace duplicate entity / entityId fields
file = file.replace(/entity: 'User',\s*entityId: [^,]+,\s*entity: 'Task',/g, "entity: 'Task',");
file = file.replace(/entity: 'Task',\s*entityId: [^,]+,\s*entity: 'User',/g, "entity: 'Task',");
file = file.replace(/entity: 'Task',\s*entityId: [^,]+,\s*entity: 'Team',\s*entityId: [^,]+,/g, "entity: 'Task',");

// Clean up leftovers by regex: if there are still multiple entities:
// The easiest is just finding exactly where we broke it.
file = file.replace(/entity: 'User',\n\s+entityId: [^,\n]+,\n\s+entity: 'Task',\n\s+entityId: [^,\n]+,\n\s+entity: 'Team',\n\s+entityId: [^,\n]+,/g, "entity: 'Task',\n      entityId: newTask._id,");

file = file.replace(/entity: 'Task',\n\s+entityId: [^,\n]+,\n\s+entity: 'User',\n\s+entityId: [^,\n]+,/g, "entity: 'Task',\n        entityId: task._id,");

fs.writeFileSync('src/controllers/task.controller.ts', file);
