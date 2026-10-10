"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CheckInModal from "@/components/clima/CheckInModal";
import { MdAssessment, MdAdd, MdRemove } from "react-icons/md";
import {
  MdBookmarks,
  MdCheckCircle,
  MdClose,
  MdLocalDrink,
  MdOutlineMedicalServices,
  MdOutlineRestaurantMenu,
  MdOutlineAutorenew,
} from "react-icons/md";
import type { Meal, PlanResponse } from "@/lib/mock";
import MealPlanView from "@/components/clima/MealPlanView";

function BentoCard({ title, sub, description, icon, onClick, delay, glow }: any) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
      className="flex aspect-square min-h-0 w-full flex-col items-start justify-between overflow-hidden rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-brand/30 sm:rounded-3xl sm:p-5"
      style={{ boxShadow: `0 6px 22px ${glow}` }}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand sm:h-12 sm:w-12 sm:rounded-2xl">
        {icon}
      </span>
      <span className="flex min-h-0 w-full flex-1 items-center py-2 sm:py-3">
        <span className="line-clamp-3 text-[10px] leading-snug text-muted-foreground sm:text-sm">{description}</span>
      </span>
      <span className="min-w-0 w-full">
        <span className="block text-xs font-bold leading-tight text-foreground sm:text-lg">{title}</span>
        <span className="mt-1 block truncate text-[10px] leading-tight text-muted-foreground sm:text-sm">{sub}</span>
      </span>
    </motion.button>
  );
}

export default function DashboardBento({
  onAction,
  activePlan,
  hydrationLog,
  onHydrate,
  onUndoHydrate,
  onGoToRestaurant,
}: any) {
  const [mealDetailsOpen, setMealDetailsOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const hydrationTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hydrationTapTimer.current) clearTimeout(hydrationTapTimer.current);
  }, []);

  let diffDays = 0;
  let dayIdx = 0;
  let todayPlan: any = null;
  let totalKcal = 0;
  let cupsGoal = 8;

  if (activePlan?.plan && activePlan?.startDate) {
    const startDate = new Date(activePlan.startDate);
    const now = new Date();
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    diffDays = Math.max(0, Math.floor((today - startDay) / 86_400_000));
    const days = activePlan.plan.meal_plan?.days || [];
    if (days.length > 0) {
      dayIdx = Math.min(diffDays, days.length - 1);
      todayPlan = days[dayIdx];
      totalKcal = todayPlan.daily_totals?.calories || todayPlan.meals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
      const weight = activePlan.plan.patient?.weight || 70;
      let extraCups = 0;
      const weatherText = JSON.stringify(activePlan.plan.weather || "").toLowerCase();
      if (weatherText.includes("hot") || weatherText.includes("warm") || weatherText.includes("sunny")) {
        extraCups = 3;
      }
      cupsGoal = Math.min(20, Math.max(8, Math.round((weight * 35) / 250) + extraCups));
    }
  }

  const todayPlanResponse: PlanResponse | null = todayPlan && activePlan?.plan
    ? {
        ...activePlan.plan,
        meal_plan: { ...activePlan.plan.meal_plan, days: [todayPlan] },
      }
    : null;

  const handleHydrationTap = () => {
    if (hydrationTapTimer.current) {
      clearTimeout(hydrationTapTimer.current);
      hydrationTapTimer.current = null;
      onUndoHydrate?.();
      return;
    }

    hydrationTapTimer.current = setTimeout(() => {
      hydrationTapTimer.current = null;
      onHydrate?.();
    }, 260);
  };

  return (
    <div className="mx-auto mt-2 w-full max-w-3xl pb-5 sm:mt-6 sm:px-4 sm:pb-8">
      <div className="mb-3 px-1 sm:mb-5 sm:px-2">
        <h1 className="mb-0.5 font-serif text-lg italic leading-tight text-brand sm:text-3xl">Welcome back.</h1>
        <p className="text-[11px] text-muted-foreground sm:text-sm">Select an option to manage your nutrition.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-5">
        <BentoCard
          title="Generate meal plan"
          sub="Personalized 7-day menu"
          description="Built around your health goals, food preferences, and local climate."
          icon={<MdOutlineAutorenew size={22} />}
          onClick={() => onAction("standard")}
          delay={0.05}
          glow="rgba(74,124,89,0.08)"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.22 }}
          className="flex aspect-square min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-[0_6px_22px_rgba(74,124,89,0.10)] sm:rounded-3xl sm:p-5"
        >
          {todayPlan ? (
            <>
              <button
                type="button"
                onClick={() => setMealDetailsOpen(true)}
                aria-label={`Open all meals for day ${dayIdx + 1}`}
                className="flex min-h-0 w-full flex-1 flex-col items-start text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span className="block w-full">
                  <span className="mb-2 flex w-full items-center justify-between gap-1">
                    <span className="truncate text-[9px] font-bold uppercase tracking-wide text-brand sm:text-xs">Day {dayIdx + 1} · Meals</span>
                    <span className="shrink-0 text-[9px] text-muted-foreground sm:text-xs">{totalKcal} kcal</span>
                  </span>
                  <span className="mb-1.5 block text-xs font-bold leading-tight text-foreground sm:text-base">Today&apos;s meals</span>
                  <span className="flex min-w-0 items-center gap-1 text-[9px] sm:text-xs">
                    <span className="shrink-0 capitalize text-muted-foreground">{todayPlan.meals[0]?.slot || "Meal"}</span>
                    <span className="truncate font-medium text-foreground">{todayPlan.meals[0]?.name || "Plan details"}</span>
                  </span>
                </span>
                <span className="mt-auto block w-full shrink-0 truncate pt-1 text-[9px] font-semibold text-brand sm:text-[10px]">
                  {todayPlan.meals.length > 1 ? `+${todayPlan.meals.length - 1} more · view all →` : "Tap to view meal details →"}
                </span>
              </button>

              
            
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
              </>
          ) : (
            <button
              type="button"
              onClick={() => onAction("standard")}
              className="flex h-full w-full flex-col items-start text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-brand sm:h-12 sm:w-12 sm:rounded-2xl">
                <MdOutlineRestaurantMenu size={21} />
              </span>
              <span className="flex min-h-0 w-full flex-1 items-center py-2 sm:py-3">
                <span className="line-clamp-3 text-[10px] leading-snug text-muted-foreground sm:text-sm">Start with a plan tailored to your health goals and local climate.</span>
              </span>
              <span className="w-full">
                <span className="block text-xs font-bold text-foreground sm:text-lg">No active plan</span>
                <span className="mt-1 block text-[10px] text-muted-foreground sm:text-sm">Tap to create one.</span>
              </span>
            </button>
          )}
        </motion.div>

        <BentoCard
          title="Not feeling well?"
          sub="Recovery meal plan"
          description="Get gentle meal ideas tailored to how you feel."
          icon={<MdOutlineMedicalServices size={22} />}
          onClick={() => onAction("recovery")}
          delay={0.15}
          glow="rgba(224,148,56,0.05)"
        />
        <BentoCard
          title="Saved Plans"
          sub="Revisit or track a plan"
          description="Your previous meal plans are ready whenever you need them."
          icon={<MdBookmarks size={22} />}
          onClick={() => onAction("saved")}
          delay={0.2}
          glow="rgba(74,124,89,0.05)"
        />
      </div>

      

      
      {/* Hydration Tile (Full Width) */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-4 flex w-full items-center justify-between rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-[0_6px_22px_rgba(59,130,246,0.08)]"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Daily Hydration</span>
          <span className="mt-0.5 flex items-baseline gap-1 text-4xl font-black text-foreground">
            {hydrationLog}
            <span className="text-xl text-muted-foreground">/{cupsGoal}</span>
          </span>
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            {hydrationLog >= cupsGoal ? "Goal reached! 🎉" : `${cupsGoal - hydrationLog} more to reach your goal`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {hydrationLog > 0 && (
            <button 
              onClick={onUndoHydrate} 
              className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted-foreground hover:bg-border transition-colors"
              aria-label="Undo hydration"
            >
              <MdRemove size={20} />
            </button>
          )}
          
          <button 
            onClick={handleHydrationTap}
            className="group relative flex h-20 w-14 flex-col justify-end overflow-hidden rounded-b-2xl rounded-t-lg border-2 border-blue-200/60 bg-blue-50 shadow-inner dark:border-blue-900/50 dark:bg-blue-950/20 transition-transform active:scale-95"
            aria-label="Add a glass of water"
          >
            {/* Liquid Fill */}
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-out" 
              style={{ height: `${Math.min(100, (hydrationLog / cupsGoal) * 100)}%` }} 
            />
            {/* Glass glint / reflection */}
            <div className="absolute inset-y-1 left-1.5 w-1.5 rounded-full bg-white/30 mix-blend-overlay" />
            
            {/* Plus Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-blue-500/10">
              <div className="grid h-8 w-8 scale-95 place-items-center rounded-full bg-white text-blue-500 shadow-lg transition-transform group-hover:scale-110">
                <MdAdd size={24} />
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mealDetailsOpen && todayPlanResponse && (
          <motion.div
            className="fixed inset-0 z-[70] overflow-y-auto bg-background"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            data-no-page-swipe
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:px-8">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Day {dayIdx + 1}</p>
                <h2 className="truncate text-sm font-bold text-foreground sm:text-base">Meal plan</h2>
              </div>
              <button
                type="button"
                onClick={() => setMealDetailsOpen(false)}
                aria-label="Close today’s meal plan"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-foreground hover:bg-border"
              >
                <MdClose size={20} />
              </button>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-5 pb-10 sm:px-8 sm:py-8">
              <MealPlanView plan={todayPlanResponse} onGoToRestaurant={onGoToRestaurant} />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckInModal 
        isOpen={checkInOpen} 
        onClose={() => setCheckInOpen(false)} 
        userProfile={(() => {
          try {
            return JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
          } catch { return {}; }
        })()}
        onComplete={(newWeight: number, newModifier: number, macroTweak: string, historyEntry: Record<string, unknown>) => {
          try {
            const profile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
            let history: Record<string, unknown>[] = [];
            try {
              const storedHistory = JSON.parse(localStorage.getItem("clima_progress_history") || "[]");
              if (Array.isArray(storedHistory)) history = storedHistory;
            } catch { /* Start a new local history if storage is empty or invalid. */ }
            localStorage.setItem("clima_progress_history", JSON.stringify([...history, historyEntry].slice(-30)));
            profile.weight = newWeight;
            profile.metabolic_modifier = newModifier;
            profile.macro_tweak = macroTweak;
            localStorage.setItem("clima_patient_profile", JSON.stringify(profile));
            setCheckInOpen(false);
            window.location.reload();
          } catch {}
        }}
      />
    </div>

  );
}
