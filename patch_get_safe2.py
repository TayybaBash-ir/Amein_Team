import os

idx_file = 'api/index.py'
with open(idx_file, 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = 'acute_illness=getattr(intake if "intake" in locals() else req.patient, "acute_illness", None)'

if bad_str in content:
    # First, let's split the file into generate_meal_plan and swap_meal to safely replace
    parts = content.split('def swap_meal')
    
    parts[0] = parts[0].replace(bad_str, 'acute_illness=getattr(patient, "acute_illness", None)')
    parts[1] = parts[1].replace(bad_str, 'acute_illness=getattr(req.patient, "acute_illness", None)')
    
    content = 'def swap_meal'.join(parts)
    with open(idx_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed with string replacement")
else:
    print("String not found")
