import re

with open('api/schemas.py', 'r', encoding='utf-8') as f:
    c = f.read()

if 'temporary_aversions:' not in c:
    c = c.replace('acute_illness: Optional[str]', 'acute_illness: Optional[str]\n    temporary_aversions: Optional[str] = Field(default=None, description="Foods they want to avoid this week")')

with open('api/schemas.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("schema updated")
