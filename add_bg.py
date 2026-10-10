import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

bg_html = """    <div className="min-h-screen bg-background text-foreground selection:bg-brand/30 relative">
      {/* Texture Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand/5 blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen pb-24 sm:pb-8">
"""

c = c.replace('<div className="min-h-screen bg-background text-foreground selection:bg-brand/30">', bg_html)
c = c.replace('<main className="w-full max-w-7xl mx-auto px-4 py-8 pb-24 sm:pb-8">', '<main className="w-full max-w-7xl mx-auto px-4 py-8 flex-1">')

# Also fix the closing div for the new wrapper
closing_nav = r'</AnimatePresence>\s*</main>\s*</div>\s*\);\s*\}'
c = re.sub(closing_nav, r'</AnimatePresence>\n      </main>\n      </div>\n    </div>\n  );\n}', c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Background injected!")
