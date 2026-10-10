const fs = require('fs');
let c = fs.readFileSync('src/components/clima/MealDetail.tsx', 'utf8');

const importRegex = /import type \{ Meal \} from "@\/lib\/mock";/;
c = c.replace(importRegex, 'import type { Meal, ExternalDiningRecommendation } from "@/lib/mock";');

const propsRegex = /interface MealDetailProps \{[\s\S]*?\}/;
c = c.replace(propsRegex, `interface MealDetailProps {
  meal: Meal;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalMeals?: number;
  index?: number;
  total?: number;
  tdee?: number;
  externalDining?: ExternalDiningRecommendation[];
  onGoToRestaurant?: (r: string) => void;
}`);

const paramsRegex = /tdee,\n\}: MealDetailProps\)/;
c = c.replace(paramsRegex, `tdee,\n  externalDining,\n  onGoToRestaurant,\n}: MealDetailProps)`);

const orderButton = `
        {/* Watch Recipe Button */}
        {meal.recipe_link && (
          <div className="mb-6">
            <a href={meal.recipe_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]" style={{ backgroundColor: ACCENT }}>
              <MdPlayArrow className="w-5 h-5 fill-current" />
              <span>Watch Recipe</span>
            </a>
          </div>
        )}
        
        {/* Restaurant Order Button */}
        {externalDining && externalDining.find(d => d.matched_meal_name === meal.name || d.matched_meal_id === meal.id) && (() => {
          const matched = externalDining.find(d => d.matched_meal_name === meal.name || d.matched_meal_id === meal.id);
          if (!matched) return null;
          return (
            <div className="mb-6">
              <button
                onClick={() => {
                  onClose();
                  if (onGoToRestaurant) onGoToRestaurant(matched.restaurant_name);
                }}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] bg-brand"
              >
                <span>Order online &rarr;</span>
              </button>
            </div>
          );
        })()}
`;

c = c.replace(/\{\/\* Watch Recipe Button \*\/\}[\s\S]*?\{\/\* Ingredients Section \*\/\}/m, orderButton + '\n        {/* Ingredients Section */}');

fs.writeFileSync('src/components/clima/MealDetail.tsx', c, 'utf8');
console.log('MealDetail updated!');
