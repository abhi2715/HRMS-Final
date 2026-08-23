const fs = require('fs');

let index = fs.readFileSync('src/routes/index.ts', 'utf8');

if (!index.includes('searchRoutes')) {
  index = index.replace(
    /import notificationRoutes from '\.\/notification\.routes';/,
    `import notificationRoutes from './notification.routes';\nimport searchRoutes from './search.routes';`
  );
  
  index = index.replace(
    /router\.use\('\/notifications', notificationRoutes\);/,
    `router.use('/notifications', notificationRoutes);\nrouter.use('/search', searchRoutes);`
  );

  fs.writeFileSync('src/routes/index.ts', index);
}

