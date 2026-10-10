import re

with open('api/db_manager.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Let's see what get_safe_dishes does
old_def = """def get_safe_dishes(
    allergies: List[str],
    dietary_restrictions: List[str],
    pantry_items: List[str] = None,
    strict_pantry_mode: bool = False,
    forbidden_items: List[str] = None,
    recovery_mode: bool = False
) -> Dict[str, List[Dict]]:"""

new_def = """import re

def is_valid_text(text: str) -> bool:
    if not text or not isinstance(text, str): return False
    text = text.strip()
    if len(text) < 2: return False
    # If it contains HTML tags or json-like braces
    if re.search(r'<[^>]+>', text): return False
    if '{' in text and '}' in text: return False
    # Must have some letters
    if not any(c.isalpha() for c in text): return False
    return True

def get_safe_dishes(
    allergies: List[str],
    dietary_restrictions: List[str],
    pantry_items: List[str] = None,
    strict_pantry_mode: bool = False,
    forbidden_items: List[str] = None,
    recovery_mode: bool = False
) -> Dict[str, List[Dict]]:"""

c = c.replace(old_def, new_def)

# Find the loop that filters dishes
old_loop = """    for dish in all_dishes:
        if not dish:
            continue
        
        ingredient_names = _dish_ingredient_names(dish)"""

new_loop = """    for dish in all_dishes:
        if not dish or not dish.get('name'):
            continue
        if not is_valid_text(dish.get('name', '')):
            continue
            
        ingredient_names = _dish_ingredient_names(dish)"""

c = c.replace(old_loop, new_loop)

with open('api/db_manager.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Validated db_manager dishes!")
