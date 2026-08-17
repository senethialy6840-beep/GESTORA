const fs = require('fs');
let c = fs.readFileSync('app/dashboard/layout.tsx', 'utf8');
c = c.replaceAll('text-blue-500 dark:text-blue-400', 'text-blue-400');
fs.writeFileSync('app/dashboard/layout.tsx', c);
