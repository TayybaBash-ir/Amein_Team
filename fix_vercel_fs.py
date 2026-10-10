import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_log = """def log_interaction(log: InteractionLog):
    try:
        log_data = log.model_dump()
        # 1. Save to local JSONL (fast, but ephemeral on Vercel)
        with open("ml_interactions.jsonl", "a") as f:
            f.write(json.dumps(log_data) + "\\n")
            
        # 2. Try to sync to Supabase (persistent database)
        try:
            from api.db_manager import get_supabase_client
            supabase = get_supabase_client()
            # We store it in a generic telemetry table, or fallback if it doesn't exist
            supabase.table('ml_interactions').insert(log_data).execute()
        except Exception:
            pass # Fail silently if table doesn't exist yet, we still have jsonl
            
        return {"status": "ok", "saved": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

new_log = """def log_interaction(log: InteractionLog):
    try:
        log_data = log.model_dump()
        
        # 1. Try to sync to Supabase (persistent database)
        try:
            from api.db_manager import get_supabase_client
            supabase = get_supabase_client()
            supabase.table('ml_interactions').insert(log_data).execute()
        except Exception as db_e:
            print("Supabase logging failed:", db_e)
            
        # 2. Save to local JSONL (fallback, might fail on Vercel read-only FS)
        try:
            import os
            # If on Vercel, we can only write to /tmp
            file_path = "/tmp/ml_interactions.jsonl" if os.environ.get("VERCEL") else "ml_interactions.jsonl"
            with open(file_path, "a") as f:
                f.write(json.dumps(log_data) + "\\n")
        except Exception as fs_e:
            print("Local logging failed:", fs_e)
            
        return {"status": "ok", "saved": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

if old_log in c:
    c = c.replace(old_log, new_log)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed log_interaction endpoint!")
else:
    print("Could not find old log_interaction block")
