import re

# 1. Add InteractionLog to api/schemas.py
with open('api/schemas.py', 'r', encoding='utf-8') as f:
    schemas_content = f.read()

interaction_log_class = """
class InteractionLog(BaseModel):
    action: str
    meal_id: str
    dish_name: str
    user_id: str = "anon"
    context: dict = {}
"""

if "class InteractionLog" not in schemas_content:
    schemas_content += "\n" + interaction_log_class
    with open('api/schemas.py', 'w', encoding='utf-8') as f:
        f.write(schemas_content)
    print("Added InteractionLog to schemas.py")

# 2. Add import to api/index.py
with open('api/index.py', 'r', encoding='utf-8') as f:
    index_content = f.read()

if "InteractionLog" not in index_content[:500]:
    # It's missing from the imports block
    old_imports = """    SwapRequest, SwapResponse, ExternalDiningRecommendation
)"""
    new_imports = """    SwapRequest, SwapResponse, ExternalDiningRecommendation, InteractionLog
)"""
    index_content = index_content.replace(old_imports, new_imports)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(index_content)
    print("Imported InteractionLog in index.py")
