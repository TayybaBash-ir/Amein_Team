import os
clf_file = 'api/llm_classifier.py'
with open(clf_file, 'r', encoding='utf-8') as f:
    clf = f.read()

clf = clf.replace(
    '\'  "illness_advice": "str | null",\n  "goal_advice": "str"\'',
    '\'  "illness_advice": "str | null",\',\n        \'  "goal_advice": "str"\''
)

with open(clf_file, 'w', encoding='utf-8') as f:
    f.write(clf)
print("Fixed syntax error")
