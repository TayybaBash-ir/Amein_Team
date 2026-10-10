import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_block = """def log_interaction(log: InteractionLog):
    import time
    import json
    record = log.dict()
    record['timestamp'] = time.time()
    try:
        with open("ml_interactions.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\\n")
    except Exception as e:
        print("Failed to log:", e)
    return {"status": "recorded"}"""

new_block = """def log_interaction(log: InteractionLog):
    import time
    import json
    import os
    record = log.dict()
    record['timestamp'] = time.time()
    
    # 1. Supabase (Persistent)
    try:
        from api.db_manager import get_supabase_client
        supabase = get_supabase_client()
        supabase.table('ml_interactions').insert(record).execute()
    except Exception as e:
        print("Supabase log failed:", e)
        
    # 2. Local Fallback (Vercel limits to /tmp)
    try:
        file_path = "/tmp/ml_interactions.jsonl" if os.environ.get("VERCEL") else "ml_interactions.jsonl"
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\\n")
    except Exception as e:
        print("Local log failed:", e)
        
    return {"status": "recorded"}"""

if old_block in c:
    c = c.replace(old_block, new_block)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed log_interaction for good!")
else:
    print("STILL couldn't find it.")
