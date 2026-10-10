import os
import json
from typing import Dict, Any
import requests

def analyze_feedback(feedback_text: str, goal: str, weight_change: float) -> Dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {
            "recommended_tdee_multiplier": 1.0,
            "macro_tweak": "none",
            "explanation": "No AI key configured. Defaults kept."
        }
        
    prompt = f"""You are an advanced reinforcement learning surrogate model for a clinical nutrition app.
The user's goal is: {goal}. Their weight changed by {weight_change:.2f} kg this week (Negative means they lost weight, positive means they gained).
Their free-text feedback is: "{feedback_text}"

You must analyze their metabolic response, adherence, and insulin crash patterns based on this text.
Determine if they need a caloric adjustment (multiplier) and if they need a macro split shift (e.g. more protein if hungry, lower carbs if crashing).

Output a valid JSON object EXACTLY like this (and absolutely nothing else):
{{
  "adherence_score": 0.8,
  "satiety_score": 0.4,
  "energy_score": 0.3,
  "recommended_tdee_multiplier": 1.05,
  "macro_tweak": "higher_protein",
  "explanation": "Because you felt starving at 3 PM and lost more weight than expected, I am bumping your calories by 5% and heavily shifting your macros toward protein to keep you full."
}}

For macro_tweak, choose EXACTLY ONE of: "higher_protein", "higher_fat", "lower_carb", "higher_carb", "none".
For recommended_tdee_multiplier, keep it between 0.85 and 1.15. 1.0 means no change."""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.0,
                "response_format": {"type": "json_object"},
            },
            timeout=12,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        result = json.loads(content)
        multiplier = float(result.get("recommended_tdee_multiplier", 1.0))
        if not 0.85 <= multiplier <= 1.15:
            result["recommended_tdee_multiplier"] = max(0.85, min(1.15, multiplier))
        if result.get("macro_tweak") not in {"higher_protein", "higher_fat", "lower_carb", "higher_carb", "none"}:
            result["macro_tweak"] = "none"
        return result
    except Exception as e:
        print("ML Feedback Error:", e)
        return {
            "recommended_tdee_multiplier": 1.0,
            "macro_tweak": "none",
            "explanation": "Could not parse AI response. Retaining previous targets."
        }
