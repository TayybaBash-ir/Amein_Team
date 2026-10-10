const fs = require('fs');

let content = fs.readFileSync('src/components/clima/ClinicalIntakeForm.tsx', 'utf8');

// 1. Remove Personal Information Section
content = content.replace(
  /<motion\.section initial=\{\{ opacity: 0, y: 20 \}\} animate=\{\{ opacity: 1, y: 0 \}\} className=\{sectionClass\}>[\s\S]*?<\/motion\.section>\s*<motion\.section initial=\{\{ opacity: 0, y: 20 \}\} animate=\{\{ opacity: 1, y: 0 \}\} transition=\{\{ delay: 0\.1 \}\} className=\{sectionClass\}>/m,
  '<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>'
);

// 2. Change section numbers and paddings
content = content.replace(/2\. Health Conditions &amp; Dietary Needs/, '1. Health Conditions & Dietary Needs');
content = content.replace(/3\. Your Kitchen &amp; Budget/, '2. Your Kitchen & Budget');
content = content.replace(/p-5 sm:p-7/g, 'p-4 sm:p-5'); // make it more compact

// 3. Add Optional to listField labels
content = content.replace(/listField\("Chronic conditions",/g, 'listField("Chronic conditions (Optional)",');
content = content.replace(/listField\("Dietary restrictions",/g, 'listField("Dietary restrictions (Optional)",');
content = content.replace(/listField\("Allergies",/g, 'listField("Allergies (Optional)",');

// 4. Remove Feeling under the weather accordion
content = content.replace(
  /<div className="border-t border-border pt-5">[\s\S]*?<\/AnimatePresence>\s*<\/div>/,
  ''
);

// 5. Change Strict pantry mode
content = content.replace(
  /<span><strong>Strict pantry mode<\/strong><br \/><span className="text-xs text-muted-foreground">Restrict meals to your available ingredients and staples\.<\/span><\/span>/,
  '<span><strong>Use only what I have</strong></span>'
);

// 6. Update useEffect to fetch new profile fields
const newUseEffect = 
    try {
      const intake = savedIntake ? JSON.parse(savedIntake) : {};
      const medical = savedMedicalProfile ? JSON.parse(savedMedicalProfile) : {};
      setD((current) => ({
        ...current,
        ...intake,
        name: medical.name || intake.name || current.name,
        age: Number(medical.age ?? intake.age ?? current.age),
        weight: Number(medical.weight ?? intake.weight ?? current.weight),
        height: Number(medical.height ?? intake.height ?? current.height),
        gender: String(medical.gender ?? intake.gender ?? current.gender).toLowerCase(),
        activity: medical.activity || intake.activity || current.activity,
        goal: medical.goal || intake.goal || current.goal,
        goal_amount: medical.goal_amount || intake.goal_amount || current.goal_amount,
        city: medical.city || intake.city || current.city,
        country: medical.country || intake.country || current.country,
        conditions: Array.from(new Set([...asList(medical.conditions), ...asList(intake.conditions)])),
        allergies: Array.from(new Set([...asList(medical.allergies), ...asList(intake.allergies)])),
        dietary_restrictions: Array.from(new Set([...asList(medical.dietary_restrictions), ...asList(intake.dietary_restrictions)])),
;
content = content.replace(
  /try \{\s*const intake = savedIntake \? JSON\.parse\(savedIntake\) : \{\};\s*const medical = savedMedicalProfile \? JSON\.parse\(savedMedicalProfile\) : \{\};\s*setD\(\(current\) => \(\{\s*\.\.\.current,\s*\.\.\.intake,\s*name: medical\.name \|\| intake\.name \|\| current\.name,\s*age: Number\(medical\.age \?\? intake\.age \?\? current\.age\),\s*weight: Number\(medical\.weight \?\? intake\.weight \?\? current\.weight\),\s*height: Number\(medical\.height \?\? intake\.height \?\? current\.height\),\s*gender: String\(medical\.gender \?\? intake\.gender \?\? current\.gender\)\.toLowerCase\(\),\s*conditions: Array\.from\(new Set\(\[\.\.\.asList\(medical\.conditions\), \.\.\.asList\(intake\.conditions\)]\)\),\s*allergies: Array\.from\(new Set\(\[\.\.\.asList\(medical\.allergies\), \.\.\.asList\(intake\.allergies\)]\)\),\s*dietary_restrictions: Array\.from\(new Set\(\[\.\.\.asList\(medical\.dietary_restrictions\), \.\.\.asList\(intake\.dietary_restrictions\)]\)\),/,
  newUseEffect
);

fs.writeFileSync('src/components/clima/ClinicalIntakeForm.tsx', content, 'utf8');
console.log('done form');
