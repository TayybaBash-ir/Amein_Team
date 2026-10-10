import re

with open('api/matching_engine.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add ml_prefs to find_best_meal_plan signature
c = c.replace(
    'def find_best_meal_plan(categorized, target_macros, preferences=None, iterations=2500, previously_selected=None, daily_budget=None, strict_pantry_mode=False):',
    'def find_best_meal_plan(categorized, target_macros, preferences=None, iterations=2500, previously_selected=None, daily_budget=None, strict_pantry_mode=False, ml_prefs=None):'
)

# 2. Add local ML calculator
ml_calculator = """
def calc_local_ml_penalty(dish_name, ml_prefs):
    if not ml_prefs: return 0.0
    keywords = [w for w in str(dish_name).lower().split() if len(w) > 2 and w not in ("with", "and", "the", "for", "style", "plain")]
    total = sum(ml_prefs.get(kw, 0.0) for kw in keywords)
    return max(-500.0, min(1000.0, total))
"""
if "calc_local_ml_penalty" not in c:
    # insert after imports
    c = c.replace("import random\n", "import random\n" + ml_calculator)

# 3. Fix the 4 calls in find_best_meal_plan
bad_score_block1 = """        from api.ml_recommender import get_ml_score_penalty
        ml_score_b = get_ml_score_penalty(b.get("name", ""))
        ml_score_l = get_ml_score_penalty(l.get("name", ""))
        ml_score_s = get_ml_score_penalty(s.get("name", ""))
        ml_score_d = get_ml_score_penalty(d.get("name", ""))"""

good_score_block1 = """        ml_score_b = calc_local_ml_penalty(b.get("name", ""), ml_prefs)
        ml_score_l = calc_local_ml_penalty(l.get("name", ""), ml_prefs)
        ml_score_s = calc_local_ml_penalty(s.get("name", ""), ml_prefs)
        ml_score_d = calc_local_ml_penalty(d.get("name", ""), ml_prefs)"""
c = c.replace(bad_score_block1, good_score_block1)

# 4. Add ml_prefs to get_alternative_meals signature
c = c.replace(
    'def get_alternative_meals(current_meal, categorized, target_meal_macros, slot, user_restrictions=None, user_allergies=None, daily_budget=None, num_options=5):',
    'def get_alternative_meals(current_meal, categorized, target_meal_macros, slot, user_restrictions=None, user_allergies=None, daily_budget=None, num_options=5, ml_prefs=None):'
)

# 5. Fix the 2 calls in get_alternative_meals
c = c.replace('from api.ml_recommender import get_ml_score_penalty\n        score += get_ml_score_penalty(cand["name"])', 'score += calc_local_ml_penalty(cand["name"], ml_prefs)')
c = c.replace('from api.ml_recommender import get_ml_score_penalty\n            score += get_ml_score_penalty(cand["name"])', 'score += calc_local_ml_penalty(cand["name"], ml_prefs)')

with open('api/matching_engine.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("matching_engine fixed!")
