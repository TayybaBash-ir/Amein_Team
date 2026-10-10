"use client";
import { useState, useCallback } from "react";
import { type PlanResponse, type Meal } from "@/lib/mock";
import { motion, AnimatePresence } from "framer-motion";
import { MdChevronRight, MdPrint, MdShare, MdRefresh } from "react-icons/md";
import { ACCENT } from "@/lib/theme";
import MealImage from "./MealImage";
import MealDetail from "./MealDetail";
import SwapMealModal from "./SwapMealModal";
import { RestaurantRecommendationCard } from "./RestaurantRecommendationCard";

export default function MealPlanView({ plan: initialPlan }: { plan: PlanResponse }) {
  const [plan, setPlan] = useState(initialPlan);
  const [swapMealInfo, setSwapMealInfo] = useState<{meal: Meal, dayIdx: number, mealIdx: number} | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const days = plan.meal_plan.days;
  const currentDay = days[selectedDay];

  // All meals in plan order, so the detail screen can step Previous / Next across days.
  const allMeals = days.flatMap((d) => d.meals);
  const dayStart = (dayIdx: number) => days.slice(0, dayIdx).reduce((n, d) => n + d.meals.length, 0);
  const total = allMeals.length;

  const go = useCallback((i: number) => {
    setOpenIdx(i);
    let n = 0;
    for (let d = 0; d < days.length; d++) {
      n += days[d].meals.length;
      if (i < n) { setSelectedDay(d); break; }
    }
  }, [days]);
  const close = useCallback(() => setOpenIdx(null), []);
  const prev = useCallback(() => openIdx !== null && total > 0 && go((openIdx - 1 + total) % total), [openIdx, total, go]);
  const next = useCallback(() => openIdx !== null && total > 0 && go((openIdx + 1) % total), [openIdx, total, go]);

  return (
    <>
      {/* RECOVERY ADVICE BANNER */}
      {plan.recovery_advice && (
        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 shadow-lg shadow-indigo-500/5 print:hidden">
          <h3 className="mb-2 text-sm font-bold text-indigo-400 uppercase tracking-widest">Recovery & Sickness Advice</h3>
          <p className="mb-4 text-sm text-indigo-100">{plan.recovery_advice.advice}</p>
          {plan.recovery_advice.avoid.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-400">Strictly Avoid:</span>
              {plan.recovery_advice.avoid.map((item, i) => (
                <span key={i} className="rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ULTRA-MINIMAL PDF PRINT LAYOUT */}
      <div className="hidden print:block text-black bg-white w-full p-4 font-sans">
        {days.map((day) => (
          <div key={day.day_label} className="mb-6 break-inside-avoid">
            <h2 className="text-xl font-bold mb-2 border-b-2 border-black pb-1 lowercase">{day.day_label.toLowerCase()} :-</h2>
            <div className="flex flex-col gap-2 mt-3">
              {day.meals.map((meal) => (
                <div key={meal.id} className="text-base lowercase mb-1">
                  {meal.name} {meal.estimated_cost ? <span className="text-neutral-500 font-normal ml-1">({Math.round(meal.estimated_cost)} PKR)</span> : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE WEB LAYOUT */}
      <div className="flex flex-col gap-5 w-full print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold editorial-title">Your Custom Menu</h2>
            <p className="text-sm text-neutral-400 mt-1">Crafted specifically for your body, taste, and goals.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-bold"
            >
              <MdPrint size={16} /> Download PDF
            </button>
            <button 
              onClick={async () => {
                try {
                  const res = await fetch("/api/save-plan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(plan)
                  });
                  const data = await res.json();
                  if (data.id) {
                    const url = window.location.origin + "/p/" + data.id;
                    navigator.clipboard.writeText(url);
                    alert("Plan saved! Shareable link copied to clipboard:\n" + url);
                  } else {
                    alert("Error saving plan: " + data.detail);
                  }
                } catch { 
                  alert("Network error saving plan.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors text-sm font-bold"
            >
              <MdShare size={16} /> Save & Share
            </button>
          </div>
        </div>
        
        {/* DAY SELECTOR */}
        <div className="flex w-full gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {days.map((day, idx) => {
            const isSelected = selectedDay === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                aria-pressed={isSelected}
                className={`flex min-h-16 min-w-24 flex-shrink-0 flex-col items-center justify-center rounded-2xl border px-4 text-sm font-bold transition ${
                  isSelected
                    ? "border-transparent text-neutral-900"
                    : "border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/10"
                }`}
                style={isSelected ? { background: ACCENT } : undefined}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{day.day_label}</span>
                <span className={`mt-1 text-xs font-medium ${isSelected ? "text-neutral-800" : "text-neutral-500"}`}>{day.date}</span>
              </button>
            );
          })}
        </div>

        {/* MEAL CARDS (Grid) */}
        <div className="flex flex-col w-full gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="wait">
            {currentDay.meals.map((meal, idx) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.08 }}
                className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white/[0.04] bg-white/[0.02] backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:scale-[1.01] hover:bg-white/[0.04]"
                onClick={() => go(dayStart(selectedDay) + idx)}
              >
                <div className="relative">
                  <MealImage meal={meal} className="aspect-[4/3] h-36 md:h-40 w-full rounded-none border-0 shadow-none object-cover" />
                  <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 p-2 text-white backdrop-blur hover:bg-white/20 transition-colors z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwapMealInfo({meal, dayIdx: selectedDay, mealIdx: idx});
                    }}>
                    <MdRefresh size={14} />
                  </div>
                  <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                    {meal.slot}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h4 className="editorial-title mb-1 text-lg font-bold">{meal.name}</h4>
                  <div className="mb-3 font-mono text-xs text-neutral-400">{meal.calories} kcal • {meal.protein}g protein {meal.estimated_cost ? ` • ~Rs. ${Math.round(meal.estimated_cost)}` : ""}</div>
                  <p className="mb-4 line-clamp-2 flex-1 text-xs text-neutral-400">
                    {meal.why}
                  </p>
                  <div className="mt-auto flex items-center border-t border-white/10 pt-3 text-xs font-bold uppercase tracking-wider transition-opacity group-hover:opacity-80" style={{ color: ACCENT }}>
                    View details <MdChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* OUTSIDE ORDER MATCHES */}
        {plan.outside_order_matches && plan.outside_order_matches[selectedDay]?.length > 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#222627] p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">Outside-order matches</h3>
              <p className="text-xs text-neutral-400">
                Restaurant items aligned with today's plan. Home-cooked meals remain the default.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plan.outside_order_matches[selectedDay].map((item, i) => (
                <RestaurantRecommendationCard
                  key={`${item.restaurant_name}-${i}`}
                  restaurantName={item.restaurant_name}
                  dishName={item.item_name || item.dish_name}
                  price={item.price}
                  protein={item.protein}
                  kitchenNote={item.kitchen_note}
                  orderUrl={item.order_url}
                  matchedMealName={item.matched_meal_name}
                />
              ))}
            </div>
          </div>
        )}

        {swapMealInfo && (
          <SwapMealModal
            isOpen={true}
            onClose={() => setSwapMealInfo(null)}
            meal={swapMealInfo.meal}
            plan={plan}
            onSwap={(newMeal) => {
              const updatedPlan = { ...plan };
              updatedPlan.meal_plan.days[swapMealInfo.dayIdx].meals[swapMealInfo.mealIdx] = newMeal;
              setPlan(updatedPlan);
            }}
          />
        )}

        {/* MEAL DETAIL SCREEN */}
        {openIdx !== null && allMeals[openIdx] && (
          <MealDetail
            meal={allMeals[openIdx]}
            tdee={plan.nutrition.target_calories}
            index={openIdx}
            total={total}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </div>
    </>
  );
}