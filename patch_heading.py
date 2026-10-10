import os
import re

page_file = 'src/app/dashboard/page.tsx'
with open(page_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'<div className="mb-8">\s*<h1.*?New Plan Generation.*?</div>', '', content, flags=re.DOTALL)

with open(page_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed old heading")
