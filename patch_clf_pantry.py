import os
import re

clf_file = 'api/llm_classifier.py'
with open(clf_file, 'r', encoding='utf-8') as f:
    clf = f.read()

# 1. Update ClinicalRules schema
if 'extracted_pantry: List[str]' not in clf:
    clf = clf.replace(
        "goal_advice: str = Field(",
        "extracted_pantry: List[str] = Field(description=\"List of single-word ingredients extracted from the user's pantry input text. E.g. ['chicken', 'rice', 'onion']. Empty list if none provided.\")\n    goal_advice: str = Field("
    )

# 2. Update analyze_clinical_conditions signature
if 'pantry_input: Optional[str] = None' not in clf:
    clf = clf.replace(
        "pantry_items: Optional[List[str]] = None,",
        "pantry_items: Optional[List[str]] = None,\n    pantry_input: Optional[str] = None,"
    )

# 3. Update fallback
if 'extracted_pantry=[]' not in clf:
    clf = clf.replace(
        "caloric_modifier=-500",
        "extracted_pantry=[],\n        caloric_modifier=-500"
    )

# 4. Add pantry input to the prompt lines
if 'f"User Pantry Input' not in clf:
    clf = clf.replace(
        'f"Primary Goal: {goal}",',
        'f"Primary Goal: {goal}",\n        f"User Pantry Input: {pantry_input}" if pantry_input else "",'
    )

# 5. Update JSON structure
if '"extracted_pantry": ["str"]' not in clf:
    clf = clf.replace(
        '\'  "forbidden_ingredients": ["str"],\',',
        '\'  "forbidden_ingredients": ["str"],\',\n        \'  "extracted_pantry": ["str"],\','
    )

with open(clf_file, 'w', encoding='utf-8') as f:
    f.write(clf)
print("Patched llm_classifier.py")
