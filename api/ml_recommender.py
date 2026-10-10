import json
import os
from collections import defaultdict

import os
INTERACTIONS_FILE = "/tmp/ml_interactions.jsonl" if os.environ.get("VERCEL") else "ml_interactions.jsonl"

def parse_interactions():
    """
    Reads ML interactions (from Supabase if available, fallback to JSONL)
    and builds a user preference dictionary.
    Returns: dict mapping user_id -> { ingredient_or_dish_keyword -> score }
    """
    user_prefs = defaultdict(lambda: defaultdict(float))
    
    def get_kws(d_name):
        return [w for w in str(d_name).lower().split() if len(w) > 2 and w not in ("with", "and", "the", "for", "style", "plain")]
    
    # 1. Try fetching from Supabase first
    fetched_data = []
    try:
        from api.db_manager import get_supabase_client
        supabase = get_supabase_client()
        res = supabase.table('ml_interactions').select('*').execute()
        fetched_data = res.data
    except Exception:
        # Fallback to local JSONL if Supabase fails or table doesn't exist
        if os.path.exists(INTERACTIONS_FILE):
            with open(INTERACTIONS_FILE, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            fetched_data.append(json.loads(line))
                        except Exception:
                            pass

    # 2. Process all rows to build weights
    for data in fetched_data:
        try:
            uid = data.get("user_id", "anon")
            action = data.get("action", "")
            
            # Handling Log / Skip / Custom
            if action in ("logged", "skipped", "custom"):
                dish_name = data.get("dish_name", "")
                keywords = get_kws(dish_name)
                
                weight = 0.0
                if action == "logged":
                    weight = -50.0  
                elif action == "skipped":
                    weight = 100.0  
                elif action == "custom":
                    weight = 50.0   

                for kw in keywords:
                    user_prefs[uid][kw] += weight

            # Handling Swap
            elif action == "swapped":
                accepted_dish = data.get("dish_name", "")
                rejected_dish = data.get("context", {}).get("original_dish", "")
                
                for kw in get_kws(accepted_dish):
                    user_prefs[uid][kw] += -30.0  
                for kw in get_kws(rejected_dish):
                    user_prefs[uid][kw] += 80.0   
                    
        except Exception:
            continue
            
    return user_prefs

def get_ml_score_penalty(dish_name: str, user_id: str = "anon") -> float:
    prefs = parse_interactions().get(user_id, {})
    if not prefs:
        return 0.0
        
    dish_name_lower = str(dish_name).lower()
    keywords = [w for w in dish_name_lower.split() if len(w) > 2 and w not in ("with", "and", "the", "for", "style", "plain")]
    
    total_modifier = 0.0
    for kw in keywords:
        total_modifier += prefs.get(kw, 0.0)
        
    return max(-500.0, min(1000.0, total_modifier))
