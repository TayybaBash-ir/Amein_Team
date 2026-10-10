const fs = require('fs');

let d = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
d = d.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, '$1');
d = d.replace('text-white', 'text-foreground');
d = d.replace('text-slate-400', 'text-muted-foreground');
fs.writeFileSync('src/app/dashboard/page.tsx', d, 'utf8');

let p = fs.readFileSync('src/app/profile/page.tsx', 'utf8');
p = p.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> [0-9a-f]+/g, '$1');
p = p.replace(/âœ“/g, '✓');
fs.writeFileSync('src/app/profile/page.tsx', p, 'utf8');

let h = fs.readFileSync('src/components/clima/HomeHero.tsx', 'utf8');
h = h.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> [0-9a-f]+/g, '$1');
h = h.replace(/bg-\[\#4a7c59\]/g, 'bg-brand');
h = h.replace(/bg-emerald-500/g, 'bg-brand');
h = h.replace(/text-emerald-400/g, 'text-brand');
h = h.replace(/text-emerald-600/g, 'text-brand');
h = h.replace(/border-\[\#4a7c59\]/g, 'border-brand');
h = h.replace(/from-emerald-400/g, 'from-brand');
h = h.replace(/to-emerald-600/g, 'to-brand-dark');
fs.writeFileSync('src/components/clima/HomeHero.tsx', h, 'utf8');

console.log('Conflicts resolved automatically!');
