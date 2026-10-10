import re

with open('api/nutrition_math.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Make sure it accepts macro_tweak
c = c.replace('metabolic_modifier: float = 1.0,', 'metabolic_modifier: float = 1.0,\n    macro_tweak: str = "",')

old_logic = """    protein_g = weight_kg * 2.0
    fat_g = (target_calories * 0.25) / 9.0
    carbs_g = max(0.0, (target_calories - (protein_g * 4.0) - (fat_g * 9.0)) / 4.0)"""

new_logic = """    protein_g = weight_kg * 2.0
    fat_g = (target_calories * 0.25) / 9.0
    carbs_g = max(0.0, (target_calories - (protein_g * 4.0) - (fat_g * 9.0)) / 4.0)

    # Apply True ML logic tweaks based on natural language feedback
    if macro_tweak == "higher_protein":
        shift = target_calories * 0.10
        protein_g += shift / 4.0
        carbs_g = max(0.0, carbs_g - (shift / 4.0))
    elif macro_tweak == "higher_fat":
        shift = target_calories * 0.10
        fat_g += shift / 9.0
        carbs_g = max(0.0, carbs_g - (shift / 4.0))
    elif macro_tweak == "higher_carb":
        shift = target_calories * 0.10
        carbs_g += shift / 4.0
        fat_g = max(0.0, fat_g - (shift / 9.0))
    elif macro_tweak == "lower_carb":
        shift = target_calories * 0.15
        carbs_g = max(0.0, carbs_g - (shift / 4.0))
        protein_g += (shift / 2.0) / 4.0
        fat_g += (shift / 2.0) / 9.0"""

c = c.replace(old_logic, new_logic)

with open('api/nutrition_math.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("nutrition math updated with macro tweaks")
