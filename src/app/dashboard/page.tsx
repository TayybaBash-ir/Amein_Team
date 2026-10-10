"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdEco, MdArrowBack, MdRestaurantMenu, MdPerson, MdList, MdDashboard, MdAdd, MdWbSunny, MdDarkMode } from "react-icons/md";
import AuthButton from "@/components/clima/AuthButton";
import { motion, AnimatePresence } from "framer-motion";
import ClinicalIntakeForm from "@/components/clima/ClinicalIntakeForm";
import MacroScorecard from "@/components/clima/MacroScorecard";
import MealPlanView from "@/components/clima/MealPlanView";
import { RestaurantRecommendationCard } from "@/components/clima/RestaurantRecommendationCard";
import { useRouter } from "next/navigation";
import { type PlanResponse, type IntakeData } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";
import HomeHero from "@/components/clima/HomeHero";

type ScreenStep = "home" | "input" | "loading" | "results";
type AppTab = "generate" | "restaurants";

export default function Dashboard() {
  const router = useRouter();
  const [step, setStep] = useState<ScreenStep>("home");
  const [planMode, setPlanMode] = useState<"standard" | "recovery">("standard");

  const handleHeroAction = (action: 'standard' | 'recovery' | 'restaurants' | 'saved') => {
    if (action === 'standard') {
      setPlanMode("standard");
      setStep("input");
    } else if (action === 'recovery') {
      setPlanMode("recovery");
      setStep("input");
    } else if (action === 'restaurants') {
      setActiveTab("restaurants");
    } else if (action === 'saved') {
      router.push('/plans');
    }
  };
  const [activeTab, setActiveTab] = useState<AppTab>("generate");
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const [savedProfile, setSavedProfile] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("clima_patient_profile");
      setSavedProfile(storedProfile ? JSON.parse(storedProfile) : null);
    } catch {
      setSavedProfile(null);
    }
  }, []);

const handleGenerate = async (data: IntakeData) => {
    setStep("loading");
    setError(null);
    try {
      let medicalProfile: Record<string, any> = {};
      try {
        medicalProfile = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
      } catch { /* Ignore an invalid saved profile and continue with intake values. */ }
      const asList = (value: unknown): string[] => Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
      const mergeLists = (...values: unknown[]) => Array.from(new Set(values.flatMap(asList)));
      const updatedProfile = {
        ...medicalProfile,
        name: data.name || "Patient",
        age: Number(data.age) || 30,
        height: Number(data.height) || 170,
        weight: Number(data.weight) || 70,
        gender: String(data.gender || "male").toLowerCase(),
        conditions: mergeLists(data.conditions),
        allergies: mergeLists(data.allergies),
        dietary_restrictions: mergeLists(data.dietary_restrictions),
        medical_history_notes: data.medical_history_notes || "",
        is_post_discharge: Boolean(data.is_post_discharge),
        recovery_type: data.recovery_type || "None",
        spice_tolerance: data.spice_tolerance || "Normal",
        pantry_items: Array.isArray(data.pantry_items) ? data.pantry_items : [],
        strict_pantry_mode: Boolean(data.strict_pantry_mode),
        city: data.city || medicalProfile.city || "Lahore",
        country: data.country || medicalProfile.country || "Pakistan",
      };
      localStorage.setItem("clima_patient_profile", JSON.stringify(updatedProfile));
      setSavedProfile(updatedProfile);
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_mode: planMode,
          name: updatedProfile.name,
          age: updatedProfile.age,
          weight: updatedProfile.weight,
          height: updatedProfile.height,
          gender: updatedProfile.gender,
          activity: String(data.activity || "sedentary"),
          goal: String(data.goal || "Lose weight"),
          goal_amount: String(data.goal_amount || "5kg"),
          city: String(updatedProfile.city),
          country: String(updatedProfile.country),
          start_date: new Date().toISOString().split("T")[0],
          conditions: updatedProfile.conditions,
          allergies: updatedProfile.allergies,
          dietary_restrictions: updatedProfile.dietary_restrictions,
          medical_history_notes: updatedProfile.medical_history_notes,
          is_post_discharge: updatedProfile.is_post_discharge,
          recovery_type: updatedProfile.recovery_type,
          spice_tolerance: updatedProfile.spice_tolerance,
          allow_external_dining: Boolean(data.allow_external_dining),
          pantry_items: updatedProfile.pantry_items,
          strict_pantry_mode: updatedProfile.strict_pantry_mode,
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
      
      // Save to past plans
      try {
        const past = JSON.parse(localStorage.getItem('clima_past_plans') || '[]');
        const planMeta = { 
          id: Date.now().toString(), 
          date: new Date().toISOString(), 
          mode: planMode,
          plan: result 
        };
        localStorage.setItem('clima_past_plans', JSON.stringify([planMeta, ...past].slice(0, 50))); // keep last 50
      } catch (e) { console.error("Could not save plan", e); }

      setStep("results");
      setActiveTab("generate");
    } catch (err: any) {
      setError(err.message || "Failed to connect to plan generation API.");
      setStep("input");
    }
  };

  const navItemClass = (tab: AppTab, label: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab ? "bg-indigo-500/20 text-indigo-300" : "text-neutral-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-[#0F1117] selection:bg-indigo-500/30">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0F1117]/85 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
        <div className="flex items-center gap-3">
          {/* Back arrow — shown when not on home screen */}
          {step !== "home" && activeTab === "generate" && (
            <button
              onClick={() => { setStep("home"); }}
              className="mr-1 flex items-center justify-center h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title="Back to home"
            >
              <MdArrowBack size={18} />
            </button>
          )}
          <Link href="/" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-white">ClimaDiet</span>
          </Link>
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => { setActiveTab("generate"); setStep("home"); }} className={navItemClass("generate", "Generate")}>
              <MdDashboard size={16} /> Home
            </button>
            <button onClick={() => setActiveTab("restaurants")} className={navItemClass("restaurants", "Restaurants")}>
              <MdRestaurantMenu size={16} /> Restaurants
            </button>
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
              <MdPerson size={16} /> Profile
            </Link>
            <Link href="/plans" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
              <MdList size={16} /> Saved Plans
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <MdWbSunny size={18} /> : <MdDarkMode size={18} />}
          </button>
          <AuthButton />
        </div>
      </nav>

      <div className="flex sm:hidden overflow-x-auto p-3 border-b border-white/5 bg-[#0F1117] gap-2 print:hidden scrollbar-hide">
        {step !== "home" && activeTab === "generate" && (
          <button onClick={() => setStep("home")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400">
            <MdArrowBack size={16} /> Back
          </button>
        )}
        <button onClick={() => { setActiveTab("generate"); setStep("home"); }} className={navItemClass("generate", "Generate")}>Home</button>
        <button onClick={() => setActiveTab("restaurants")} className={navItemClass("restaurants", "Restaurants")}>Restaurants</button>
        <Link href="/profile" className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400">Profile</Link>
        <Link href="/plans" className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400">Saved Plans</Link>
      </div>


      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        {(savedProfile?.is_post_discharge || savedProfile?.spice_tolerance === "Bland") && (
          <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            <span aria-hidden="true">🏥</span>
            <span>Active Protocol: Post-Discharge Recovery (Bland &amp; Soft Foods Enforced)</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          

          {activeTab === "restaurants" && (
            <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
              <h2 className="text-2xl font-bold text-white mb-2">Local Restaurant Matches</h2>
              <p className="text-neutral-400 mb-8">Dishes available to order from nearby restaurants that perfectly match your generated meal plan.</p>
              
              {!plan || !plan.external_dining || plan.external_dining.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <MdRestaurantMenu size={32} className="mx-auto text-neutral-600 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-300">No restaurants matched</h3>
                  <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">Generate a new clinical meal plan first. If any meals match our Foodpanda catalog, they will appear here!</p>
                  <button onClick={() => setActiveTab("generate")} className="mt-6 rounded-lg bg-[#4a7c59] px-6 py-2 text-sm font-medium text-white hover:bg-[#3d6849]">
                    <MdAdd size={16} className="inline mr-2 -mt-0.5" />
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
              {step === "home" && (
                <HomeHero onAction={handleHeroAction} />
              )}

              {step === "input" && (
                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-3xl">
                  
                  {error && (
                    <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-400">
                      {error}
                    </div>
                  )}
                  {planMode === "recovery" && (
                    <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                      <h3 className="text-sm font-bold text-indigo-400 mb-1 flex items-center gap-2"><MdPerson size={16}/> Sickness & Recovery Mode</h3>
                      <p className="text-xs text-indigo-300/80">Tell us what you're feeling and we will generate a fast 3-day recovery meal plan with foods to eat and avoid. Budget filtering is disabled to prioritize your health.</p>
                    </div>
                  )}
                  <ClinicalIntakeForm onSubmit={handleGenerate} loading={loading} planMode={planMode} onInputChange={() => {}} />
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                  <div className="relative mb-8 grid h-24 w-24 place-items-center rounded-full bg-white/5">
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#4a7c59] opacity-20" />
                    <MdEco size={32} className="animate-pulse text-[#4a7c59]" />
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
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">Your Health Overview</h2>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        Perfectly balanced for {plan.patient.age}y {plan.patient.gender} â€¢ {plan.patient.goal}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                        Print PDF
                      </button>
                      <button onClick={() => setStep("home")} className="flex items-center gap-2 rounded-xl bg-[#4a7c59] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3d6849]">
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

