import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Update updateLog to fetch /api/interaction
old_update = """  const updateLog = (mealId: string, status: string, customText?: string) => {
    const newLog = { ...foodLog, [mealId]: { status, customText } };
    setFoodLog(newLog);
    localStorage.setItem("clima_food_log", JSON.stringify(newLog));
  };"""

new_update = """  const updateLog = (mealId: string, status: string, customText?: string, dishName?: string) => {
    const newLog = { ...foodLog, [mealId]: { status, customText } };
    setFoodLog(newLog);
    localStorage.setItem("clima_food_log", JSON.stringify(newLog));
    
    // Log for ML training
    fetch("/api/interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "anon",
        action: status,
        meal_id: mealId,
        dish_name: dishName || "Unknown",
        context: { customText }
      })
    }).catch(console.error);
  };"""

c = c.replace(old_update, new_update)

# Update the log button click handlers to pass dishName
old_log = "updateLog(meal.id, 'logged')"
new_log = "updateLog(meal.id, 'logged', undefined, meal.name)"
c = c.replace(old_log, new_log)

old_skip = "updateLog(meal.id, 'skipped')"
new_skip = "updateLog(meal.id, 'skipped', undefined, meal.name)"
c = c.replace(old_skip, new_skip)

old_custom = "updateLog(meal.id, 'custom', t)"
new_custom = "updateLog(meal.id, 'custom', t, meal.name)"
c = c.replace(old_custom, new_custom)


with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("MealPlanView UI updated to log to backend!")
