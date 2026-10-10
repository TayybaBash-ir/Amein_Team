import json

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Let's find the log_interaction function
old_log = """def log_interaction(log: InteractionLog):
    try:
        with open("ml_interactions.jsonl", "a") as f:
            f.write(json.dumps(log.model_dump()) + "\\n")
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

new_log = """def log_interaction(log: InteractionLog):
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

c = c.replace(old_log, new_log)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated log_interaction to use Supabase + JSONL")
