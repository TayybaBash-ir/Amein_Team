import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add import
if 'DashboardBackground' not in c:
    c = c.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport DashboardBackground from "@/components/clima/DashboardBackground";')

# Replace inline background with component
old_bg_pattern = re.compile(r'\{/\* Texture Background \*/\}.*?(?=<div className="relative z-10 flex flex-col min-h-screen pb-24 sm:pb-8">)', re.DOTALL)
c = re.sub(old_bg_pattern, '<DashboardBackground />\n      ', c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Injected DashboardBackground into page.tsx!")
