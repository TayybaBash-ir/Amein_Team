import os

page_file = 'src/app/dashboard/page.tsx'
with open(page_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Sun, Moon to lucide imports
if 'Sun, Moon' not in content:
    content = content.replace(
        'import { Leaf, ArrowLeft, UtensilsCrossed, User, List, LayoutDashboard, Plus } from "lucide-react";',
        'import { Leaf, ArrowLeft, UtensilsCrossed, User, List, LayoutDashboard, Plus, Sun, Moon } from "lucide-react";'
    )

# Add useEffect hook
if 'useEffect(() => {' not in content and 'import { useState }' in content:
    content = content.replace(
        'import { useState } from "react";',
        'import { useState, useEffect } from "react";'
    )

# Add theme state and useEffect
theme_logic = """
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);
"""
if 'const [theme, setTheme]' not in content:
    content = content.replace(
        'const [error, setError] = useState<string | null>(null);',
        'const [error, setError] = useState<string | null>(null);' + theme_logic
    )

# Add button next to AuthButton
toggle_btn = """
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
"""
if 'onClick={() => setTheme' not in content:
    content = content.replace(
        '<AuthButton />',
        toggle_btn + '\n          <AuthButton />'
    )

with open(page_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added theme toggle to dashboard")
