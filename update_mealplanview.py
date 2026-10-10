import re

with open('src/components/clima/MealPlanView.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add isTracking to props
old_props = """export default function MealPlanView({
  plan: initialPlan,
  onGoToRestaurant,
  hideHeading = false,
  compactActions = false,
}: {"""
new_props = """export default function MealPlanView({
  plan: initialPlan,
  onGoToRestaurant,
  hideHeading = false,
  compactActions = false,
  isTracking = false,
}: {"""
c = c.replace(old_props, new_props)

old_type = """  onGoToRestaurant?: (r: string, mealId?: string) => void;
  hideHeading?: boolean;
  compactActions?: boolean;
}) {"""
new_type = """  onGoToRestaurant?: (r: string, mealId?: string) => void;
  hideHeading?: boolean;
  compactActions?: boolean;
  isTracking?: boolean;
}) {"""
c = c.replace(old_type, new_type)


# 2. Update the Food Log Summary block
old_summary = """        {/* FOOD LOG SUMMARY */}
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
        </div>"""

new_summary = """        {/* SUMMARY BLOCK (DYNAMIC BASED ON ISTRACKING) */}
        <div className="mb-2 p-4 rounded-2xl bg-surface-2 border border-border">
          <h3 className="text-sm font-bold mb-2">{isTracking ? "Today's Intake (Tracked)" : "Daily Plan Totals"}</h3>
          <div className="flex gap-4 text-xs font-mono">
            {(() => {
              let cals = 0, pro = 0, carb = 0, fat = 0;
              currentDay.meals.forEach(m => {
                const log = foodLog[m.id];
                if (!isTracking || log?.status === 'logged') {
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
        </div>"""
c = c.replace(old_summary, new_summary)


# 3. Update the TRACKING BUTTONS so they only render if isTracking is true
old_tracking_buttons = """                      {/* TRACKING BUTTONS */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                        {foodLog[meal.id]?.status === 'logged' ? ("""

new_tracking_buttons = """                      {/* TRACKING BUTTONS */}
                      {isTracking && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50" onClick={e => e.stopPropagation()}>
                        {foodLog[meal.id]?.status === 'logged' ? ("""

old_tracking_close = """                           <button onClick={() => {
                              const newLog = {...foodLog};
                              delete newLog[meal.id];
                              setFoodLog(newLog);
                              localStorage.setItem("clima_food_log", JSON.stringify(newLog));
                           }} className="ml-auto text-xs text-red-400 hover:underline">Undo</button>
                        )}
                      </div>
                    </div>"""

new_tracking_close = """                           <button onClick={() => {
                              const newLog = {...foodLog};
                              delete newLog[meal.id];
                              setFoodLog(newLog);
                              localStorage.setItem("clima_food_log", JSON.stringify(newLog));
                           }} className="ml-auto text-xs text-red-400 hover:underline">Undo</button>
                        )}
                      </div>
                      )}
                    </div>"""

c = c.replace(old_tracking_buttons, new_tracking_buttons)
c = c.replace(old_tracking_close, new_tracking_close)


# 4. Hide "Your Custom Menu" when hideHeading is true
# Actually, the user said: "it should not say 'your custom menu'" (in the context of saved plans view)
# In my previous code:
#          {!hideHeading && (
#            <div>
#              <h2 className="text-2xl font-bold editorial-title">Your Custom Menu</h2>
#
# But wait, in DashboardBento it renders it maybe without hideHeading? No, DashboardBento passes nothing to MealPlanView so hideHeading is false, so it shows it.
# Let's check `src/app/plans/page.tsx`. It passes `hideHeading`! 
# Let's ensure the heading is completely hidden. Wait, the screenshot shows "Your Custom Menu" inside a modal! That modal is from `SwapMealModal.tsx`!
# Ah! The user's screenshot has "Swap Meal ... Choose an alternative Breakfast"

with open('src/components/clima/MealPlanView.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("MealPlanView UI updated")
