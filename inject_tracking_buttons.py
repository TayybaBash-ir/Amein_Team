import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Let's find the view details block using regex
footer_pattern = re.compile(r'(<div className="mt-auto flex items-center border-t border-border pt-3 text-xs font-bold uppercase tracking-wider transition-opacity group-hover:opacity-80" style=\{\{ color: ACCENT \}\}>\s*View details <MdChevronRight size=\{14\} className="ml-1" />\s*</div>)')

log_buttons = """<div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                      <div className="flex items-center text-xs font-bold uppercase tracking-wider transition-opacity group-hover:opacity-80" style={{ color: ACCENT }}>
                        View details <MdChevronRight size={14} className="ml-1" />
                      </div>
                      
                      {/* TRACKING BUTTONS */}
                      {isTracking && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                        {foodLog[meal.id]?.status === 'logged' ? (
                          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">✓ Logged</span>
                        ) : foodLog[meal.id]?.status === 'skipped' ? (
                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-500/10 px-2 py-1 rounded">Skipped</span>
                        ) : foodLog[meal.id]?.status === 'custom' ? (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded line-clamp-1 max-w-[120px]" title={foodLog[meal.id]?.customText}>Custom: {foodLog[meal.id]?.customText}</span>
                        ) : (
                          <>
                            <button onClick={() => updateLog(meal.id, 'logged', undefined, meal.name)} className="px-2 py-1 text-[10px] bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Log</button>
                            <button onClick={() => updateLog(meal.id, 'skipped', undefined, meal.name)} className="px-2 py-1 text-[10px] bg-surface-2 text-foreground font-bold rounded-lg hover:bg-border">Skip</button>
                            <button onClick={() => {
                              const t = prompt("What did you eat instead?");
                              if (t) updateLog(meal.id, 'custom', t, meal.name);
                            }} className="px-2 py-1 text-[10px] border border-border text-foreground font-bold rounded-lg hover:bg-surface-2">Custom</button>
                          </>
                        )}
                        {foodLog[meal.id] && (
                           <button onClick={() => {
                              const newLog = {...foodLog};
                              delete newLog[meal.id];
                              setFoodLog(newLog);
                              localStorage.setItem("clima_food_log", JSON.stringify(newLog));
                           }} className="ml-auto text-[10px] text-red-400 hover:underline">Undo</button>
                        )}
                      </div>
                      )}
                    </div>"""

m = footer_pattern.search(c)
if m:
    c = c[:m.start()] + log_buttons + c[m.end():]
    with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Tracking buttons injected!")
else:
    print("Could not find footer pattern")
