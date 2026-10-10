import os
import re

index_file = 'api/index.py'
with open(index_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure estimate_dish_cost is imported from matching_engine
if 'estimate_dish_cost' not in content:
    content = content.replace("from api.matching_engine import find_best_meal_plan", "from api.matching_engine import find_best_meal_plan, estimate_dish_cost")

# Inject estimated_cost into the Meal instantiation
meal_pattern = r'''            meal_obj = Meal\('''
replacement = '''
            # Calculate estimated cost
            from api.matching_engine import estimate_dish_cost
            dish_cost = estimate_dish_cost(d, name)
            
            meal_obj = Meal(
                estimated_cost=dish_cost,'''

if 'estimated_cost=dish_cost' not in content:
    content = re.sub(meal_pattern, replacement, content)

swap_pattern = r'''        final_meal = Meal\('''
swap_replacement = '''        
        from api.matching_engine import estimate_dish_cost
        dish_cost = estimate_dish_cost(cand['candidate'], name)
        final_meal = Meal(
            estimated_cost=dish_cost,'''

if 'dish_cost = estimate_dish_cost(cand' not in content:
    content = re.sub(swap_pattern, swap_replacement, content)

with open(index_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched index.py with cost")
