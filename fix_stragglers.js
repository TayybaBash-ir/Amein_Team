const fs = require('fs');

function r(f, a, b) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.match(a)) {
    fs.writeFileSync(f, c.replace(a, b), 'utf8');
  }
}

r('src/app/dashboard/page.tsx', /text-\[\#4a7c59\]/g, 'text-brand');
r('src/components/clima/HomeHero.tsx', /stroke="#4a7c59"/g, 'stroke="var(--brand)"');
r('src/components/clima/MealCard.tsx', /text-\[\#4a7c59\]/g, 'text-brand');
r('src/components/clima/RestaurantRecommendationCard.tsx', /bg-emerald-600/g, 'bg-brand');
r('src/components/clima/RestaurantRecommendationCard.tsx', /focus-visible:outline-emerald-400/g, 'focus-visible:outline-brand');
r('src/components/clima/ClinicalIntakeForm.tsx', /accent-emerald-400/g, 'accent-brand');
r('src/components/clima/ClinicalIntakeForm.tsx', /hover:text-emerald-700/g, 'hover:text-brand-dark');
r('src/components/clima/ClinicalIntakeForm.tsx', /dark:hover:text-emerald-200/g, 'dark:hover:text-brand');
r('src/components/clima/MealPlanView.tsx', /text-emerald-100/g, 'text-brand');

console.log('Stragglers cleaned');
