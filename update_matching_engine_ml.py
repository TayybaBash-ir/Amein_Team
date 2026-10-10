import re

with open('api/matching_engine.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Inject ml_score into find_best_meal_plan (which affects full plan generation)
old_score1 = """        score = calculate_penalty(scaled_macros, target_macros) + variety_penalty"""
new_score1 = """        from api.ml_recommender import get_ml_score_penalty
        ml_score_b = get_ml_score_penalty(b.get("name", ""))
        ml_score_l = get_ml_score_penalty(l.get("name", ""))
        ml_score_s = get_ml_score_penalty(s.get("name", ""))
        ml_score_d = get_ml_score_penalty(d.get("name", ""))
        
        score = calculate_penalty(scaled_macros, target_macros) + variety_penalty + ml_score_b + ml_score_l + ml_score_s + ml_score_d"""
c = c.replace(old_score1, new_score1)

# 2. Inject ml_score into get_alternative_meals (which affects swap ranking)
old_score2 = """        score = cal_diff + pro_diff + carb_diff + fat_diff
        estimated_meal_cost = None"""
new_score2 = """        score = cal_diff + pro_diff + carb_diff + fat_diff
        from api.ml_recommender import get_ml_score_penalty
        score += get_ml_score_penalty(cand["name"])
        estimated_meal_cost = None"""
c = c.replace(old_score2, new_score2)

# 3. Inject ml_score into fallback ranking in get_alternative_meals
old_score3 = """            score = abs(base_cals * multiplier - target_meal_macros['calories']) + abs(cand['protein_g'] * multiplier - target_meal_macros['protein'])*4 + abs(cand['carbs_g'] * multiplier - target_meal_macros['carbs'])*4 + abs(cand['fat_g'] * multiplier - target_meal_macros['fat'])*9
            final_options.append({"""
new_score3 = """            score = abs(base_cals * multiplier - target_meal_macros['calories']) + abs(cand['protein_g'] * multiplier - target_meal_macros['protein'])*4 + abs(cand['carbs_g'] * multiplier - target_meal_macros['carbs'])*4 + abs(cand['fat_g'] * multiplier - target_meal_macros['fat'])*9
            from api.ml_recommender import get_ml_score_penalty
            score += get_ml_score_penalty(cand["name"])
            final_options.append({"""
c = c.replace(old_score3, new_score3)

with open('api/matching_engine.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("ML Recommender injected into matching engine!")
