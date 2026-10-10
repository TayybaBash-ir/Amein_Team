import re

with open('src/components/clima/ClinicalIntakeForm.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update Section 1 title and Goal field
old_section1 = """        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400"><MdFavorite size={20} /></div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Health Conditions & Dietary Needs</h2>
          </div>
          <div className="space-y-6">
            {planMode !== "recovery" && (<div className="mb-6">
              <label className={labelClass}>AI Health Goal</label>
              <input className={inputClass} value={d.goal || ""} placeholder="e.g. 'I want to lose 5 kg weight in 1 month'" onChange={(e) => set("goal", e.target.value)} />
            </div>)}
                                        </div>
        </motion.section>"""

new_section1 = """        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400"><MdFavorite size={20} /></div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Goals & Temporary Needs</h2>
          </div>
          <div className="space-y-5">
            {planMode !== "recovery" && (
              <div>
                <label className={labelClass}>Your Main Goal</label>
                <input className={inputClass} value={d.goal || ""} placeholder="e.g. 'I want to lose 5 kg weight in 1 month'" onChange={(e) => set("goal", e.target.value)} />
              </div>
            )}
            
            <div>
              <label className={labelClass}>Preferences: Things you don't want to eat</label>
              <input className={inputClass} value={d.temporary_aversions || ""} placeholder="e.g. No hot/spicy things because I have acne" onChange={(e) => set("temporary_aversions", e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Temporary Symptoms (Optional)</label>
              <input className={inputClass} value={d.acute_illness || ""} placeholder="e.g. acne, itching, nose bleed, cold" onChange={(e) => set("acute_illness", e.target.value)} />
            </div>
          </div>
        </motion.section>"""

# Using regex just in case there are spacing differences
c = re.sub(
    r'<motion\.section[^>]+>\s*<div className="mb-6 flex items-center gap-3">.*?<h2[^>]+>1\. Health Conditions & Dietary Needs</h2>.*?<label className={labelClass}>AI Health Goal</label>.*?</motion\.section>',
    new_section1,
    c,
    flags=re.DOTALL
)

with open('src/components/clima/ClinicalIntakeForm.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("IntakeForm updated!")
