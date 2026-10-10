import os

schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'pantry_input: Optional[str]' not in content:
    content = content.replace(
        'pantry_items: Optional[List[str]] = Field(default=[], description="List of available pantry ingredients"),',
        'pantry_items: Optional[List[str]] = Field(default=[], description="List of available pantry ingredients"),\n    pantry_input: Optional[str] = Field(default=None, description="Natural language description of pantry items"),'
    )
    with open(schema_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added pantry_input to schemas.py")
