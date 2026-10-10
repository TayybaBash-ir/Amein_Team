"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MdBookmarks,
  MdCheckCircle,
  MdClose,
  MdLocalDrink,
  MdOutlineMedicalServices,
  MdOutlineRestaurantMenu,
  MdOutlineAutorenew,
} from "react-icons/md";

type Meal = {
  slot?: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: string[];
  why?: string;
};

function BentoCard({ title, sub, icon, onClick, delay, glow }: any) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
      className="flex min-h-[88px] w-full items-center gap-2.5 overflow-hidden rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-brand/30 sm:min-h-[112px] sm:gap-3 sm:rounded-3xl sm:p-5"
      style={{ boxShadow: `0 6px 22px ${glow}` }}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand sm:h-12 sm:w-12 sm:rounded-2xl">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold leading-tight text-foreground sm:text-base">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground sm:text-xs">{sub}</span>
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
}: any) {
  const [mealDetailsOpen, setMealDetailsOpen] = useState(false);
  const hydrationTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hydrationTapTimer.current) clearTimeout(hydrationTapTimer.current);
  }, []);

  useEffect(() => {
    if (!mealDetailsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMealDetailsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mealDetailsOpen]);

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
      totalKcal = todayPlan.meals.reduce((sum: number, meal: Meal) => sum + (meal.calories || 0), 0);
      const weight = activePlan.plan.patient?.weight || 70;
      cupsGoal = Math.min(20, Math.max(8, Math.round((weight * 35) / 250)));
    }
  }

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
    <div className="mx-auto mt-2 w-full max-w-5xl px-1 pb-5 sm:mt-6 sm:px-4 sm:pb-8">
      <div className="mb-3 px-1 sm:mb-5 sm:px-2">
        <h1 className="mb-0.5 font-serif text-lg italic leading-tight text-brand sm:text-3xl">Welcome back.</h1>
        <p className="text-[11px] text-muted-foreground sm:text-sm">Select an option to manage your nutrition.</p>
      </div>

      <div className="grid grid-cols-2 items-start gap-2.5 sm:gap-5">
        <div className="flex min-w-0 flex-col gap-2.5 sm:gap-5">
        <BentoCard
          title="Weekly Plan"
          sub="Generate tailored menu"
          icon={<MdOutlineAutorenew size={21} />}
          onClick={() => onAction("standard")}
          delay={0.05}
          glow="rgba(74,124,89,0.08)"
        />

        <BentoCard
          title="Recovery"
          sub="Healing & sickness"
          icon={<MdOutlineMedicalServices size={21} />}
          onClick={() => onAction("recovery")}
          delay={0.15}
          glow="rgba(224,148,56,0.05)"
        />
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 sm:gap-5">
        <div className="min-w-0 self-start">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:mb-2 sm:text-xs">
            {todayPlan ? `Day ${dayIdx + 1} meals` : "Today’s meals"}
          </p>
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.22 }}
            className="flex h-auto min-h-[88px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 text-left shadow-[0_6px_22px_rgba(74,124,89,0.10)] transition-colors hover:border-brand/30 sm:min-h-[112px] sm:rounded-3xl sm:p-5"
          >
            {todayPlan ? (
              <>
                <button
                  type="button"
                  onClick={() => setMealDetailsOpen(true)}
                  aria-label={`Open details for day ${dayIdx + 1} meals`}
                  className="w-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <div className="mb-2 flex w-full items-center justify-between gap-1 sm:mb-3">
                    <span className="rounded-md bg-brand/10 px-1.5 py-1 text-[8px] font-bold uppercase leading-none tracking-wide text-brand sm:px-2 sm:text-[10px]">
                      Active · Day {dayIdx + 1}
                    </span>
                    <span className="text-[9px] text-muted-foreground sm:text-xs">{totalKcal} kcal</span>
                  </div>
                  <h2 className="mb-1.5 text-xs font-bold leading-tight text-foreground sm:mb-2 sm:text-base">Today&apos;s meals</h2>
                  <div className="w-full space-y-1">
                    {todayPlan.meals.slice(0, 3).map((meal: Meal, index: number) => (
                      <div key={`${meal.slot}-${index}`} className="flex min-w-0 items-center justify-between gap-1 text-[9px] sm:text-xs">
                        <span className="shrink-0 capitalize text-muted-foreground">{meal.slot || `Meal ${index + 1}`}</span>
                        <span className="truncate text-right font-medium text-foreground">{meal.name}</span>
                      </div>
                    ))}
                    <p className="pt-0.5 text-[9px] font-semibold text-brand sm:text-[10px]">
                      {todayPlan.meals.length > 3 ? `+${todayPlan.meals.length - 3} more · view all →` : "Tap to view meal details →"}
                    </p>
                  </div>
                </button>

                <div className="mt-2 w-full border-t border-border pt-2 sm:mt-3 sm:pt-3">
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-foreground sm:text-xs">
                      <MdLocalDrink className="text-blue-500" size={14} /> Water
                    </span>
                    <span className="text-[9px] text-muted-foreground sm:text-xs">{hydrationLog}/{cupsGoal} glasses</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1" aria-label="Hydration log. Tap once to add a glass; double tap to undo one.">
                    {Array.from({ length: cupsGoal }).map((_, index) => {
                      const drank = index < hydrationLog;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={handleHydrationTap}
                          aria-label={`Glass ${index + 1}${drank ? " logged; double tap to undo" : "; tap to log"}`}
                          className={`grid h-4 w-4 place-items-center rounded-full border transition-colors sm:h-5 sm:w-5 ${drank ? "border-blue-500 bg-blue-500" : "border-border bg-surface-2 hover:border-blue-400"}`}
                        >
                          {drank && <MdCheckCircle size={10} className="text-white" />}
                        </button>
                      );
                    })}
                    {hydrationLog > 0 && (
                      <button
                        type="button"
                        onClick={onUndoHydrate}
                        className="ml-auto rounded-md px-1.5 py-1 text-[9px] font-semibold text-muted-foreground hover:bg-surface-2 hover:text-foreground sm:text-[10px]"
                        aria-label="Undo last glass"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[8px] text-muted-foreground sm:text-[10px]">Tap to log · double tap to undo</p>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => onAction("standard")} className="flex w-full items-center gap-2.5 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand sm:h-12 sm:w-12 sm:rounded-2xl">
                  <MdOutlineRestaurantMenu size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-foreground sm:text-base">No active plan</span>
                  <span className="mt-0.5 block text-[9px] leading-tight text-muted-foreground sm:text-xs">Tap to create one.</span>
                </span>
              </button>
            )}
          </motion.div>
        </div>

        <BentoCard
          title="Saved Plans"
          sub="Past history"
          icon={<MdBookmarks size={21} />}
          onClick={() => onAction("saved")}
          delay={0.2}
          glow="rgba(74,124,89,0.05)"
        />
        </div>
      </div>

      <AnimatePresence>
        {mealDetailsOpen && todayPlan && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-end bg-black/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMealDetailsOpen(false)}
            data-no-page-swipe
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="today-meals-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-border bg-background p-4 shadow-2xl sm:rounded-3xl sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand">Day {dayIdx + 1}</p>
                  <h2 id="today-meals-title" className="text-lg font-bold text-foreground sm:text-xl">Today&apos;s meals</h2>
                  <p className="text-xs text-muted-foreground">{totalKcal} kcal planned · {todayPlan.meals.length} meals</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMealDetailsOpen(false)}
                  aria-label="Close meal details"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-foreground hover:bg-border"
                >
                  <MdClose size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {todayPlan.meals.map((meal: Meal, index: number) => (
                  <article key={`${meal.slot}-${index}`} className="rounded-2xl border border-border bg-card p-3.5 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-brand">{meal.slot || `Meal ${index + 1}`}</p>
                        <h3 className="font-semibold leading-snug text-foreground">{meal.name}</h3>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground">{meal.calories ?? "—"} kcal</span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                      Protein {meal.protein ?? "—"}g <span className="px-1 text-border">·</span>
                      Carbs {meal.carbs ?? "—"}g <span className="px-1 text-border">·</span>
                      Fat {meal.fat ?? "—"}g
                    </p>
                    {meal.ingredients?.length ? (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Ingredients:</span> {meal.ingredients.join(", ")}</p>
                    ) : null}
                    {meal.why ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{meal.why}</p> : null}
                  </article>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
