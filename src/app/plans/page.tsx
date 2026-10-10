"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdArrowBack, MdEco, MdCalendarToday } from "react-icons/md";
import { type PlanResponse } from "@/lib/mock";
import MealPlanView from "@/components/clima/MealPlanView";

type SavedPlan = {
  id: string;
  date: string;
  mode: "standard" | "recovery";
  plan: PlanResponse;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clima_past_plans");
      if (stored) {
        setPlans(JSON.parse(stored));
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1117] selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0F1117]/85 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
            title="Back to dashboard"
          >
            <MdArrowBack size={18} />
          </Link>
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-white">ClimaDiet</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {selectedPlan ? (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <MdArrowBack size={16} /> Back to List
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {selectedPlan.mode === "recovery" ? "Recovery Plan" : "7-Day Meal Plan"}
                </h1>
                <p className="text-xs text-neutral-400">
                  Generated on {new Date(selectedPlan.date).toLocaleDateString()} at {new Date(selectedPlan.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {/* Note: Deliberately omitting MacroScorecard as requested */}
            <MealPlanView plan={selectedPlan.plan} />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Saved Plans</h1>
              <p className="text-sm text-neutral-500">Your history of generated clinical meal plans.</p>
            </div>
            
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] py-20 text-center">
                <MdCalendarToday size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-neutral-400">No saved plans yet.</p>
                <Link href="/dashboard" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
                  Build your first plan &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className="flex flex-col items-start rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 text-left transition-all hover:bg-white/[0.08] hover:border-indigo-500/30 group"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-full bg-white/10 p-2 text-white group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <MdCalendarToday size={16} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${p.mode === "recovery" ? "text-indigo-400" : "text-emerald-400"}`}>
                        {p.mode === "recovery" ? "Recovery (3-Day)" : "Standard (7-Day)"}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-white mb-1">
                      {new Date(p.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(p.date).toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
