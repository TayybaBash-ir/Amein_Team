const fs = require('fs');
let c = fs.readFileSync('src/components/clima/MealPlanView.tsx', 'utf8');

// 1. Remove the outside_order_matches block
const outsideMatchesRegex = /\{plan\.outside_order_matches && plan\.outside_order_matches\[selectedDay\] && plan\.outside_order_matches\[selectedDay\]\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/m;
c = c.replace(outsideMatchesRegex, '');

// 2. Add onGoToRestaurant to props
c = c.replace(/export default function MealPlanView\(\{ plan: initialPlan \}: \{ plan: PlanResponse \}\) \{/, 'export default function MealPlanView({ plan: initialPlan, onGoToRestaurant }: { plan: PlanResponse; onGoToRestaurant?: (r: string) => void }) {');

// 3. Pass props to MealDetail
const detailRegex = /<MealDetail\s+meal=\{allMeals\[openIdx\]\}[\s\S]*?onPrev=\{prev\}\s*\/>/m;
const newDetail = `<MealDetail
            meal={allMeals[openIdx]}
            tdee={plan.nutrition.target_calories}
            index={openIdx}
            total={total}
            onClose={close}
            onPrev={prev}
            onNext={next}
            externalDining={plan.external_dining}
            onGoToRestaurant={onGoToRestaurant}
          />`;
c = c.replace(detailRegex, newDetail);

fs.writeFileSync('src/components/clima/MealPlanView.tsx', c, 'utf8');
console.log('MealPlanView updated!');
