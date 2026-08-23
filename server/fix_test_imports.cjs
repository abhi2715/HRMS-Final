const fs = require('fs');
const path = require('path');

const testDir = 'src/__tests__';
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

for (const file of files) {
  const fp = path.join(testDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Fix helper imports: ../helpers -> ./helpers/index.ts (won't work)
  // Actually vitest should resolve, let's try adding extensions
  content = content.replace(/from '\.\.\/helpers'/g, "from './helpers/index.js'");
  content = content.replace(/from '\.\.\/\.\.\/app'/g, "from '../app.js'");
  content = content.replace(/from '\.\.\/\.\.\/models\//g, "from '../models/");
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/shared/g, "from '../../../shared");
  
  fs.writeFileSync(fp, content);
}

// Fix helpers/index.ts too
let helpers = fs.readFileSync('src/__tests__/helpers/index.ts', 'utf8');
helpers = helpers.replace(/from '\.\.\/\.\.\/app'/g, "from '../../app.js'");
helpers = helpers.replace(/from '\.\.\/\.\.\/models\//g, "from '../../models/");
helpers = helpers.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/shared/g, "from '../../../../shared");
fs.writeFileSync('src/__tests__/helpers/index.ts', helpers);

