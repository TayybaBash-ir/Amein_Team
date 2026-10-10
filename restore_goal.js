const fs = require('fs');
let p = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

const regex = /<div><label className=\{labelClass\}>Primary Goal<\/label>[\s\S]*?goal_amount:\s*e\.target\.value\s*\}\)}\s*\/><\/div>/m;
const newGoal = `<div className="sm:col-span-2"><label className={labelClass}>✨ AI Health Goal</label><input className={inputClass} value={profile.goal} placeholder="e.g. 'I want to lose 5 kg weight in 1 month'" onChange={e => setProfile({ ...profile, goal: e.target.value })} /></div>`;

if (regex.test(p)) {
  p = p.replace(regex, newGoal);
  fs.writeFileSync('src/app/profile/page.tsx', p, 'utf8');
  console.log('Restored free-text AI Goal!');
} else {
  console.log('Could not find the target string with regex!');
}
