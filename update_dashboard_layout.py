import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Inject global styles to hide nav when step !== 'home'
# and also wrap the generate tab in a data-no-page-swipe container
if 'nav[aria-label="Main navigation"]' not in c:
    old_generate = """          {activeTab === "generate" && (
            <motion.div key="generate" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>"""
    
    new_generate = """          {activeTab === "generate" && (
            <motion.div key="generate" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }} className="w-full max-w-[100vw] overflow-x-hidden" {...(step !== "home" ? { "data-no-page-swipe": "true" } : {})}>
              {step !== "home" && (
                <style>{`
                  nav[aria-label="Main navigation"] { display: none !important; }
                `}</style>
              )}
              {step === "input" && (
                <button onClick={() => setStep("home")} className="mb-4 flex items-center text-sm font-bold text-muted-foreground hover:text-foreground">
                  <MdArrowBack size={18} className="mr-1" /> Back to Dashboard
                </button>
              )}"""
    
    c = c.replace(old_generate, new_generate)

# Also fix the `main` tag to ensure no overflow
c = c.replace('<main className="mx-auto max-w-5xl p-4 sm:p-8 pb-6 sm:pb-8">', '<main className="mx-auto max-w-5xl w-full max-w-[100vw] overflow-x-hidden p-4 sm:p-8 pb-6 sm:pb-8">')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Dashboard page updated for mobile layout and nav hiding")
