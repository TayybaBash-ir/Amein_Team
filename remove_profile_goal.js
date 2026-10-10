const fs = require('fs');
let p = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

// Remove AI Health Goal div
p = p.replace(/<div className="sm:col-span-2"><label className=\{labelClass\}>AI Health Goal<\/label><input className=\{inputClass\} value=\{profile\.goal\} placeholder="e\.g\. 'I want to lose 5 kg weight in 1 month'" onChange=\{e => setProfile\(\{ \.\.\.profile, goal: e\.target\.value \}\)\} \/><\/div>/g, '');

fs.writeFileSync('src/app/profile/page.tsx', p, 'utf8');
console.log('Removed Goal from Profile page');
