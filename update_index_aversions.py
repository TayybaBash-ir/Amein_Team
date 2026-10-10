import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_constraints = """    if patient.allergies: constraints.extend(patient.allergies)
    if patient.dietary_restrictions: constraints.extend(patient.dietary_restrictions)
    if patient.conditions: constraints.extend(patient.conditions)
    if patient.medical_history_notes: constraints.append(f"Medical notes: {patient.medical_history_notes}")
    constraints.append(f"Goal: {patient.goal} {patient.goal_amount}")"""

new_constraints = """    if patient.allergies: constraints.extend(patient.allergies)
    if patient.dietary_restrictions: constraints.extend(patient.dietary_restrictions)
    if patient.conditions: constraints.extend(patient.conditions)
    if getattr(patient, "temporary_aversions", None): constraints.append(f"Must Avoid: {patient.temporary_aversions}")
    if getattr(patient, "acute_illness", None): constraints.append(f"Current Symptoms: {patient.acute_illness}")
    if patient.medical_history_notes: constraints.append(f"Medical notes: {patient.medical_history_notes}")
    constraints.append(f"Goal: {patient.goal} {patient.goal_amount}")"""

c = c.replace(old_constraints, new_constraints)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("index constraints updated")
