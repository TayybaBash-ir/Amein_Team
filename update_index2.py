import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_call = """        metabolic_modifier=float(patient.metabolic_modifier),
        weight_kg=float(patient.weight),"""

new_call = """        metabolic_modifier=float(patient.metabolic_modifier),
        macro_tweak=str(getattr(patient, "macro_tweak", "") or ""),
        weight_kg=float(patient.weight),"""

c = c.replace(old_call, new_call)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("index.py macro_tweak passed")
