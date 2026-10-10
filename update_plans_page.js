const fs = require('fs');

let c = fs.readFileSync('src/app/plans/page.tsx', 'utf8');

const importRegex = /import React, \{ useEffect, useState \} from "react";/;
c = c.replace(importRegex, 'import React, { useEffect, useState } from "react";\nimport { useRouter } from "next/navigation";');

const routerRegex = /export default function PlansPage\(\) \{/;
c = c.replace(routerRegex, 'export default function PlansPage() {\n  const router = useRouter();');

const followButtonHTML = `
              <div className="ml-auto">
                <button
                  onClick={() => {
                    const activeData = { plan: selectedPlan.plan, startDate: new Date().toISOString(), id: selectedPlan.id };
                    localStorage.setItem("clima_active_plan", JSON.stringify(activeData));
                    router.push('/dashboard');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark shadow-lg shadow-brand/20"
                >
                  Follow this plan &rarr;
                </button>
              </div>
            </div>`;

// Replace `</div>\n            {/* Note: Deliberately omitting MacroScorecard as requested */}` 
// With our followButtonHTML
c = c.replace(/<\/div>\n\s*\{\/\* Note: Deliberately omitting MacroScorecard as requested \*\/\}/m, followButtonHTML + '\n            {/* Note: Deliberately omitting MacroScorecard as requested */}');

fs.writeFileSync('src/app/plans/page.tsx', c, 'utf8');
console.log('Plans page updated!');
