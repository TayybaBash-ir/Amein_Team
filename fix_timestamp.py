import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the timestamp from record to prevent Supabase crash
bad_block = """    record['timestamp'] = time.time()
    
    # 1. Supabase (Persistent)"""

good_block = """    
    # 1. Supabase (Persistent)"""
    
if bad_block in c:
    c = c.replace(bad_block, good_block)
    with open('api/index.py', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed timestamp bug!")
else:
    print("Couldn't find timestamp block")
