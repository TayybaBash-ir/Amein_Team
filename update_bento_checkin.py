import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Declare diffDays globally
if 'let diffDays = 0;' not in c:
    c = c.replace('let dayIdx = 0;\n  let todayPlan', 'let diffDays = 0;\n  let dayIdx = 0;\n  let todayPlan')

c = c.replace('const diffDays = Math.max(0, Math.floor((today - startDay) / 86_400_000));', 'diffDays = Math.max(0, Math.floor((today - startDay) / 86_400_000));')


# Inject the button inside the Today's meals card
old_button_end = """                  <span className="mt-auto block w-full shrink-0 truncate pt-1 text-[9px] font-semibold text-brand sm:text-[10px]">
                    {todayPlan.meals.length > 1 ? `+${todayPlan.meals.length - 1} more A view all +'` : "Tap to view meal details +'"}
                  </span>
                </button>
  
                
              </>"""

# Using regex because of the weird unicode characters A and +'
regex_button_end = re.compile(r'(<span className="mt-auto block w-full shrink-0 truncate pt-1 text-\[9px\] font-semibold text-brand sm:text-\[10px\]">.*?</span>\s*</button>\s*)(</>)', re.DOTALL)

new_button_ui = r"""\1
              {diffDays >= 6 && (
                <div className="mt-3 w-full border-t border-border pt-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCheckInOpen(true); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark"
                  >
                    <MdAssessment size={16} /> Run Weekly Check-In
                  </button>
                </div>
              )}
              \2"""

c = re.sub(regex_button_end, new_button_ui, c)

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Injected weekly check-in button!")
