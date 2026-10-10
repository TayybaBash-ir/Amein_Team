"use client";

import { useState, useEffect, useRef } from "react";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znsqzyxmotdzzylwpdcb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3F6eXhtb3Rkenp5bHdwZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDg4MTMsImV4cCI6MjEwNjUyNDgxM30.Sp4946ezcz8YEyQ5BfnLW3SwafXni8wt825fhcIgqGY";
const supabase = createClient(supabaseUrl, supabaseKey);
import Link from "next/link";
import { MdEco, MdArrowBack, MdRestaurantMenu, MdPerson, MdList, MdDashboard, MdAdd, MdWbSunny, MdDarkMode } from "react-icons/md";
import AuthButton from "@/components/clima/AuthButton";
import { motion, AnimatePresence } from "framer-motion";
import DashboardBackground from "@/components/clima/DashboardBackground";
import ClinicalIntakeForm from "@/components/clima/ClinicalIntakeForm";
import MacroScorecard from "@/components/clima/MacroScorecard";
import MealPlanView from "@/components/clima/MealPlanView";
import { RestaurantRecommendationCard } from "@/components/clima/RestaurantRecommendationCard";
import { useRouter, useSearchParams } from "next/navigation";
import { type PlanResponse, type IntakeData } from "@/lib/mock";
import DashboardBento from "@/components/clima/DashboardBento";


type ScreenStep = "home" | "input" | "loading" | "results";
type AppTab = "generate" | "restaurants";

function hydrationDateKey() {
  return new Date().toISOString().split("T")[0];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab: AppTab = searchParams.get("tab") === "restaurants" ? "restaurants" : "generate";
  const setActiveTab = (tab: AppTab) => router.push(tab === "restaurants" ? "/dashboard?tab=restaurants" : "/dashboard");
  const previousTab = useRef(activeTab);
  const [pendingRestaurantTarget, setPendingRestaurantTarget] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(undefined);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clima_patient_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setHasProfile(!!(p.age && p.weight && p.height));
      } else {
        setHasProfile(false);
      }
    } catch {
      setHasProfile(false);
    }
  }, []);

  

  const [step, setStep] = useState<ScreenStep>("home");
  const [planMode, setPlanMode] = useState<"standard" | "recovery">("standard");

  useEffect(() => {
    if (previousTab.current === "restaurants" && activeTab === "generate") setStep("home");
    previousTab.current = activeTab;
  }, [activeTab]);

  const goToRestaurant = (restaurantName: string, mealId?: string) => {
    setPendingRestaurantTarget(mealId ? `restaurant-meal-${mealId}` : `restaurant-${restaurantName}`);
    setActiveTab("restaurants");
  };

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
    const [activePlan, setActivePlan] = useState<any>(null);
  const [hydrationLog, setHydrationLog] = useState<number>(0);
  
  useEffect(() => {
    try {
      const active = localStorage.getItem("clima_active_plan");
      if (active) {
        const storedPlan = JSON.parse(active);
        setActivePlan(storedPlan);
        setPlan(storedPlan.plan || null);
      }
      
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      setHydrationLog(log[hydrationDateKey()] || 0);
    } catch (e) {}
  }, []);

  const handleHydrationChange = (amount: number) => {
    try {
      const today = hydrationDateKey();
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      const current = Number(log[today] ?? hydrationLog) || 0;
      log[today] = Math.max(0, Math.min(30, current + amount));
      localStorage.setItem("clima_hydration", JSON.stringify(log));
      setHydrationLog(log[today]);
    } catch (e) {}
  };
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  useEffect(() => {
    if (activeTab !== "restaurants" || !pendingRestaurantTarget) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingRestaurantTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingRestaurantTarget(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, pendingRestaurantTarget, plan]);
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    const handleReturnHome = () => setStep("home");
    window.addEventListener("climadiet:return-home", handleReturnHome);
    return () => window.removeEventListener("climadiet:return-home", handleReturnHome);
  }, []);

  const [savedProfile, setSavedProfile] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("clima_patient_profile");
      setSavedProfile(storedProfile ? JSON.parse(storedProfile) : null);
    } catch {
      setSavedProfile(null);
    }
  }, []);

  if (user === undefined) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" /></div>;

  if (user === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark shadow-xl shadow-brand/20 mb-6">
          <MdEco size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to ClimaDiet</h1>
        <p className="text-muted-foreground max-w-sm mb-8">Your personalized clinical nutrition journey starts here. Please sign in to continue.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
          className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors font-bold shadow-lg"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 border border-border shadow-xl mb-6">
          <MdPerson size={32} className="text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground max-w-md mb-8">Before we can generate your perfect meal plan, we need some basic health information to calibrate our clinical AI.</p>
        <button 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-6 py-4 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors font-bold shadow-lg shadow-brand/25"
        >
          Setup My Profile
        </button>
      </div>
    );
  }

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
        pantry_input: data.pantry_input || "",
        weekly_budget: data.weekly_budget || "No Limit",
        acute_illness: data.acute_illness || "",
        temporary_aversions: data.temporary_aversions || "",
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
          metabolic_modifier: (updatedProfile as any).metabolic_modifier || 1.0,
          medical_history_notes: updatedProfile.medical_history_notes,
          acute_illness: data.acute_illness || "",
          temporary_aversions: data.temporary_aversions || "",
          weekly_budget: data.weekly_budget || "No Limit",
          pantry_input: data.pantry_input || "",
          is_post_discharge: updatedProfile.is_post_discharge,
          recovery_type: updatedProfile.recovery_type,
          spice_tolerance: updatedProfile.spice_tolerance,
          allow_external_dining: Boolean(data.allow_external_dining),
          pantry_items: updatedProfile.pantry_items,
          strict_pantry_mode: updatedProfile.strict_pantry_mode,
          preferences: data.preferences || {},
        }),
      });

      const responseText = await response.text();
      let responseData: any = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch { /* Non-JSON upstream errors get a readable message below. */ }

      if (!response.ok) {
        const errData = responseData;
        const errorMessage = typeof errData?.detail === "string"
          ? errData.detail 
          : Array.isArray(errData?.detail)
          ? errData.detail.map((e: any) => `${e.loc?.join(".")}: ${e.msg}`).join(", ")
          : response.status >= 500
          ? "The plan service is temporarily unavailable. Please try again in a moment."
          : `Plan request failed (HTTP ${response.status}). Please review your details and try again.`;
        throw new Error(errorMessage);
      }

      if (!responseData?.meal_plan?.days || !Array.isArray(responseData.meal_plan.days)) {
        throw new Error("The plan service returned an invalid response. Please try again in a moment.");
      }

      const result: PlanResponse = responseData;
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
        const activeData = { plan: result, startDate: planMeta.date, id: planMeta.id };
        localStorage.setItem("clima_active_plan", JSON.stringify(activeData));
        setActivePlan(activeData);
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
      activeTab === tab ? "bg-brand/20 text-brand" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
    }`;

  return (
        <div className="min-h-screen bg-background text-foreground selection:bg-brand/30 relative">
      <DashboardBackground />
      <div className="relative z-10 flex flex-col min-h-screen pb-24 sm:pb-8">

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
        <div className="flex items-center gap-3">
          {step !== "home" && activeTab === "generate" && (
            <button
              onClick={() => { setStep("home"); }}
              className="mr-1 flex items-center justify-center h-8 w-8 rounded-xl bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
              title="Back to home"
            >
              <MdArrowBack size={18} />
            </button>
          )}
          <Link href="/" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-foreground" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-foreground">ClimaDiet</span>
          </Link>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => { setActiveTab("generate"); setStep("home"); }} className={navItemClass("generate", "Generate")}>
              <MdDashboard size={16} /> Home
            </button>
            <button onClick={() => setActiveTab("restaurants")} className={navItemClass("restaurants", "Restaurants")}>
              <MdRestaurantMenu size={16} /> Restaurants
            </button>
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
              <MdPerson size={16} /> Profile
            </Link>
            <Link href="/plans" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
              <MdList size={16} /> Saved Plans
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-surface hover:bg-surface-2 text-foreground transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <MdWbSunny size={18} /> : <MdDarkMode size={18} />}
          </button>
          
        </div>
      </nav>

      <main className="mx-auto max-w-5xl w-full max-w-[100vw] overflow-x-hidden p-4 sm:p-8 pb-6 sm:pb-8">
        {(savedProfile?.is_post_discharge || savedProfile?.spice_tolerance === "Bland") && (
          <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            <span aria-hidden="true">🏥</span>
            <span>Active Protocol: Post-Discharge Recovery (Bland & Soft Foods Enforced)</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === "restaurants" && (
            <motion.div key="restaurants" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }} className="pt-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Local Restaurant Matches</h2>
              <p className="text-muted-foreground mb-8">Dishes available to order from nearby restaurants that perfectly match your generated meal plan.</p>
              
              {!plan || !plan.external_dining || plan.external_dining.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-surface">
                  <MdRestaurantMenu size={32} className="mx-auto text-neutral-600 mb-4" />
                  <h3 className="text-lg font-bold text-muted-foreground">No restaurants matched</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Generate a meal plan to discover health-safe dishes available from local delivery partners near you.
                  </p>
                  <button onClick={() => setActiveTab("generate")} className="mt-6 rounded-lg bg-brand-dark px-6 py-2 text-sm font-medium text-white hover:bg-brand">

                    <MdAdd size={16} className="inline mr-2 -mt-0.5" />
                    Generate Plan
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plan.external_dining.map((item, i) => (
                    <div id={item.matched_meal_id ? `restaurant-meal-${item.matched_meal_id}` : `restaurant-${item.restaurant_name}`} key={`${item.restaurant_name}-${item.dish_name}-${i}`} className="transform scroll-mt-24 transition duration-300 hover:scale-[1.02]">
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
            <motion.div key="generate" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }} className="w-full max-w-[100vw] overflow-x-hidden" {...(step !== "home" ? { "data-no-page-swipe": "true" } : {})}>
              {step !== "home" && (
                <style>{`
                  nav[aria-label="Main navigation"] { display: none !important; }
                `}</style>
              )}
              {step === "input" && (
                <button onClick={() => setStep("home")} className="mb-4 flex items-center text-sm font-bold text-muted-foreground hover:text-foreground">
                  <MdArrowBack size={18} className="mr-1" /> Back to Dashboard
                </button>
              )}
              {step === "home" && (
                <div className="w-full">
                  <DashboardBento 
                    onAction={handleHeroAction} 
                    activePlan={activePlan} 
                    hydrationLog={hydrationLog} 
                    onHydrate={() => handleHydrationChange(1)}
                    onUndoHydrate={() => handleHydrationChange(-1)}
                    onGoToRestaurant={goToRestaurant}
                  />
                </div>
              )}

              {step === "input" && (
                <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-3xl">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create Your Daily Meal Plan</h2>
                    <p className="text-muted-foreground">Tell us about yourself so we can curate meals tailored to your health and weather.</p>
                  </div>
                  {error && (
                    <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-400">
                      {error}
                    </div>
                  )}
                  {planMode === "recovery" && (
                    <div className="mb-6 rounded-xl border border-brand/20 bg-brand/10 p-4">
                      <h3 className="text-sm font-bold text-brand mb-1 flex items-center gap-2"><MdPerson size={16}/> Sickness & Recovery Mode</h3>
                      <p className="text-xs text-brand/80">Tell us what you're feeling and we will generate a fast 3-day recovery meal plan with foods to eat and avoid. Budget filtering is disabled to prioritize your health.</p>
                    </div>
                  )}
                  <ClinicalIntakeForm onSubmit={handleGenerate} loading={false} planMode={planMode} onInputChange={() => {}} />
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                  <div className="relative mb-8 grid h-24 w-24 place-items-center rounded-full bg-surface-2">
                    <div className="absolute inset-0 animate-ping rounded-full border-2 border-brand opacity-20" />
                    <MdEco size={32} className="animate-pulse text-brand" />
                  </div>
                  <h3 className="editorial-title text-2xl font-bold text-foreground mb-2">Preparing Your Custom Meal Plan...</h3>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Tailoring health-safe dishes to your weather and medical profile...
                  </p>
                </motion.div>
              )}

              {step === "results" && plan && (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 pb-20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-1">Your Health Overview</h2>
                      <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span>Personalized nutrition plan tailored</span>
                          <span className="text-brand text-lg leading-none">&bull;</span>
                          <span>Goal: {savedProfile?.goal || plan.patient?.goal || "Improve health"}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2">
                        Print PDF
                      </button>
                      <button onClick={() => setStep("home")} className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                        Start Over
                      </button>
                    </div>
                  </div>
                  <MacroScorecard plan={plan} />
                  <MealPlanView plan={plan} onGoToRestaurant={goToRestaurant} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent />
    </Suspense>
  );
}
