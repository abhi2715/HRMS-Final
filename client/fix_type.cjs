const fs = require('fs');
let file = fs.readFileSync('src/components/ui/CommandPalette.tsx', 'utf8');
file = file.replace(/import \{ searchApi, SearchResult \} from '\.\.\/\.\.\/services\/searchApi';/, "import { searchApi } from '../../services/searchApi';\nimport type { SearchResult } from '../../services/searchApi';");
fs.writeFileSync('src/components/ui/CommandPalette.tsx', file);
