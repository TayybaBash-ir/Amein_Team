import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

bad_schema = """class InteractionLog(BaseModel):
    user_id: str = "anon"
    action: str
    meal_id: str
    dish_name: str
    context: dict = {}"""

good_schema = """class InteractionLog(BaseModel):
    action: str
    meal_id: str
    dish_name: str
    user_id: str = "anon"
    context: dict = {}"""

c = c.replace(bad_schema, good_schema)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Schema syntax fixed!")
