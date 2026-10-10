import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix Theme persistence
old_theme = """  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);"""

new_theme = """  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clima_theme");
      if (stored === "dark") setTheme("dark");
      else if (stored === "light") setTheme("light");
      else if (document.documentElement.classList.contains("dark")) setTheme("dark");
    } catch {}
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("clima_theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("clima_theme", "dark");
    }
  }, [theme]);"""

if 'localStorage.setItem("clima_theme"' not in c:
    c = c.replace(old_theme, new_theme)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Theme persistence updated in dashboard")
