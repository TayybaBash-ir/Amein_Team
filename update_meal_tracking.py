import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add state for foodLog
food_log_state = """  const [plan, setPlan] = useState(initialPlan);
  const [foodLog, setFoodLog] = useState<Record<string, any>>({});
  
  // Load food log on mount
  useState(() => {
    if (typeof window !== "undefined") {
      try {
        setFoodLog(JSON.parse(localStorage.getItem("clima_food_log") || "{}"));
      } catch {}
    }
  });

  const updateLog = (mealId: string, status: string, customText?: string) => {
    const newLog = { ...foodLog, [mealId]: { status, customText } };
    setFoodLog(newLog);
    localStorage.setItem("clima_food_log", JSON.stringify(newLog));
  };
"""
c = c.replace('const [plan, setPlan] = useState(initialPlan);', food_log_state)

# 2. Add Top Summary
summary_ui = """      {/* INTERACTIVE WEB LAYOUT */}
      <div className="flex flex-col gap-5 w-full print:hidden">

        {/* FOOD LOG SUMMARY */}
        <div className="mb-2 p-4 rounded-2xl bg-surface-2 border border-border">
          <h3 className="text-sm font-bold mb-2">Today's Intake</h3>
          <div className="flex gap-4 text-xs font-mono">
            {(() => {
              let cals = 0, pro = 0, carb = 0, fat = 0;
              currentDay.meals.forEach(m => {
                const log = foodLog[m.id];
                if (log?.status === 'logged') {
                  cals += m.calories || 0;
                  pro += (m as any).protein_g || m.protein || 0;
                  carb += (m as any).carbs_g || m.carbs || 0;
                  fat += (m as any).fat_g || m.fat || 0;
                }
              });
              return (
                <>
                  <div className="text-brand">Cals: {Math.round(cals)}</div>
                  <div className="text-blue-400">Pro: {Math.round(pro)}g</div>
                  <div className="text-amber-400">Carbs: {Math.round(carb)}g</div>
                  <div className="text-red-400">Fat: {Math.round(fat)}g</div>
                </>
              );
            })()}
          </div>
        </div>
"""
c = c.replace('      {/* INTERACTIVE WEB LAYOUT */}\n      <div className="flex flex-col gap-5 w-full print:hidden">', summary_ui)

# 3. Add Log Buttons inside the meal card
log_buttons = """                    <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                      <div className="flex items-center text-xs font-bold uppercase tracking-wider transition-opacity group-hover:opacity-80" style={{ color: ACCENT }}>
                        View details <MdChevronRight size={14} className="ml-1" />
                      </div>
                      
                      {/* TRACKING BUTTONS */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                        {foodLog[meal.id]?.status === 'logged' ? (
                          <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">✓ Logged</span>
                        ) : foodLog[meal.id]?.status === 'skipped' ? (
                          <span className="text-xs font-bold text-neutral-500 bg-neutral-500/10 px-2 py-1 rounded">Skipped</span>
                        ) : foodLog[meal.id]?.status === 'custom' ? (
                          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Custom: {foodLog[meal.id]?.customText} (Est. Macros not added)</span>
                        ) : (
                          <>
                            <button onClick={() => updateLog(meal.id, 'logged')} className="px-2 py-1 text-xs bg-brand text-white font-bold rounded-lg hover:bg-brand-dark">Log</button>
                            <button onClick={() => updateLog(meal.id, 'skipped')} className="px-2 py-1 text-xs bg-surface-2 text-foreground font-bold rounded-lg hover:bg-border">Skip</button>
                            <button onClick={() => {
                              const t = prompt("What did you eat instead?");
                              if (t) updateLog(meal.id, 'custom', t);
                            }} className="px-2 py-1 text-xs border border-border text-foreground font-bold rounded-lg hover:bg-surface-2">Custom</button>
                          </>
                        )}
                        {foodLog[meal.id] && (
                           <button onClick={() => {
                              const newLog = {...foodLog};
                              delete newLog[meal.id];
                              setFoodLog(newLog);
                              localStorage.setItem("clima_food_log", JSON.stringify(newLog));
                           }} className="ml-auto text-xs text-red-400 hover:underline">Undo</button>
                        )}
                      </div>
                    </div>"""
                    
# Replace the old view details footer
old_footer = """                    <div className="mt-auto flex items-center border-t border-border pt-3 text-xs font-bold uppercase tracking-wider transition-opacity group-hover:opacity-80" style={{ color: ACCENT }}>
                      View details <MdChevronRight size={14} className="ml-1" />
                    </div>"""

c = c.replace(old_footer, log_buttons)

with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Food logging added!")
