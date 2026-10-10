import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

profile_endpoint = """
@app.get("/api/ml-profile")
def get_ml_profile(user_id: str = "anon"):
    \"\"\"
    Exposes the dynamically learned ML weights for a user.
    Great for demonstrating the ML engine to judges!
    \"\"\"
    try:
        from api.ml_recommender import parse_interactions
        prefs = parse_interactions()
        # Sort weights so the biggest penalties (dislikes) and boosts (likes) are easy to see
        user_weights = prefs.get(user_id, {})
        sorted_weights = dict(sorted(user_weights.items(), key=lambda item: item[1]))
        return {
            "status": "success",
            "user_id": user_id,
            "learned_preferences": sorted_weights,
            "explanation": "Negative scores mean the user LIKES this ingredient (it gets a score boost). Positive scores mean the user DISLIKES it (it gets penalized in the matching engine)."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

"""

# Insert before the last line if possible, or just append if there's no conflict.
# Let's insert it right before the final `if __name__ == "__main__":` or at the end.
if 'if __name__ == "__main__":' in c:
    c = c.replace('if __name__ == "__main__":', profile_endpoint + '\nif __name__ == "__main__":')
else:
    c += "\n" + profile_endpoint

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Added /api/ml-profile endpoint!")
