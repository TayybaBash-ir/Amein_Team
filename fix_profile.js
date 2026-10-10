const fs = require('fs');

let content = fs.readFileSync('src/app/profile/page.tsx', 'utf8');

content = content.replace(
  /conditions: string\[\];\r?\n  medical_history_notes: string;\r?\n\};/,
  'conditions: string[];\n  medical_history_notes: string;\n  activity: string;\n  goal: string;\n  goal_amount: string;\n  city: string;\n  country: string;\n};'
);

content = content.replace(
  /conditions: \[\],\r?\n  medical_history_notes: "",\r?\n\};/,
  'conditions: [],\n  medical_history_notes: "",\n  activity: "Sedentary (desk job)",\n  goal: "Maintain weight",\n  goal_amount: "",\n  city: "Lahore",\n  country: "Pakistan",\n};'
);

content = content.replace(
  '<div><label className={labelClass}>Weight (kg)</label><input type="number" className={inputClass} value={profile.weight} onChange={e => setProfile({ ...profile, weight: +e.target.value })} /></div>',
  '<div><label className={labelClass}>Weight (kg)</label><input type="number" className={inputClass} value={profile.weight} onChange={e => setProfile({ ...profile, weight: +e.target.value })} /></div>\n              <div><label className={labelClass}>Activity Level</label><select className={inputClass} value={profile.activity} onChange={e => setProfile({ ...profile, activity: e.target.value })}><option>Sedentary (desk job)</option><option>Lightly active (1-3 days/wk)</option><option>Moderately active (3-5 days/wk)</option><option>Very active (6-7 days/wk)</option><option>Extra active (athlete)</option></select></div>\n              <div><label className={labelClass}>Primary Goal</label><select className={inputClass} value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })}><option>Lose weight</option><option>Gain muscle</option><option>Maintain weight</option><option>Improve overall health</option></select></div>\n              <div><label className={labelClass}>Goal Target</label><input className={inputClass} value={profile.goal_amount || ""} placeholder="e.g. 5kg" onChange={e => setProfile({ ...profile, goal_amount: e.target.value })} /></div>\n              <div><label className={labelClass}>City</label><input className={inputClass} value={profile.city || ""} onChange={e => setProfile({ ...profile, city: e.target.value })} /></div>\n              <div><label className={labelClass}>Country</label><input className={inputClass} value={profile.country || ""} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div>'
);

content = content.replace(
  /\["BMI", bmi \? \$\{bmi.toFixed\(1\)\} \S+ \$\{bmiCategory\?.label\} : "\?"\],/,
  '["BMI", bmi ? ${bmi.toFixed(1)} –  : "?"],\n                ["Activity", profile.activity || "Sedentary"],\n                ["Goal", ${profile.goal || ""} ],\n                ["Location", ${profile.city || ""}, ],'
);

fs.writeFileSync('src/app/profile/page.tsx', content, 'utf8');
console.log('done');
