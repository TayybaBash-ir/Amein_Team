import re

with open('api/schemas.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add macro_tweak to PatientIntake
if 'macro_tweak:' not in c:
    c = c.replace('metabolic_modifier: float = 1.0', 'metabolic_modifier: float = 1.0\n    macro_tweak: Optional[str] = ""')

# Add CheckInRequest
if 'class CheckInRequest' not in c:
    c = c + '''\n
class CheckInRequest(BaseModel):
    patient: PatientIntake
    feedback_text: str
    new_weight: float
'''

with open('api/schemas.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("schemas updated")
