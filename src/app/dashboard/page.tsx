"use client";

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
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: Number(data.age),
          weight: Number(data.weight),
          height: Number(data.height),
          gender: String(data.gender || "male").toLowerCase(),
          activity: String(data.activity || "sedentary"),
          goal: String(data.goal || "Lose weight"),
          goal_amount: String(data.goal_amount || "5kg"),
          city: String(data.city || "Islamabad"),
          country: String(data.country || "pakistan"),
          start_date: new Date().toISOString().split("T")[0],
          conditions: Array.isArray(data.conditions) ? data.conditions : [],
          allergies: Array.isArray(data.allergies) ? data.allergies : [],
          dietary_restrictions: Array.isArray(data.dietary_restrictions) ? data.dietary_restrictions : [],
          allow_external_dining: Boolean(data.allow_external_dining),
          pantry_items: Array.isArray(data.pantry_items) ? data.pantry_items : [],
          strict_pantry_mode: Boolean(data.strict_pantry_mode),
          preferences: data.preferences || {},
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorMessage = typeof errData.detail === "string" 
          ? errData.detail 
          : Array.isArray(errData.detail)
          ? errData.detail.map((e: any) => `${e.loc?.join(".")}: ${e.msg}`).join(", ")
          : "Failed to generate plan from backend.";
        throw new Error(errorMessage);
      }

      const result: PlanResponse = await response.json();
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
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#1A1D1E]/80 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
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

      <div className="flex sm:hidden overflow-x-auto p-3 border-b border-white/5 bg-[#1A1D1E] gap-2 print:hidden scrollbar-hide">
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
                  <ClinicalIntakeForm onSubmit={handleGenerate} loading={false} onInputChange={() => {}} />
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
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 print:hidden">
                    <div>
                      <h2 className="editorial-title text-xl sm:text-2xl mb-0.5">Calculated Nutrition Plan</h2>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        Personalized nutrition plan tailored for {plan.patient.age}y {plan.patient.gender} â€¢ {plan.patient.goal}
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

