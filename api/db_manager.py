from __future__ import annotations
import os
from supabase import create_client, Client
from typing import List, Dict

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

def get_safe_dishes(allergies: List[str], dietary_restrictions: List[str]):
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
    
    for d in all_dishes:
        ingredients_list = []
        for di in d.get('dish_ingredients', []):
            if di and 'ingredients' in di and di['ingredients']:
                ingredients_list.append(di['ingredients'].get('name', '').lower())
        
        is_safe = True
        dish_name = d.get('name', '').lower()
        for c in constraints:
            if c in dish_name:
                is_safe = False
                break
            for ing in ingredients_list:
                if c in ing:
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
    return categorized
