import re

# 1. Update plans/page.tsx
with open('src/app/plans/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_selected_plan = """      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {selectedPlan ? ("""

new_selected_plan = """      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12" {...(selectedPlan ? { "data-no-page-swipe": "true" } : {})}>
        {selectedPlan && (
          <style>{`
            nav[aria-label="Main navigation"] { display: none !important; }
          `}</style>
        )}
        {selectedPlan ? ("""

c = c.replace(old_selected_plan, new_selected_plan)

with open('src/app/plans/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Update MealDetail.tsx (increase z-index and add data-no-page-swipe)
with open('src/components/clima/MealDetail.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">',
              '<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" data-no-page-swipe>')

with open('src/components/clima/MealDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Nav bar hiding and swipe blocking applied!")
