import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# In generate_meal_plan:
fetch_prefs = """    # 2. Get Safe Dishes
    dishes = get_safe_dishes()"""

inject_prefs = """    # 2. Get Safe Dishes
    dishes = get_safe_dishes()
    
    # 2.5 Fetch ML preferences ONCE per request to prevent 10,000 DB queries
    try:
        from api.ml_recommender import parse_interactions
        all_ml_prefs = parse_interactions()
        user_ml_prefs = all_ml_prefs.get(patient.user_id, {}) if hasattr(patient, 'user_id') else all_ml_prefs.get("anon", {})
    except Exception as e:
        print("ML Recommender error:", e)
        user_ml_prefs = {}"""
c = c.replace(fetch_prefs, inject_prefs)

# Fix find_best_meal_plan call
old_call = """        best_plan = find_best_meal_plan(
            categorized,
            targets,
            preferences=None,
            iterations=2000,
            previously_selected=used_dishes,
            daily_budget=daily_budget,
            strict_pantry_mode=strict_pantry_mode
        )"""
new_call = """        best_plan = find_best_meal_plan(
            categorized,
            targets,
            preferences=None,
            iterations=2000,
            previously_selected=used_dishes,
            daily_budget=daily_budget,
            strict_pantry_mode=strict_pantry_mode,
            ml_prefs=user_ml_prefs
        )"""
c = c.replace(old_call, new_call)

# In swap_meal:
old_swap_call = """    alternatives = get_alternative_meals(
        current_meal=req.current_meal,
        categorized=categorized,
        target_meal_macros=target_meal_macros,
        slot=req.slot,
        user_restrictions=req.patient.dietary_restrictions,
        user_allergies=req.patient.allergies,
        daily_budget=daily_budget,
        num_options=15
    )"""
new_swap_call = """    
    try:
        from api.ml_recommender import parse_interactions
        all_ml_prefs = parse_interactions()
        user_ml_prefs = all_ml_prefs.get(req.patient.user_id, {}) if hasattr(req.patient, 'user_id') else all_ml_prefs.get("anon", {})
    except Exception:
        user_ml_prefs = {}

    alternatives = get_alternative_meals(
        current_meal=req.current_meal,
        categorized=categorized,
        target_meal_macros=target_meal_macros,
        slot=req.slot,
        user_restrictions=req.patient.dietary_restrictions,
        user_allergies=req.patient.allergies,
        daily_budget=daily_budget,
        num_options=15,
        ml_prefs=user_ml_prefs
    )"""
c = c.replace(old_swap_call, new_swap_call)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("index.py fixed!")
