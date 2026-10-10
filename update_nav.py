import re

# 1. dashboard/page.tsx - Remove AuthButton
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<AuthButton />', '')

# 2. Make mobile nav fixed at bottom
mobile_nav_regex = re.compile(r'<div className="flex sm:hidden justify-around p-3 border-b border-border bg-background gap-2 print:hidden scrollbar-hide">')
c = mobile_nav_regex.sub('<div className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden justify-around p-3 border-t border-border bg-background/90 backdrop-blur-xl gap-2 pb-safe print:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">', c)

# 3. Add bottom padding to main so content doesn't get hidden behind bottom nav
main_regex = re.compile(r'<main className="([^"]+)">')
c = main_regex.sub(r'<main className="\1 pb-24 sm:pb-8">', c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

# 4. profile/page.tsx - Add AuthButton
with open('src/app/profile/page.tsx', 'r', encoding='utf-8') as f:
    p = f.read()

if 'AuthButton' not in p:
    p = p.replace('import Link from "next/link";', 'import Link from "next/link";\nimport AuthButton from "@/components/clima/AuthButton";')
    p = p.replace('</form>', '</form>\n\n              <div className="mt-10 border-t border-border pt-8 flex justify-center">\n                <AuthButton />\n              </div>')
    with open('src/app/profile/page.tsx', 'w', encoding='utf-8') as f:
        f.write(p)

print("Nav & AuthButton updated!")
