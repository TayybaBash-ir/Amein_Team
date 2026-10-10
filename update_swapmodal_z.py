import re

with open('src/components/clima/SwapMealModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">',
              '<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-no-page-swipe>')

with open('src/components/clima/SwapMealModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("SwapMealModal updated!")
