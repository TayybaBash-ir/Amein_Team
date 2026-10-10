import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

# I need to fix the intake to patient mapping in generate_meal_plan only.
# Wait, let's just globally replace `intake` with `patient` where it's used for weekly_budget and constraints_applied in generate_meal_plan.

content = content.replace("intake.weekly_budget", "patient.weekly_budget")
content = content.replace("hasattr(intake, 'weekly_budget')", "hasattr(patient, 'weekly_budget')")
content = content.replace("intake.goal", "patient.goal")
content = content.replace("intake.goal_amount", "patient.goal_amount")
content = content.replace("intake.city", "patient.city")
content = content.replace("intake.country", "patient.country")

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced 'intake' with 'patient'")
