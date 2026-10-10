import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Extract the ml-profile endpoint
ml_pattern = re.compile(r'(@app\.get\("/api/ml-profile"\).*?return \{"status": "error", "message": str\(e\)\})', re.DOTALL)
m = ml_pattern.search(c)
if m:
    ml_block = m.group(1)
    # Remove it from current location
    c = c[:m.start()] + c[m.end():]
    
    # 2. Insert it BEFORE the /api/plan/{plan_id} route
    plan_pattern = re.compile(r'@app\.get\("/api/plan/\{plan_id\}"\)')
    p = plan_pattern.search(c)
    if p:
        c = c[:p.start()] + ml_block + "\n\n" + c[p.start():]
        
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Moved /api/ml-profile above dynamic routes!")
else:
    print("Could not find /api/ml-profile block")
