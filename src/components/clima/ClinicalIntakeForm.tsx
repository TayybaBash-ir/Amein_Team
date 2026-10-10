"use client";

import { useEffect, useState } from "react";
import { MdAutorenew, MdFavorite, MdDirectionsRun, MdHome, MdExpandLess, MdExpandMore } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { type IntakeData } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";

const CONDITIONS_PRESET = ["Low BP", "Hypertension", "Diabetes", "Gastritis / GORD", "Kidney Disease", "High Cholesterol", "PCOS"];
const RESTRICTIONS_PRESET = ["Halal", "Vegetarian", "Vegan", "Low Sodium"];
const ALLERGIES_PRESET = ["Nuts", "Dairy", "Peanuts", "Shellfish"];

export default function ClinicalIntakeForm({
  onSubmit,
  loading,
  onInputChange,
  planMode = "standard",
}: {
  onSubmit: (data: IntakeData) => void;
  loading: boolean;
  onInputChange: () => void;
  planMode?: "standard" | "recovery";
}) {
  const [d, setD] = useState<IntakeData>({
    name: "Patient",
    age: 32,
    weight: 85,
    height: 175,
    gender: "male",
    activity: "sedentary",
    goal: "Lose weight",
    goal_amount: "5kg",
    conditions: [],
    allergies: [],
    dietary_restrictions: [],
    medical_history_notes: "",
    is_post_discharge: false,
    recovery_type: "None",
    spice_tolerance: "Normal",
    pantry_items: [],
    pantry_input: "",
    strict_pantry_mode: false,
    city: "Lahore",
    country: "Pakistan",
    weekly_budget: "No Limit",
    acute_illness: "",
    allow_external_dining: true,
    preferences: { cuisine: "Balanced Mix", carb: "Surprise Me", snack: "Savory & Salty", strictness: "Very Strict" },
  });
  const [customCond, setCustomCond] = useState("");
  const [customDiet, setCustomDiet] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");

  useEffect(() => {
    const savedIntake = localStorage.getItem("patientProfile");
    const savedMedicalProfile = localStorage.getItem("clima_patient_profile");
    const asList = (value: unknown): string[] => Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

    try {
      const intake = savedIntake ? JSON.parse(savedIntake) : {};
      const medical = savedMedicalProfile ? JSON.parse(savedMedicalProfile) : {};
      setD((current) => ({
        ...current,
        ...intake,
        name: medical.name || intake.name || current.name,
        age: Number(medical.age ?? intake.age ?? current.age),
        weight: Number(medical.weight ?? intake.weight ?? current.weight),
        height: Number(medical.height ?? intake.height ?? current.height),
        gender: String(medical.gender ?? intake.gender ?? current.gender).toLowerCase(),
        activity: medical.activity || intake.activity || current.activity,
        goal: medical.goal || intake.goal || current.goal,
        goal_amount: medical.goal_amount || intake.goal_amount || current.goal_amount,
        city: medical.city || intake.city || current.city,
        country: medical.country || intake.country || current.country,
        conditions: Array.from(new Set([...asList(medical.conditions), ...asList(intake.conditions)])),
        allergies: Array.from(new Set([...asList(medical.allergies), ...asList(intake.allergies)])),
        dietary_restrictions: Array.from(new Set([...asList(medical.dietary_restrictions), ...asList(intake.dietary_restrictions)])),
      }));
    } catch { /* ignore */ }
  }, []);

  const set = (key: keyof IntakeData, val: any) => {
    setD((prev) => {
      const next = { ...prev, [key]: val };
      onInputChange();
      return next;
    });
  };

  const handleListAdd = (key: "conditions" | "dietary_restrictions" | "allergies", val: string, resetFn: () => void) => {
    if (!val.trim()) return;
    set(key, Array.from(new Set([...d[key], val.trim()])));
    resetFn();
  };

  const listField = (
    label: string,
    key: "conditions" | "dietary_restrictions" | "allergies",
    presets: string[],
    customVal: string,
    setCustom: (s: string) => void,
    placeholder: string
  ) => (
    <div className="border-t border-border pt-5">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((c) => {
          const active = d[key].includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => {
                const nextList = active ? d[key].filter((x) => x !== c) : [...d[key], c];
                set(key, nextList);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                active ? "border-brand/50 bg-brand/15 text-brand dark:text-brand" : "border-border bg-surface text-foreground hover:bg-surface-2 hover:border-brand/30"
              }`}
            >
              {c}
            </button>
          );
        })}
        {d[key].filter((c) => !presets.includes(c)).map((c) => (
          <span key={c} className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 pl-3 pr-2 py-1.5 text-xs font-semibold text-brand dark:text-brand">
            {c}
            <button type="button" onClick={() => set(key, d[key].filter((x) => x !== c))} className="rounded-full p-0.5 hover:bg-brand/20 text-brand hover:text-brand-dark dark:hover:text-brand">
              <MdExpandLess className="rotate-45" size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={inputClass} value={customVal} onChange={(e) => setCustom(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleListAdd(key, customVal, () => setCustom("")); } }} />
        <button type="button" onClick={() => handleListAdd(key, customVal, () => setCustom(""))} className="rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark transition-colors">
          Add
        </button>
      </div>
    </div>
  );

  const sectionClass = "mb-4 rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xl shadow-black/5";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const inputClass = "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:bg-surface-2 focus:border-brand focus:bg-surface-2 md:text-base";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(d); }} className="mx-auto w-full max-w-2xl">
      
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400"><MdFavorite size={20} /></div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Health Conditions & Dietary Needs</h2>
        </div>
        <div className="space-y-6">
          <div className="mb-6">
            <label className={labelClass}>AI Health Goal</label>
            <input className={inputClass} value={d.goal || ""} placeholder="e.g. 'I want to lose 5 kg weight in 1 month'" onChange={(e) => set("goal", e.target.value)} />
          </div>
          {listField("Chronic conditions (Optional)", "conditions", CONDITIONS_PRESET, customCond, setCustomCond, "Add a condition...")}
          {listField("Dietary restrictions (Optional)", "dietary_restrictions", RESTRICTIONS_PRESET, customDiet, setCustomDiet, "Add a dietary restriction...")}
          {listField("Allergies (Optional)", "allergies", ALLERGIES_PRESET, customAllergy, setCustomAllergy, "Add an allergy...")}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={sectionClass}>
        <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-green-500/10 p-2 text-green-400"><MdHome size={20} /></div><h2 className="text-xl font-semibold tracking-tight text-foreground">2. Your Kitchen & Budget</h2></div>
        <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">Tell us what you have at home and we&apos;ll prioritize meals using those ingredients.</p>
        <textarea className={`${inputClass} min-h-28 resize-y rounded-3xl`} placeholder="e.g. Chicken, rice, tomatoes, onions, and eggs" value={d.pantry_input || ""} onChange={(event) => set("pantry_input", event.target.value)} />
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          {planMode !== "recovery" && (
            <div><label className={labelClass}>Weekly food budget</label><select className={inputClass} value={d.weekly_budget || "No Limit"} onChange={(event) => set("weekly_budget", event.target.value)}><option>Under 5,000 PKR</option><option>5,000 - 10,000 PKR</option><option>10,000 - 15,000 PKR</option><option>No Limit</option></select></div>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-foreground"><input type="checkbox" className="mt-1 accent-brand" checked={Boolean(d.strict_pantry_mode)} onChange={(event) => set("strict_pantry_mode", event.target.checked)} /><span><strong>Use only what I have</strong></span></label>
        </div>
      </motion.section>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-5 text-[17px] font-semibold text-background shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? <><MdAutorenew className="animate-spin" size={20} /> Preparing your plan...</> : "Generate Personal Plan"}
      </motion.button>
    </form>
  );
}
