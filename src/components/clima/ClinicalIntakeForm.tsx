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
  const [showIllness, setShowIllness] = useState(planMode === "recovery");
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
        conditions: Array.from(new Set([...asList(medical.conditions), ...asList(intake.conditions)])),
        allergies: Array.from(new Set([...asList(medical.allergies), ...asList(intake.allergies)])),
        dietary_restrictions: Array.from(new Set([...asList(medical.dietary_restrictions), ...asList(intake.dietary_restrictions)])),
        medical_history_notes: medical.medical_history_notes ?? intake.medical_history_notes ?? current.medical_history_notes,
        is_post_discharge: Boolean(medical.is_post_discharge ?? intake.is_post_discharge ?? current.is_post_discharge),
        recovery_type: medical.recovery_type ?? intake.recovery_type ?? current.recovery_type,
        spice_tolerance: medical.spice_tolerance ?? intake.spice_tolerance ?? current.spice_tolerance,
        pantry_items: Array.isArray(intake.pantry_items) ? intake.pantry_items : [],
        strict_pantry_mode: Boolean(intake.strict_pantry_mode),
        allow_external_dining: Boolean(intake.allow_external_dining ?? current.allow_external_dining),
      }));
    } catch (error) {
      console.error("Failed to parse saved profiles", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("patientProfile", JSON.stringify(d));
  }, [d]);

  const inputClass = "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:bg-surface-2 focus:border-indigo-500 focus:bg-surface-2 md:text-base";
  const labelClass = "mb-2 ml-1 block text-[13px] font-medium text-muted-foreground";
  const sectionClass = "rounded-[2rem] border border-border bg-card p-5 shadow-xl sm:p-7 md:p-8";

  const set = (key: keyof IntakeData, value: unknown) => {
    setD((current) => ({ ...current, [key]: value }));
    onInputChange();
  };

  const toggle = (key: "conditions" | "allergies" | "dietary_restrictions", value: string) => {
    const selected = d[key].includes(value);
    set(key, selected ? d[key].filter((item) => item !== value) : [...d[key], value]);
  };

  const includePending = (items: string[], pending: string) => {
    const value = pending.trim();
    return value && !items.includes(value) ? [...items, value] : items;
  };

  const addCustom = (key: "conditions" | "allergies" | "dietary_restrictions", value: string, clear: (value: string) => void) => {
    if (!value.trim() || d[key].includes(value.trim())) return;
    set(key, [...d[key], value.trim()]);
    clear("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pantryFromText = (d.pantry_input || "").split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    const submitted: IntakeData = {
      ...d,
      conditions: includePending(d.conditions, customCond),
      dietary_restrictions: includePending(d.dietary_restrictions, customDiet),
      allergies: includePending(d.allergies, customAllergy),
      pantry_items: Array.from(new Set([...(d.pantry_items || []), ...pantryFromText])),
      strict_pantry_mode: Boolean(d.strict_pantry_mode),
    };
    setD(submitted);
    setCustomCond("");
    setCustomDiet("");
    setCustomAllergy("");
    onSubmit(submitted);
  };

  const listField = (
    title: string,
    key: "conditions" | "dietary_restrictions" | "allergies",
    presets: string[],
    draft: string,
    setDraft: (value: string) => void,
    placeholder: string,
  ) => (
    <div>
      <label className={labelClass}>{title}</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map((item) => {
          const active = d[key].includes(item);
          return <button key={item} type="button" aria-pressed={active} onClick={() => toggle(key, item)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-border bg-surface-2 text-foreground hover:bg-border"}`}>{item}</button>;
        })}
        {d[key].filter((item) => !presets.includes(item)).map((item) => <button key={item} type="button" onClick={() => toggle(key, item)} className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">{item} Ã—</button>)}
      </div>
      <div className="flex gap-2">
        <input className={inputClass} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addCustom(key, draft, setDraft))} placeholder={placeholder} />
        <button type="button" onClick={() => addCustom(key, draft, setDraft)} className="rounded-xl border border-border bg-surface-2 px-4 text-foreground hover:bg-border">Add</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl flex-col gap-6 pb-12 font-sans sm:gap-8">
      <div className="mb-2 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Tailor your plan.</h2>
        <p className="text-sm text-muted-foreground sm:text-base">Tell us about your health, your goals, and what&apos;s in your kitchen.</p>
      </div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={sectionClass}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400"><MdDirectionsRun size={20} /></div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Personal Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="col-span-2"><label className={labelClass}>Name</label><input className={inputClass} value={d.name || "Patient"} onChange={(event) => set("name", event.target.value)} /></div>
          <div><label className={labelClass}>Age</label><input className={inputClass} type="number" value={d.age} onChange={(event) => set("age", Number(event.target.value))} /></div>
          <div><label className={labelClass}>Gender</label><select className={inputClass} value={d.gender} onChange={(event) => set("gender", event.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="unspecified">Unspecified</option></select></div>
          <div><label className={labelClass}>Weight (kg)</label><input className={inputClass} type="number" value={d.weight} onChange={(event) => set("weight", Number(event.target.value))} /></div>
          <div><label className={labelClass}>Height (cm)</label><input className={inputClass} type="number" value={d.height} onChange={(event) => set("height", Number(event.target.value))} /></div>
          <div className="col-span-2"><label className={labelClass}>Daily activity</label><select className={inputClass} value={d.activity} onChange={(event) => set("activity", event.target.value)}><option value="sedentary">Sedentary (desk job)</option><option value="lightly active">Lightly active (1â€“3 days/wk)</option><option value="moderately active">Moderately active (3â€“5 days/wk)</option><option value="very active">Very active (6â€“7 days/wk)</option><option value="extra active">Extra active (athlete)</option></select></div>
          <div className="col-span-2"><label className={labelClass}>Location for climate-based foods</label><div className="grid grid-cols-2 gap-3"><input className={inputClass} placeholder="City" value={d.city || "Lahore"} onChange={(event) => set("city", event.target.value)} /><input className={inputClass} placeholder="Country" value={d.country || "Pakistan"} onChange={(event) => set("country", event.target.value)} /></div></div>
          <div className="col-span-2"><label className={labelClass}>Main goal</label><select className={inputClass} value={d.goal} onChange={(event) => set("goal", event.target.value)}><option value="Lose weight">Lose weight</option><option value="Gain muscle">Gain muscle</option><option value="Maintain weight">Maintain weight</option><option value="Improve overall health">Improve overall health</option></select></div>
          <div className="col-span-2"><label className={labelClass}>Specific target</label><input className={inputClass} placeholder="Optional, e.g. 5kg" value={d.goal_amount} onChange={(event) => set("goal_amount", event.target.value)} /></div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400"><MdFavorite size={20} /></div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">2. Health Conditions &amp; Dietary Needs</h2>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-amber-200"><input type="checkbox" checked={Boolean(d.is_post_discharge)} onChange={(event) => set("is_post_discharge", event.target.checked)} className="accent-amber-400" />Post-discharge recovery protocol</label>
            {d.is_post_discharge && <div className="mt-4"><label className={labelClass}>Recovery focus</label><select className={inputClass} value={d.recovery_type || "Gastric Recovery (Bland & Soft)"} onChange={(event) => set("recovery_type", event.target.value)}><option>Gastric Recovery (Bland &amp; Soft)</option><option>Post-Surgery / Soft Food</option><option>Low BP / Hydration Focus</option><option>General Recovery</option></select></div>}
            <div className="mt-4"><label className={labelClass}>Spice preference</label><select className={inputClass} value={d.spice_tolerance || "Normal"} onChange={(event) => set("spice_tolerance", event.target.value)}><option value="Bland">Bland (Zero Spice)</option><option value="Low Spice">Low Spice</option><option value="Normal">Normal</option></select></div>
            <div className="mt-4"><label className={labelClass}>Doctor&apos;s medical notes</label><textarea className={`${inputClass} min-h-24 resize-y`} value={d.medical_history_notes || ""} onChange={(event) => set("medical_history_notes", event.target.value)} placeholder="Ongoing care instructions or dietary guidelines..." /></div>
          </div>
          {listField("Chronic conditions", "conditions", CONDITIONS_PRESET, customCond, setCustomCond, "Add a condition...")}
          {listField("Dietary restrictions", "dietary_restrictions", RESTRICTIONS_PRESET, customDiet, setCustomDiet, "Add a dietary restriction...")}
          {listField("Allergies", "allergies", ALLERGIES_PRESET, customAllergy, setCustomAllergy, "Add an allergy...")}
          <div className="border-t border-border pt-5">
            <button type="button" onClick={() => setShowIllness(!showIllness)} className="flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2 text-[13px] font-medium text-orange-300 transition-colors hover:text-orange-200">
              {showIllness ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />} Feeling under the weather today?
            </button>
            <AnimatePresence>{showIllness && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-4"><label className={labelClass}>Symptoms</label><input className={inputClass} value={d.acute_illness || ""} onChange={(event) => set("acute_illness", event.target.value)} placeholder="Flu, cough, sore throat, fever..." /><p className="ml-1 mt-2 text-xs text-muted-foreground">We&apos;ll account for this while building today&apos;s meal plan.</p></div></motion.div>}</AnimatePresence>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={sectionClass}>
        <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-green-500/10 p-2 text-green-400"><MdHome size={20} /></div><h2 className="text-xl font-semibold tracking-tight text-foreground">3. Your Kitchen &amp; Budget</h2></div>
        <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">Tell us what you have at home and we&apos;ll prioritize meals using those ingredients.</p>
        <textarea className={`${inputClass} min-h-28 resize-y rounded-3xl`} placeholder="e.g. Chicken, rice, tomatoes, onions, and eggs" value={d.pantry_input || ""} onChange={(event) => set("pantry_input", event.target.value)} />
        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          {planMode !== "recovery" && (
            <div><label className={labelClass}>Weekly food budget</label><select className={inputClass} value={d.weekly_budget || "No Limit"} onChange={(event) => set("weekly_budget", event.target.value)}><option>Under 5,000 PKR</option><option>5,000 - 10,000 PKR</option><option>10,000 - 15,000 PKR</option><option>No Limit</option></select></div>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-foreground"><input type="checkbox" className="mt-1 accent-emerald-400" checked={Boolean(d.strict_pantry_mode)} onChange={(event) => set("strict_pantry_mode", event.target.checked)} /><span><strong>Strict pantry mode</strong><br /><span className="text-xs text-muted-foreground">Restrict meals to your available ingredients and staples.</span></span></label>
        </div>
      </motion.section>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-5 text-[17px] font-semibold text-background shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? <><MdAutorenew className="animate-spin" size={20} /> Preparing your plan...</> : "Generate Personal Plan"}
      </motion.button>
    </form>
  );
}




