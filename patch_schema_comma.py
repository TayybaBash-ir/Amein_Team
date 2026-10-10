import os
schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "weekly_budget: Optional[str] = Field(default='No Limit', description='e.g., No Limit, Under 5,000 PKR, 5,000 - 10,000 PKR'),",
    "weekly_budget: Optional[str] = Field(default='No Limit', description='e.g., No Limit, Under 5,000 PKR, 5,000 - 10,000 PKR')"
)

with open(schema_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed schemas.py trailing comma")
