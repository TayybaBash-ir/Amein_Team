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

  const trackPlan = (plan: SavedPlan) => {
    localStorage.setItem("clima_active_plan", JSON.stringify({
      plan: plan.plan,
      startDate: new Date().toISOString(),
      id: plan.id,
    }));
    router.push("/dashboard");
  };

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
          <button
            type="button"
            onClick={() => selectedPlan ? setSelectedPlan(null) : router.push("/dashboard")}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground"
            title={selectedPlan ? "Back to saved plans" : "Back to dashboard"}
          >
            <MdArrowBack size={18} />
          </button>
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-foreground" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-foreground">ClimaDiet</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12" {...(selectedPlan ? { "data-no-page-swipe": "true" } : {})}>
        {selectedPlan && (
          <style>{`
            nav[aria-label="Main navigation"] { display: none !important; }
          `}</style>
        )}
        {selectedPlan ? (
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold leading-tight text-foreground">
                  {selectedPlan.mode === "recovery" ? "Recovery Plan" : "7-Day Meal Plan"}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generated {new Date(selectedPlan.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  {" · "}
                  {new Date(selectedPlan.date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <button 
                onClick={() => trackPlan(selectedPlan)}
                className="shrink-0 whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark active:scale-95"
              >
                Track this plan &rarr;
              </button>
            </div>
            {/* Note: Deliberately omitting MacroScorecard as requested */}
            <MealPlanView plan={selectedPlan.plan} hideHeading compactActions />
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
                  <article key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/30 sm:p-5">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className="group flex flex-col items-start text-left"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-full bg-surface-2 p-2 text-foreground transition-colors group-hover:bg-brand">
                          <MdCalendarToday size={16} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand">
                          {p.mode === "recovery" ? "Recovery (3-Day)" : "Standard (7-Day)"}
                        </span>
                      </div>
                      <p className="mb-1 text-base font-semibold text-foreground">
                        {new Date(p.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(p.date).toLocaleTimeString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => trackPlan(p)}
                      className="mt-4 w-full rounded-xl bg-brand/10 px-3 py-2.5 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      Track this plan
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}



