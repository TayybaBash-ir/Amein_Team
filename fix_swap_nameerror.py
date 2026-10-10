import re

# 1. FIX MATCHING ENGINE
with open('api/matching_engine.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_sig = "def get_alternative_meals(categorized, slot, target_meal_macros, previously_selected=None, num_options=5, daily_budget=None, strict_pantry_mode=False):"
new_sig = "def get_alternative_meals(categorized, slot, target_meal_macros, previously_selected=None, num_options=5, daily_budget=None, strict_pantry_mode=False, ml_prefs=None):"

if old_sig in c:
    c = c.replace(old_sig, new_sig)
    with open('api/matching_engine.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed matching_engine.py")
else:
    print("Could not find get_alternative_meals signature in matching_engine.py")

# 2. FIX API INDEX
with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_swap_call = """    alts = get_alternative_meals(
        categorized, 
        req.slot, 
        target_macros, 
        previously_selected=set(req.previously_selected), 
        num_options=3,
        daily_budget=daily_budget,
        strict_pantry_mode=bool(req.patient.strict_pantry_mode),
    )"""

new_swap_call = """    try:
        from api.ml_recommender import parse_interactions
        all_ml_prefs = parse_interactions()
        user_ml_prefs = all_ml_prefs.get(req.patient.name, {}) if hasattr(req.patient, 'name') else all_ml_prefs.get("anon", {})
    except Exception:
        user_ml_prefs = {}

    alts = get_alternative_meals(
        categorized, 
        req.slot, 
        target_macros, 
        previously_selected=set(req.previously_selected), 
        num_options=3,
        daily_budget=daily_budget,
        strict_pantry_mode=bool(req.patient.strict_pantry_mode),
        ml_prefs=user_ml_prefs
    )"""

if old_swap_call in c:
    c = c.replace(old_swap_call, new_swap_call)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed api/index.py")
else:
    print("Could not find get_alternative_meals call in api/index.py")
