import re

with open('src/app/profile/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update Profile type
if 'metabolic_modifier?: number;' not in c:
    c = c.replace('country: string;', 'country: string;\n  metabolic_modifier?: number;')

# 2. Update initialProfile
if 'metabolic_modifier: 1.0' not in c:
    c = c.replace('country: "Pakistan",', 'country: "Pakistan",\n  metabolic_modifier: 1.0,')

# 3. Update toProfile
to_profile_old = """      conditions: asList(stored.conditions),
      medical_history_notes: typeof stored.medical_history_notes === "string" ? stored.medical_history_notes : "",
    };"""

to_profile_new = """      conditions: asList(stored.conditions),
      medical_history_notes: typeof stored.medical_history_notes === "string" ? stored.medical_history_notes : "",
      activity: typeof stored.activity === "string" ? stored.activity : initialProfile.activity,
      goal: typeof stored.goal === "string" ? stored.goal : initialProfile.goal,
      goal_amount: typeof stored.goal_amount === "string" ? stored.goal_amount : initialProfile.goal_amount,
      city: typeof stored.city === "string" ? stored.city : initialProfile.city,
      country: typeof stored.country === "string" ? stored.country : initialProfile.country,
      metabolic_modifier: typeof stored.metabolic_modifier === "number" ? stored.metabolic_modifier : 1.0,
    };"""
c = c.replace(to_profile_old, to_profile_new)

# 4. Add getBmr and getTdee
math_logic = """
function getBmr(profile: Profile) {
  if (!profile.weight || !profile.height || !profile.age) return null;
  const isMale = profile.gender.toLowerCase() === "male";
  if (isMale) {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  }
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
}

function getTdee(profile: Profile, bmr: number | null) {
  if (!bmr) return null;
  let mult = 1.375;
  const act = (profile.activity || "").toLowerCase();
  if (act.includes("sedentary")) mult = 1.2;
  else if (act.includes("moderately")) mult = 1.55;
  else if (act.includes("very")) mult = 1.9;
  else if (act.includes("active")) mult = 1.725;
  else if (act.includes("lightly") || act.includes("light")) mult = 1.375;

  const mod = profile.metabolic_modifier || 1.0;
  return bmr * mult * mod;
}
"""
if 'function getBmr' not in c:
    c = c.replace('const inputClass', math_logic + '\nconst inputClass')

# 5. Inject bmr and tdee into the component body
if 'const bmr = getBmr(profile);' not in c:
    c = c.replace('const bmiCategory = bmi ? getBmiCategory(bmi) : null;', 'const bmiCategory = bmi ? getBmiCategory(bmi) : null;\n  const bmr = getBmr(profile);\n  const tdee = getTdee(profile, bmr);')

# 6. Add to the stats array
old_stats = """                ["Name", profile.name], ["Age", `${profile.age} years`],
                ["Gender", profile.gender], ["Height", `${profile.height} cm`],
                ["Weight", `${profile.weight} kg`],
                ["BMI", bmi ? `${bmi.toFixed(1)} — ${bmiCategory?.label}` : "-"],"""

new_stats = """                ["Name", profile.name], ["Age", `${profile.age} years`],
                ["Gender", profile.gender], ["Height", `${profile.height} cm`],
                ["Weight", `${profile.weight} kg`],
                ["BMI", bmi ? `${bmi.toFixed(1)} — ${bmiCategory?.label}` : "-"],
                ["BMR (Resting)", bmr ? `${Math.round(bmr)} kcal` : "-"],
                ["TDEE (Metabolic)", tdee ? `${Math.round(tdee)} kcal` : "-"],"""
c = c.replace(old_stats, new_stats)

# Wait, what if the string uses a different dash symbol in the codebase? Like \u2014 or similar?
# Let's use regex to replace the array of arrays directly
stats_regex = re.compile(r'\{\[\s*\["Name", profile\.name\].*?\["Weight", `\$\{profile\.weight\} kg`\],\s*\["BMI", bmi \? `\$\{bmi\.toFixed\(1\)\} [^`]+` : "-"\](?:,\s*)?\s*\]\.map')
replacement = r"""{[
                  ["Name", profile.name], ["Age", `${profile.age} years`],
                  ["Gender", profile.gender], ["Height", `${profile.height} cm`],
                  ["Weight", `${profile.weight} kg`],
                  ["BMI", bmi ? `${bmi.toFixed(1)} — ${bmiCategory?.label}` : "-"],
                  ["BMR (Resting)", bmr ? `${Math.round(bmr)} kcal` : "-"],
                  ["TDEE (Metabolic)", tdee ? `${Math.round(tdee)} kcal` : "-"],
                ].map"""
c = re.sub(stats_regex, replacement, c)

with open('src/app/profile/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Profile page updated with BMR and TDEE math!")
