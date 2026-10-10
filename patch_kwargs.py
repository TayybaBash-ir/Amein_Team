import os
import re

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(',\n        acute_illness=getattr(patient, "acute_illness", None)', '')
content = content.replace(',\n        acute_illness=getattr(req.patient, "acute_illness", None)', '')
# in case there is trailing comma
content = content.replace(', acute_illness=getattr(patient, "acute_illness", None)', '')
content = content.replace(', acute_illness=getattr(req.patient, "acute_illness", None)', '')

with open(idx_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed invalid kwarg from get_safe_dishes calls")
