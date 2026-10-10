import re

with open('api/db_manager.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Make the safe filter check ingredients as well
old_filter = """        safe = []
        for dish in data:
            n = dish.get('name', '')
            if not n or '<' in n or '{' in n or not any(c.isalpha() for c in n):
                continue
            safe.append(dish)"""

new_filter = """        safe = []
        for dish in data:
            n = str(dish.get('name', ''))
            ing = str(dish.get('ingredients', ''))
            
            # Check for gibberish (HTML tags, json brackets, missing letters)
            is_gibberish = (
                not n 
                or '<' in n or '{' in n or '}' in n
                or '<' in ing or '{' in ing or '}' in ing
                or not any(c.isalpha() for c in n)
            )
            
            if is_gibberish:
                continue
            safe.append(dish)"""

c = c.replace(old_filter, new_filter)

with open('api/db_manager.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("Database gibberish filter expanded!")
