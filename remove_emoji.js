const fs = require('fs');
let p = fs.readFileSync('src/app/profile/page.tsx', 'utf8');
p = p.replace(/o" AI Health Goal/g, 'AI Health Goal');
p = p.replace(/✨ AI Health Goal/g, 'AI Health Goal');
fs.writeFileSync('src/app/profile/page.tsx', p, 'utf8');
