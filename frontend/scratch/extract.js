const fs = require('fs');
const content = fs.readFileSync('e:/BalaWork/school/TN-Schools/frontend/src/lib/navConfig.ts', 'utf8');
const labels = [...content.matchAll(/label:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log(Array.from(new Set(labels)).join('\n'));
