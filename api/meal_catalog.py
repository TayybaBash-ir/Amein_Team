from __future__ import annotations
"""Small Pakistan-first demo catalog with portions and ingredient-based estimates.

Ingredient nutrient values are approximate generic-food references informed by
USDA FoodData Central (public-domain data; https://fdc.nal.usda.gov/). They are
not an exact data import or laboratory measurements of these recipes. Expand
and locally review the catalog before using it for real care.
"""

from dataclasses import dataclass
from typing import Dict, Tuple


@dataclass(frozen=True)
class Ingredient:
    name: str
    grams: float
    # kcal, protein, carbohydrate, fat per 100 g
    per_100g: Tuple[float, float, float, float]


@dataclass(frozen=True)
class Recipe:
    key: str
    name: str
    slot: str
    ingredients: Tuple[Ingredient, ...]
    cuisine_tags: Tuple[str, ...] = ("pakistani", "halal")
    why: str = "Made with familiar everyday ingredients commonly available in Pakistan."
    benefits: Tuple[str, ...] = ("Uses familiar local ingredients", "Portion-based nutrition estimate")


# Values are generic estimates per 100 g of ingredient. Staple grains and pulses
# are listed dry; chickpeas are cooked/drained. Recipe amounts are one serving.
N = {
    "atta": (360, 12.0, 72.0, 2.0),
    "rice": (365, 7.1, 80.0, 0.7),
    "masoor": (352, 24.6, 63.4, 1.1),
    "moong": (347, 23.9, 62.6, 1.2),
    "chana": (164, 8.9, 27.4, 2.6),
    "chicken": (120, 22.5, 0.0, 2.6),
    "egg": (143, 12.6, 0.7, 9.5),
    "yogurt": (61, 3.5, 4.7, 3.3),
    "oil": (884, 0.0, 0.0, 100.0),
    "tomato": (18, 0.9, 3.9, 0.2),
    "onion": (40, 1.1, 9.3, 0.1),
    "spinach": (23, 2.9, 3.6, 0.4),
    "potato": (77, 2.0, 17.0, 0.1),
    "cucumber": (15, 0.7, 3.6, 0.1),
    "banana": (89, 1.1, 22.8, 0.3),
    "milk": (61, 3.2, 4.8, 3.3),
    "bread": (265, 9.0, 49.0, 3.2),
}


def _i(name: str, grams: float, key: str) -> Ingredient:
    return Ingredient(name, grams, N[key])


CATALOG = (
    Recipe("egg_roti", "Anda Bhurji with Atta Roti", "Breakfast", (
        _i("Egg", 100, "egg"), _i("Atta flour", 55, "atta"), _i("Tomato", 50, "tomato"),
        _i("Onion", 25, "onion"), _i("Cooking oil", 5, "oil"), _i("Plain yogurt", 100, "yogurt"),
    )),
    Recipe("chana_chaat", "Chana Chaat with Plain Yogurt", "Breakfast", (
        _i("Cooked chickpeas", 150, "chana"), _i("Plain yogurt", 120, "yogurt"),
        _i("Tomato", 60, "tomato"), _i("Onion", 25, "onion"), _i("Cucumber", 60, "cucumber"),
    )),
    Recipe("omelette_roti", "Tomato Omelette with Atta Roti", "Breakfast", (
        _i("Egg", 150, "egg"), _i("Atta flour", 45, "atta"), _i("Tomato", 50, "tomato"),
        _i("Onion", 20, "onion"), _i("Cooking oil", 5, "oil"),
    )),
    Recipe("banana_milk_egg", "Eggs with Banana and Milk", "Breakfast", (
        _i("Egg", 150, "egg"), _i("Banana", 100, "banana"), _i("Milk", 200, "milk"),
    )),
    Recipe("chicken_rice", "Chicken Curry with Basmati Rice", "Lunch", (
        _i("Chicken", 170, "chicken"), _i("Basmati rice", 65, "rice"), _i("Tomato", 80, "tomato"),
        _i("Onion", 40, "onion"), _i("Cooking oil", 8, "oil"), _i("Plain yogurt", 60, "yogurt"),
    )),
    Recipe("chicken_roti", "Chicken Salan with Atta Roti", "Lunch", (
        _i("Chicken", 170, "chicken"), _i("Atta flour", 65, "atta"), _i("Tomato", 80, "tomato"),
        _i("Onion", 40, "onion"), _i("Cooking oil", 8, "oil"),
    )),
    Recipe("masoor_rice", "Masoor Daal with Basmati Rice", "Lunch", (
        _i("Dry masoor lentils", 65, "masoor"), _i("Basmati rice", 45, "rice"),
        _i("Tomato", 70, "tomato"), _i("Onion", 35, "onion"), _i("Cooking oil", 6, "oil"),
        _i("Plain yogurt", 100, "yogurt"),
    )),
    Recipe("chana_rice", "Chana Masala with Basmati Rice", "Lunch", (
        _i("Cooked chickpeas", 160, "chana"), _i("Basmati rice", 45, "rice"),
        _i("Tomato", 80, "tomato"), _i("Onion", 35, "onion"), _i("Cooking oil", 6, "oil"),
    )),
    Recipe("chicken_spinach", "Chicken Palak with Atta Roti", "Lunch", (
        _i("Chicken", 160, "chicken"), _i("Spinach", 100, "spinach"), _i("Atta flour", 60, "atta"),
        _i("Tomato", 60, "tomato"), _i("Onion", 35, "onion"), _i("Cooking oil", 8, "oil"),
        _i("Plain yogurt", 60, "yogurt"),
    )),
    Recipe("moong_rice", "Moong Daal with Basmati Rice", "Dinner", (
        _i("Dry split moong daal", 65, "moong"), _i("Basmati rice", 45, "rice"),
        _i("Tomato", 70, "tomato"), _i("Onion", 35, "onion"), _i("Cooking oil", 6, "oil"),
        _i("Plain yogurt", 100, "yogurt"), _i("Cucumber", 80, "cucumber"),
    )),
    Recipe("chicken_cucumber", "Chicken with Atta Roti and Cucumber Raita", "Dinner", (
        _i("Chicken", 170, "chicken"), _i("Atta flour", 55, "atta"), _i("Plain yogurt", 120, "yogurt"),
        _i("Cucumber", 80, "cucumber"), _i("Tomato", 60, "tomato"), _i("Cooking oil", 7, "oil"),
    )),
    Recipe("egg_curry_rice", "Egg Curry with Basmati Rice", "Dinner", (
        _i("Egg", 150, "egg"), _i("Basmati rice", 55, "rice"), _i("Tomato", 90, "tomato"),
        _i("Onion", 40, "onion"), _i("Cooking oil", 7, "oil"), _i("Plain yogurt", 80, "yogurt"),
    )),
    Recipe("chicken_keema_roti", "Chicken Keema with Atta Roti", "Dinner", (
        _i("Chicken", 160, "chicken"), _i("Atta flour", 55, "atta"), _i("Tomato", 70, "tomato"),
        _i("Onion", 35, "onion"), _i("Cooking oil", 8, "oil"), _i("Spinach", 60, "spinach"),
    )),
    Recipe("aloo_palak_daal", "Aloo Palak with Masoor Daal and Roti", "Dinner", (
        _i("Potato", 100, "potato"), _i("Spinach", 100, "spinach"), _i("Dry masoor lentils", 45, "masoor"),
        _i("Atta flour", 40, "atta"), _i("Tomato", 60, "tomato"), _i("Onion", 30, "onion"),
        _i("Cooking oil", 6, "oil"),
    )),
)


def nutrition_for(recipe: Recipe, portion: float = 1.0) -> Dict[str, int]:
    totals = [0.0, 0.0, 0.0, 0.0]
    for ingredient in recipe.ingredients:
        for index, value in enumerate(ingredient.per_100g):
            totals[index] += value * ingredient.grams * portion / 100
    # Keep calorie reporting consistent with the same macro values shown to users.
    calories = totals[1] * 4 + totals[2] * 4 + totals[3] * 9
    return {
        "calories": round(calories),
        "protein": round(totals[1]),
        "carbs": round(totals[2]),
        "fat": round(totals[3]),
    }
