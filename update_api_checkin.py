import re

with open('api/index.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add imports
if 'from api.schemas import' in c:
    c = c.replace('from api.schemas import (', 'from api.schemas import (\n    CheckInRequest,')

if 'from api.ml_feedback import analyze_feedback' not in c:
    c = c.replace('from api.llm_classifier import analyze_clinical_conditions, RECOVERY_FORBIDDEN_TERMS', 'from api.llm_classifier import analyze_clinical_conditions, RECOVERY_FORBIDDEN_TERMS\nfrom api.ml_feedback import analyze_feedback')

# Add endpoint
new_endpoint = '''
@app.post("/api/checkin")
def process_checkin(req: CheckInRequest):
    try:
        weight_change = req.new_weight - req.patient.weight
        ai_analysis = analyze_feedback(req.feedback_text, req.patient.goal or "maintain", weight_change)
        
        # update the modifier
        new_modifier = req.patient.metabolic_modifier * ai_analysis.get("recommended_tdee_multiplier", 1.0)
        # bound the modifier
        new_modifier = max(0.6, min(1.5, new_modifier))
        
        return {
            "new_weight": req.new_weight,
            "new_modifier": round(new_modifier, 3),
            "macro_tweak": ai_analysis.get("macro_tweak", "none"),
            "explanation": ai_analysis.get("explanation", "Adjusted based on feedback.")
        }
    except Exception as e:
        return {"error": str(e)}
'''

if '/api/checkin' not in c:
    c = c + new_endpoint

with open('api/index.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("index updated")
