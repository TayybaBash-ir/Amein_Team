from __future__ import annotations
import os
import json
import concurrent.futures
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class ClinicalRules(BaseModel):
    forbidden_ingredients: List[str] = Field(description="List of ingredients the patient MUST NEVER consume due to their medical conditions, allergies, or diet restrictions.")
    forced_climate: Optional[str] = Field(description="If the patient has a disease requiring warming/cooling foods (e.g., flu requires warming), output 'warming' or 'cooling'. Otherwise null.")
    macro_tweaks: Dict[str, str] = Field(description="Instructions for macro ratio adjustments, e.g. {'carbs': 'low', 'protein': 'high'}")
    caloric_modifier: int = Field(description="Exact integer of calories to add or subtract from TDEE. e.g. -500 for standard weight loss, +300 for bulking, -200 for body recomposition (lose fat gain muscle), 0 for maintenance.")
    goal_advice: str = Field(description="A brief 1-sentence clinical advice explaining how the plan achieves their specific weight/health goal.")

def analyze_clinical_conditions(
    conditions: List[str],
    allergies: List[str],
    diet: List[str],
    goal: str,
    goal_amount: str,
    avg_temp: Optional[float] = None,
    pantry_items: Optional[List[str]] = None,
    forbidden_items: Optional[List[str]] = None,
) -> ClinicalRules:
    fallback = ClinicalRules(
        forbidden_ingredients=[],
        forced_climate=None,
        macro_tweaks={},
        caloric_modifier=-500 if "los" in goal.lower() or "loos" in goal.lower() or "cut" in goal.lower() else (300 if "gain" in goal.lower() or "bulk" in goal.lower() else 0),
        goal_advice=f"[Fast Fallback] Macros tailored to your target of {goal} {goal_amount}."
    )
    
    selected_pantry = [item.strip() for item in (pantry_items or []) if item.strip()]
    forbidden_list = [item for item in (forbidden_items or []) if item]
    pantry_constraint = ""
    if selected_pantry:
        pantry_constraint = (
            "STRICT NEGATIVE CONSTRAINT (FORBIDDEN INGREDIENTS):\n"
            "The following ingredients are STRICTLY FORBIDDEN from appearing in ANY meal or dish title:\n["
            + ", ".join(forbidden_list)
            + "].\nDO NOT generate or include any dish with 'chicken' in the name or ingredient list "
            "(e.g., No Chicken Karahi, No Chicken Club Sandwich, No Chicken Curry).\n"
            "ALLOWED PROTEINS ONLY: Use ONLY ["
            + ", ".join(selected_pantry)
            + "] as your protein sources for Lunch and Dinner."
        )

    prompt_lines = [
        "You are an expert clinical nutritionist AI. Evaluate these patient constraints and GOALS:",
        f"Conditions: {conditions}",
        f"Allergies: {allergies}",
        f"Dietary Restrictions: {diet}",
        f"Primary Goal: {goal}",
        f"Goal Target: {goal_amount}",
        f"Local 7-Day Average Temp: {avg_temp} C",
    ]
    if pantry_constraint:
        prompt_lines.append(pantry_constraint)
    prompt_lines.extend([
        "",
        "Analyze the exact wording of the Goal.",
        'If they say "lose 5kg and gain 2kg muscle", they want body recomposition -> slight deficit (-200) and high protein.',
        "If they just want to lose weight -> standard deficit (-500) and high protein.",
        "If they want to gain mass -> surplus (+300 to +500).",
        "Output the exact caloric_modifier integer.",
        "",
        "Also apply medical rules (e.g. forbid high sodium if hypertension, forbid gluten if celiac).",
        "",
        "Return EXACTLY AND ONLY this JSON structure (no markdown blocks):",
        "{",
        '  "forbidden_ingredients": ["str"],',
        '  "forced_climate": "warming | cooling | null",',
        '  "macro_tweaks": {"protein": "high", "carbs": "low"},',
        '  "caloric_modifier": -500,',
        '  "goal_advice": "str"',
        "}",
    ])
    prompt = "\n".join(prompt_lines)
    
    # 1. Try Groq (Super fast, 2.5s timeout)
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        import requests
        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-8b-8192",
                    "response_format": {"type": "json_object"},
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 400,
                    "temperature": 0.1
                },
                timeout=2.5
            )
            if res.status_code == 200:
                data = json.loads(res.json()["choices"][0]["message"]["content"])
                return ClinicalRules(**data)
        except Exception:
            pass
            
    # 2. Try Gemini using httpx directly for a strict timeout without threadpool blocking!
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        import requests
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json"
                }
            }
            res = requests.post(url, json=payload, timeout=2.5)
            if res.status_code == 200:
                data = json.loads(res.json()["candidates"][0]["content"]["parts"][0]["text"])
                return ClinicalRules(**data)
        except Exception:
            pass

    return fallback

