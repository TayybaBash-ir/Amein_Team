import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add validation check where name is formed
old_name = """            for m in best_plan:
                for item in m['items']:
                    used_dishes.add(item.get('name', ''))
                slot = m['slot']
                name = " with ".join([item.get('name', '') for item in m['items']])"""

new_name = """            for m in best_plan:
                for item in m['items']:
                    used_dishes.add(item.get('name', ''))
                slot = m['slot']
                name = " with ".join([item.get('name', '') for item in m['items']])
                
                # Sanitize corrupted generated names
                if not name or '<' in name or '{' in name or not any(c.isalpha() for c in name):
                    name = "Wholesome Balanced Plate"
                    m['items'] = [{'name': name, 'calories': 400, 'protein_g': 30, 'carbs_g': 40, 'fat_g': 15}]"""

c = c.replace(old_name, new_name)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Index name validation updated")
