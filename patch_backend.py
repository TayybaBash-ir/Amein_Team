import re

# 1. Update api/schemas.py
with open('api/schemas.py', 'r', encoding='utf-8') as f:
    c = f.read()

if 'metabolic_modifier' not in c:
    c = c.replace('goal: Optional[str] = "Maintain"', 'goal: Optional[str] = "Maintain"\n    metabolic_modifier: float = 1.0')
    with open('api/schemas.py', 'w', encoding='utf-8') as f:
        f.write(c)

# 2. Update api/nutrition_math.py
with open('api/nutrition_math.py', 'r', encoding='utf-8') as f:
    c = f.read()

if 'intake.metabolic_modifier' not in c:
    # Find the TDEE calculation line and append modifier logic
    tdee_pattern = re.compile(r'(tdee = bmr \* activity_multiplier)')
    replacement = r'\1\n    tdee = int(tdee * getattr(intake, "metabolic_modifier", 1.0))'
    c = re.sub(tdee_pattern, replacement, c)
    with open('api/nutrition_math.py', 'w', encoding='utf-8') as f:
        f.write(c)

print("Backend updated with metabolic_modifier!")
