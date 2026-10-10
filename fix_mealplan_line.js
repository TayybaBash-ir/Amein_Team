const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

c = c.replace(/<MealPlanView plan=\{plan\} onGoToRestaurant=[\s\S]*?\/>/m, `<MealPlanView plan={plan} onGoToRestaurant={(r) => { setActiveTab('restaurants'); setTimeout(() => { const el = document.getElementById('restaurant-' + r); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} />`);

fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('Fixed MealPlanView!');
