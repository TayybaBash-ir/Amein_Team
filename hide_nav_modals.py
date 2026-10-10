import re

def inject_style(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    style_tag = """
      <style>{`nav[aria-label="Main navigation"] { display: none !important; }`}</style>"""
      
    # For MealDetail.tsx
    if 'MealDetail' in file_path:
        target = 'data-no-page-swipe>'
        if style_tag not in c:
            c = c.replace(target, target + style_tag)
            
    # For SwapMealModal.tsx
    if 'SwapMealModal' in file_path:
        target = 'data-no-page-swipe>'
        if style_tag not in c:
            c = c.replace(target, target + style_tag)
            
    # For CheckInModal.tsx
    if 'CheckInModal' in file_path:
        target = 'backdrop-blur-sm">'
        if style_tag not in c:
            c = c.replace(target, target + style_tag)
            
    # For DashboardBento.tsx
    if 'DashboardBento' in file_path:
        target = 'data-no-page-swipe'
        if style_tag not in c:
            c = c.replace(target + '\n            >', target + '\n            >' + style_tag)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(c)

inject_style('src/components/clima/MealDetail.tsx')
inject_style('src/components/clima/SwapMealModal.tsx')
inject_style('src/components/clima/CheckInModal.tsx')
inject_style('src/components/clima/DashboardBento.tsx')

print("Global style injection for modals complete!")
