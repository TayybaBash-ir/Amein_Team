const fs = require('fs');
let c = fs.readFileSync('src/components/clima/ClinicalIntakeForm.tsx', 'utf8');

const regex = /<div className="space-y-6">\s*\{listField\("Chronic conditions/m;
const insertion = `<div className="space-y-6">
          <div className="mb-6">
            <label className={labelClass}>AI Health Goal</label>
            <input className={inputClass} value={d.goal || ""} placeholder="e.g. 'I want to lose 5 kg weight in 1 month'" onChange={(e) => set("goal", e.target.value)} />
          </div>
          {listField("Chronic conditions`;

if (regex.test(c)) {
  c = c.replace(regex, insertion);
  fs.writeFileSync('src/components/clima/ClinicalIntakeForm.tsx', c, 'utf8');
  console.log('Added AI Health Goal to ClinicalIntakeForm successfully!');
} else {
  console.log('Regex did not match!');
}
