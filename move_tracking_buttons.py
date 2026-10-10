import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove tracking buttons from footer
footer_pattern = re.compile(r'\{/\* TRACKING BUTTONS \*/\}.*?(?=</div>\s*</div>\s*</motion\.div>)', re.DOTALL)
m = footer_pattern.search(c)
if m:
    c = c[:m.start()] + c[m.end():]

# Insert tracking buttons right under the macros
macro_pattern = re.compile(r'(<div className="mb-3 font-mono text-xs text-muted-foreground">.*?</div>)', re.DOTALL)
tracking_buttons = """
                    {/* TRACKING BUTTONS */}
                    {isTracking && (
                    <div className="mb-3 flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
                      {foodLog[meal.id]?.status === 'logged' ? (
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">✓ Logged</span>
                      ) : foodLog[meal.id]?.status === 'skipped' ? (
                        <span className="text-[10px] font-bold text-neutral-500 bg-neutral-500/10 px-2 py-1 rounded">Skipped</span>
                      ) : foodLog[meal.id]?.status === 'custom' ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded line-clamp-1 max-w-[120px]" title={foodLog[meal.id]?.customText}>Custom: {foodLog[meal.id]?.customText}</span>
                      ) : (
                        <>
                          <button onClick={() => updateLog(meal.id, 'logged', undefined, meal.name)} className="px-3 py-1.5 text-xs bg-brand text-white font-bold rounded-lg hover:bg-brand-dark shadow-md">Log Meal</button>
                          <button onClick={() => updateLog(meal.id, 'skipped', undefined, meal.name)} className="px-3 py-1.5 text-xs bg-surface-2 text-foreground font-bold rounded-lg hover:bg-border border border-border">Skip</button>
                          <button onClick={() => {
                            const t = prompt("What did you eat instead?");
                            if (t) updateLog(meal.id, 'custom', t, meal.name);
                          }} className="px-3 py-1.5 text-xs border border-border text-foreground font-bold rounded-lg hover:bg-surface-2">Custom</button>
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
"""
# We will inject this right after the macros div
c = re.sub(r'(<div className="mb-3 font-mono text-xs text-muted-foreground">.*?</div>)', r'\1' + tracking_buttons, c, count=0, flags=re.DOTALL)

# Also fix the <p> tag flex-1 bug
c = c.replace('<p className="mb-4 line-clamp-2 flex-1 text-xs text-muted-foreground">', '<p className="mb-2 line-clamp-3 text-xs text-muted-foreground">')

with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("Moved tracking buttons up!")
