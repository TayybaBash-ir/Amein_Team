import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

style_tag = """
              <style>{`nav[aria-label="Main navigation"] { display: none !important; }`}</style>"""

if "display: none !important" not in c:
    c = re.sub(r'(data-no-page-swipe\s*>)', r'\1' + style_tag, c)
    with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("DashboardBento updated!")
