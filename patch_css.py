import os

css_file = 'src/app/globals.css'
with open(css_file, 'r', encoding='utf-8') as f:
    content = f.read()

theme_css = """
/* Automatic Light/Dark Mode Toggle Trick */
html.light {
  filter: invert(1) hue-rotate(180deg);
  background: white; /* After invert, becomes black, but wait: if background is #1A1D1E, invert makes it light gray. Let's just let it be. */
}
html.light img, 
html.light video,
html.light [data-no-invert] {
  filter: invert(1) hue-rotate(180deg);
}
"""

if 'html.light' not in content:
    content += "\n" + theme_css

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched globals.css")
