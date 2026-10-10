import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_ing = """        ingredients = []
        for item in cand['items']:
            ingredients.extend(item.get('ingredient_names', []))"""

new_ing = """        ingredients = []
        for item in cand['items']:
            ingredients.extend(item.get('ingredient_names', []))
            
        safe_ingredients = []
        for ing in set(ingredients):
            ing_str = str(ing)
            if not ing_str or '<' in ing_str or '{' in ing_str or '}' in ing_str or not any(c.isalpha() for c in ing_str): continue
            safe_ingredients.append(ing_str)
        ingredients = safe_ingredients"""

c = c.replace(old_ing, new_ing)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Ingredient sanitizer added!")
