import os
import re

index_file = 'api/index.py'
with open(index_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add budget parsing
budget_logic = """
    # Parse weekly budget into a daily limit
    daily_budget = None
    if hasattr(intake, 'weekly_budget') and intake.weekly_budget:
        b = intake.weekly_budget.lower()
        if 'under 5,000' in b:
            daily_budget = 5000 / 7
        elif '5,000 - 10,000' in b:
            daily_budget = 10000 / 7
        elif '10,000 - 15,000' in b:
            daily_budget = 15000 / 7
"""

if 'daily_budget = None' not in content:
    content = content.replace("    categorized = get_safe_dishes(", budget_logic + "\n    categorized = get_safe_dishes(")
    
    # Pass daily_budget to find_best_meal_plan
    content = re.sub(
        r'plan_dishes, mult = find_best_meal_plan\(categorized, t_macros, intake\.preferences, previously_selected=previously_selected\)',
        'plan_dishes, mult = find_best_meal_plan(categorized, t_macros, intake.preferences, previously_selected=previously_selected, daily_budget=daily_budget)',
        content
    )
    
    # We also need to add the estimated_cost to the final Meal objects so the user can see it!
    # Wait, the frontend might not render it yet, but we'll include it in the response.
    # Where does it build the Meal object?
    
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched index.py")
else:
    print("Already patched index.py")
