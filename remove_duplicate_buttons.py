import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Pattern to remove the bad block:
# It starts with {/* TRACKING BUTTONS */} 
# And ends with Undo</button> \n )} \n </div> \n )}
bad_block_pattern = re.compile(r'(\s*\{/\* TRACKING BUTTONS \*/\}.*?Undo</button>\s*\)\}\s*</div>\s*\)\})', re.DOTALL)

m = bad_block_pattern.search(c)
if m:
    c = c[:m.start()] + c[m.end():]
    with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Deleted duplicate tracking buttons!")
else:
    print("Could not find duplicate block.")
