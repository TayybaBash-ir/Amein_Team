import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Remove the existing TRACKING BUTTONS block
tracking_pattern = re.compile(r'(\s*\{/\* TRACKING BUTTONS \*/\}.*?\n\s*\})', re.DOTALL)
m = tracking_pattern.search(c)
if m:
    # Just to be safe, only replace if it contains "Undo</button>"
    if "Undo</button>" in m.group(1):
        c = c.replace(m.group(1), "")

# 2. Add the overlay inside the image container
# We look for the closing </div> of the "absolute left-3 top-3... {meal.slot} </div>" block.
# Which is followed by a closing </div> for the relative container.
image_container_pattern = re.compile(r'(<div className="absolute left-3 top-3[^>]*>\s*\{meal\.slot\}\s*</div>\s*)(</div>)', re.DOTALL)

tracking_overlay = """
                    {/* TRACKING BUTTONS OVERLAY */}
                    {isTracking && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-center items-center gap-1 bg-background/95 backdrop-blur-md p-1.5 rounded-xl z-20 shadow-lg border border-border/50" onClick={e => e.stopPropagation()}>
                      {foodLog[meal.id]?.status === 'logged' ? (
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded w-full text-center">✓ Logged</span>
                      ) : foodLog[meal.id]?.status === 'skipped' ? (
                        <span className="text-[10px] font-bold text-neutral-500 bg-neutral-500/10 px-2 py-1 rounded w-full text-center">Skipped</span>
                      ) : foodLog[meal.id]?.status === 'custom' ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded line-clamp-1 w-full text-center" title={foodLog[meal.id]?.customText}>Custom</span>
                      ) : (
                        <>
                          <button onClick={() => updateLog(meal.id, 'logged', undefined, meal.name)} className="flex-1 px-1 py-1 text-[10px] bg-brand text-white font-bold rounded-lg hover:bg-brand-dark shadow-sm">Log</button>
                          <button onClick={() => updateLog(meal.id, 'skipped', undefined, meal.name)} className="flex-1 px-1 py-1 text-[10px] bg-surface-2 text-foreground font-bold rounded-lg hover:bg-border border border-border">Skip</button>
                          <button onClick={() => {
                            const t = prompt("What did you eat instead?");
                            if (t) updateLog(meal.id, 'custom', t, meal.name);
                          }} className="flex-1 px-1 py-1 text-[10px] border border-border text-foreground font-bold rounded-lg hover:bg-surface-2">Edit</button>
                        </>
                      )}
                      {foodLog[meal.id] && (
                         <button onClick={() => {
                            const newLog = {...foodLog};
                            delete newLog[meal.id];
                            setFoodLog(newLog);
                            localStorage.setItem("clima_food_log", JSON.stringify(newLog));
                         }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md hover:scale-110 transition-transform">✕</button>
                      )}
                    </div>
                    )}
"""

c = image_container_pattern.sub(r'\1' + tracking_overlay + r'\2', c)

with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Tracking overlay embedded safely!")
