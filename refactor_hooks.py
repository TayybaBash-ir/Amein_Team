import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the early returns and place them right before the first non-hook statement, or just after all useEffects.
# Let's find the exact early returns block.
early_returns_pattern = re.compile(
    r'(if \(user === undefined\) return.*?if \(!hasProfile\) \{.*?</button>\s*</div>\s*\);\s*\})',
    re.DOTALL
)

match = early_returns_pattern.search(content)
if not match:
    print("Could not find early returns!")
    exit(1)

early_returns = match.group(1)

# Remove the early returns from their original place
content = content.replace(early_returns, '')

# Now, we find the last useEffect block in the hooks section
# Looking for `setSavedProfile(null);\n    }\n  }, []);`
last_use_effect_pattern = re.compile(r'setSavedProfile\(null\);\n\s*\}\n\s*\}, \[\]\);', re.DOTALL)
last_match = last_use_effect_pattern.search(content)

if last_match:
    insertion_point = last_match.end()
    # Insert the early returns right after the last useEffect
    new_content = content[:insertion_point] + "\n\n  " + early_returns + content[insertion_point:]
    
    # Also change the default theme to light
    new_content = new_content.replace('useState<"dark" | "light">("dark")', 'useState<"dark" | "light">("light")')
    
    with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Hooks refactored and default theme changed!")
else:
    print("Could not find the last useEffect!")
