import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf8') as f:
    content = f.read()

# 1. Add Header to Intake Form
header_html = '''<motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-3xl">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create Your Daily Meal Plan</h2>
                    <p className="text-muted-foreground">Tell us about yourself so we can curate meals tailored to your health and weather.</p>
                  </div>'''
content = content.replace(
    '<motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-3xl">',
    header_html
)

# 2. Fix Loading Screen
content = content.replace(
    'text-white mb-2">Preparing Your Custom Meal Plan...</h3>',
    'text-foreground mb-2">Preparing Your Custom Meal Plan...</h3>'
)
content = content.replace(
    'Tailoring health-safe dishes to your local weather and personal profile...',
    'Tailoring health-safe dishes to your weather and medical profile...'
)

# 3. Fix Profile Summary
# The file has a broken character. We'll use a regex to match the paragraph block.
summary_pattern = re.compile(r'<p className="text-xs sm:text-sm text-muted-foreground">\s*Perfectly balanced for.*?<\/p>', re.DOTALL)
replacement_summary = '''<p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span>Personalized nutrition plan tailored</span>
                          <span className="text-brand text-lg leading-none">&bull;</span>
                          <span>Goal: {savedProfile?.goal || plan.patient?.goal || "Improve health"}</span>
                        </p>'''

content = summary_pattern.sub(replacement_summary, content)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf8') as f:
    f.write(content)

print("Dashboard copy updated successfully!")
