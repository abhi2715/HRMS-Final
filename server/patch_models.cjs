const fs = require('fs');
const path = require('path');

const modelsDir = 'src/models';
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.model.ts'));

for (const file of files) {
  const fp = path.join(modelsDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Find the line: const X = mongoose.model<...>(...);
  // and replace with: const X = mongoose.models.X || mongoose.model<...>(...);
  
  content = content.replace(/const (\w+) = mongoose\.model<([^>]+)>\('([^']+)', (\w+)\);/g, "const $1 = mongoose.models.$3 || mongoose.model<$2>('$3', $4);");
  content = content.replace(/const (\w+) = mongoose\.model\('([^']+)', (\w+)\);/g, "const $1 = mongoose.models.$2 || mongoose.model('$2', $3);");
  
  fs.writeFileSync(fp, content);
}

