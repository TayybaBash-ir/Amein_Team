import re

with open('src/app/plans/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

header_regex = re.compile(r'(<button\s+onClick=\{\(\) => setSelectedPlan\(null\)\}\s+className="[^"]+"\s*>\s*<MdArrowBack size=\{16\} /> Back to List\s*</button>.*?</div>)', re.DOTALL)

replacement = r"""\1
              <button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("clima_active_plan", JSON.stringify({
                      plan: selectedPlan.plan,
                      startDate: new Date().toISOString(),
                      hydrationLog: 0,
                      lastHydrationDate: new Date().toISOString().split('T')[0]
                    }));
                    alert("This plan is now your Active Plan!");
                    window.location.href = "/dashboard";
                  }
                }}
                className="ml-auto bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
              >
                Track this plan &rarr;
              </button>"""

c = re.sub(header_regex, replacement, c)

with open('src/app/plans/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Injected Track this plan!")
