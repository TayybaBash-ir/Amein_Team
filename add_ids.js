const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace(/<div key=\{\`\$\{item\.restaurant_name\}\-\$\{item\.dish_name\}\-\$\{i\}\`\} className="transform transition \\n?duration-300 hover:scale-\[1\.02\]">/g, 
'<div id={`restaurant-${item.restaurant_name}`} key={`${item.restaurant_name}-${item.dish_name}-${i}`} className="transform transition duration-300 hover:scale-[1.02]">');

fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('Added IDs to restaurant cards!');
