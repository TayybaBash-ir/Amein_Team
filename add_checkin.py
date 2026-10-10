import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add state and import
if 'import CheckInModal' not in c:
    c = c.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\nimport { useState } from "react";\nimport CheckInModal from "@/components/clima/CheckInModal";\nimport { MdAssessment } from "react-icons/md";')
    c = c.replace('export default function DashboardBento({ onAction, activePlan, hydrationLog, onHydrate }: any) {', 'export default function DashboardBento({ onAction, activePlan, hydrationLog, onHydrate }: any) {\n  const [checkInOpen, setCheckInOpen] = useState(false);')

# Add button inside the tracking tile
button_html = """
              <button 
                onClick={(e) => { e.stopPropagation(); setCheckInOpen(true); }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand text-brand hover:bg-brand hover:text-white transition-colors py-2 text-xs font-bold uppercase tracking-wider"
              >
                <MdAssessment size={16} /> Weekly Check-In
              </button>
              
              {/* Hydration inside the tile */}
"""
c = c.replace('{/* Hydration inside the tile */}', button_html)

# Add Modal at the end
modal_html = """
      <CheckInModal 
        isOpen={checkInOpen} 
        onClose={() => setCheckInOpen(false)} 
        userProfile={(() => {
          try {
            return JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
          } catch { return {}; }
        })()}
        onComplete={(newWeight: number, newModifier: number) => {
          try {
            const profile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
            profile.weight = newWeight;
            profile.metabolic_modifier = newModifier;
            localStorage.setItem("clima_patient_profile", JSON.stringify(profile));
            setCheckInOpen(false);
            window.location.reload();
          } catch {}
        }}
      />
    </div>
  );
}
"""
c = re.sub(r'    </div>\s*\);\s*\}\s*$', modal_html, c)

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("DashboardBento updated with CheckInModal!")
