import os
import re

mock_file = 'src/lib/mock.ts'
with open(mock_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'estimated_cost?: number;' not in content:
    content = content.replace(
        "fat: number;",
        "fat: number;\n  estimated_cost?: number;"
    )
    with open(mock_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched mock.ts meal schema")
