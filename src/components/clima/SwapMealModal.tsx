/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { type Meal, type PlanResponse } from "@/lib/mock";
import MealImage from "./MealImage";

import { MdClose } from "react-icons/md";
import { motion } from "framer-motion";

export default function SwapMealModal({
  isOpen,
  onClose,
  meal,
  plan,
  onSwap
}: {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  plan: PlanResponse;
  onSwap: (newMeal: Meal) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [alts, setAlts] = useState<Meal[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !meal) return;
    
    setLoading(true);
    setError("");
    setAlts([]);

    const previouslySelected = plan.meal_plan.days.flatMap(d => d.meals.map(m => m.name));

    fetch("/api/swap-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient: plan.patient,
        slot: meal.slot,
        target_calories: meal.calories,
        target_protein: (meal as any).protein_g || meal.protein,
        target_carbs: (meal as any).carbs_g || meal.carbs,
        target_fat: (meal as any).fat_g || meal.fat,
        previously_selected: previouslySelected
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.alternatives) setAlts(data.alternatives);
        else setError(data.detail || "Failed to find alternatives");
      })
      .catch(() => setError("Network error occurred"))
      .finally(() => setLoading(false));

  }, [isOpen, meal, plan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#111113] border border-border rounded-3xl text-foreground overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-border">
          <div>
            <h2 className="text-xl editorial-title">Swap Meal</h2>
            <p className="text-muted-foreground text-xs mt-1">Choose an alternative {meal?.slot}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-2 rounded-full hover:bg-surface-2 transition-colors">
            <MdClose size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-white"></div>
              <p className="mt-4 text-xs text-muted-foreground">Finding delicious alternatives...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && alts.length > 0 && (
            <div className="flex flex-col gap-3">
              {alts.map((alt) => (
                <div 
                  key={alt.id}
                  onClick={() => onSwap(alt)}
                  className="group flex gap-3 p-3 rounded-2xl border border-border bg-surface cursor-pointer hover:border-white/30 hover:bg-surface transition-all"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                    <MealImage meal={alt} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h4 className="font-bold text-sm line-clamp-2 leading-tight mb-1">{alt.name}</h4>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {alt.calories} kcal · {(alt as any).protein_g || alt.protein}g pro
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}



