"use client";
import { motion } from "framer-motion";
import { MdOutlineAutorenew, MdOutlineMedicalServices, MdBookmarks, MdOutlineRestaurantMenu, MdLocalDrink, MdCheckCircle } from "react-icons/md";

function BentoCard({ title, sub, icon, onClick, delay, glow, children }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative flex flex-col items-start gap-2 rounded-3xl border border-border bg-card p-5 text-left transition-all duration-200 overflow-hidden w-full h-full min-h-[140px]"
      style={{ boxShadow: `0 8px 30px ${glow}` }}
    >
      <div className="flex items-center gap-3 mb-auto">
        <div className="rounded-2xl bg-surface-2 p-3 text-brand">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-foreground leading-tight text-sm sm:text-base">{title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      {children}
    </motion.button>
  );
}

export default function DashboardBento({ onAction, activePlan, hydrationLog, onHydrate }: any) {
  // Compute active plan summary
  let dayIdx = 0;
  let todayPlan = null;
  let totalKcal = 0;
  let cupsGoal = 8;
  
  if (activePlan?.plan && activePlan?.startDate) {
    const startDate = new Date(activePlan.startDate);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const days = activePlan.plan.meal_plan?.days || [];
    if (days.length > 0) {
      dayIdx = Math.min(diffDays, days.length - 1);
      todayPlan = days[dayIdx];
      totalKcal = todayPlan.meals.reduce((sum: number, m: any) => sum + m.calories, 0);
      const weight = activePlan.plan.patient?.weight || 70;
      cupsGoal = Math.max(8, Math.round((weight * 35) / 250));
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mt-4 sm:mt-8 pb-10">
      
      {/* Mini Title */}
      <div className="mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-serif italic text-brand mb-1">Welcome back.</h1>
        <p className="text-sm text-muted-foreground">Select an option to manage your nutrition.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        
        {/* TILE 1: Generate Standard Plan */}
        <BentoCard 
          title="Weekly Plan" 
          sub="Generate tailored menu" 
          icon={<MdOutlineAutorenew size={24} />}
          onClick={() => onAction('standard')}
          delay={0.1}
          glow="rgba(74,124,89,0.08)"
        />

        {/* TILE 2: Today's Meal (Tracking) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative flex flex-col rounded-3xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 overflow-hidden shadow-[0_8px_30px_rgba(74,124,89,0.12)] w-full h-full min-h-[140px]"
        >
          {todayPlan ? (
            <>
              <div className="mb-4">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand/10 px-2 py-1 rounded-md">
                  Active - Day {dayIdx + 1}
                </span>
                <h3 className="font-bold text-foreground mt-3 text-lg">Today&apos;s Meals</h3>
                <p className="text-xs text-muted-foreground">{totalKcal} kcal total</p>
              </div>

              {/* Compact Meal List */}
              <div className="flex flex-col gap-2 mb-auto flex-1">
                {todayPlan.meals.slice(0, 3).map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground capitalize font-medium">{m.slot}</span>
                    <span className="text-foreground font-semibold truncate max-w-[100px] text-right">{m.name}</span>
                  </div>
                ))}
                {todayPlan.meals.length > 3 && (
                  <div className="text-[10px] text-brand font-bold mt-1">+ {todayPlan.meals.length - 3} more</div>
                )}
              </div>

              {/* Hydration inside the tile */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <MdLocalDrink className="text-blue-400" size={14} /> Hydration
                  </h4>
                  <span className="text-[10px] font-semibold text-muted-foreground">{hydrationLog}/{cupsGoal}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: cupsGoal }).map((_, i) => {
                    const drank = i < hydrationLog;
                    return (
                      <button
                        key={i}
                        onClick={onHydrate}
                        disabled={drank}
                        className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center border transition-all ${drank ? 'bg-blue-500 border-blue-500' : 'bg-surface-2 border-border hover:border-blue-400'}`}
                      >
                        {drank && <MdCheckCircle size={10} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
              <MdOutlineRestaurantMenu size={32} className="mb-2" />
              <p className="text-sm font-semibold text-foreground">No active plan</p>
              <p className="text-xs text-muted-foreground">Generate a plan to start tracking.</p>
            </div>
          )}
        </motion.div>

        {/* TILE 3: Recovery Mode */}
        <BentoCard 
          title="Recovery" 
          sub="Healing & sickness" 
          icon={<MdOutlineMedicalServices size={24} />}
          onClick={() => onAction('recovery')}
          delay={0.3}
          glow="rgba(224,148,56,0.05)"
        />

        {/* TILE 4: Saved Plans */}
        <BentoCard 
          title="Saved Plans" 
          sub="Past history" 
          icon={<MdBookmarks size={24} />}
          onClick={() => onAction('saved')}
          delay={0.4}
          glow="rgba(74,124,89,0.05)"
        />

      </div>
    </div>
  );
}
