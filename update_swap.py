import re

# 1. Update SwapMealModal.tsx to send original_meal_name
with open('src/components/clima/SwapMealModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'target_fat: (meal as any).fat_g || meal.fat,',
    'target_fat: (meal as any).fat_g || meal.fat,\n          original_meal_name: meal.name,'
)

with open('src/components/clima/SwapMealModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Update api/schemas.py to accept original_meal_name
with open('api/schemas.py', 'r', encoding='utf-8') as f:
    s = f.read()

s = s.replace(
    'previously_selected: List[str] = []',
    'previously_selected: List[str] = []\n    original_meal_name: Optional[str] = None'
)

with open('api/schemas.py', 'w', encoding='utf-8') as f:
    f.write(s)

# 3. Update api/index.py to pass it
with open('api/index.py', 'r', encoding='utf-8') as f:
    idx = f.read()

idx = idx.replace(
    'strict_pantry_mode=bool(req.patient.strict_pantry_mode),',
    'strict_pantry_mode=bool(req.patient.strict_pantry_mode),\n        original_meal_name=req.original_meal_name,'
)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(idx)

# 4. Update api/matching_engine.py
with open('api/matching_engine.py', 'r', encoding='utf-8') as f:
    m = f.read()

old_sig = 'def get_alternative_meals(categorized, slot, target_meal_macros, previously_selected=None, num_options=3, daily_budget=None, strict_pantry_mode=False):'
new_sig = 'def get_alternative_meals(categorized, slot, target_meal_macros, previously_selected=None, num_options=3, daily_budget=None, strict_pantry_mode=False, original_meal_name=None):'
m = m.replace(old_sig, new_sig)

# Exclude original meal from candidates entirely!
exclude_logic = """
    valid_candidates = []
    
    orig_cleaned = original_meal_name.lower().replace(' (home-style)', '').replace(' (dum cooked)', '').strip() if original_meal_name else ""
    orig_parts = set(orig_cleaned.split(' with ')) if orig_cleaned else set()

    for cand in candidates:
        if not cand: continue
        
        # Absolute exclusion of original meal or identical main dish
        cand_lower = cand['name'].lower().replace(' (home-style)', '').replace(' (dum cooked)', '').strip()
        cand_parts = set(cand_lower.split(' with '))
        
        # If the candidate shares the main dish with the original meal, skip it unconditionally
        # (e.g. if original was "chicken breast", skip "chicken breast with egg")
        if orig_parts and len(orig_parts.intersection(cand_parts)) > 0:
            continue
"""

m = re.sub(r'\s*valid_candidates = \[\]\s*for cand in candidates:\s*if not cand: continue', exclude_logic, m)

with open('api/matching_engine.py', 'w', encoding='utf-8') as f:
    f.write(m)

print("Swap duplicate filtering updated")
