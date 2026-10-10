import re

with open('api/nutrition_math.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Make sure it accepts plan_mode and metabolic_modifier
c = c.replace('def get_nutritional_targets(', 'def get_nutritional_targets(\n    plan_mode: str = "standard",\n    metabolic_modifier: float = 1.0,')

# Find the target_calories logic
old_logic = """    goal_key = str(goal).lower().strip()
    if "lose" in goal_key:
        target_calories = tdee - 500
    elif "gain" in goal_key:
        target_calories = tdee + 300
    else:
        target_calories = tdee"""

new_logic = """    tdee = tdee * metabolic_modifier
    goal_key = str(goal).lower().strip()
    if plan_mode == "recovery":
        target_calories = tdee
    elif "lose" in goal_key:
        target_calories = tdee - 500
    elif "gain" in goal_key:
        target_calories = tdee + 300
    else:
        target_calories = tdee"""

if old_logic in c:
    c = c.replace(old_logic, new_logic)
else:
    # Handle if metabolic_modifier logic was previously injected
    old_logic2 = """    goal_key = str(goal).lower().strip()
    if "lose" in goal_key:
        target_calories = tdee - 500
    elif "gain" in goal_key:
        target_calories = tdee + 300
    else:
        target_calories = tdee"""
    # Wait, in the python script earlier I replaced `tdee = bmr * activity_multiplier` with `tdee = int(tdee * getattr(intake, "metabolic_modifier", 1.0))`
    # but the regex missed it! So it's exactly like `old_logic`.
    c = c.replace(old_logic, new_logic)

with open('api/nutrition_math.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("nutrition_math updated")
