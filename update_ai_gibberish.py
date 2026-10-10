import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_guidance = """            "AI: " + (plan_rules.clinical_guidance if hasattr(plan_rules, 'clinical_guidance') else "[Fast Fallback] Macros tailored to your target of " + (req.patient.goal or "maintain") + ".")"""

new_guidance = """            "AI: " + (re.sub(r'[^a-zA-Z0-9 \\.\\,\\!\\?\\-\\'\\"]', '', plan_rules.clinical_guidance) if hasattr(plan_rules, 'clinical_guidance') and plan_rules.clinical_guidance else "[Fast Fallback] Macros tailored to your target of " + (req.patient.goal or "maintain") + ".")"""

c = c.replace(old_guidance, new_guidance)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("Clinical guidance sanitizer added!")
