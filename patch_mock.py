import os

mock_file = 'src/lib/mock.ts'
with open(mock_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'weekly_budget?: string;' not in content:
    content = content.replace(
        "allow_external_dining?: boolean;",
        "weekly_budget?: string;\n    allow_external_dining?: boolean;"
    )
    content = content.replace(
        "allow_external_dining: true,",
        "weekly_budget: \"No Limit\",\n      allow_external_dining: true,"
    )
    with open(mock_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched mock.ts")
