const fs = require('fs');

let c = fs.readFileSync('src/components/clima/ClinicalIntakeForm.tsx', 'utf8');
const regex = /<div className="rounded-2xl border border-amber-500\/20 bg-amber-500\/\[0\.05\] p-4">[\s\S]*?<\/div>\s*\{listField\("Chronic conditions/m;
c = c.replace(regex, '{listField("Chronic conditions');
fs.writeFileSync('src/components/clima/ClinicalIntakeForm.tsx', c, 'utf8');

console.log('Removed amber block from Intake Form!');
