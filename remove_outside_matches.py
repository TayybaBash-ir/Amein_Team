import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# The block starts with `{plan.outside_order_matches &&`
# and we want to remove the entire block. Let's just find the exact block and replace it.
block_pattern = re.compile(r'\{\s*/\* OUTSIDE ORDER MATCHES \*/\s*\}.*?bg-\[#222627\].*?</div>\s*\)\}', re.DOTALL)
c = re.sub(block_pattern, '', c)

with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Removed outside order matches block!")
