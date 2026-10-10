from __future__ import annotations
import os
from supabase import create_client, Client
from typing import List, Dict
import re

HOUSEHOLD_STAPLES = {"water", "salt", "black pepper", "cooking oil", "olive oil"}
INGREDIENT_ALIASES = {
    "chicken": {"chicken"},
    "beef": {"beef"},
    "pork": {"pork"},
    "fish": {"fish", "salmon", "tuna", "tilapia", "rohu", "pomfret", "mackerel"},
    "rice": {"rice", "basmati"},
    "egg": {"egg", "eggs"},
    "bean": {"bean", "beans", "chickpea", "chickpeas", "chana"},
    "lentil": {"lentil", "lentils", "daal", "dal", "chana", "chickpea", "chickpeas"},
    "tomato": {"tomato", "tomatoes"},
    "onion": {"onion", "onions"},
    "potato": {"potato", "potatoes"},
}
MAJOR_PROTEINS = {
    "chicken": {"chicken"},
    "beef": {"beef"},
    "mutton": {"mutton", "lamb", "goat"},
    "pork": {"pork", "bacon", "ham"},
    "fish": {"fish", "salmon", "tuna", "tilapia", "rohu", "pomfret", "mackerel"},
    "egg": {"egg", "eggs"},
    "turkey": {"turkey"},
    "duck": {"duck"},
    "shrimp": {"shrimp", "prawn", "prawns"},
    "tofu": {"tofu"},
    "lentil": {"lentil", "lentils", "daal", "dal", "chana", "chickpea", "chickpeas"},
    "chickpea": {"chana", "chickpea", "chickpeas"},
}
LENTIL_PANTRY_ALIASES = {"lentil", "lentils", "daal", "dal", "chana", "chickpea", "chickpeas"}
MEAT_OR_FISH_PANTRY_ITEMS = {
    "chicken", "beef", "mutton", "lamb", "fish", "seafood", "prawn", "prawns",
    "shrimp", "pork", "turkey", "duck",
}

def _normalized_words(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", (value or "").lower()))

def ingredient_is_available(ingredient: str, pantry_items: List[str]) -> bool:
    """Match a catalog ingredient against pantry names and basic household staples."""
    candidate = _normalized_words(ingredient)
    if not candidate:
        return False

    allowed_names = {_normalized_words(item) for item in (pantry_items or []) if _normalized_words(item)}
    allowed_names.update(HOUSEHOLD_STAPLES)
    allowed_names = {_normalized_words(item) for item in allowed_names}

    for allowed in allowed_names:
        if re.search(rf"\b{re.escape(allowed)}\b", candidate):
            return True
        aliases = next((values for key, values in INGREDIENT_ALIASES.items() if allowed in values), set())
        if any(re.search(rf"\b{re.escape(alias)}\b", candidate) for alias in aliases):
            return True
    return False

def has_unselected_major_protein(text: str, pantry_items: List[str]) -> bool:
    """Reject a dish title or ingredient naming a protein the user did not select."""
    candidate = _normalized_words(text)
    selected = {_normalized_words(item) for item in (pantry_items or [])}
    for protein, names in MAJOR_PROTEINS.items():
        if not any(re.search(rf"\b{re.escape(name)}\b", candidate) for name in names):
            continue
        if not any(
            selected_name == protein or selected_name in names
            or any(re.search(rf"\b{re.escape(name)}\b", selected_name) for name in names)
            for selected_name in selected
        ):
            return True
    return False

def contains_forbidden_ingredient(text: str, forbidden_items: List[str]) -> bool:
    """Match forbidden ingredient names as whole words to avoid partial matches."""
    candidate = _normalized_words(text)
    return any(
        re.search(rf"\b{re.escape(_normalized_words(item))}\b", candidate)
        for item in (forbidden_items or [])
        if _normalized_words(item)
    )

def _dish_ingredient_names(dish: Dict) -> List[str]:
    names = []
    for relation in dish.get("dish_ingredients", []) or []:
        if relation and relation.get("ingredients"):
            name = relation["ingredients"].get("name")
            if name:
                names.append(str(name).strip().lower())
    # Support catalog rows that expose a direct ingredients list instead of
    # the Supabase join shape.
    direct = dish.get("ingredients") or []
    if isinstance(direct, str):
        direct = [direct]
    for ingredient in direct:
        if isinstance(ingredient, dict):
            ingredient = ingredient.get("name", "")
        if ingredient:
            names.append(str(ingredient).strip().lower())
    return list(dict.fromkeys(names))

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    return create_client(url, key)

def fetch_all_dishes() -> List[Dict]:
    supabase = get_supabase_client()
    
    all_dishes = []
    chunk_size = 1000
    for i in range(5):
        res = (
            supabase.table("dishes")
            .select("*, dish_ingredients(ingredients(name))")
            .range(i * chunk_size, (i + 1) * chunk_size - 1)
            .execute()
        )
        all_dishes.extend(res.data)
        if len(res.data) < chunk_size:
            break
            
    return all_dishes

def find_dish_video_url(dish_name: str):
    """Return the stored video_url for an exact dish-name match, if available."""
    name = dish_name.strip()
    if not name:
        return None

    try:
        response = (
            get_supabase_client()
            .table("dishes")
            .select("video_url")
            .ilike("name", name)
            .limit(1)
            .execute()
        )
        if response.data:
            return response.data[0].get("video_url")
    except Exception:
        pass
    return None

def get_safe_dishes(
    allergies: List[str],
    dietary_restrictions: List[str],
    pantry_items: List[str] = None,
    strict_pantry_mode: bool = False,
    forbidden_items: List[str] = None
):
    all_dishes = fetch_all_dishes()
    safe_dishes = []
    
    SYNONYMS = {
        "peanut": ["peanut", "groundnut", "arachis"],
        "dairy": ["milk", "cheese", "yogurt", "butter", "ghee", "cream", "dahi"],
        "gluten": ["wheat", "atta", "roti", "naan", "barley", "rye", "bread"],
        "beef": ["beef", "cow", "veal"],
        "pork": ["pork", "bacon", "ham", "swine"],
        "egg": ["egg", "eggs", "omelette"],
        "vegan": ["milk", "cheese", "yogurt", "butter", "ghee", "cream", "dahi", "egg", "eggs", "chicken", "beef", "mutton", "fish", "meat", "honey"],
        "vegetarian": ["chicken", "beef", "mutton", "fish", "meat"]
    }

    raw_constraints = [a.lower() for a in allergies + dietary_restrictions]
    constraints = []
    for c in raw_constraints:
        constraints.append(c)
        for key, syns in SYNONYMS.items():
            if key in c:
                constraints.extend(syns)
    constraints = list(set(constraints))
    
    pantry_terms = [item.strip().lower() for item in (pantry_items or []) if item.strip()]

    # Calculate explicit forbidden words if pantry is active
    explicit_forbidden = set(forbidden_items or [])
    if pantry_terms:
        # Determine unselected proteins dynamically
        for prot, aliases in MAJOR_PROTEINS.items():
            # If no selected pantry item matches this protein or its aliases, forbid it
            if not any(
                p_term == prot or p_term in aliases or any(a in p_term for a in aliases)
                for p_term in pantry_terms
            ):
                explicit_forbidden.update(aliases)
                explicit_forbidden.add(prot)
        # Lentils, daal, and chickpeas are pantry aliases for plant protein;
        # selecting one makes the family available rather than forbidden.
        if set(pantry_terms) & LENTIL_PANTRY_ALIASES:
            explicit_forbidden.difference_update(LENTIL_PANTRY_ALIASES)

    for d in all_dishes:
        ingredients_list = _dish_ingredient_names(d)
        dish_name = d.get('name', '').lower()
        dish_text = f"{dish_name} {' '.join(ingredients_list)}"

        is_safe = True

        # 1. Standard Allergy & Dietary Constraints
        for c in constraints:
            if c in dish_name or any(c in ing for ing in ingredients_list):
                is_safe = False
                break

        # 2. Strict Forbidden Items Removal (e.g. Chicken, Beef, etc.)
        if is_safe and explicit_forbidden:
            for forbidden in explicit_forbidden:
                pattern = rf"\b{re.escape(forbidden)}\b"
                if re.search(pattern, dish_text):
                    is_safe = False
                    break

        if is_safe:
            d['ingredient_names'] = [ing.title() for ing in ingredients_list]
            safe_dishes.append(d)
            
    categorized = {
        'meat': [d for d in safe_dishes if d.get('category_id') == 1],
        'veg': [d for d in safe_dishes if d.get('category_id') == 2],
        'daal': [d for d in safe_dishes if d.get('category_id') == 3],
        'carbs': [d for d in safe_dishes if d.get('category_id') == 4],
        'snacks': [d for d in safe_dishes if d.get('category_id') == 5],
        'refreshments': [d for d in safe_dishes if d.get('category_id') == 6]
    }
    has_meat_in_pantry = any(
        protein in pantry_term
        for pantry_term in pantry_terms
        for protein in MEAT_OR_FISH_PANTRY_ITEMS
    )
    if not categorized['meat'] or (pantry_terms and not has_meat_in_pantry):
        # Plant-protein and vegetable components can occupy the main pool,
        # while their original categories remain available to the assembler.
        categorized['meat'].extend(categorized['daal'])
        categorized['meat'].extend(
            dish for dish in categorized['veg'] if dish not in categorized['meat']
        )
        unique = {}
        for dish in categorized['meat']:
            unique[dish.get('id', dish.get('name'))] = dish
        categorized['meat'] = list(unique.values())
    return categorized
