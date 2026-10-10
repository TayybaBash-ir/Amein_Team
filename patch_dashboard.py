import os

page_file = 'src/app/dashboard/page.tsx'
with open(page_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the physics book heading from the dashboard
heading_to_remove = """                    <div className="mb-8">
                      <h1 className="editorial-title mb-2 text-4xl sm:text-5xl">New Plan Generation</h1>
                      <p className="text-lg text-neutral-400">Enter patient signals and local climate context.</p>
                    </div>"""
if heading_to_remove in content:
    content = content.replace(heading_to_remove, "")

# 2. Update the loading screen
old_loading = """                {step === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                    <div className="relative mb-8 grid h-24 w-24 place-items-center rounded-full bg-white/5">
                      <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#4a7c59] opacity-20" />
                      <Leaf size={32} className="animate-pulse text-[#4a7c59]" />
                    </div>
                    <h3 className="editorial-title text-2xl">Computing Clinical Targets</h3>
                    <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-500">
                      <p className="animate-pulse">Resolving location via Open-Meteo API...</p>
                      <p className="animate-pulse delay-100">Applying Harris-Benedict thermodynamics...</p>
                      <p className="animate-pulse delay-200">Matching dishes with strict AI constraints...</p>
                    </div>
                  </motion.div>
                )}"""

apple_loading = """                {step === "loading" && (
                  <motion.div 
                    key="loading" 
                    initial={{ opacity: 0, filter: "blur(10px)" }} 
                    animate={{ opacity: 1, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl"
                  >
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] }} 
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-8 flex items-center justify-center border border-white/10">
                        <Leaf size={24} className="text-white/80" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">Crafting your plan...</h2>
                      <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-sm">
                        Balancing your macros, analyzing your clinical constraints, and finalizing the perfect healing diet.
                      </p>
                    </motion.div>
                  </motion.div>
                )}"""

if old_loading in content:
    content = content.replace(old_loading, apple_loading)

with open(page_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated dashboard/page.tsx")
