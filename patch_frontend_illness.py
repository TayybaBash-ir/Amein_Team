import os

mock_file = 'src/lib/mock.ts'
with open(mock_file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'acute_illness?: string;' not in content:
    content = content.replace(
        "weekly_budget?: string;",
        "acute_illness?: string;\n    weekly_budget?: string;"
    )
    with open(mock_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched mock.ts")

form_file = 'src/components/clima/ClinicalIntakeForm.tsx'
with open(form_file, 'r', encoding='utf-8') as f:
    form = f.read()

if 'showIllness' not in form:
    # Add state hook for showIllness toggle right after other hooks
    form = form.replace(
        "const [submitted, setSubmitted] = useState<IntakeData | null>(null);",
        "const [submitted, setSubmitted] = useState<IntakeData | null>(null);\n  const [showIllness, setShowIllness] = useState(false);"
    )
    
    # Add acute_illness to default state
    form = form.replace(
        'weekly_budget: "No Limit",',
        'weekly_budget: "No Limit",\n      acute_illness: "",'
    )
    
    # Inject the Illness section before the Weekly Budget
    illness_ui = """
          <div className="mt-4 border-t border-white/5 pt-4">
            <button 
              type="button" 
              onClick={() => setShowIllness(!showIllness)}
              className="clinical-label text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 mb-2"
            >
              {showIllness ? "▼" : "▶"} Not feeling well?
            </button>
            {showIllness && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                <label className="clinical-label text-[10px] sm:text-xs">Symptoms / Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g., Flu, cough, sore throat, fever"
                  className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
                  value={d.acute_illness || ""}
                  onChange={(e) => set("acute_illness", e.target.value)}
                />
                <p className="text-[10px] text-neutral-500 mt-1">We will tailor your diet to help you heal and avoid foods that make it worse.</p>
              </div>
            )}
          </div>
"""
    form = form.replace(
        '<div className="mt-4">\n            <label className="clinical-label text-[10px] sm:text-xs">Weekly Budget</label>',
        illness_ui + '\n          <div className="mt-4">\n            <label className="clinical-label text-[10px] sm:text-xs">Weekly Budget</label>'
    )
    
    with open(form_file, 'w', encoding='utf-8') as f:
        f.write(form)
    print("Patched form")
