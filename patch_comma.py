import os
import re

schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the trailing comma on pantry_input
content = content.replace(
    'pantry_input: Optional[str] = Field(default=None, description="Natural language description of pantry items"),',
    'pantry_input: Optional[str] = Field(default=None, description="Natural language description of pantry items")'
)

with open(schema_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed trailing comma in schemas.py")
