import json
import os
from collections import defaultdict

INTERACTIONS_FILE = "ml_interactions.jsonl"

def parse_interactions():
    """
    Reads the ML interactions JSONL and builds a user preference dictionary.
    Returns: dict mapping user_id -> { ingredient_or_dish_keyword -> score }
    """
    user_prefs = defaultdict(lambda: defaultdict(float))
    
    # Define how to extract keywords from a dish name
    def get_kws(d_name):
        return [w for w in d_name.lower().split() if len(w) > 2 and w not in ("with", "and", "the", "for", "style", "plain")]
    
    if not os.path.exists(INTERACTIONS_FILE):
        return user_prefs

    with open(INTERACTIONS_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                uid = data.get("user_id", "anon")
                action = data.get("action", "")
                
                # Handling Log / Skip / Custom
                if action in ("logged", "skipped", "custom"):
                    dish_name = data.get("dish_name", "")
                    keywords = get_kws(dish_name)
                    
                    weight = 0.0
                    if action == "logged":
                        weight = -50.0  # Decrease penalty (boost recommendation)
                    elif action == "skipped":
                        weight = 100.0  # Increase penalty (avoid recommending)
                    elif action == "custom":
                        weight = 50.0   # Custom implies they didn't like the recommendation

                    for kw in keywords:
                        user_prefs[uid][kw] += weight

                # Handling Swap
                elif action == "swapped":
                    # They accepted 'dish_name' and rejected 'original_dish'
                    accepted_dish = data.get("dish_name", "")
                    rejected_dish = data.get("context", {}).get("original_dish", "")
                    
                    for kw in get_kws(accepted_dish):
                        user_prefs[uid][kw] += -30.0  # Boost accepted
                    for kw in get_kws(rejected_dish):
                        user_prefs[uid][kw] += 80.0   # Penalize rejected
                        
            except Exception:
                continue
                
    return user_prefs

def get_ml_score_penalty(dish_name: str, user_id: str = "anon") -> float:
    """
    Given a dish name, calculates the preference penalty modifier.
    Negative penalty means the user LIKES it (so it gets ranked higher).
    Positive penalty means the user DISLIKES it (ranked lower).
    """
    prefs = parse_interactions().get(user_id, {})
    if not prefs:
        return 0.0
        
    dish_name_lower = dish_name.lower()
    keywords = [w for w in dish_name_lower.split() if len(w) > 2 and w not in ("with", "and", "the", "for", "style", "plain")]
    
    total_modifier = 0.0
    for kw in keywords:
        total_modifier += prefs.get(kw, 0.0)
        
    # Cap the modifier so it doesn't completely overwhelm macro tracking, but is strong enough to re-rank.
    return max(-500.0, min(1000.0, total_modifier))
