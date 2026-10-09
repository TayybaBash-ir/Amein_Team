import os

with open("src/components/clima/MealPlanView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make the interactive view hidden on print
content = content.replace(
    '<div className="flex flex-col gap-5 w-full">', 
    '<div className="flex flex-col gap-5 w-full print:hidden">'
)

print_view = """
    <>
      <div className="hidden print:block text-black bg-white w-full p-4">
        {plan.meal_plan.days.map((day) => (
          <div key={day.day_label} className="mb-6 break-inside-avoid">
            <h2 className="text-xl font-bold mb-2 border-b border-black pb-1 lowercase">{day.day_label.toLowerCase()} :-</h2>
            <ul className="list-none pl-0 mb-4">
              {day.meals.map((meal) => (
                <li key={meal.id} className="text-md mb-1 lowercase">
                  {meal.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
"""

# Inject print view
if "hidden print:block text-black bg-white" not in content:
    content = content.replace("return (\n", "return (\n" + print_view)
    content = content.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}")

# Remove old print hacks
content = content.replace('<h2 className="hidden print:block text-2xl font-bold border-b-2 border-black pb-2 mb-4 mt-8 text-black">{currentDay.day_label} :-</h2>', '')
content = content.replace('print:flex print:flex-col print:gap-0', '')

with open("src/components/clima/MealPlanView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
