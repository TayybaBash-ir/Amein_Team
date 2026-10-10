import re

with open('src/components/clima/SwapMealModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_swap = """                <button onClick={() => {
                  onSwap(alt.candidate);
                  onClose();
                }}"""

new_swap = """                <button onClick={() => {
                  // Log for ML training
                  fetch("/api/interaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: "anon",
                      action: "swapped",
                      meal_id: meal.id,
                      dish_name: alt.candidate.name,
                      context: { original_dish: meal.name }
                    })
                  }).catch(console.error);

                  onSwap(alt.candidate);
                  onClose();
                }}"""

c = c.replace(old_swap, new_swap)

with open('src/components/clima/SwapMealModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("SwapMealModal updated to log to backend!")
