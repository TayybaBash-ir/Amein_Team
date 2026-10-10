import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('className="relative flex flex-col rounded-3xl border border-border bg-card p-4 sm:p-5 transition-all \nduration-200 overflow-hidden shadow-[0_8px_30px_rgba(74,124,89,0.12)] "', 'className="relative flex flex-col rounded-3xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 overflow-hidden shadow-[0_8px_30px_rgba(74,124,89,0.12)] w-full h-full min-h-[140px]"')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
