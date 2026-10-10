import re

with open('api/ml_recommender.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('INTERACTIONS_FILE = "ml_interactions.jsonl"', 'import os\nINTERACTIONS_FILE = "/tmp/ml_interactions.jsonl" if os.environ.get("VERCEL") else "ml_interactions.jsonl"')

with open('api/ml_recommender.py', 'w', encoding='utf-8') as f:
    f.write(c)
