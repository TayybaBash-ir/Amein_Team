import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add Schema
schema = """class InteractionLog(BaseModel):
    user_id: str = "anon"
    action: str
    meal_id: str
    dish_name: str
    context: dict = {}

"""
if "class InteractionLog(BaseModel):" not in c:
    c = c.replace("class SwapRequest(BaseModel):", schema + "class SwapRequest(BaseModel):")

# 2. Add Route
route = """@app.post("/api/interaction")
def log_interaction(log: InteractionLog):
    import time
    import json
    record = log.dict()
    record['timestamp'] = time.time()
    try:
        with open("ml_interactions.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\\n")
    except Exception as e:
        print("Failed to log:", e)
    return {"status": "recorded"}

"""
if "@app.post(\"/api/interaction\")" not in c:
    c = c.replace("@app.post(\"/api/swap-meal\", response_model=SwapResponse)", route + "@app.post(\"/api/swap-meal\", response_model=SwapResponse)")

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Backend interaction logging added!")
