import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace HomeHero import
c = c.replace('import HomeHero from "@/components/clima/HomeHero";', 'import DashboardBento from "@/components/clima/DashboardBento";')
c = c.replace('import TodayMealTile from "@/components/clima/TodayMealTile";', '')

# Replace rendering block
old_render = r'\{step === "home" && \([\s\S]*?\}\s*</div>\s*\)\}'
new_render = """{step === "home" && (
                <div className="w-full">
                  <DashboardBento 
                    onAction={handleHeroAction} 
                    activePlan={activePlan} 
                    hydrationLog={hydrationLog} 
                    onHydrate={handleHydrate} 
                  />
                </div>
              )}"""

c = re.sub(old_render, new_render, c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Dashboard replaced with Bento Grid!")
