with open('src/app/dashboard/page.tsx', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.finditer(r'step === "(input|loading|results)"(.*?)(?=step ===|$)', text, re.DOTALL)
for m in matches:
    print(f"=== {m.group(1)} ===")
    print(m.group(2)[:1000])
