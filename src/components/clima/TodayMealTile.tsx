"use client";
import { useState, useEffect } from "react";
import { MdLocalDrink, MdCheckCircle } from "react-icons/md";
import type { PlanResponse, DayPlan } from "@/lib/mock";
import { motion } from "framer-motion";

export default function TodayMealTile({ activePlan, onHydrate, hydrationLog }: { activePlan: any, onHydrate: () => void, hydrationLog: number }) {
  if (!activePlan || !activePlan.plan || !activePlan.startDate) return null;
  
  const plan: PlanResponse = activePlan.plan;
  const startDate = new Date(activePlan.startDate);
  const now = new Date();
  
  // Calculate day difference
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const days = plan.meal_plan?.days || [];
  if (days.length === 0) return null;
  
  // Cap it at the last day if they exceed the plan
  const dayIndex = Math.min(diffDays, days.length - 1);
  const todayPlan: DayPlan = days[dayIndex];
  
  const weight = plan.patient?.weight || 70;
  const cupsGoal = Math.max(8, Math.round((weight * 35) / 250));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-sm mx-auto mb-10 px-4"
    >
      <div className="relative rounded-3xl border border-border bg-card backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-brand uppercase tracking-widest">Active Plan - Day {dayIndex + 1}</span>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-4">Today&apos;s Meals</h2>
        
        <div className="flex flex-col gap-3 mb-6">
          {todayPlan.meals.map((meal, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-surface-2 p-3 rounded-2xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{meal.slot}</p>
                <p className="text-sm font-semibold text-foreground truncate">{meal.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-brand">{meal.calories} kcal</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MdLocalDrink className="text-blue-400" size={18} /> Hydration Tracker
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">{hydrationLog} / {cupsGoal} cups</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: cupsGoal }).map((_, i) => {
              const drank = i < hydrationLog;
              return (
                <button
                  key={i}
                  onClick={() => { if (!drank) onHydrate(); }}
                  disabled={drank}
                  className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300 ${drank ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-surface-2 border-border hover:border-blue-400'}`}
                >
                  {drank && <MdCheckCircle size={14} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
