
"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, HeartPulse, Activity, Home, Apple } from "lucide-react";
import { type IntakeData } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

const CONDITIONS_PRESET = ["Diabetes", "Hypertension", "PCOS"];
const RESTRICTIONS_PRESET = ["Halal", "Vegan", "Low Sodium"];
const ALLERGIES_PRESET = ["Peanuts", "Shellfish", "Dairy"];

export default function ClinicalIntakeForm({
  onSubmit,
  loading,
  onInputChange,
}: {
  onSubmit: (d: IntakeData) => void;
  loading: boolean;
  onInputChange: () => void;
}) {
  const [d, setD] = useState<IntakeData>({
    age: 32,
    weight: 85,
    height: 175,
    gender: "male",
    activity: "sedentary",
    goal: "Lose weight",
    goal_amount: "5kg",
    weekly_budget: "No Limit",
    acute_illness: "",
    conditions: [],
    allergies: [],
    dietary_restrictions: [],
    pantry_items: [],
    pantry_input: "",
    strict_pantry_mode: false,
    city: "Lahore",
    country: "Pakistan",
  });
  const [customCond, setCustomCond] = useState("");
  const [customDiet, setCustomDiet] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");
  const [customPantryItem, setCustomPantryItem] = useState("");
  const [showIllness, setShowIllness] = useState(false);

  useEffect(() => { onInputChange(); }, [d, onInputChange]);
  const set = (k: keyof IntakeData, v: any) => setD({ ...d, [k]: v });
  const toggle = (list: string[], val: string, key: keyof IntakeData) => set(key, list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  const includePending = (list: string[], val: string) => val.trim() && !list.includes(val.trim()) ? [...list, val.trim()] : list;

  const handleAddPantryItem = () => {
    const item = customPantryItem.trim();
    if (!item || (d.pantry_items || []).some((existing) => existing.toLowerCase() === item.toLowerCase())) return;
    set("pantry_items", [...(d.pantry_items || []), item]);
    setCustomPantryItem("");
  };

  // Apple-like inputs
  const inputClass = "w-full bg-white/5 border border-white/5 focus:bg-white/10 focus:border-white/20 hover:bg-white/[0.07] rounded-2xl px-4 py-3 outline-none text-white transition-all placeholder:text-neutral-500 text-sm md:text-base";
  const labelClass = "block text-[13px] font-medium text-neutral-400 mb-2 ml-1";
  const sectionClass = "rounded-[2rem] border border-white/[0.04] bg-white/[0.02] p-5 sm:p-7 md:p-8 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const submitted = {
          ...d,
          conditions: includePending(d.conditions, customCond),
          dietary_restrictions: includePending(d.dietary_restrictions, customDiet),
          allergies: includePending(d.allergies, customAllergy),
          pantry_items: includePending(d.pantry_items || [], customPantryItem),
          strict_pantry_mode: Boolean(d.strict_pantry_mode),
        };
        setD(submitted);
        setCustomCond("");
        setCustomDiet("");
        setCustomAllergy("");
        setCustomPantryItem("");
        onSubmit(submitted);
      }}
      className="flex flex-col gap-6 sm:gap-8 pb-12 font-sans max-w-4xl mx-auto"
    >
      <div className="text-center mb-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">Tailor your plan.</h1>
        <p className="text-neutral-400 text-sm sm:text-base">Tell us about your body, your goals, and what’s in your kitchen.</p>
      </div>

      {/* About You */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><Activity size={20} /></div>
          <h2 className="text-xl font-semibold text-white tracking-tight">About You</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Age</label>
            <input className={inputClass} type="number" value={d.age} onChange={(e) => set("age", +e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input className={inputClass} type="number" value={d.weight} onChange={(e) => set("weight", +e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input className={inputClass} type="number" value={d.height} onChange={(e) => set("height", +e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Sex</label>
            <select className={inputClass} value={d.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Daily activity</label>
            <select className={inputClass} value={d.activity} onChange={(e) => set("activity", e.target.value)}>
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="lightly active">Lightly active (1-3 days/wk)</option>
              <option value="moderately active">Moderately active (3-5 days/wk)</option>
              <option value="very active">Very active (6-7 days/wk)</option>
              <option value="extra active">Extra active (athlete)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Location (for climate-based foods)</label>
            <div className="flex gap-2">
              <input className={inputClass} type="text" placeholder="City" value={d.city} onChange={(e) => set("city", e.target.value)} />
              <input className={inputClass} type="text" placeholder="Country" value={d.country} onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Main goal</label>
            <select className={inputClass} value={d.goal} onChange={(e) => set("goal", e.target.value)}>
              <option value="Lose weight">Lose weight</option>
              <option value="Gain muscle">Gain muscle</option>
              <option value="Maintain weight">Maintain weight</option>
              <option value="Improve overall health">Improve overall health</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Specific target (e.g. 5kg)</label>
            <input className={inputClass} type="text" placeholder="Optional" value={d.goal_amount} onChange={(e) => set("goal_amount", e.target.value)} />
          </div>
        </div>
      </motion.section>

      {/* Health & Preferences */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400"><HeartPulse size={20} /></div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Health & Preferences</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Medical conditions</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CONDITIONS_PRESET.map((c) => (
                <button key={c} type="button" onClick={() => toggle(d.conditions, c, "conditions")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${d.conditions.includes(c) ? "bg-white text-black scale-95" : "bg-white/5 text-neutral-300 hover:bg-white/10"}`}>
                  {c}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Add other conditions..." className={inputClass} value={customCond} onChange={(e) => setCustomCond(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Dietary preferences</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {RESTRICTIONS_PRESET.map((c) => (
                <button key={c} type="button" onClick={() => toggle(d.dietary_restrictions, c, "dietary_restrictions")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${d.dietary_restrictions.includes(c) ? "bg-white text-black scale-95" : "bg-white/5 text-neutral-300 hover:bg-white/10"}`}>
                  {c}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Add other preferences..." className={inputClass} value={customDiet} onChange={(e) => setCustomDiet(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Allergies</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ALLERGIES_PRESET.map((c) => (
                <button key={c} type="button" onClick={() => toggle(d.allergies, c, "allergies")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${d.allergies.includes(c) ? "bg-white text-black scale-95" : "bg-white/5 text-neutral-300 hover:bg-white/10"}`}>
                  {c}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Add other allergies..." className={inputClass} value={customAllergy} onChange={(e) => setCustomAllergy(e.target.value)} />
          </div>

          <div className="pt-4 border-t border-white/5">
            <button type="button" onClick={() => setShowIllness(!showIllness)}
              className="flex items-center gap-2 text-[13px] font-medium text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-2 rounded-xl">
              {showIllness ? "▼" : "▶"} Feeling under the weather today?
            </button>
            <AnimatePresence>
              {showIllness && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3">
                    <label className={labelClass}>Tell us your symptoms</label>
                    <input type="text" placeholder="e.g., Flu, cough, sore throat, fever" className={inputClass} value={d.acute_illness || ""} onChange={(e) => set("acute_illness", e.target.value)} />
                    <p className="text-[12px] text-neutral-500 mt-2 ml-1">We'll tailor your diet to help you heal and strictly avoid foods that make it worse.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Pantry & Budget */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-xl text-green-400"><Home size={20} /></div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Your Kitchen & Budget</h2>
        </div>

        <p className="mb-5 text-[13px] leading-relaxed text-neutral-400">
          Just tell us what you have in your kitchen, and we'll prioritize meals using those ingredients.
        </p>

        <div className="mb-6">
          <textarea
            className="w-full bg-white/5 border border-white/5 focus:bg-white/10 focus:border-white/20 hover:bg-white/[0.07] rounded-[1.5rem] px-5 py-4 outline-none text-white transition-all placeholder:text-neutral-500 text-sm md:text-base min-h-[120px] resize-none"
            placeholder="e.g., I have some chicken, rice, tomatoes, and onions. Maybe some eggs too."
            value={d.pantry_input || ""}
            onChange={(e) => set("pantry_input", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <label className={labelClass}>Weekly food budget</label>
            <select className={inputClass} value={d.weekly_budget || "No Limit"} onChange={(e) => set("weekly_budget", e.target.value)}>
              <option value="Under 5,000 PKR">Under 5,000 PKR</option>
              <option value="5,000 - 10,000 PKR">5,000 - 10,000 PKR</option>
              <option value="10,000 - 15,000 PKR">10,000 - 15,000 PKR</option>
              <option value="No Limit">No Limit</option>
            </select>
            <p className="text-[12px] text-neutral-500 mt-2 ml-1">We'll estimate recipe costs to fit your pocket.</p>
          </div>
          <div className="flex items-start gap-3 mt-4 md:mt-8 ml-2">
             <input type="checkbox" id="strict" className="mt-1 w-4 h-4 rounded-md border-white/20 bg-white/10 accent-blue-500 cursor-pointer" checked={d.strict_pantry_mode} onChange={(e) => set("strict_pantry_mode", e.target.checked)} />
             <label htmlFor="strict" className="text-sm text-neutral-300 cursor-pointer select-none">
               <strong>Strict Mode</strong><br/><span className="text-xs text-neutral-500">Only recommend meals using the exact ingredients I selected above.</span>
             </label>
          </div>
        </div>
      </motion.section>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-[17px] font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.15)] mt-4"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Initializing Engine...
          </>
        ) : (
          "Generate Personal Plan"
        )}
      </motion.button>
    </form>
  );
}
