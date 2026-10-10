import os

scorecard_file = 'src/components/clima/MacroScorecard.tsx'
with open(scorecard_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Calculated for this patient", "Your Daily Targets")
content = content.replace(
    'className="clinical-card fade-up"',
    'className="rounded-[2rem] border border-white/[0.04] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] fade-up"'
)
content = content.replace(
    'rounded-2xl border border-white/10 bg-white/[0.04] p-3',
    'rounded-3xl border border-white/[0.03] bg-white/[0.03] p-4 transition-transform hover:scale-[1.02]'
)

with open(scorecard_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched MacroScorecard")
