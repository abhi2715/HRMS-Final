const fs = require('fs');

// 1. Remove NotificationBell from AppLayout.tsx
let layout = fs.readFileSync('src/layouts/AppLayout.tsx', 'utf8');
layout = layout.replace(/import \{ NotificationBell \} from '\.\.\/components\/notifications\/NotificationBell';\n/, '');
layout = layout.replace(/<NotificationBell \/>\n\s*/, '');
fs.writeFileSync('src/layouts/AppLayout.tsx', layout);

// 2. Add NotificationBell to TopNavigation.tsx
let topnav = fs.readFileSync('src/components/layout/TopNavigation.tsx', 'utf8');
topnav = topnav.replace(/import \{ Bell, Search, Menu \} from 'lucide-react';/, "import { Search, Menu } from 'lucide-react';\nimport { NotificationBell } from '../notifications/NotificationBell';");
topnav = topnav.replace(/<IconButton\n\s*icon=\{<Bell size=\{20\} \/>\}\n\s*aria-label="Notifications"\n\s*className="topnav__action-btn"\n\s*\/>/, '<NotificationBell />');
fs.writeFileSync('src/components/layout/TopNavigation.tsx', topnav);

