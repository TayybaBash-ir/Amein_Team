import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_complete = """        onComplete={(newWeight: number, newModifier: number) => {
          try {
            const profile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
            profile.weight = newWeight;
            profile.metabolic_modifier = newModifier;
            localStorage.setItem("clima_patient_profile", JSON.stringify(profile));"""

new_complete = """        onComplete={(newWeight: number, newModifier: number, macroTweak: string) => {
          try {
            const profile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
            profile.weight = newWeight;
            profile.metabolic_modifier = newModifier;
            profile.macro_tweak = macroTweak;
            localStorage.setItem("clima_patient_profile", JSON.stringify(profile));"""

c = c.replace(old_complete, new_complete)

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
