import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

sketches = """        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        {/* Floating Sketches */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden mix-blend-multiply dark:mix-blend-screen">
          <svg className="absolute top-[10%] left-[5%] w-32 h-32" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" />
            <path d="M50 20 L50 80 M20 50 L80 50" />
            <circle cx="50" cy="50" r="15" />
          </svg>
          <svg className="absolute top-[40%] right-[5%] w-48 h-48 rotate-45" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M10 90 L90 10 M30 90 L90 30 M10 70 L70 10 M50 90 L90 50 M10 50 L50 10" />
            <rect x="20" y="20" width="60" height="60" rx="10" />
          </svg>
          <svg className="absolute bottom-[20%] left-[10%] w-40 h-40 -rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="50" cy="50" r="40" />
            <path d="M50 10 C30 30 70 70 50 90" />
            <path d="M10 50 C30 30 70 70 90 50" />
          </svg>
          <svg className="absolute top-[20%] left-[60%] w-24 h-24 rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 80 Q50 10 80 80 Z M35 80 Q50 30 65 80" />
          </svg>
        </div>"""

c = c.replace("""        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>""", sketches)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Sketches injected!")
