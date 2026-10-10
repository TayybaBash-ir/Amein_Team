import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the route signature
old_sig = "def log_interaction(log: InteractionLog):"
new_sig = "def log_interaction(log: dict):\n    record = log"
c = c.replace(old_sig, new_sig)

# But wait, inside log_interaction, it does `record = log.dict()`
old_dict = "    record = log.dict()"
new_dict = ""
c = c.replace(old_dict, new_dict)

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed log_interaction signature!")
