import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Inject Hydration Weather Math
math_old = 'cupsGoal = Math.min(20, Math.max(8, Math.round((weight * 35) / 250)));'
math_new = '''let extraCups = 0;
      const weatherText = JSON.stringify(activePlan.plan.weather || "").toLowerCase();
      if (weatherText.includes("hot") || weatherText.includes("warm") || weatherText.includes("sunny")) {
        extraCups = 3;
      }
      cupsGoal = Math.min(20, Math.max(8, Math.round((weight * 35) / 250) + extraCups));'''
c = c.replace(math_old, math_new)


# 2. Inject Check-in button into the top of the Meal Details modal
modal_header_old = r'(<h2 id="today-meals-title" className="text-lg font-bold text-foreground sm:text-xl">Today&apos;s meals</h2>\s*<p className="text-xs text-muted-foreground">\{totalKcal\} kcal planned · \{todayPlan\.meals\.length\} meals</p>\s*</div>)'
modal_header_new = r'''\1
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCheckInOpen(true); }}
                  className="ml-auto mr-3 rounded-lg border border-brand bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  Weekly Check-In
                </button>'''
c = re.sub(modal_header_old, modal_header_new, c)

# 3. Add the CheckInModal component inside DashboardBento at the end (before final closing div)
modal_tag = """
      <CheckInModal 
        isOpen={checkInOpen} 
        onClose={() => setCheckInOpen(false)} 
        userProfile={(() => {
          try {
            return JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
          } catch { return {}; }
        })()}
        onComplete={(newWeight: number, newModifier: number) => {
          try {
            const profile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
            profile.weight = newWeight;
            profile.metabolic_modifier = newModifier;
            localStorage.setItem("clima_patient_profile", JSON.stringify(profile));
            setCheckInOpen(false);
            window.location.reload();
          } catch {}
        }}
      />
    </div>
"""
c = re.sub(r'\s*</div>\s*\);\s*\}\s*$', modal_tag + '\n  );\n}', c)

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Dashboard bento updated")
