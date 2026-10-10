import re

with open('src/lib/mock.ts', 'r', encoding='utf-8') as f:
    c = f.read()

if 'temporary_aversions?: string;' not in c:
    c = c.replace('acute_illness?: string;', 'acute_illness?: string;\n  temporary_aversions?: string;')

with open('src/lib/mock.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("mock.ts updated")
