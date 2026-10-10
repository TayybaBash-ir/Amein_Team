import os
import re

directories = ['src/components', 'src/app']

replacements = [
    (r'bg-white/\[?0\.0\d\]?', 'bg-surface'),
    (r'bg-white/5', 'bg-surface-2'),
    (r'bg-white/10', 'bg-surface-2'),
    (r'bg-white/20', 'bg-surface-2'),
    (r'border-white/\[?0\.0\d\]?', 'border-border'),
    (r'border-white/10', 'border-border'),
    (r'border-white/20', 'border-border'),
    (r'text-white', 'text-foreground'),
    (r'text-neutral-[345]00', 'text-muted-foreground'),
    (r'text-zinc-[345]00', 'text-muted-foreground'),
    (r'bg-\[\#0F1117\]', 'bg-background'),
    (r'bg-\[\#1A1D1E\]', 'bg-background'),
    (r'bg-\[\#161922\]', 'bg-card'),
    (r'bg-\[\#24282a\]', 'bg-card')
]

for root_dir in directories:
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.tsx'):
                filepath = os.path.join(dirpath, filename)
                with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                
                original_content = content
                for pattern, replacement in replacements:
                    content = re.sub(pattern, replacement, content)
                
                # manual reversions
                content = content.replace('bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-foreground', 'bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-white')
                content = content.replace('bg-indigo-500 py-4 text-sm font-bold text-foreground', 'bg-indigo-500 py-4 text-sm font-bold text-white')
                content = content.replace('bg-[#4a7c59] px-6 py-2 text-sm font-medium text-foreground', 'bg-[#4a7c59] px-6 py-2 text-sm font-medium text-white')
                content = content.replace('bg-[#4a7c59] px-4 py-2 text-sm font-semibold text-foreground', 'bg-[#4a7c59] px-4 py-2 text-sm font-semibold text-white')
                content = content.replace('bg-black/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground', 'bg-black/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white')
                content = content.replace('bg-black/60 text-foreground', 'bg-black/60 text-white')
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")
