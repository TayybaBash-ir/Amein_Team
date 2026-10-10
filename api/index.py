from __future__ import annotations
import datetime
import os
import urllib.parse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pathlib
from pydantic import BaseModel

from typing import List
from api.schemas import (
    PatientIntake, PlanResponse, Meal, NutritionTargets,
    WeatherInfo, DailyTotals, ValidationInfo, DayPlan, MealPlan,
    SwapRequest, SwapResponse, ExternalDiningRecommendation
)
from api.nutrition_math import get_nutritional_targets
from api.meal_validator import validate_meals, structure_day_plans
from api.llm_classifier import analyze_clinical_conditions

env_path = pathlib.Path('.') / '.env.local'
load_dotenv(dotenv_path=env_path)
load_dotenv()

app = FastAPI(title="ClimaDiet API", description="AI Clinical Nutrition API")

ALL_PROTEINS = {
    "chicken", "beef", "mutton", "lamb", "fish", "prawns", "seafood",
    "egg", "tofu", "paneer", "lentils", "daal", "chana",
}
PLANT_PROTEIN_ALIASES = {"lentil", "lentils", "daal", "dal", "chana", "chickpea", "chickpeas"}

def _forbidden_proteins(pantry_items):
    forbidden = [
        protein for protein in ALL_PROTEINS
        if pantry_items and not any(protein in item.lower() for item in pantry_items)
    ]
    if any(
        alias in item.lower()
        for item in pantry_items
        for alias in PLANT_PROTEIN_ALIASES
    ):
        forbidden = [protein for protein in forbidden if protein not in PLANT_PROTEIN_ALIASES]
    return forbidden

def _sanitize_candidate_plan(plan, categorized, forbidden_items):
    """Replace forbidden components with safe catalog components before assembly."""
    from api.db_manager import contains_forbidden_ingredient

    by_category = categorized
    safe_components = [
        item
        for components in by_category.values()
        for item in components
        if not contains_forbidden_ingredient(item.get("name", ""), forbidden_items)
        and not any(
            contains_forbidden_ingredient(ingredient, forbidden_items)
            for ingredient in item.get("ingredient_names", [])
        )
    ]

    for meal in plan:
        sanitized_items = []
        for item in meal.get("items", []):
            is_forbidden = contains_forbidden_ingredient(item.get("name", ""), forbidden_items) or any(
                contains_forbidden_ingredient(ingredient, forbidden_items)
                for ingredient in item.get("ingredient_names", [])
            )
            if not is_forbidden:
                sanitized_items.append(item)
                continue

            same_category = [
                candidate for candidate in safe_components
                if candidate.get("category_id") == item.get("category_id")
            ]
            replacement_pool = same_category or safe_components
            if not replacement_pool:
                continue
            sanitized_items.append(replacement_pool[0])
        meal["items"] = sanitized_items
    return plan

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGIONAL_FOOD_GUIDANCE = {
    "pakistan": {
        "preferred": "everyday Pakistani home foods such as roti/chapati made with atta, basmati rice, moong/masoor/chana dal, chana, eggs, chicken, seasonal sabzi (palak, bhindi, lauki, tori, gobi), dahi/raita, and locally common fruit",
        "avoid": ["quinoa", "cauliflower rice", "riced cauliflower", "thepla", "kale", "couscous", "avocado", "chia seeds"],
    },
    "india": {
        "preferred": "everyday foods common in the selected Indian region: atta roti, rice, locally common dals, eggs, chicken or fish where appropriate, seasonal sabzi, curd, and local fruit",
        "avoid": ["quinoa", "cauliflower rice", "riced cauliflower", "kale", "couscous", "avocado", "chia seeds"],
    },
    "bangladesh": {
        "preferred": "everyday Bangladeshi foods such as rice, masoor/moong dal, seasonal vegetables, eggs, locally common fish or chicken, and local fruit",
        "avoid": ["quinoa", "cauliflower rice", "riced cauliflower", "kale", "couscous", "avocado", "chia seeds"],
    },
}

ISLAMABAD_RESTAURANTS = [
    {
        "keywords": ["tea", "chai", "green tea", "coffee", "kahwa", "kahwa tea"],
        "restaurant_name": "Chai Khana (F-6 Markaz)",
        "order_url": "https://maps.google.com/?q=Chai+Khana+F-6+Islamabad",
        "price": None,
    },
    {
        "keywords": ["chapli kabab", "kabab", "chapli", "seekh kabab"],
        "restaurant_name": "Kabul Restaurant (F-7 Markaz)",
        "order_url": "https://maps.google.com/?q=Kabul+Restaurant+F-7+Markaz+Islamabad",
        "price": None,
    },
    {
        "keywords": ["tikka", "boti", "bbq", "chicken tikka"],
        "restaurant_name": "Bar B Q Tonight (Blue Area)",
        "order_url": "https://maps.google.com/?q=Bar+B+Q+Tonight+Islamabad",
        "price": None,
    },
    {
        "keywords": ["karahi", "shorba", "handi", "desi"],
        "restaurant_name": "Butt Karahi (F-8 Markaz)",
        "order_url": "https://butt-karahi.com",
        "price": None,
    },
    {
        "keywords": ["pulao", "yakhni pulao", "chaat", "chana", "daal"],
        "restaurant_name": "Savour Foods (Blue Area)",
        "order_url": "https://order.savourfoods.com.pk/",
        "price": None,
    },
    {
        "keywords": ["pizza", "burger", "wings", "fries"],
        "restaurant_name": "Cheezious (F-7 Markaz)",
        "order_url": "https://cheezious.com",
        "price": None,
    },
]

DEFAULT_ISLAMABAD_RESTAURANT = {
    "restaurant_name": "Bar B Q Tonight / Monal (Islamabad)",
    "order_url": "https://maps.google.com/?q=Islamabad+Famous+Restaurants",
}

def get_restaurant_order_info(dish_name: str, planned_dish_name: str = "") -> dict:
    cleaned_dish_name = " ".join((dish_name or "").split()).lower()
    for restaurant in ISLAMABAD_RESTAURANTS:
        if any(keyword in cleaned_dish_name for keyword in restaurant["keywords"]):
            price = restaurant["price"]
            if "karahi" in cleaned_dish_name:
                price = 1100
            elif "pulao" in cleaned_dish_name:
                price = 724
            return {**restaurant, "price": price}

    fallback_dish_name = (planned_dish_name or dish_name or "").strip()
    maps_query = "Islamabad " + fallback_dish_name
    return {
        **DEFAULT_ISLAMABAD_RESTAURANT,
        "item_name": fallback_dish_name,
        "price": None,
        "order_url": f"https://maps.google.com/?q={urllib.parse.quote(maps_query)}",
    }

def build_outside_order_recommendation(meal: Meal) -> ExternalDiningRecommendation:
    planned_dish_name = meal.name.strip()
    primary_dish_name = planned_dish_name.split(" with ", 1)[0].strip()
    order_info = get_restaurant_order_info(primary_dish_name, planned_dish_name)
    normalized_dish_name = " ".join(primary_dish_name.split()).casefold()
    item_name = (
        "Ginger Green Tea / Green Tea"
        if normalized_dish_name == "ginger green tea"
        else planned_dish_name
    )
    return ExternalDiningRecommendation(
        restaurant_name=order_info["restaurant_name"],
        dish_name=item_name,
        item_name=item_name,
        price=order_info["price"],
        protein=round(meal.protein, 1),
        kitchen_note="Confirm preparation and ingredients with the restaurant.",
        order_url=order_info["order_url"],
        foodpanda_url=order_info["order_url"],
        matched_meal_id=meal.id,
        matched_meal_name=meal.name,
    )

def get_regional_food_guidance(country: str) -> dict:
    return REGIONAL_FOOD_GUIDANCE.get(country.strip().lower(), {
        "preferred": f"simple, affordable foods commonly sold in markets in {country}",
        "avoid": [],
    })

def get_serving_text(items, multiplier):
    portions = []
    for item in items:
        name = item.get('name', '').lower()
        orig_name = item.get('name', '')
        if 'roti' in name or 'paratha' in name or 'bread' in name:
            unit = "slice(s)" if 'bread' in name else "piece(s)"
            amount = max(1, round(2.0 * multiplier)) if 'bread' in name else max(1, round(1.0 * multiplier))
            portions.append(f"{amount} {unit} of {orig_name}")
        elif 'tea' in name or 'coffee' in name or 'lassi' in name or 'shake' in name or 'smoothie' in name or 'drink' in name or 'afza' in name or 'shikanjvi' in name or 'margarita' in name:
            amount = max(100, round(250 * multiplier))
            portions.append(f"{amount}ml of {orig_name}")
        elif 'kabab' in name or 'kebab' in name:
            amount = max(1, round(2.0 * multiplier))
            portions.append(f"{amount} piece(s) of {orig_name}")
        elif 'egg' in name and 'fried' not in name and 'omelette' not in name:
            amount = max(1, round(1.5 * multiplier))
            portions.append(f"{amount} whole {orig_name}")
        else:
            if 'rice' in name or 'pulao' in name or 'biryani' in name or 'chow' in name:
                base_g = 200
            elif 'chaat' in name or 'salad' in name:
                base_g = 180
            elif 'omelette' in name or 'egg' in name:
                base_g = 150
            else:
                base_g = 250
            amount = max(50, round(base_g * multiplier / 10.0) * 10)
            portions.append(f"{amount}g of {orig_name}")
    return " + ".join(portions)

def resolve_direct_youtube_url(m_items, combo_name, categorized):
    from urllib.parse import urlparse
    from api.db_manager import find_dish_video_url

    primary_name = combo_name.split(" with ", 1)[0].strip()
    LINK_KEYS = ['youtube_url', 'recipe_url', 'recipe_link', 'video_url', 'youtube_link', 'url', 'link']

    def valid_http_url(value):
        if not isinstance(value, str) or not value.strip():
            return False
        parsed = urlparse(value.strip())
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)

    # Prefer a stored link on the selected dish record when available.
    for item in m_items:
        item_name = str(item.get("name", "")).strip()
        if item_name.casefold() == primary_name.casefold():
            for key in LINK_KEYS:
                value = item.get(key)
                if valid_http_url(value):
                    return value

    # The selected catalog may already contain the Supabase row and its video_url.
    if isinstance(categorized, dict):
        for dishes in categorized.values():
            for dish in dishes:
                if str(dish.get("name", "")).strip().casefold() == primary_name.casefold():
                    value = dish.get("video_url")
                    if valid_http_url(value):
                        return value

    # Query Supabase by the primary item only (before " with ").
    stored_video_url = find_dish_video_url(primary_name)
    if valid_http_url(stored_video_url):
        return stored_video_url

    return f"https://www.youtube.com/results?search_query={urllib.parse.quote(primary_name + ' recipe')}"

@app.post("/api/generate-plan", response_model=PlanResponse)
def generate_meal_plan(patient: PatientIntake):
    print("\n" + "="*50)
    print("RECEIVED PANTRY ITEMS FROM FRONTEND:", patient.pantry_items)
    print("STRICT PANTRY MODE:", patient.strict_pantry_mode)
    print("="*50 + "\n")
    pantry_items = [item.strip() for item in (patient.pantry_items or []) if item.strip()]
    forbidden_items = _forbidden_proteins(pantry_items)

    from api.weather_api import get_7_day_forecast
    w_data = get_7_day_forecast(patient.city, patient.country, patient.start_date)
    weather_info = WeatherInfo(**w_data)
    
    avg_temp = None
    if weather_info.forecast:
        temps = [d.get("temperature_max", 25) for d in weather_info.forecast if isinstance(d, dict)]
        if temps:
            avg_temp = sum(temps) / len(temps)

    ai_rules = analyze_clinical_conditions(
        patient.conditions, patient.allergies, patient.dietary_restrictions, 
        patient.goal, patient.goal_amount, avg_temp, patient.pantry_items, forbidden_items
    )
    
    
    if getattr(ai_rules, 'extracted_pantry', None):
        pantry_items.extend(ai_rules.extracted_pantry)
        forbidden_items = _forbidden_proteins(pantry_items)
        print("AI EXTRACTED PANTRY:", ai_rules.extracted_pantry)

    targets = get_nutritional_targets(
        weight_kg=float(patient.weight),
        height_cm=float(patient.height),
        age=int(patient.age),
        gender=str(patient.gender),
        activity_level=str(patient.activity),
        goal=str(patient.goal),
    )
    
    if "protein" in ai_rules.macro_tweaks and ai_rules.macro_tweaks["protein"] == "high":
        shift = targets["target_calories"] * 0.05
        targets["protein_g"] += int(shift / 4)
        targets["carbs_g"] -= int(shift / 4)
        
    constraints = []
    if patient.allergies: constraints.extend(patient.allergies)
    if patient.dietary_restrictions: constraints.extend(patient.dietary_restrictions)
    if patient.conditions: constraints.extend(patient.conditions)
    constraints.append(f"Goal: {patient.goal} {patient.goal_amount}")
    if ai_rules.goal_advice:
        constraints.append(f"AI: {ai_rules.goal_advice}")
    
    final_targets = NutritionTargets(
        bmi=targets["bmi"],
        bmi_category=targets["bmi_category"],
        bmr=targets["bmr"],
        tdee=int(targets.get("baseline_tdee") or targets.get("tdee") or 0),
        target_calories=targets["target_calories"],
        protein_g=targets["protein_g"],
        carbs_g=targets["carbs_g"],
        fat_g=targets["fat_g"],
        constraints_applied=constraints
    )

    from api.db_manager import get_safe_dishes, contains_forbidden_ingredient
    from api.matching_engine import find_best_meal_plan, estimate_dish_cost
    
    allergies = list(patient.allergies or [])
    if ai_rules.forbidden_ingredients:
        allergies.extend(ai_rules.forbidden_ingredients)
        
    if ai_rules.forced_climate == 'warming' or (avg_temp is not None and avg_temp < 15):
        allergies.extend(['ice cream', 'cold', 'smoothie', 'chilled', 'sorbet', 'salad'])
    elif ai_rules.forced_climate == 'cooling' or (avg_temp is not None and avg_temp > 30):
        allergies.extend(['soup', 'stew', 'hot pot', 'broth', 'spicy'])
        
    current_month = datetime.datetime.now().month
    if not ((avg_temp is not None and avg_temp < 25) or current_month in [12, 1]):
        allergies.append('soup')
        if not any('fish' in item.lower() or item.lower() in {'salmon', 'tuna', 'tilapia', 'rohu', 'pomfret', 'mackerel'} for item in pantry_items):
            allergies.append('fish')
        
    dietary_restrictions = list(patient.dietary_restrictions or [])

    forbidden_items.extend(getattr(ai_rules, 'forbidden_ingredients', []))
    # Parse weekly budget into a daily limit
    daily_budget = None
    if hasattr(patient, 'weekly_budget') and patient.weekly_budget:
        b = patient.weekly_budget.lower()
        if 'under 5,000' in b:
            daily_budget = 5000 / 7
        elif '5,000 - 10,000' in b:
            daily_budget = 10000 / 7
        elif '10,000 - 15,000' in b:
            daily_budget = 15000 / 7

    categorized = get_safe_dishes(
        allergies,
        dietary_restrictions,
        pantry_items=pantry_items,
        strict_pantry_mode=bool(patient.strict_pantry_mode),
        forbidden_items=forbidden_items
    )
    print("MEAT/MAIN POOL DISHES:", [d.get('name') for d in categorized.get('meat', [])])

    if not categorized.get('meat') and not categorized.get('veg'):
        raise HTTPException(status_code=422, detail="No suitable dishes found for these dietary restrictions.")
        
    all_final_meals = []
    prefs = patient.preferences.dict() if patient.preferences else {}
    
    used_dishes = set()
    for day_num in range(1, 8):
        best_plan, multiplier = find_best_meal_plan(categorized, final_targets.dict(), preferences=prefs, iterations=2500, previously_selected=used_dishes)
        
        if not best_plan:
            raise HTTPException(status_code=422, detail="Math engine failed to find a combination.")

        if forbidden_items:
            best_plan = _sanitize_candidate_plan(best_plan, categorized, forbidden_items)
            
        for m in best_plan:
            for item in m['items']:
                used_dishes.add(item.get('name', ''))
            slot = m['slot']
            name = " with ".join([item.get('name', '') for item in m['items']])
            ingredients = []
            for item in m['items']:
                ingredients.extend(item.get('ingredient_names', []))
                
            cals = sum(item.get('calories', 0) for item in m['items']) * multiplier
            pro = sum(item.get('protein_g', 0) for item in m['items']) * multiplier
            carb = sum(item.get('carbs_g', 0) for item in m['items']) * multiplier
            fat = sum(item.get('fat_g', 0) for item in m['items']) * multiplier
            
            image_keyword = m['items'][0].get('name', 'Meal')
            
            serving_text = get_serving_text(m["items"], multiplier)
            why_str = f"Portion to eat: {serving_text}. This provides exactly the energy ({round(cals)} kcal) your body needs for this meal."

            dyn_benefits = []
            if pro > 25: dyn_benefits.append("Packed with protein to keep you full")
            if carb < 20: dyn_benefits.append("Keeps carbs low to help with fat loss")
            elif carb > 60: dyn_benefits.append("Provides high energy for your daily activity")
            
            name_lower = name.lower()
            if 'daal' in name_lower or 'veg' in name_lower or 'sabzi' in name_lower or 'saag' in name_lower:
                dyn_benefits.append("Lots of fiber and healthy micronutrients")
            if 'chicken' in name_lower or 'beef' in name_lower or 'tikka' in name_lower or 'kabab' in name_lower:
                dyn_benefits.append("Great source of lean, high-quality meat")
            if 'shake' in name_lower or 'tea' in name_lower or 'coffee' in name_lower:
                dyn_benefits.append("Light, hydrating, and boosts metabolism")
                
            if len(dyn_benefits) < 2:
                dyn_benefits.append("A delicious, guilt-free classic")
                dyn_benefits.append("Perfectly balanced for your daily targets")
            
            dyn_benefits = list(set(dyn_benefits))[:3]

            dish = m['items'][0] if m.get('items') else {}
            dish_image_url = dish.get('image_url')
            
            dish_recipe_url = resolve_direct_youtube_url(m.get('items', []), name, categorized)
            
            if not dish_image_url and categorized:
                all_db = [d for cat in categorized.values() for d in cat] if isinstance(categorized, dict) else []
                item_name = dish.get('name', '').lower()
                base_name = item_name.split(' with ')[0].split('(')[0].strip()
                for d in all_db:
                    d_name = d.get('name', '').lower()
                    d_base = d_name.split(' with ')[0].split('(')[0].strip()
                    if (base_name and base_name in d_name) or (d_base and d_base in item_name):
                        if d.get('image_url') and not dish_image_url:
                            dish_image_url = d.get('image_url')
                        if dish_image_url:
                            break

            image_prompt = f"Delicious {name}, professional food photography, appetizing, high quality"
            fallback_image = (
                "https://image.pollinations.ai/prompt/"
                f"{urllib.parse.quote(image_prompt)}"
                "?width=800&height=600&nologo=true"
            )


            # Calculate estimated cost
            from api.matching_engine import estimate_dish_cost
            dish_cost = estimate_dish_cost(d, name)
            
            meal_obj = Meal(
                estimated_cost=dish_cost,
                id=f"day{day_num}-{slot.lower()}",
                day=f"Day {day_num}",
                slot=slot,
                name=name,
                ingredients=list(set(ingredients)) or ["Chef's Recipe"],
                image_keyword=image_keyword,
                image=dish_image_url or fallback_image,
                image_url=dish.get("image_url") or dish_image_url,
                recipe_url=dish_recipe_url,
                recipe_link=dish_recipe_url,
                youtube_url=dish_recipe_url,
                calories=round(cals),
                protein=round(pro),
                carbs=round(carb),
                fat=round(fat),
                why=why_str,
                benefits=dyn_benefits
            )
            
            all_final_meals.append(meal_obj)

    if pantry_items:
        forbidden_meals = []
        for meal in all_final_meals:
            if contains_forbidden_ingredient(meal.name, forbidden_items) or any(
                contains_forbidden_ingredient(ingredient, forbidden_items)
                for ingredient in meal.ingredients
            ):
                forbidden_meals.append(meal.name)
        if forbidden_meals:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Pantry validation rejected meals containing unselected proteins: "
                    f"{', '.join(forbidden_meals)}."
                ),
            )
            
    is_valid, errs = validate_meals(all_final_meals, final_targets, dietary_restrictions, allergies)
    
    day_plans = structure_day_plans(all_final_meals, weather_info.forecast)
    msgs = []
    if is_valid:
        msgs = ["Nutrition estimates calculated from catalog data", "Allergens excluded via DB", "Full 7-day generation complete"]
        if "[FALLBACK]" in ai_rules.goal_advice:
            msgs.append("Basic fallback used (AI guidance unavailable)")
        else:
            msgs.append("AI clinical guidance applied")
    else:
        msgs = errs
    meal_plan = MealPlan(
        days=day_plans,
        overall_validation=ValidationInfo(valid=is_valid, messages=msgs)
    )

    external_dining: List[ExternalDiningRecommendation] = []
    outside_order_matches: List[List[ExternalDiningRecommendation]] = [
        [] for _ in day_plans
    ]
    if patient.allow_external_dining:
        try:
            for day_index, day_plan in enumerate(day_plans):
                day_recommendations = [
                    build_outside_order_recommendation(meal)
                    for meal in day_plan.meals
                    if meal.slot.lower() in {"lunch", "dinner", "snack"}
                ]
                outside_order_matches[day_index] = day_recommendations
                external_dining.extend(day_recommendations)
        except Exception:
            external_dining = []
            outside_order_matches = [[] for _ in day_plans]

    return PlanResponse(
        patient=patient,
        nutrition=final_targets,
        weather=weather_info,
        meal_plan=meal_plan,
        external_dining=external_dining,
        outside_order_matches=outside_order_matches,
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/swap-meal", response_model=SwapResponse)
def swap_meal(req: SwapRequest):
    allergies = req.patient.allergies or []
    dietary_restrictions = req.patient.dietary_restrictions or []
    from api.db_manager import get_safe_dishes, contains_forbidden_ingredient
    pantry_items = [item.strip() for item in (req.patient.pantry_items or []) if item.strip()]
    forbidden_items = _forbidden_proteins(pantry_items)
    
    daily_budget = None
    if hasattr(req.patient, 'weekly_budget') and req.patient.weekly_budget:
        b = req.patient.weekly_budget.lower()
        if 'under 5,000' in b: daily_budget = 5000 / 7
        elif '5,000 - 10,000' in b: daily_budget = 10000 / 7
        elif '10,000 - 15,000' in b: daily_budget = 15000 / 7
        
    categorized = get_safe_dishes(
        allergies,
        dietary_restrictions,
        pantry_items=pantry_items,
        strict_pantry_mode=bool(req.patient.strict_pantry_mode),
        forbidden_items=forbidden_items
    )
    
    target_macros = {
        'calories': req.target_calories,
        'protein': req.target_protein,
        'carbs': req.target_carbs,
        'fat': req.target_fat
    }
    
    from api.matching_engine import get_alternative_meals
    import uuid
    
    alts = get_alternative_meals(
        categorized, 
        req.slot, 
        target_macros, 
        previously_selected=set(req.previously_selected), 
        num_options=3
    )
    
    if not alts:
        raise HTTPException(status_code=404, detail="No alternative meals found matching those targets.")
        
    final_alts = []
    for cand_info in alts:
        cand = cand_info['candidate']
        multiplier = cand_info['multiplier']

        if pantry_items and any(
            contains_forbidden_ingredient(item.get('name', ''), forbidden_items)
            or any(
                contains_forbidden_ingredient(ingredient, forbidden_items)
                for ingredient in item.get('ingredient_names', [])
            )
            for item in cand.get('items', [])
        ):
            continue
        
        name = " with ".join([item.get('name', '') for item in cand['items']])
        ingredients = []
        for item in cand['items']:
            ingredients.extend(item.get('ingredient_names', []))
            
        cals = sum(item.get('calories', 0) for item in cand['items']) * multiplier
        pro = sum(item.get('protein_g', 0) for item in cand['items']) * multiplier
        carb = sum(item.get('carbs_g', 0) for item in cand['items']) * multiplier
        fat = sum(item.get('fat_g', 0) for item in cand['items']) * multiplier
        
        serving_text = get_serving_text(cand["items"], multiplier)
        why_str = f"Portion to eat: {serving_text}. This provides exactly the energy ({round(cals)} kcal) your body needs for this meal."
        
        dish = cand['items'][0] if cand.get('items') else {}
        dish_image_url = dish.get('image_url')
        
        dish_recipe_url = resolve_direct_youtube_url(cand.get('items', []), name, categorized)
        
        if not dish_image_url and categorized:
            all_db = [d for cat in categorized.values() for d in cat] if isinstance(categorized, dict) else []
            item_name = dish.get('name', '').lower()
            base_name = item_name.split(' with ')[0].split('(')[0].strip()
            for d in all_db:
                d_name = d.get('name', '').lower()
                d_base = d_name.split(' with ')[0].split('(')[0].strip()
                if (base_name and base_name in d_name) or (d_base and d_base in item_name):
                    if d.get('image_url') and not dish_image_url:
                        dish_image_url = d.get('image_url')
                    if dish_image_url:
                        break
                        
        image_prompt = f"Delicious {name}, professional food photography, appetizing, high quality"
        fallback_image = (
            "https://image.pollinations.ai/prompt/"
            f"{urllib.parse.quote(image_prompt)}"
            "?width=800&height=600&nologo=true"
        )
        
        
        from api.matching_engine import estimate_dish_cost
        dish_cost = estimate_dish_cost(cand['candidate'], name)
        final_meal = Meal(
            estimated_cost=dish_cost,
            id=f"swap-{uuid.uuid4().hex[:8]}",
            day="",
            slot=req.slot,
            name=name,
            why=why_str,
            ingredients=list(set(ingredients)),
            calories=round(cals),
            protein=round(pro),
            carbs=round(carb),
            fat=round(fat),
            benefits=["Balanced to fit your macros perfectly", "Provides great energy"],
            image_keyword=cand["items"][0].get("name", "meal") if cand.get("items") else "meal",
            image=dish_image_url or fallback_image,
            image_url=dish.get("image_url") or dish_image_url,
            recipe_url=dish_recipe_url,
            recipe_link=dish_recipe_url,
            youtube_url=dish_recipe_url
        )
        final_alts.append(final_meal)

    if not final_alts:
        raise HTTPException(
            status_code=404,
            detail="No alternative meals found that satisfy the pantry ingredients and macro targets.",
        )
        
    return SwapResponse(alternatives=final_alts)

class SavePlanRequest(BaseModel):
    patient: dict
    nutrition: dict
    weather: dict
    meal_plan: dict

@app.post("/api/save-plan")
def save_plan(req: SavePlanRequest):
    from api.db_manager import get_supabase_client
    import uuid
    
    supabase = get_supabase_client()
    plan_id = str(uuid.uuid4())
    
    try:
        supabase.table('saved_plans').insert({
            'id': plan_id,
            'plan_data': req.dict()
        }).execute()
        return {"id": plan_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/plan/{plan_id}")
def get_plan(plan_id: str):
    from api.db_manager import get_supabase_client
    supabase = get_supabase_client()
    try:
        res = supabase.table('saved_plans').select('plan_data').eq('id', plan_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Plan not found")
        return res.data[0]['plan_data']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
