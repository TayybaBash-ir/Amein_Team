from __future__ import annotations

from api.meal_validator import validate_meals
from api.nutrition_math import get_nutritional_targets
from api.schemas import Meal, NutritionTargets


def _targets() -> NutritionTargets:
    return NutritionTargets(
        bmi=22.9,
        bmi_category="Normal",
        bmr=1500,
        tdee=1800,
        target_calories=2000,
        protein_g=150,
        carbs_g=200,
        fat_g=66,
        constraints_applied=[],
    )


def _weekly_meals() -> list[Meal]:
    meals = []
    for day in range(1, 8):
        for slot in ("Breakfast", "Lunch", "Dinner"):
            meals.append(Meal(
                id=f"day{day}-{slot.lower()}",
                day=f"Day {day}",
                slot=slot,
                name="Chicken with rice",
                ingredients=["chicken", "rice"],
                image_keyword="chicken rice",
                calories=666,
                protein=50,
                carbs=66,
                fat=22,
                why="",
                benefits=[],
            ))
    return meals


def test_nutritional_targets_calculate_bmi_and_weight_loss_target():
    targets = get_nutritional_targets(
        weight_kg=70,
        height_cm=175,
        age=30,
        gender="male",
        activity_level="sedentary",
        goal="Lose weight",
    )

    assert targets["bmi"] == 22.9
    assert targets["target_calories"] < targets["tdee"]


def test_weekly_meals_pass_and_wrong_meal_count_fails():
    meals = _weekly_meals()

    valid, messages = validate_meals(meals, _targets(), [])
    assert valid, messages

    valid, messages = validate_meals(meals[:1], _targets(), [])
    assert not valid
    assert any("Expected 21 to 28 meals" in message for message in messages)


def test_weekly_meals_reject_allergen_in_ingredients():
    meals = _weekly_meals()
    meals[0].ingredients.append("peanut")

    valid, messages = validate_meals(meals, _targets(), ["peanut"])

    assert not valid
    assert any("peanut" in message.lower() for message in messages)
