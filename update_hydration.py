import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add MdAdd and MdRemove to imports if they don't exist
if 'MdAdd' not in c:
    c = c.replace('import {', 'import { MdAdd, MdRemove,', 1)

# 2. Remove the old hydration block inside the meal tile
old_hydration_regex = re.compile(r'<div className="mt-2 w-full border-t border-border pt-2 sm:mt-3 sm:pt-3">.*?Undo\s*</button>\s*\)}?\s*</div>\s*</div>', re.DOTALL)
c = re.sub(old_hydration_regex, '', c)

# 3. Remove the generic text below the tiles
old_text_regex = re.compile(r'<p className="mt-3 px-1 text-center text-\[10px\] leading-relaxed text-muted-foreground sm:mt-5 sm:text-sm">\s*Generate a 7-day meal plan shaped around your health goals and local climate\.\s*</p>', re.DOTALL)
c = re.sub(old_text_regex, '', c)

# 4. Remove duplicate CheckInModal (if any)
duplicate_modal_regex = re.compile(r'(<CheckInModal[^>]+/>\s*)<CheckInModal[^>]+/>', re.DOTALL)
c = re.sub(duplicate_modal_regex, r'\1', c)

# 5. Inject the new Hydration Tile
new_hydration_tile = """
      {/* Hydration Tile (Full Width) */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-4 flex w-full items-center justify-between rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-[0_6px_22px_rgba(59,130,246,0.08)]"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Daily Hydration</span>
          <span className="mt-0.5 flex items-baseline gap-1 text-4xl font-black text-foreground">
            {hydrationLog}
            <span className="text-xl text-muted-foreground">/{cupsGoal}</span>
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            {hydrationLog >= cupsGoal ? "Goal reached! 🎉" : `${cupsGoal - hydrationLog} more to reach your goal`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {hydrationLog > 0 && (
            <button 
              onClick={onUndoHydrate} 
              className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted-foreground hover:bg-border transition-colors"
              aria-label="Undo hydration"
            >
              <MdRemove size={20} />
            </button>
          )}
          
          <button 
            onClick={handleHydrationTap}
            className="group relative flex h-20 w-14 flex-col justify-end overflow-hidden rounded-b-2xl rounded-t-lg border-2 border-blue-200/60 bg-blue-50 shadow-inner dark:border-blue-900/50 dark:bg-blue-950/20 transition-transform active:scale-95"
            aria-label="Add a glass of water"
          >
            {/* Liquid Fill */}
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-out" 
              style={{ height: `${Math.min(100, (hydrationLog / cupsGoal) * 100)}%` }} 
            />
            {/* Glass glint / reflection */}
            <div className="absolute inset-y-1 left-1.5 w-1.5 rounded-full bg-white/30 mix-blend-overlay" />
            
            {/* Plus Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-blue-500/10">
              <div className="grid h-8 w-8 scale-95 place-items-center rounded-full bg-white text-blue-500 shadow-lg transition-transform group-hover:scale-110">
                <MdAdd size={24} />
              </div>
            </div>
          </button>
        </div>
      </motion.div>
"""

# Insert the hydration tile right before the AnimatePresence for the modal
c = c.replace('<AnimatePresence>', new_hydration_tile + '\n      <AnimatePresence>')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Hydration UI refactored successfully!")
