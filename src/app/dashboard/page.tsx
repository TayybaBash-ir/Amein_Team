"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znsqzyxmotdzzylwpdcb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3F6eXhtb3Rkenp5bHdwZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDg4MTMsImV4cCI6MjEwNjUyNDgxM30.Sp4946ezcz8YEyQ5BfnLW3SwafXni8wt825fhcIgqGY";
const supabase = createClient(supabaseUrl, supabaseKey);
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
import TodayMealTile from "@/components/clima/TodayMealTile";

type ScreenStep = "home" | "input" | "loading" | "results";
type AppTab = "generate" | "restaurants";

export default function Dashboard() {
  const router = useRouter();
  
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
      if (active) setActivePlan(JSON.parse(active));
      
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      const today = new Date().toISOString().split('T')[0];
      setHydrationLog(log[today] || 0);
    } catch (e) {}
  }, []);

  const handleHydrate = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const log = JSON.parse(localStorage.getItem("clima_hydration") || "{}");
      log[today] = (log[today] || 0) + 1;
      localStorage.setItem("clima_hydration", JSON.stringify(log));
      setHydrationLog(log[today]);
    } catch (e) {}
  };

  const [activeTab, setActiveTab] = useState<AppTab>("generate");
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
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
    <div className="min-h-screen bg-background text-foreground selection:bg-brand/30">
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
          <AuthButton />
        </div>
      </nav>

      <div className="flex sm:hidden justify-around p-3 border-b border-border bg-background gap-2 print:hidden scrollbar-hide">
          {step !== "home" && activeTab === "generate" && (
            <button onClick={() => setStep("home")} className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground">
              <MdArrowBack size={24} />
            </button>
          )}
          <button onClick={() => { setActiveTab("generate"); setStep("home"); }} className={`flex items-center justify-center p-2 rounded-lg ${activeTab === "generate" ? "text-brand" : "text-muted-foreground hover:bg-surface-2"}`}>
            <MdDashboard size={24} />
          </button>
          <button onClick={() => setActiveTab("restaurants")} className={`flex items-center justify-center p-2 rounded-lg ${activeTab === "restaurants" ? "text-brand" : "text-muted-foreground hover:bg-surface-2"}`}>
            <MdRestaurantMenu size={24} />
          </button>
          <Link href="/profile" className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2">
            <MdPerson size={24} />
          </Link>
          <Link href="/plans" className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2">
            <MdList size={24} />
          </Link>
        </div>

      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        {(savedProfile?.is_post_discharge || savedProfile?.spice_tolerance === "Bland") && (
          <div role="status" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            <span aria-hidden="true">🏥</span>
            <span>Active Protocol: Post-Discharge Recovery (Bland & Soft Foods Enforced)</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === "restaurants" && (
            <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Local Restaurant Matches</h2>
              <p className="text-muted-foreground mb-8">Dishes available to order from nearby restaurants that perfectly match your generated meal plan.</p>
              
              {!plan || !plan.external_dining || plan.external_dining.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-surface">
                  <MdRestaurantMenu size={32} className="mx-auto text-neutral-600 mb-4" />
                  <h3 className="text-lg font-bold text-muted-foreground">No restaurants matched</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    Generate a meal plan to discover health-safe dishes available from local delivery partners near you.
                  </p>
                  <button onClick={() => setActiveTab("generate")} className="mt-6 rounded-lg bg-[#4a7c59] px-6 py-2 text-sm font-medium text-foreground hover:bg-[#3d6849]">

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
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
                  <div className="flex-1 w-full max-w-2xl mx-auto">
                    <HomeHero onAction={handleHeroAction} />
                  </div>
                  {activePlan && (
                    <div className="w-full lg:w-[400px] shrink-0 mt-8 lg:mt-24">
                      <TodayMealTile activePlan={activePlan} onHydrate={handleHydrate} hydrationLog={hydrationLog} />
                    </div>
                  )}
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
                  <MealPlanView plan={plan} onGoToRestaurant={(r) => { setActiveTab('restaurants'); setTimeout(() => { const el = document.getElementById('restaurant-' + r); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
