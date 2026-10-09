import os

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def patch_file(path, old, new):
    if not os.path.exists(path): return
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
    with open(path, "w", encoding="utf-8") as f:
        f.write(c.replace(old, new))

patch_file("src/app/globals.css", 
"""  /* Ensure the grid of meals looks good */
  .grid-cols-2, .md\\:grid-cols-4, .lg\\:grid-cols-4 {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }""", "")

patch_file("src/lib/mock.ts", "allow_external_dining: false", "allow_external_dining: true")
patch_file("src/components/clima/ClinicalIntakeForm.tsx", "allow_external_dining: false", "allow_external_dining: true")

meal_card = """"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Meal } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";
import MealImage from "./MealImage";

export default function MealCard({
  meal,
  index,
  onClick,
}: {
  meal: Meal;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="group flex w-[75vw] max-w-[280px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-white/10 bg-[#24282a] text-left shadow-lg transition-colors hover:border-white/20 hover:bg-white/[0.06] lg:w-full lg:max-w-none print:w-full print:max-w-none print:block print:border-none print:border-b print:border-neutral-300 print:bg-transparent print:shadow-none print:rounded-none print:py-2 print:my-0"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-t-xl print:hidden">
        <MealImage
          meal={meal}
          className="h-40 w-full rounded-none rounded-t-xl border-0 shadow-none"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {meal.slot}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 print:p-0 print:block">
        <div className="hidden print:inline-block font-bold uppercase text-xs mr-2 text-black">{meal.slot}:</div>
        <h4 className="editorial-title mb-1 line-clamp-1 text-base leading-tight print:line-clamp-none print:inline-block print:text-sm print:font-bold print:text-black print:mb-0">
          {meal.name}
        </h4>
        <div className="mb-2 font-mono text-xs text-neutral-400 print:inline-block print:ml-2 print:text-black print:mb-0 print:text-xs">
          ({meal.calories} kcal • {meal.protein}g protein)
        </div>
        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-neutral-400 print:line-clamp-none print:block print:text-black print:mb-0 print:mt-1">
          Portion to eat: {meal.why}
        </p>
        <div className="mt-auto hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#4a7c59] opacity-0 transition-opacity group-hover:opacity-100 sm:flex no-print">
          View details <ChevronRight size={12} strokeWidth={3} />
        </div>
      </div>
    </motion.button>
  );
}
"""
write_file("src/components/clima/MealCard.tsx", meal_card)

# Let's fix MealPlanView to remove the restaurants card (we will put it in dashboard)
# and add the Day X print header.
with open("src/components/clima/MealPlanView.tsx", "r", encoding="utf-8") as f:
    mpv = f.read()

# Hide daily totals
mpv = mpv.replace('className="clinical-card" aria-label={`Planned nutrition totals', 'className="clinical-card no-print" aria-label={`Planned nutrition totals')

# Remove Restaurant card completely
import re
mpv = re.sub(r'\{plan\.patient\.allow_external_dining && currentOutsideOrderMatches\.length > 0 && \(.*?</section>\r?\n\s*\)\}', '', mpv, flags=re.DOTALL)

# Fix print layout for days
mpv = mpv.replace('className="flex flex-col w-full gap-4 md:grid md:grid-cols-2 lg:grid-cols-4"', 'className="flex flex-col w-full gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 print:flex print:flex-col print:gap-0"')

# Add Day header
mpv = mpv.replace('{/* MEAL CARDS (Horizontal Swipe Carousel on Mobile / Grid on Laptops & Tablets) */}', '<h2 className="hidden print:block text-2xl font-bold border-b-2 border-black pb-2 mb-4 mt-8 text-black">{currentDay.day_label} :-</h2>\n        {/* MEAL CARDS (Horizontal Swipe Carousel on Mobile / Grid on Laptops & Tablets) */}')

write_file("src/components/clima/MealPlanView.tsx", mpv)


dashboard = """"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ArrowLeft, UtensilsCrossed, User, List, LayoutDashboard, Plus } from "lucide-react";
import AuthButton from "@/components/clima/AuthButton";
import { motion, AnimatePresence } from "framer-motion";
import ClinicalIntakeForm from "@/components/clima/ClinicalIntakeForm";
import MacroScorecard from "@/components/clima/MacroScorecard";
import MealPlanView from "@/components/clima/MealPlanView";
import { RestaurantRecommendationCard } from "@/components/clima/RestaurantRecommendationCard";
import { type PlanResponse, type IntakeData } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";

type ScreenStep = "input" | "loading" | "results";
type AppTab = "generate" | "restaurants" | "profile";

export default function Dashboard() {
  const [step, setStep] = useState<ScreenStep>("input");
  const [activeTab, setActiveTab] = useState<AppTab>("generate");
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: IntakeData) => {
    setStep("loading");
    setError(null);
    try {
      const { generatePlan } = await import("@/lib/mock");
      const result = await generatePlan(data);
      setPlan(result);
      setStep("results");
      setActiveTab("generate");
    } catch (err: any) {
      setError(err.message || "Failed to connect to plan generation API.");
      setStep("input");
    }
  };

  const navItemClass = (tab: AppTab, label: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab ? "bg-[#4a7c59] text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-[#1A1D1E] selection:bg-[#4a7c59]/30">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#1A1D1E]/80 px-4 py-3 backdrop-blur-xl no-print sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#4a7c59] to-[#2c4c36] shadow-lg transition-transform group-hover:scale-105">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-white">ClimaDiet</span>
          </Link>
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setActiveTab("generate")} className={navItemClass("generate", "Generate")}>
              <LayoutDashboard size={16} /> Home
            </button>
            <button onClick={() => setActiveTab("restaurants")} className={navItemClass("restaurants", "Restaurants")}>
              <UtensilsCrossed size={16} /> Restaurants
            </button>
            <button onClick={() => setActiveTab("profile")} className={navItemClass("profile", "Profile")}>
              <User size={16} /> Profile
            </button>
            <Link href="/plans" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
              <List size={16} /> Saved Plans
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AuthButton />
        </div>
      </nav>

      <div className="flex sm:hidden overflow-x-auto p-3 border-b border-white/5 bg-[#1A1D1E] gap-2 no-print scrollbar-hide">
        <button onClick={() => setActiveTab("generate")} className={navItemClass("generate", "Generate")}>Home</button>
        <button onClick={() => setActiveTab("restaurants")} className={navItemClass("restaurants", "Restaurants")}>Restaurants</button>
        <button onClick={() => setActiveTab("profile")} className={navItemClass("profile", "Profile")}>Profile</button>
        <Link href="/plans" className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400">Saved Plans</Link>
      </div>

      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        <AnimatePresence mode="wait">
          
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-10 text-center">
              <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white/5">
                <User size={32} className="text-neutral-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
              <p className="text-neutral-400 mb-6">Connect to Supabase to manage your persistent medical history.</p>
              <button onClick={() => setActiveTab("generate")} className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20">Go back to Home</button>
            </motion.div>
          )}

          {activeTab === "restaurants" && (
            <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
              <h2 className="text-2xl font-bold text-white mb-2">Local Restaurant Matches</h2>
              <p className="text-neutral-400 mb-8">Dishes available to order from nearby restaurants that perfectly match your generated meal plan.</p>
              
              {!plan || !plan.external_dining || plan.external_dining.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <UtensilsCrossed size={32} className="mx-auto text-neutral-600 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-300">No restaurants matched</h3>
                  <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">Generate a new clinical meal plan first. If any meals match our Foodpanda catalog, they will appear here!</p>
                  <button onClick={() => setActiveTab("generate")} className="mt-6 rounded-lg bg-[#4a7c59] px-6 py-2 text-sm font-medium text-white hover:bg-[#3d6849]">
                    <Plus size={16} className="inline mr-2 -mt-0.5" />
                    Generate Plan
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plan.external_dining.map((item, i) => (
                    <div key={`${item.restaurant_name}-${item.dish_name}-${i}`} className="transform transition duration-300 hover:scale-[1.02]">
                      <RestaurantRecommendationCard
                        restaurantName={item.restaurant_name}
                        dishName={item.item_name || item.dish_name}
                        price={item.price}
                        protein={item.protein}
                        kitchenNote={item.kitchen_note}
                        orderUrl={item.order_url}
                        matchedMealName={item.matched_meal_name}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "generate" && (
            <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {step === "input" && (
                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-3xl">
                  <div className="mb-8">
                    <h1 className="editorial-title mb-2 text-4xl sm:text-5xl">New Plan Generation</h1>
                    <p className="text-lg text-neutral-400">Enter patient signals and local climate context.</p>
                  </div>
                  {error && (
                    <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-400">
                      {error}
                    </div>
                  )}
                  <ClinicalIntakeForm onSubmit={handleGenerate} />
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                  <div className="relative mb-8 grid h-24 w-24 place-items-center rounded-full bg-white/5">
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#4a7c59] opacity-20" />
                    <Leaf size={32} className="animate-pulse text-[#4a7c59]" />
                  </div>
                  <h3 className="editorial-title text-2xl">Computing Clinical Targets</h3>
                  <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-500">
                    <p className="animate-pulse">Resolving location via Open-Meteo API...</p>
                    <p className="animate-pulse delay-100">Applying Harris-Benedict thermodynamics...</p>
                    <p className="animate-pulse delay-200">Matching dishes with strict AI constraints...</p>
                  </div>
                </motion.div>
              )}

              {step === "results" && plan && (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 no-print">
                    <div>
                      <h2 className="editorial-title text-xl sm:text-2xl mb-0.5">Calculated Nutrition Plan</h2>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        Personalized nutrition plan tailored for {plan.patient.age}y {plan.patient.gender} • {plan.patient.goal}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                        Print PDF
                      </button>
                      <button onClick={() => setStep("input")} className="flex items-center gap-2 rounded-xl bg-[#4a7c59] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3d6849]">
                        Start Over
                      </button>
                    </div>
                  </div>
                  <MacroScorecard plan={plan} />
                  <MealPlanView plan={plan} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
"""
write_file("src/app/dashboard/page.tsx", dashboard)
