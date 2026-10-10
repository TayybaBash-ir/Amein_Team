from __future__ import annotations
from typing import Any, Dict

def get_nutritional_targets(
    plan_mode: str = "standard",
    metabolic_modifier: float = 1.0,
    macro_tweak: str = "",
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str = "moderate",
    goal: str = "maintain",
) -> Dict[str, Any]:
    """Calculates daily macro, BMI, BMR, TDEE, and calorie targets based on patient data."""
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m ** 2), 1)
    
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25.0:
        bmi_category = "Normal"
    elif bmi < 30.0:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    if str(gender).lower() == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.375,
        "light": 1.375,
        "moderately active": 1.55,
        "moderate": 1.55,
        "active": 1.725,
        "very active": 1.9,
        "athlete": 1.9,
    }

    act_key = str(activity_level).lower().strip()
    tdee = bmr * multipliers.get(act_key, 1.375)

    tdee = tdee * metabolic_modifier
    goal_key = str(goal).lower().strip()
    if plan_mode == "recovery":
        target_calories = tdee
    elif "lose" in goal_key:
        target_calories = tdee - 500
    elif "gain" in goal_key:
        target_calories = tdee + 300
    else:
        target_calories = tdee

    target_calories = max(0.0, target_calories)
    protein_g = weight_kg * 2.0
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
        fat_g += (shift / 2.0) / 9.0

    return {
        "bmi": bmi,
        "bmi_category": bmi_category,
        "bmr": round(bmr),
        "tdee": round(tdee),
        "baseline_tdee": round(tdee),
        "target_calories": round(target_calories),
        "calories": round(target_calories),
        "protein_g": round(protein_g),
        "fat_g": round(fat_g),
        "carbs_g": round(carbs_g),
        "constraints_applied": ["High Protein Target", "Caloric Adjustment"]
    }
