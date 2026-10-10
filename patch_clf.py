import os
import re

clf_file = 'api/llm_classifier.py'
with open(clf_file, 'r', encoding='utf-8') as f:
    clf = f.read()

# Update ClinicalRules schema
if 'illness_advice: Optional[str]' not in clf:
    clf = clf.replace(
        "goal_advice: str = Field(",
        "illness_advice: Optional[str] = Field(description=\"Strict dietary constraints and healing foods advice if the user is ill (e.g., 'Avoid cold dairy and fried food. Focus on warm soups.'). Otherwise null.\")\n    goal_advice: str = Field("
    )

# Update analyze_clinical_conditions signature
if 'acute_illness: Optional[str] = None' not in clf:
    clf = clf.replace(
        "avg_temp: Optional[float] = None,",
        "avg_temp: Optional[float] = None,\n    acute_illness: Optional[str] = None,"
    )

# Update fallback
if 'illness_advice=None' not in clf:
    clf = clf.replace(
        "caloric_modifier=-500",
        "illness_advice=None,\n        caloric_modifier=-500"
    )

# Add illness to prompt
if 'f"Acute Illness/Symptoms' not in clf:
    clf = clf.replace(
        'f"Local 7-Day Average Temp: {avg_temp} C",',
        'f"Local 7-Day Average Temp: {avg_temp} C",\n        f"Acute Illness/Symptoms: {acute_illness}" if acute_illness else "",'
    )

# Update JSON structure prompt
if '"illness_advice": "str | null"' not in clf:
    clf = clf.replace(
        '"goal_advice": "str"',
        '"illness_advice": "str | null",\n  "goal_advice": "str"'
    )

with open(clf_file, 'w', encoding='utf-8') as f:
    f.write(clf)
print("Patched llm_classifier.py")
