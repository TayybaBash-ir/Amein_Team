import os

schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'acute_illness: Optional[str]' not in content:
    content = content.replace(
        "weekly_budget: Optional[str]",
        "acute_illness: Optional[str] = Field(default=None, description='e.g. flu, cough, sore throat'),\n    weekly_budget: Optional[str]"
    )
    with open(schema_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched schemas.py")
