import os
import re

schema_file = 'api/schemas.py'
with open(schema_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'weekly_budget' not in content:
    content = content.replace(
        "allow_external_dining: bool = Field(",
        "weekly_budget: Optional[str] = Field(default='No Limit', description='e.g., No Limit, Under 5,000 PKR, 5,000 - 10,000 PKR'),\n    allow_external_dining: bool = Field("
    )
    # Also add cost to Meal schema so frontend can see it
    content = content.replace(
        "benefits: List[str] = Field(..., description=\"3-4 short points on why this meal helps them\")",
        "benefits: List[str] = Field(..., description=\"3-4 short points on why this meal helps them\")\n    estimated_cost: Optional[float] = Field(None, description=\"Estimated cost in PKR\")"
    )
    with open(schema_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added weekly_budget to schemas.py")
else:
    print("weekly_budget already in schemas.py")
