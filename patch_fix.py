import os

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix `generate_meal_plan` variable mismatch
content = content.replace(
    "forbidden_items.extend(clinical_rules.forbidden_ingredients)",
    "forbidden_items.extend(getattr(ai_rules, 'forbidden_ingredients', []))"
)

# 2. Fix the `constraints_applied` variable mismatch. I injected:
# if getattr(clinical_rules, "illness_advice", None):
content = content.replace(
    'getattr(clinical_rules, "illness_advice"',
    'getattr(ai_rules, "illness_advice"'
)
content = content.replace(
    'clinical_rules.illness_advice',
    'ai_rules.illness_advice'
)
content = content.replace(
    'getattr(clinical_rules, "forbidden_ingredients"',
    'getattr(ai_rules, "forbidden_ingredients"'
)
content = content.replace(
    'clinical_rules.forbidden_ingredients',
    'ai_rules.forbidden_ingredients'
)

# 3. Fix swap_meal which is totally broken by the bad injections
# Let's find the def swap_meal block.
import re
swap_meal_pattern = re.compile(r'@app\.post\("/api/swap-meal", response_model=SwapResponse\)\ndef swap_meal\(req: SwapRequest\):.*?categorized = get_safe_dishes\(', re.DOTALL)

def clean_swap_meal(match):
    original = match.group(0)
    # the proper code should be:
    return """@app.post("/api/swap-meal", response_model=SwapResponse)
def swap_meal(req: SwapRequest):
    allergies = req.patient.allergies or []
    dietary_restrictions = req.patient.dietary_restrictions or []
    from api.db_manager import get_safe_dishes, contains_forbidden_ingredient
    pantry_items = [item.strip() for item in (req.patient.pantry_items or []) if item.strip()]
    forbidden_items = _forbidden_proteins(pantry_items)
    
    daily_budget = None
    if hasattr(req.patient, 'weekly_budget') and req.patient.weekly_budget:
        b = req.patient.weekly_budget.lower()
        if 'under 5,000' in b: daily_budget = 5000 / 7
        elif '5,000 - 10,000' in b: daily_budget = 10000 / 7
        elif '10,000 - 15,000' in b: daily_budget = 15000 / 7
        
    categorized = get_safe_dishes("""

content = re.sub(swap_meal_pattern, clean_swap_meal, content)

# 4. In swap_meal get_safe_dishes, we also have acute_illness=getattr(intake, "acute_illness", None) injected!
# It should be req.patient
content = content.replace(
    'acute_illness=getattr(intake, "acute_illness", None)',
    'acute_illness=getattr(intake if "intake" in locals() else req.patient, "acute_illness", None)'
)

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up api/index.py bugs")
