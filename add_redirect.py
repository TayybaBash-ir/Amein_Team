import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add automatic redirect to profile
effect_pattern = r'(\s*const savedProfile = localStorage\.getItem\("clima_patient_profile"\);\s*if \(savedProfile\) \{\s*try \{\s*const p = JSON\.parse\(savedProfile\);\s*setSavedProfile\(p\);\s*if \(p\.name && p\.weight\) setHasProfile\(true\);\s*\} catch \{\s*setSavedProfile\(null\);\s*\}\s*\}\s*\}, \[\]\);)'

replacement = r'''\1

  useEffect(() => {
    if (user !== undefined && user !== null && !hasProfile) {
      router.push('/profile');
    }
  }, [user, hasProfile, router]);
'''

if 'router.push(\'/profile\');' not in c or 'if (user !== undefined' not in c:
    c = re.sub(effect_pattern, replacement, c)
    with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Redirect injected!")
