from __future__ import annotations
import random
from typing import List, Dict


def estimate_dish_cost(macros, name=""):
    name = name.lower()
    protein_g = macros.get('protein_g', macros.get('protein', 0))
    carbs_g = macros.get('carbs_g', macros.get('carbs', 0))
    fat_g = macros.get('fat_g', macros.get('fat', 0))

    cost = 0.0

    if 'chicken' in name or 'murg' in name:
        cost += (protein_g / 0.25) * 0.7 
    elif 'beef' in name or 'gosht' in name:
        cost += (protein_g / 0.25) * 1.2
    elif 'mutton' in name:
        cost += (protein_g / 0.25) * 2.0
    elif 'egg' in name or 'omelette' in name:
        cost += (protein_g / 6.0) * 20.8
    elif 'milk' in name or 'shake' in name or 'chai' in name:
        cost += (protein_g / 0.034) * 0.35
    elif 'fish' in name:
        cost += (protein_g / 0.25) * 1.5
    else:
        cost += (protein_g / 0.25) * 0.4

    cost += carbs_g * 0.4
    cost += fat_g * 0.6
    cost += 30 # Overhead
    return cost

def estimate_plan_cost(dishes, mult=1.0):
    total = 0
    for d in dishes:
        if isinstance(d, dict):
            cost = estimate_dish_cost(d, d.get('name', ''))
            total += cost * mult
    return total

def calculate_penalty(plan_macros, target_macros):
    cal_diff = abs(plan_macros['calories'] - target_macros['target_calories'])
    pro_diff = abs(plan_macros['protein'] - target_macros['protein_g']) * 4
    carb_diff = abs(plan_macros['carbs'] - target_macros['carbs_g']) * 4
    fat_diff = abs(plan_macros['fat'] - target_macros['fat_g']) * 9
    return cal_diff + pro_diff + carb_diff + fat_diff

def combine(dishes):
    if not dishes: return None
    cals = sum(d.get('calories', 0) or 0 for d in dishes)
    pro = sum(d.get('protein_g', 0) or 0 for d in dishes)
    carbs = sum(d.get('carbs_g', 0) or 0 for d in dishes)
    fat = sum(d.get('fat_g', 0) or 0 for d in dishes)
    name = " with ".join(d.get('name', '') for d in dishes)
    return {
        'name': name,
        'calories': cals,
        'protein_g': pro,
        'carbs_g': carbs,
        'fat_g': fat,
        'items': dishes
    }

def clean_name(dish):
    name = dish.get('name', '')
    if 'Fitness' in name:
        dish['name'] = name.replace('Fitness ', '').replace('Fitness', '')
    return dish

def find_best_meal_plan(categorized, target_macros, preferences=None, iterations=2500, previously_selected=None, daily_budget=None, strict_pantry_mode=False):
    best_plan = None
    best_score = float('inf')
    best_mult = 1.0
    best_within_budget_plan = None
    best_within_budget_score = float('inf')
    best_within_budget_mult = 1.0
    
    if previously_selected is None:
        previously_selected = set()
    
    meat = [clean_name(d) for d in categorized.get('meat', [])]
    veg = [clean_name(d) for d in categorized.get('veg', [])]
    daal = [clean_name(d) for d in categorized.get('daal', [])]
    carbs = [clean_name(d) for d in categorized.get('carbs', [])]
    snacks = [clean_name(d) for d in categorized.get('snacks', [])]
    refreshments = [clean_name(d) for d in categorized.get('refreshments', [])]
    
    dummy = {'name': 'Chef Special', 'calories': 300, 'protein_g': 10, 'carbs_g': 30, 'fat_g': 10, 'image_url': ''}
    
    if not meat: meat = [dummy]
    if not veg: veg = [dummy]
    if not daal: daal = [dummy]
    if not carbs: carbs = [dummy]
    if not snacks: snacks = [dummy]
    if not refreshments: refreshments = [dummy]

    # Carb sub-categories
    roti_paratha = [c for c in carbs if 'roti' in c.get('name', '').lower() or 'paratha' in c.get('name', '').lower()]
    breads = [c for c in carbs if 'bread' in c.get('name', '').lower()]
    boiled_rice = [c for c in carbs if 'boiled' in c.get('name', '').lower() and 'rice' in c.get('name', '').lower()]
    fried_rice = [c for c in carbs if 'fried rice' in c.get('name', '').lower()]
    pulao_biryani = [c for c in carbs if 'pulao' in c.get('name', '').lower() or 'biryani' in c.get('name', '').lower()]
    
    if not roti_paratha: roti_paratha = [random.choice(carbs)]
    if not breads: breads = roti_paratha
    if not boiled_rice: boiled_rice = roti_paratha
    if not fried_rice: fried_rice = boiled_rice
    if not pulao_biryani: pulao_biryani = [random.choice(carbs)]

    # Meat sub-categories
    chinese_meats = [m for m in meat if 'manchurian' in m.get('name', '').lower() or 'chili' in m.get('name', '').lower()]
    eggs_in_meat = [m for m in meat if 'egg' in m.get('name', '').lower() or 'omelette' in m.get('name', '').lower()]
    desi_meats = [m for m in meat if m not in chinese_meats and m not in eggs_in_meat]
    if not desi_meats: desi_meats = meat

    easy_meats = [m for m in desi_meats if any(k in m.get('name', '').lower() for k in ['kabab', 'kebab', 'grilled', 'tikka', 'fried fish']) and 'karahi' not in m.get('name', '').lower()]
    complex_desi_meats = [m for m in desi_meats if m not in easy_meats]
    if not complex_desi_meats: complex_desi_meats = desi_meats
    if not easy_meats: easy_meats = desi_meats # fallback if no easy meats found

    # Snacks sub-categories
    chow_mein = [s for s in snacks if 'chow' in s.get('name', '').lower()]
    egg_snacks = [s for s in snacks if 'egg' in s.get('name', '').lower() or 'omelette' in s.get('name', '').lower()]
    egg_items = egg_snacks + eggs_in_meat
    sandwiches = [s for s in snacks if 'sandwich' in s.get('name', '').lower() or 'burger' in s.get('name', '').lower()]
    pure_snacks = [s for s in snacks if s not in chow_mein and s not in egg_snacks and s not in sandwiches]
    if not pure_snacks: pure_snacks = snacks

    bfs = []
    if egg_items:
        for s in egg_items:
            bfs.append(combine([s, random.choice(breads)]))
            if 'boiled' not in s.get('name', '').lower():
                bfs.append(combine([s, random.choice(roti_paratha)]))
    else:
        for _ in range(10):
            bfs.append(combine([random.choice(pure_snacks)]))

    easy_mains = []
    # Easy meats + simple carbs
    for _ in range(25):
        easy_mains.append(combine([random.choice(easy_meats), random.choice(roti_paratha)]))
        easy_mains.append(combine([random.choice(easy_meats), random.choice(boiled_rice)]))
    # Sandwiches
    if sandwiches:
        for s in sandwiches:
            easy_mains.append(combine([s]))

    complex_mains = []
    # Veg / Daal with Roti or Boiled Rice
    for _ in range(25):
        c_list = random.choice([veg, daal])
        c = random.choice(c_list)
        complex_mains.append(combine([c, random.choice(roti_paratha)]))
        complex_mains.append(combine([c, random.choice(boiled_rice)]))
    # Complex Desi meats (Karahi, Handi) with Roti
    for _ in range(25):
        complex_mains.append(combine([random.choice(complex_desi_meats), random.choice(roti_paratha)]))
    # Chinese meats with Fried Rice or Chow Mein
    if chinese_meats:
        for _ in range(15):
            complex_mains.append(combine([random.choice(chinese_meats), random.choice(fried_rice)]))
            if chow_mein:
                complex_mains.append(combine([random.choice(chinese_meats), random.choice(chow_mein)]))
    # Biryani / Pulao standalone
    if pulao_biryani:
        for _ in range(15):
            complex_mains.append(combine([random.choice(pulao_biryani)]))

    # Daal is a full lunch/dinner main, not only a side or fallback. Keep
    # explicit daal-plus-carb combinations in both main pools so the optimizer
    # can select lentil meals when the pantry contains no meat or fish.
    daal_mains = []
    daal_carbs = list({
        carb.get("id", carb.get("name")): carb
        for carb in roti_paratha + boiled_rice
    }.values())
    for dish in daal:
        for carb in daal_carbs:
            daal_mains.append(combine([dish, carb]))
    easy_mains.extend(daal_mains)
    complex_mains.extend(daal_mains)

    # The pantry bridge can put Category 3 dishes in `meat`; identify actual
    # animal mains by their source category so lentils are not overshadowed by
    # dummy or snack-like entries in that pool.
    animal_mains = [dish for dish in meat if dish.get("category_id") == 1]
    daal_main_candidates = [
        combine([dish, carb])
        for dish in daal
        if dish.get("category_id") == 3
        for carb in daal_carbs
    ]
    veg_main_candidates = [
        combine([dish, carb])
        for dish in veg
        if dish.get("category_id") == 2
        for carb in daal_carbs
    ]
    # Prefer actual Category 3 meals whenever the filtered pool contains them;
    # fall back to vegetable mains only when no daal candidates are available.
    plant_main_candidates = daal_main_candidates or veg_main_candidates
    if not animal_mains and plant_main_candidates:
        # With no meat/fish candidates, both lunch and dinner draw from
        # lentil/vegetable mains paired with a staple carb.
        easy_mains = list(plant_main_candidates)
        complex_mains = list(plant_main_candidates)

    sks = []
    for _ in range(20):
        sks.append(combine([random.choice(pure_snacks)]))

    if not bfs: bfs = [combine([dummy])]
    if not easy_mains: easy_mains = [combine([dummy])]
    if not complex_mains: complex_mains = [combine([dummy])]
    if not sks: sks = [combine([dummy])]

    target_cals = target_macros['target_calories']
    
    for _ in range(iterations):
        b = random.choice(bfs)
        s = random.choice(sks)
        
        # One easy meal, one complex meal
        if random.random() < 0.5:
            l = random.choice(easy_mains)
            d = random.choice(complex_mains)
        else:
            l = random.choice(complex_mains)
            d = random.choice(easy_mains)
        
        if l['name'] == d['name']:
            continue
            
        base_cals = b['calories'] + l['calories'] + d['calories'] + s['calories']
        base_pro = b['protein_g'] + l['protein_g'] + d['protein_g'] + s['protein_g']
        base_carbs = b['carbs_g'] + l['carbs_g'] + d['carbs_g'] + s['carbs_g']
        base_fat = b['fat_g'] + l['fat_g'] + d['fat_g'] + s['fat_g']
        
        multiplier = target_cals / base_cals if base_cals > 0 else 1.0
        uses_plant_main = any(
            item.get("category_id") in (2, 3)
            for main in (l, d)
            for item in main.get("items", [])
        )
        min_multiplier, max_multiplier = (0.5, 2.0) if uses_plant_main else (0.7, 1.5)
        if not (min_multiplier <= multiplier <= max_multiplier):
            continue
            
        variety_penalty = 0
        current_item_names = set()
        for meal in [b, l, d, s]:
            for item in meal['items']:
                # only penalize main dishes (skip roti, rice, bread, drinks)
                cat_id = item.get('category_id')
                if cat_id in [1, 2, 3, 5]: # Meat, Veg, Daal, Snacks
                    name_base = item.get('name', '').replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip()
                    current_item_names.add(name_base)
        cleaned_prev = {n.replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip() for n in previously_selected}
        overlap = len(current_item_names.intersection(cleaned_prev))
        #if overlap > 0: print("FOUND OVERLAP!", current_item_names.intersection(previously_selected))
        variety_penalty = overlap * 50000
        
        scaled_macros = {
            'calories': base_cals * multiplier,
            'protein': base_pro * multiplier,
            'carbs': base_carbs * multiplier,
            'fat': base_fat * multiplier
        }
        
        score = calculate_penalty(scaled_macros, target_macros) + variety_penalty
        estimated_daily_cost = None
        if daily_budget is not None and daily_budget > 0:
            estimated_daily_cost = sum(
                estimate_dish_cost(
                    {"protein_g": meal["protein_g"], "carbs_g": meal["carbs_g"], "fat_g": meal["fat_g"]},
                    meal["name"],
                )
                for meal in (b, l, s, d)
            ) * multiplier
            # Prefer affordable plans, and make going over the selected cap a
            # meaningful penalty while still allowing nutrition fit if every
            # catalog combination is over budget.
            score += estimated_daily_cost * 0.05
            score += max(0.0, estimated_daily_cost - daily_budget) * 40

        if strict_pantry_mode and any(
            item.get("name") == "Chef Special"
            for meal in (b, l, s, d)
            for item in meal.get("items", [])
        ):
            continue

        if (
            estimated_daily_cost is not None
            and estimated_daily_cost <= daily_budget
            and score < best_within_budget_score
        ):
            best_within_budget_score = score
            best_within_budget_plan = [
                {'slot': 'Breakfast', 'items': b['items']},
                {'slot': 'Lunch', 'items': l['items']},
                {'slot': 'Snack', 'items': s['items']},
                {'slot': 'Dinner', 'items': d['items']},
            ]
            best_within_budget_mult = multiplier
        
        if score < best_score:
            best_score = score
            best_plan = [
                {'slot': 'Breakfast', 'items': b['items']}, 
                {'slot': 'Lunch', 'items': l['items']}, 
                {'slot': 'Snack', 'items': s['items']}, 
                {'slot': 'Dinner', 'items': d['items']}
            ]
            best_mult = multiplier
            
    if best_within_budget_plan is not None:
        best_plan = best_within_budget_plan
        best_mult = best_within_budget_mult

    if not best_plan and strict_pantry_mode:
        return None, 1.0

    if not best_plan:
        b = random.choice(bfs)
        l = random.choice(easy_mains)
        d = random.choice(complex_mains)
        s = random.choice(sks)
        best_plan = [
            {'slot': 'Breakfast', 'items': b['items']}, 
            {'slot': 'Lunch', 'items': l['items']}, 
            {'slot': 'Snack', 'items': s['items']}, 
            {'slot': 'Dinner', 'items': d['items']}
        ]
        base_cals = b['calories'] + l['calories'] + d['calories'] + s['calories']
        best_mult = target_cals / base_cals if base_cals > 0 else 1.0
        
    for m in best_plan:
        for item in m['items']:
            previously_selected.add(item['name'])
        
    return best_plan, best_mult

def get_alternative_meals(categorized, slot, target_meal_macros, previously_selected=None, num_options=5, daily_budget=None, strict_pantry_mode=False):
    if previously_selected is None:
        previously_selected = set()
        
    meat = [clean_name(d) for d in categorized.get('meat', [])]
    veg = [clean_name(d) for d in categorized.get('veg', [])]
    daal = [clean_name(d) for d in categorized.get('daal', [])]
    carbs = [clean_name(d) for d in categorized.get('carbs', [])]
    snacks = [clean_name(d) for d in categorized.get('snacks', [])]
    refreshments = [clean_name(d) for d in categorized.get('refreshments', [])]
    
    dummy = {'name': 'Chef Special', 'calories': 300, 'protein_g': 10, 'carbs_g': 30, 'fat_g': 10, 'image_url': ''}
    
    if not meat: meat = [dummy]
    if not veg: veg = [dummy]
    if not daal: daal = [dummy]
    if not carbs: carbs = [dummy]
    if not snacks: snacks = [dummy]
    if not refreshments: refreshments = [dummy]

    roti_paratha = [c for c in carbs if 'roti' in c.get('name', '').lower() or 'paratha' in c.get('name', '').lower()]
    breads = [c for c in carbs if 'bread' in c.get('name', '').lower()]
    boiled_rice = [c for c in carbs if 'boiled' in c.get('name', '').lower() and 'rice' in c.get('name', '').lower()]
    fried_rice = [c for c in carbs if 'fried rice' in c.get('name', '').lower()]
    pulao_biryani = [c for c in carbs if 'pulao' in c.get('name', '').lower() or 'biryani' in c.get('name', '').lower()]
    
    if not roti_paratha: roti_paratha = [random.choice(carbs)]
    if not breads: breads = roti_paratha
    if not boiled_rice: boiled_rice = roti_paratha
    if not fried_rice: fried_rice = boiled_rice
    if not pulao_biryani: pulao_biryani = [random.choice(carbs)]

    chinese_meats = [m for m in meat if 'manchurian' in m.get('name', '').lower() or 'chili' in m.get('name', '').lower()]
    eggs_in_meat = [m for m in meat if 'egg' in m.get('name', '').lower() or 'omelette' in m.get('name', '').lower()]
    desi_meats = [m for m in meat if m not in chinese_meats and m not in eggs_in_meat]
    if not desi_meats: desi_meats = meat

    easy_meats = [m for m in desi_meats if any(k in m.get('name', '').lower() for k in ['kabab', 'kebab', 'grilled', 'tikka', 'fried fish']) and 'karahi' not in m.get('name', '').lower()]
    complex_desi_meats = [m for m in desi_meats if m not in easy_meats]
    if not complex_desi_meats: complex_desi_meats = desi_meats
    if not easy_meats: easy_meats = desi_meats

    chow_mein = [s for s in snacks if 'chow' in s.get('name', '').lower()]
    egg_snacks = [s for s in snacks if 'egg' in s.get('name', '').lower() or 'omelette' in s.get('name', '').lower()]
    egg_items = egg_snacks + eggs_in_meat
    sandwiches = [s for s in snacks if 'sandwich' in s.get('name', '').lower() or 'burger' in s.get('name', '').lower()]
    pure_snacks = [s for s in snacks if s not in chow_mein and s not in egg_snacks and s not in sandwiches]
    if not pure_snacks: pure_snacks = snacks

    # Generate all possible combinations for this slot to pick from
    candidates = []
    slot_lower = slot.lower()
    
    if slot_lower == 'breakfast':
        if egg_items:
            for s in egg_items:
                for b in breads: candidates.append(combine([s, b]))
                if 'boiled' not in s.get('name', '').lower():
                    for r in roti_paratha: candidates.append(combine([s, r]))
        else:
            for ps in pure_snacks:
                candidates.append(combine([ps]))
    elif slot_lower == 'snack':
        for ps in pure_snacks: candidates.append(combine([ps]))
    else: # Lunch or Dinner
        # Add all easy mains
        for em in easy_meats:
            for r in roti_paratha: candidates.append(combine([em, r]))
            for b in boiled_rice: candidates.append(combine([em, b]))
        for s in sandwiches: candidates.append(combine([s]))
        # Add all complex mains
        for v in veg + daal:
            for r in roti_paratha: candidates.append(combine([v, r]))
            for b in boiled_rice: candidates.append(combine([v, b]))
        for cm in complex_desi_meats:
            for r in roti_paratha: candidates.append(combine([cm, r]))
        for chm in chinese_meats:
            for fr in fried_rice: candidates.append(combine([chm, fr]))
            for cm in chow_mein: candidates.append(combine([chm, cm]))
        for pb in pulao_biryani: candidates.append(combine([pb]))
        
    # Filter candidates by previously selected
    cleaned_prev = {n.replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip() for n in previously_selected}
    valid_candidates = []
    
    for cand in candidates:
        if not cand: continue
        if strict_pantry_mode and any(item.get("name") == "Chef Special" for item in cand.get("items", [])):
            continue
        
        # Check variety penalty
        current_names = set()
        for item in cand['items']:
            cat_id = item.get('category_id')
            if cat_id in [1, 2, 3]:
                name_base = item.get('name', '').replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip()
                current_names.add(name_base)
        
        if len(current_names.intersection(cleaned_prev)) > 0:
            continue # Skip repeating main dishes completely
            
        base_cals = cand['calories']
        if base_cals <= 0: continue
        
        multiplier = target_meal_macros['calories'] / base_cals
        if not (0.7 <= multiplier <= 1.5):
            continue
            
        scaled_cals = base_cals * multiplier
        scaled_pro = cand['protein_g'] * multiplier
        scaled_carbs = cand['carbs_g'] * multiplier
        scaled_fat = cand['fat_g'] * multiplier
        
        cal_diff = abs(scaled_cals - target_meal_macros['calories'])
        pro_diff = abs(scaled_pro - target_meal_macros['protein']) * 4
        carb_diff = abs(scaled_carbs - target_meal_macros['carbs']) * 4
        fat_diff = abs(scaled_fat - target_meal_macros['fat']) * 9
        
        score = cal_diff + pro_diff + carb_diff + fat_diff
        estimated_meal_cost = None
        if daily_budget is not None and daily_budget > 0:
            estimated_meal_cost = estimate_dish_cost(
                {"protein_g": scaled_pro, "carbs_g": scaled_carbs, "fat_g": scaled_fat},
                cand["name"],
            )
            score += estimated_meal_cost * 0.05
            score += max(0.0, estimated_meal_cost - daily_budget / 4) * 40
        valid_candidates.append({
            'candidate': cand,
            'multiplier': multiplier,
            'score': score,
            'estimated_cost': estimated_meal_cost,
        })

    if daily_budget is not None and daily_budget > 0:
        within_meal_budget = [
            option for option in valid_candidates
            if option['estimated_cost'] is not None and option['estimated_cost'] <= daily_budget / 4
        ]
        if within_meal_budget:
            valid_candidates = within_meal_budget
        
    # Sort by best macro match
    valid_candidates.sort(key=lambda x: x['score'])
    
    # Deduplicate by base main ingredient (ignore sides after 'with')
    seen_names = set()
    final_options = []
    for vc in valid_candidates:
        base_name = vc['candidate']['name'].lower().split(' with ')[0].replace(' (home-style)', '').replace(' (dum cooked)', '').strip()
        if base_name not in seen_names:
            seen_names.add(base_name)
            final_options.append(vc)
        if len(final_options) >= num_options:
            break
            
    # If we couldn't find enough, try ignoring variety penalty
    if len(final_options) < num_options:
        for cand in candidates:
            base_name = cand['name'].lower().split(' with ')[0].replace(' (home-style)', '').replace(' (dum cooked)', '').strip()
            if base_name in seen_names: continue
            base_cals = cand['calories']
            if base_cals <= 0: continue
            multiplier = target_meal_macros['calories'] / base_cals
            score = abs(base_cals * multiplier - target_meal_macros['calories']) + abs(cand['protein_g'] * multiplier - target_meal_macros['protein'])*4 + abs(cand['carbs_g'] * multiplier - target_meal_macros['carbs'])*4 + abs(cand['fat_g'] * multiplier - target_meal_macros['fat'])*9
            final_options.append({
                'candidate': cand,
                'multiplier': multiplier,
                'score': score + 1000 # Penalize for being a fallback
            })
            seen_names.add(base_name)
            if len(final_options) >= num_options: break
            
    return final_options
