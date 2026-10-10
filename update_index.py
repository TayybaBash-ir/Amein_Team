import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_call = """    targets = get_nutritional_targets(
        weight_kg=float(patient.weight),
        height_cm=float(patient.height),
        age=int(patient.age),
        gender=str(patient.gender),
        activity_level=str(patient.activity),
        goal=str(patient.goal),
    )"""

new_call = """    targets = get_nutritional_targets(
        plan_mode=str(patient.plan_mode),
        metabolic_modifier=float(patient.metabolic_modifier),
        weight_kg=float(patient.weight),
        height_cm=float(patient.height),
        age=int(patient.age),
        gender=str(patient.gender),
        activity_level=str(patient.activity),
        goal=str(patient.goal),
    )"""

c = c.replace(old_call, new_call)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("index.py updated")
