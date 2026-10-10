"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CheckInModal from "@/components/clima/CheckInModal";
import { MdAssessment } from "react-icons/md";
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

  let dayIdx = 0;
  let todayPlan: any = null;
  let totalKcal = 0;
  let cupsGoal = 8;

  if (activePlan?.plan && activePlan?.startDate) {
    const startDate = new Date(activePlan.startDate);
    const now = new Date();
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diffDays = Math.max(0, Math.floor((today - startDay) / 86_400_000));
    const days = activePlan.plan.meal_plan?.days || [];
    if (days.length > 0) {
      dayIdx = Math.min(diffDays, days.length - 1);
      todayPlan = days[dayIdx];
      totalKcal = todayPlan.daily_totals?.calories || todayPlan.meals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
      const weight = activePlan.plan.patient?.weight || 70;
      cupsGoal = Math.min(20, Math.max(8, Math.round((weight * 35) / 250)));
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

              <div className="mt-2 w-full border-t border-border pt-2 sm:mt-3 sm:pt-3">
                <div className="mb-1.5 flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-foreground sm:text-xs">
                    <MdLocalDrink className="text-blue-500" size={14} /> Water
                  </span>
                  <span className="text-[9px] text-muted-foreground sm:text-xs">{hydrationLog}/{cupsGoal}</span>
                </div>
                <div className="flex flex-wrap gap-0.5" aria-label="Hydration log. Tap once to add a glass; double tap to undo one.">
                  {Array.from({ length: cupsGoal }).map((_, index) => {
                    const drank = index < hydrationLog;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={handleHydrationTap}
                        aria-label={`Glass ${index + 1}${drank ? " logged; double tap to undo" : "; tap to log"}`}
                        className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-colors sm:h-4 sm:w-4 ${drank ? "border-blue-500 bg-blue-500" : "border-border bg-surface-2 hover:border-blue-400"}`}
                      >
                        {drank && <MdCheckCircle size={9} className="text-white" />}
                      </button>
                    );
                  })}
                  {hydrationLog > 0 && (
                    <button
                      type="button"
                      onClick={onUndoHydrate}
                      className="ml-auto rounded-md px-1 text-[9px] font-semibold text-muted-foreground hover:bg-surface-2 hover:text-foreground sm:text-[10px]"
                      aria-label="Undo last glass"
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
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

      <p className="mt-3 px-1 text-center text-[10px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-sm">
        Generate a 7-day meal plan shaped around your health goals and local climate.
      </p>

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
