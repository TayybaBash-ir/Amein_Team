import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports
c = c.replace('import HomeHero from "@/components/clima/HomeHero";', 'import HomeHero from "@/components/clima/HomeHero";\nimport TodayMealTile from "@/components/clima/TodayMealTile";')

# 2. State and logic
hooks_to_insert = """  const [activePlan, setActivePlan] = useState<any>(null);
  const [hydrationLog, setHydrationLog] = useState<number>(0);
  
  useEffect(() => {
    try {
      const active = localStorage.getItem("clima_active_plan");
      if (active) setActivePlan(JSON.parse(active));
      
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      const today = new Date().toISOString().split('T')[0];
      setHydrationLog(log[today] || 0);
    } catch (e) {}
  }, []);

  const handleHydrate = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      log[today] = (log[today] || 0) + 1;
      localStorage.setItem("clima_hydration", JSON.stringify(log));
      setHydrationLog(log[today]);
    } catch (e) {}
  };
"""
c = c.replace('const [activeTab, setActiveTab] = useState<AppTab>("generate");', hooks_to_insert + '\n  const [activeTab, setActiveTab] = useState<AppTab>("generate");')

# 3. handleGenerate saving logic
old_save = """        localStorage.setItem('clima_past_plans', JSON.stringify([planMeta, ...past].slice(0, 50))); // keep last 50
      } catch (e) { console.error("Could not save plan", e); }"""
new_save = """        localStorage.setItem('clima_past_plans', JSON.stringify([planMeta, ...past].slice(0, 50))); // keep last 50
        const activeData = { plan: result, startDate: planMeta.date, id: planMeta.id };
        localStorage.setItem("clima_active_plan", JSON.stringify(activeData));
        setActivePlan(activeData);
      } catch (e) { console.error("Could not save plan", e); }"""
c = c.replace(old_save, new_save)

# 4. Render
old_render = """              {step === "home" && (
                <HomeHero onAction={handleHeroAction} />
              )}"""
new_render = """              {step === "home" && (
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
                  <div className="flex-1 w-full max-w-2xl mx-auto">
                    <HomeHero onAction={handleHeroAction} />
                  </div>
                  {activePlan && (
                    <div className="w-full lg:w-[400px] shrink-0 mt-8 lg:mt-24">
                      <TodayMealTile activePlan={activePlan} onHydrate={handleHydrate} hydrationLog={hydrationLog} />
                    </div>
                  )}
                </div>
              )}"""
c = c.replace(old_render, new_render)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("dashboard/page.tsx updated!")
