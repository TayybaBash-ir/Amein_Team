"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <div className="min-h-screen bg-background selection:bg-brand/30">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
            title="Back to dashboard"
          >
            <MdArrowBack size={18} />
          </Link>
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-foreground" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-foreground">ClimaDiet</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {selectedPlan ? (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
              >
                <MdArrowBack size={16} /> Back to List
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {selectedPlan.mode === "recovery" ? "Recovery Plan" : "7-Day Meal Plan"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Generated on {new Date(selectedPlan.date).toLocaleDateString()} at {new Date(selectedPlan.date).toLocaleTimeString()}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("clima_active_plan", JSON.stringify({
                      plan: selectedPlan.plan,
                      startDate: new Date().toISOString(),
                      hydrationLog: 0,
                      lastHydrationDate: new Date().toISOString().split('T')[0]
                    }));
                    alert("This plan is now your Active Plan!");
                    window.location.href = "/dashboard";
                  }
                }}
                className="ml-auto bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 transition-all active:scale-95"
              >
                Track this plan &rarr;
              </button>
            </div>
            {/* Note: Deliberately omitting MacroScorecard as requested */}
            <MealPlanView plan={selectedPlan.plan} />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Saved Plans</h1>
              <p className="text-sm text-muted-foreground">Your history of generated clinical meal plans.</p>
            </div>
            
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-surface py-20 text-center">
                <MdCalendarToday size={48} className="mx-auto mb-4 text-foreground/10" />
                <p className="text-muted-foreground">No saved plans yet.</p>
                <Link href="/dashboard" className="mt-4 inline-block text-brand hover:text-brand font-semibold text-sm">
                  Build your first plan &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className="flex flex-col items-start rounded-2xl border border-border bg-card p-5 text-left transition-all hover:bg-surface hover:border-brand/30 group"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="rounded-full bg-surface-2 p-2 text-foreground group-hover:bg-brand group-hover:text-foreground transition-colors">
                        <MdCalendarToday size={16} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${p.mode === "recovery" ? "text-brand" : "text-brand"}`}>
                        {p.mode === "recovery" ? "Recovery (3-Day)" : "Standard (7-Day)"}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">
                      {new Date(p.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
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



