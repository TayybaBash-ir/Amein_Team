import os

schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the trailing comma on acute_illness
content = content.replace(
    "acute_illness: Optional[str] = Field(default=None, description='e.g. flu, cough, sore throat'),",
    "acute_illness: Optional[str] = Field(default=None, description='e.g. flu, cough, sore throat')"
)

with open(schema_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed trailing comma on acute_illness")
