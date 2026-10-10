import os
import re

view_file = 'src/components/clima/MealPlanView.tsx'
with open(view_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Web view update
content = content.replace(
    '<div className="mb-3 font-mono text-xs text-neutral-400">{meal.calories} kcal • {meal.protein}g protein</div>',
    '<div className="mb-3 font-mono text-xs text-neutral-400">{meal.calories} kcal • {meal.protein}g protein {meal.estimated_cost ? ` • ~Rs. ${Math.round(meal.estimated_cost)}` : ""}</div>'
)

# Print view update
# Previously it was just: {meal.name}
print_target = '{meal.name}'
print_replacement = '{meal.name} {meal.estimated_cost ? <span className="text-gray-500 font-normal">({Math.round(meal.estimated_cost)} PKR)</span> : ""}'
if 'PKR)</span>' not in content:
    content = content.replace(
        '<div key={meal.id} className="text-base lowercase mb-1">\n                  {meal.name}\n                </div>',
        '<div key={meal.id} className="text-base lowercase mb-1">\n                  {meal.name} {meal.estimated_cost ? <span className="text-neutral-500 font-normal ml-1">({Math.round(meal.estimated_cost)} PKR)</span> : ""}\n                </div>'
    )

with open(view_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched MealPlanView.tsx")
