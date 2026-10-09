from __future__ import annotations
import pytest
from api.nutrition_math import calculate_bmi, calculate_tdee, adjust_calories_for_goal
from api.schemas import Meal, NutritionTargets
from api.meal_validator import validate_meals

def test_bmi():
    bmi, cat = calculate_bmi(70, 175)
    assert round(bmi, 1) == 22.9
    assert cat == "Normal weight"

def test_tdee_adjustments():
    tdee = calculate_tdee(1500, "Sedentary")
    assert tdee == 1800
    
    # Weight loss
    target = adjust_calories_for_goal(2000, "Lose weight", 1500)
    assert target < 2000
    
    # Muscle gain
    target2 = adjust_calories_for_goal(2000, "Gain muscle", 1500)
    assert target2 > 2000

def test_meal_validator():
    targets = NutritionTargets(
        bmi=22.9, bmi_category="Normal", bmr=1500, tdee=1800,
        target_calories=2000, protein_g=150, carbs_g=200, fat_g=66,
        constraints_applied=[]
    )
    
    # Invalid count
    meals = [
        Meal(id="1", day="Day 1", slot="Breakfast", name="Eggs", ingredients=["egg"], image_keyword="egg", calories=500, protein=30, carbs=20, fat=20, why="", benefits=[])
    ]
    is_valid, msgs = validate_meals(meals, targets, ["peanuts"])
    assert not is_valid
    assert "Expected exactly 9 meals" in msgs[0]

    # Valid plan mock (3 days x 3 meals)
    full_meals = []
    for d in range(3):
        for s in ["Breakfast", "Lunch", "Dinner"]:
            full_meals.append(Meal(
                id=f"d{d}-{s}", day=f"Day {d+1}", slot=s, name="Test Meal", ingredients=["chicken", "rice"], image_keyword="test",
                calories=666, protein=50, carbs=66, fat=22, why="", benefits=[]
            ))
            
    is_valid, msgs = validate_meals(full_meals, targets, [])
    assert is_valid

    # Allergy violation
    allergy_meals = full_meals.copy()
    # Create a fresh Meal object to avoid mutating the shared reference
    bad_meal = Meal(
        id="bad1", day="Day 1", slot="Breakfast", name="Test Meal", ingredients=["peanut", "chicken"], image_keyword="test",
        calories=666, protein=50, carbs=66, fat=22, why="", benefits=[]
    )
    allergy_meals[0] = bad_meal
    is_valid, msgs = validate_meals(allergy_meals, targets, ["peanut"])
    assert not is_valid
    assert any("contains prohibited ingredient" in m for m in msgs)
    
    # Macro out of bounds (Protein too high)
    high_protein_meals = full_meals.copy()
    high_protein_meals[0] = Meal(
        id="hp1", day="Day 1", slot="Breakfast", name="Test Meal", ingredients=["chicken"], image_keyword="test",
        calories=666, protein=100, carbs=66, fat=22, why="", benefits=[]
    )
    is_valid, msgs = validate_meals(high_protein_meals, targets, [])
    assert not is_valid
    assert any("protein" in m and "outside" in m for m in msgs)
    
    # Macro out of bounds (Fat too high)
    high_fat_meals = full_meals.copy()
    high_fat_meals[0] = Meal(
        id="hf1", day="Day 1", slot="Breakfast", name="Test Meal", ingredients=["oil"], image_keyword="test",
        calories=666, protein=50, carbs=66, fat=100, why="", benefits=[]
    )
    is_valid, msgs = validate_meals(high_fat_meals, targets, [])
    assert not is_valid
    assert any("fat" in m and "outside" in m for m in msgs)

    # Macro out of bounds (carbs too high)
    high_carb_meals = full_meals.copy()
    high_carb_meals[0] = Meal(
        id="hc1", day="Day 1", slot="Breakfast", name="Test Meal", ingredients=["rice"], image_keyword="test",
        calories=666, protein=50, carbs=200, fat=22, why="", benefits=[]
    )
    is_valid, msgs = validate_meals(high_carb_meals, targets, [])
    assert not is_valid
    assert any("carbs" in m and "outside" in m for m in msgs)
