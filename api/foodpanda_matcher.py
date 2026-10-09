from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set

from api.schemas import ExternalDiningRecommendation, Meal

CATALOG_PATH = Path(__file__).resolve().parent.parent / "data" / "foodpanda_catalog.json"
STOPWORDS = {
    "with", "and", "the", "a", "an", "of", "in", "on", "for", "to", "plain",
    "fresh", "homemade", "home", "style", "special",
}


def load_foodpanda_catalog() -> List[Dict[str, Any]]:
    if not CATALOG_PATH.exists():
        return []
    with CATALOG_PATH.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def _tokens(text: str) -> Set[str]:
    parts = re.findall(r"[a-z0-9]+", (text or "").lower())
    return {part for part in parts if len(part) > 2 and part not in STOPWORDS}


def _flatten_catalog(catalog: Sequence[Dict[str, Any]]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for restaurant in catalog:
        items = restaurant.get("items") or []
        for item in items:
            rows.append({
                "restaurant_id": restaurant.get("restaurant_id", ""),
                "restaurant_name": restaurant.get("restaurant_name", "Restaurant"),
                "foodpanda_url": restaurant.get("delivery_url") or restaurant.get("foodpanda_url") or "",
                "item_id": item.get("item_id", ""),
                "dish_name": item.get("name", ""),
                "price": float(item.get("price_pkr") or item.get("price") or 0),
                "protein": float(item.get("protein_g") or item.get("protein") or 0),
                "carbs": float(item.get("carbs_g") or 0),
                "fat": float(item.get("fat_g") or 0),
                "sodium_mg": float(item.get("sodium_mg") or 0),
                "glycemic_index": str(item.get("glycemic_index") or ""),
                "tags": [str(tag).lower() for tag in (item.get("tags") or [])],
            })
    return rows


def _contains_any(text: str, needles: Iterable[str]) -> bool:
    haystack = text.lower()
    return any(needle.lower() in haystack for needle in needles if needle)


def _kitchen_note(item: Dict[str, Any], conditions: Sequence[str]) -> str:
    joined = " ".join(conditions).lower()
    notes: List[str] = []
    if "hypertension" in joined or "blood pressure" in joined:
        notes.append("Ask the kitchen for no extra salt and sauce on the side.")
    if "diabetes" in joined or "pcos" in joined:
        notes.append("Request grilled rather than fried, and skip sugary marinades.")
    if not notes:
        notes.append("Ask for a grilled preparation with sauce on the side.")
    if item.get("glycemic_index", "").lower() == "high":
        notes.append("Pair with salad instead of extra rice or naan.")
    return " ".join(notes)


def _item_allowed(
    item: Dict[str, Any],
    allergies: Sequence[str],
    dietary_restrictions: Sequence[str],
    conditions: Sequence[str],
) -> bool:
    blob = " ".join([
        item.get("dish_name", ""),
        item.get("restaurant_name", ""),
        " ".join(item.get("tags") or []),
    ]).lower()
    if _contains_any(blob, allergies):
        return False
    restrictions = [r.lower() for r in dietary_restrictions]
    if any("vegan" in r for r in restrictions) and _contains_any(
        blob, ["chicken", "beef", "mutton", "fish", "egg", "tikka", "kabab", "kebab", "cream", "butter"]
    ):
        return False
    if any("vegetarian" in r for r in restrictions) and _contains_any(
        blob, ["chicken", "beef", "mutton", "fish", "tikka", "kabab", "kebab"]
    ):
        return False
    joined_conditions = " ".join(conditions).lower()
    if ("hypertension" in joined_conditions or "blood pressure" in joined_conditions) and item.get("sodium_mg", 0) >= 1000:
        return False
    return True


def _score_item(meal: Meal, item: Dict[str, Any]) -> float:
    meal_tokens = _tokens(meal.name) | _tokens(" ".join(meal.ingredients or []))
    item_tokens = _tokens(item["dish_name"])
    if not meal_tokens or not item_tokens:
        return 0.0
    overlap = meal_tokens & item_tokens
    score = float(len(overlap) * 12)
    if meal.protein:
        score -= abs(item["protein"] - float(meal.protein)) * 0.15
    slot = (meal.slot or "").lower()
    if slot in {"lunch", "dinner"}:
        score += 2
    return score


def match_external_dining(
    meals: Sequence[Meal],
    conditions: Optional[Sequence[str]] = None,
    allergies: Optional[Sequence[str]] = None,
    dietary_restrictions: Optional[Sequence[str]] = None,
    limit: int = 4,
) -> List[ExternalDiningRecommendation]:
    """Match planned meals to a local Foodpanda catalog. No live ordering API is called."""
    conditions = list(conditions or [])
    allergies = list(allergies or [])
    dietary_restrictions = list(dietary_restrictions or [])
    catalog_items = [
        item
        for item in _flatten_catalog(load_foodpanda_catalog())
        if _item_allowed(item, allergies, dietary_restrictions, conditions)
    ]
    if not catalog_items:
        return []

    candidates = [
        meal for meal in meals
        if (meal.slot or "").lower() in {"lunch", "dinner", "snack"}
    ] or list(meals)

    ranked: List[ExternalDiningRecommendation] = []
    used_item_ids: Set[str] = set()
    for meal in candidates:
        best_item: Optional[Dict[str, Any]] = None
        best_score = 4.0
        for item in catalog_items:
            item_key = item.get("item_id") or item["dish_name"]
            if item_key in used_item_ids:
                continue
            score = _score_item(meal, item)
            if score > best_score:
                best_score = score
                best_item = item
        if not best_item:
            continue
        used_item_ids.add(best_item.get("item_id") or best_item["dish_name"])
        ranked.append(
            ExternalDiningRecommendation(
                restaurant_name=best_item["restaurant_name"],
                dish_name=best_item["dish_name"],
                price=round(best_item["price"], 2),
                protein=round(best_item["protein"], 1),
                kitchen_note=_kitchen_note(best_item, conditions),
                foodpanda_url=best_item["foodpanda_url"],
                matched_meal_id=meal.id,
                matched_meal_name=meal.name,
            )
        )
        if len(ranked) >= limit:
            break
    return ranked
