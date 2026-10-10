"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { type IntakeData } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";

const CONDITIONS_PRESET = ["Low BP", "Hypertension", "Diabetes", "Gastritis / GORD", "Kidney Disease", "High Cholesterol", "PCOS"];
const RESTRICTIONS_PRESET = ["Halal", "Vegan", "Low Sodium"];
const ALLERGIES_PRESET = ["Peanuts", "Shellfish", "Dairy"];
const PANTRY_GROUPS = {
  Proteins: ["Chicken", "Eggs", "Fish", "Beans", "Lentils", "Tofu"],
  Veggies: ["Spinach", "Tomatoes", "Onions", "Potatoes", "Bell peppers", "Carrots"],
  "Carbs & grains": ["Rice", "Roti", "Bread", "Oats", "Pasta"],
  "Dairy & pantry staples": ["Milk", "Yogurt", "Cheese", "Oil", "Salt", "Pepper"],
} as const;

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
    name: "Patient",
    age: 32,
    weight: 85,
    height: 175,
    gender: "male",
    activity: "sedentary",
    goal: "Lose weight",
    goal_amount: "5kg",
    medical_history_notes: "",
    is_post_discharge: false,
    recovery_type: "None",
    spice_tolerance: "Normal",
    conditions: [],
    allergies: [],
    dietary_restrictions: [],
    pantry_items: [],
    strict_pantry_mode: false,
    allow_external_dining: true,
    preferences: {
      cuisine: "Balanced Mix",
      carb: "Surprise Me",
      snack: "Savory & Salty",
      strictness: "Very Strict",
    },
  });

  const [customCond, setCustomCond] = useState("");
  const [customDiet, setCustomDiet] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");
  const [customPantryItem, setCustomPantryItem] = useState("");

  useEffect(() => {
    const savedIntake = localStorage.getItem("patientProfile");
    const savedMedicalProfile = localStorage.getItem("clima_patient_profile");
    try {
      const intake = savedIntake ? JSON.parse(savedIntake) : {};
      const medical = savedMedicalProfile ? JSON.parse(savedMedicalProfile) : {};
      const asList = (value: unknown): string[] => Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
      const unique = (...values: unknown[]) => Array.from(new Set(values.flatMap(asList)));

      setD((current) => ({
        ...current,
        ...intake,
        name: medical.name || intake.name || current.name,
        age: Number(medical.age ?? intake.age ?? current.age),
        weight: Number(medical.weight ?? intake.weight ?? current.weight),
        height: Number(medical.height ?? intake.height ?? current.height),
        gender: String(medical.gender ?? intake.gender ?? current.gender).toLowerCase(),
        allergies: savedMedicalProfile ? unique(medical.allergies) : unique(intake.allergies),
        conditions: savedMedicalProfile ? unique(medical.conditions) : unique(intake.conditions),
        dietary_restrictions: savedMedicalProfile ? unique(medical.dietary_restrictions) : unique(intake.dietary_restrictions),
        medical_history_notes: medical.medical_history_notes || intake.medical_history_notes || "",
        is_post_discharge: Boolean(medical.is_post_discharge ?? intake.is_post_discharge),
        recovery_type: medical.recovery_type || intake.recovery_type || "None",
        spice_tolerance: medical.spice_tolerance || intake.spice_tolerance || "Normal",
        pantry_items: Array.isArray(intake.pantry_items) ? intake.pantry_items : [],
        strict_pantry_mode: Boolean(intake.strict_pantry_mode),
        allow_external_dining: Boolean(intake.allow_external_dining ?? current.allow_external_dining),
      }));
    } catch (error) {
      console.warn("Failed to load saved patient profile", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("patientProfile", JSON.stringify(d));
  }, [d]);

  const set = (k: keyof IntakeData, v: string | number | string[] | boolean) => {
    setD({ ...d, [k]: v });
    onInputChange();
  };

  const toggleArray = (key: "conditions" | "allergies" | "dietary_restrictions", val: string) => {
    if (d[key].includes(val)) set(key, d[key].filter((x) => x !== val));
    else set(key, [...d[key], val]);
  };

  const addCustom = (val: string, key: "conditions" | "allergies" | "dietary_restrictions", setter: (v: string) => void) => {
    if (val.trim() && !d[key].includes(val.trim())) {
      set(key, [...d[key], val.trim()]);
      setter("");
    }
  };

  const includePending = (items: string[], draft: string) => {
    const value = draft.trim();
    return value && !items.includes(value) ? [...items, value] : items;
  };

  const addPantryItem = (value: string) => {
    const item = value.trim();
    if (!item || (d.pantry_items || []).some((existing) => existing.toLowerCase() === item.toLowerCase())) return;
    set("pantry_items", [...(d.pantry_items || []), item]);
    setCustomPantryItem("");
  };

  const hasPantryProtein = (d.pantry_items || []).some((item) =>
    /chicken|egg|fish|bean|lentil|tofu|beef|meat|yogurt|cheese/i.test(item),
  );
  const hasPantryCarbOrVeg = (d.pantry_items || []).some((item) =>
    /rice|roti|bread|oat|pasta|grain|spinach|tomato|onion|potato|pepper|carrot|vegetable|veggie/i.test(item),
  );

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
      className="flex flex-col gap-3 sm:gap-5 pb-4 sm:pb-8"
    >
      <section className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#24282a] p-3 sm:p-5 shadow-md">
        <h3 className="mb-1 border-b border-white/[0.06] pb-1.5 text-xs sm:text-sm font-bold tracking-wide text-white">
          PANTRY &amp; INGREDIENTS (OPTIONAL)
        </h3>
        <p className="mb-3 text-[11px] leading-relaxed text-neutral-400 sm:text-xs">
          Have ingredients at home? Add them here to use what you already have. Otherwise, leave blank to use our full recipe library.
        </p>
        <div className="space-y-3">
          {Object.entries(PANTRY_GROUPS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-1.5 text-[10px] font-semibold text-neutral-300">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => {
                  const selected = (d.pantry_items || []).includes(item);
                  return (
                    <button key={item} type="button" aria-pressed={selected}
                      onClick={() => set("pantry_items", selected ? (d.pantry_items || []).filter((x) => x !== item) : [...(d.pantry_items || []), item])}
                      className={`rounded-full border px-2.5 py-1 text-[10px] transition ${selected ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200" : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"}`}>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {(d.pantry_items || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(d.pantry_items || []).filter((item) => !Object.values(PANTRY_GROUPS).flat().includes(item as never)).map((item) => (
              <button key={item} type="button" onClick={() => set("pantry_items", (d.pantry_items || []).filter((x) => x !== item))}
                className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-[10px] text-sky-200">
                {item} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <input value={customPantryItem} onChange={(e) => setCustomPantryItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPantryItem(customPantryItem))}
            placeholder="Add Ingredient" aria-label="Add a custom pantry ingredient" className="clinical-input min-w-0 flex-1 py-2 text-xs" />
          <button type="button" onClick={() => addPantryItem(customPantryItem)} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 text-neutral-300 hover:text-white">
            <Plus size={14} /><span className="sr-only">Add ingredient</span>
          </button>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-neutral-300 sm:text-xs">
          <input type="checkbox" checked={Boolean(d.strict_pantry_mode)} onChange={(e) => set("strict_pantry_mode", e.target.checked)} className="accent-emerald-400" />
          Strict pantry validation (reject any plan containing an unlisted ingredient)
        </label>
        {(d.pantry_items || []).length > 0 && d.strict_pantry_mode && (!hasPantryProtein || !hasPantryCarbOrVeg) && (
          <p role="status" className="mt-2 rounded-lg bg-amber-400/10 p-2 text-[11px] leading-relaxed text-amber-200">
            To build full meals using only your pantry, add at least 1 protein and 1 carb/veggie source.
          </p>
        )}
      </section>

      {/* 1. PATIENT PROFILE */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#24282a] p-3 sm:p-5 shadow-md">
        <h3 className="mb-2 sm:mb-3 border-b border-white/[0.06] pb-1.5 text-xs sm:text-sm font-bold tracking-wide text-white">
          1. PATIENT PROFILE
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="col-span-2">
            <label className="clinical-label text-[10px] sm:text-xs">Name</label>
            <input className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm" type="text" value={d.name || "Patient"} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Age</label>
            <input
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              type="number"
              value={d.age}
              onChange={(e) => set("age", +e.target.value)}
            />
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Gender</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Weight (kg)</label>
            <input
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              type="number"
              value={d.weight}
              onChange={(e) => set("weight", +e.target.value)}
            />
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Height (cm)</label>
            <input
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              type="number"
              value={d.height}
              onChange={(e) => set("height", +e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 2. LIFESTYLE & GOALS */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#24282a] p-3 sm:p-5 shadow-md">
        <h3 className="mb-2 sm:mb-3 border-b border-white/[0.06] pb-1.5 text-xs sm:text-sm font-bold tracking-wide text-white">
          2. LIFESTYLE & GOALS
        </h3>
        <div className="flex flex-col gap-2 sm:gap-3">
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Activity Level</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.activity}
              onChange={(e) => set("activity", e.target.value)}
            >
              <option value="sedentary">Sedentary (office job)</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="very active">Very Active</option>
              <option value="athlete">Athlete</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="clinical-label text-[10px] sm:text-xs">Primary Goal</label>
              <input
                className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
                type="text"
                value={d.goal}
                onChange={(e) => set("goal", e.target.value)}
              />
            </div>
            <div>
              <label className="clinical-label text-[10px] sm:text-xs">Target (Optional)</label>
              <input
                className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
                type="text"
                value={d.goal_amount}
                onChange={(e) => set("goal_amount", e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="clinical-label text-[10px] sm:text-xs">
              Do you plan to order food from outside today?
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5" role="group" aria-label="External dining today">
              <button
                type="button"
                aria-pressed={!d.allow_external_dining}
                onClick={() => set("allow_external_dining", false)}
                className={`rounded-xl border px-3 py-2 text-left text-[11px] sm:text-xs font-semibold transition ${
                  !d.allow_external_dining
                    ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                    : "border-white/10 text-neutral-300 hover:border-[#4a7c59]/50"
                }`}
              >
                No, home-cooked only
              </button>
              <button
                type="button"
                aria-pressed={Boolean(d.allow_external_dining)}
                onClick={() => set("allow_external_dining", true)}
                className={`rounded-xl border px-3 py-2 text-left text-[11px] sm:text-xs font-semibold transition ${
                  d.allow_external_dining
                    ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                    : "border-white/10 text-neutral-300 hover:border-[#4a7c59]/50"
                }`}
              >
                Yes, include restaurant options
              </button>
            </div>
            <p className="mt-1.5 text-[10px] sm:text-xs text-neutral-500">
              {d.allow_external_dining
                ? "We will add restaurant matches that fit this plan. You still cook the home meals unless you order."
                : "Only the home-cooked meal plan will be generated."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL & DIETARY */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#24282a] p-3 sm:p-5 shadow-md">
        <h3 className="mb-2 sm:mb-3 border-b border-white/[0.06] pb-1.5 text-xs sm:text-sm font-bold tracking-wide text-white">
          3. CLINICAL & DIETARY
        </h3>
        <div className="flex flex-col gap-2.5 sm:gap-3.5">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 sm:p-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-amber-200 sm:text-sm">
              <input type="checkbox" checked={Boolean(d.is_post_discharge)} onChange={(e) => set("is_post_discharge", e.target.checked)} className="accent-amber-400" />
              Post-discharge recovery protocol
            </label>
            {d.is_post_discharge && <div className="mt-3">
                <label className="clinical-label text-[10px] sm:text-xs">Recovery Focus</label>
                <select className="clinical-input py-1.5 text-xs sm:py-2 sm:text-sm" value={d.recovery_type || "Gastric Recovery (Bland & Soft)"} onChange={(e) => set("recovery_type", e.target.value)}>
                  <option>Gastric Recovery (Bland &amp; Soft)</option><option>Post-Surgery / Soft Food</option><option>Low BP / Hydration Focus</option><option>General Recovery</option>
                </select>
            </div>}
            <div className="mt-3">
              <label className="clinical-label text-[10px] sm:text-xs">Spice Preference</label>
              <select className="clinical-input py-1.5 text-xs sm:py-2 sm:text-sm" value={d.spice_tolerance || "Normal"} onChange={(e) => set("spice_tolerance", e.target.value)}>
                <option value="Bland">Bland (Zero Spice)</option><option value="Low Spice">Low Spice</option><option value="Normal">Normal</option>
              </select>
            </div>
            <div className="mt-3">
              <label className="clinical-label text-[10px] sm:text-xs">Doctor&apos;s Medical Notes / Instructions</label>
              <textarea className="clinical-input min-h-16 py-2 text-xs sm:text-sm" value={d.medical_history_notes || ""} onChange={(e) => set("medical_history_notes", e.target.value)} placeholder="Care instructions or permanent dietary constraints..." />
            </div>
          </div>
          {/* Conditions */}
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Conditions</label>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {CONDITIONS_PRESET.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleArray("conditions", c)}
                  className={`rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition border ${
                    d.conditions.includes(c)
                      ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                      : "border-white/10 text-neutral-300 hover:border-[#4a7c59]/50"
                  }`}
                >
                  {c}
                </button>
              ))}
              {d.conditions
                .filter((c) => !CONDITIONS_PRESET.includes(c))
                .map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleArray("conditions", c)}
                    className="flex items-center gap-1 rounded-full border border-[#4a7c59] bg-[#4a7c59] px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white"
                  >
                    {c} <X size={11} />
                  </button>
                ))}
            </div>
            <div className="flex gap-1.5">
              <input
                className="clinical-input py-1 sm:py-1.5 text-xs"
                type="text"
                placeholder="Add condition..."
                value={customCond}
                onChange={(e) => {
                  setCustomCond(e.target.value);
                  onInputChange();
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addCustom(customCond, "conditions", setCustomCond))
                }
              />
              <button
                type="button"
                onClick={() => addCustom(customCond, "conditions", setCustomCond)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 text-neutral-400 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Dietary Restrictions</label>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {RESTRICTIONS_PRESET.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleArray("dietary_restrictions", r)}
                  className={`rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition border ${
                    d.dietary_restrictions.includes(r)
                      ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                      : "border-white/10 text-neutral-300 hover:border-[#4a7c59]/50"
                  }`}
                >
                  {r}
                </button>
              ))}
              {d.dietary_restrictions
                .filter((r) => !RESTRICTIONS_PRESET.includes(r))
                .map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => toggleArray("dietary_restrictions", r)}
                    className="flex items-center gap-1 rounded-full border border-[#4a7c59] bg-[#4a7c59] px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white"
                  >
                    {r} <X size={11} />
                  </button>
                ))}
            </div>
            <div className="flex gap-1.5">
              <input
                className="clinical-input py-1 sm:py-1.5 text-xs"
                type="text"
                placeholder="e.g. Halal, Vegan..."
                value={customDiet}
                onChange={(e) => {
                  setCustomDiet(e.target.value);
                  onInputChange();
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addCustom(customDiet, "dietary_restrictions", setCustomDiet))
                }
              />
              <button
                type="button"
                onClick={() => addCustom(customDiet, "dietary_restrictions", setCustomDiet)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 text-neutral-400 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Explicit Allergies</label>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {ALLERGIES_PRESET.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleArray("allergies", a)}
                  className={`rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition border ${
                    d.allergies.includes(a)
                      ? "border-orange-400/80 bg-orange-500/80 text-white"
                      : "border-white/10 text-neutral-300 hover:border-orange-400/50"
                  }`}
                >
                  {a}
                </button>
              ))}
              {d.allergies
                .filter((a) => !ALLERGIES_PRESET.includes(a))
                .map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggleArray("allergies", a)}
                    className="flex items-center gap-1 rounded-full border border-orange-400/80 bg-orange-500/80 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white"
                  >
                    {a} <X size={11} />
                  </button>
                ))}
            </div>
            <div className="flex gap-1.5">
              <input
                className="clinical-input py-1 sm:py-1.5 text-xs"
                type="text"
                placeholder="e.g. Peanuts, Shellfish..."
                value={customAllergy}
                onChange={(e) => {
                  setCustomAllergy(e.target.value);
                  onInputChange();
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addCustom(customAllergy, "allergies", setCustomAllergy))
                }
              />
              <button
                type="button"
                onClick={() => addCustom(customAllergy, "allergies", setCustomAllergy)}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-2.5 text-neutral-400 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DIETARY PREFERENCES */}
      <section className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#24282a] p-3 sm:p-5 shadow-md">
        <h3 className="mb-2 sm:mb-3 border-b border-white/[0.06] pb-1.5 text-xs sm:text-sm font-bold tracking-wide text-white">
          4. DIETARY PREFERENCES
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Cuisine Style</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.preferences?.cuisine}
              onChange={(e) =>
                setD({
                  ...d,
                  preferences: { ...d.preferences, cuisine: e.target.value } as NonNullable<
                    IntakeData["preferences"]
                  >,
                })
              }
            >
              <option value="Balanced Mix">Balanced Mix</option>
              <option value="Traditional Pakistani">Traditional Pakistani</option>
              <option value="Fast Food / Fusion">Fast Food / Fusion</option>
            </select>
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Dinner Carb</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.preferences?.carb}
              onChange={(e) =>
                setD({
                  ...d,
                  preferences: { ...d.preferences, carb: e.target.value } as NonNullable<
                    IntakeData["preferences"]
                  >,
                })
              }
            >
              <option value="Surprise Me">Surprise Me</option>
              <option value="Mostly Rice">Mostly Rice (Pulao/Biryani)</option>
              <option value="Mostly Bread">Mostly Bread (Roti/Naan)</option>
            </select>
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Snack Preference</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.preferences?.snack}
              onChange={(e) =>
                setD({
                  ...d,
                  preferences: { ...d.preferences, snack: e.target.value } as NonNullable<
                    IntakeData["preferences"]
                  >,
                })
              }
            >
              <option value="Savory & Salty">Savory & Salty (Chana, Kabab)</option>
              <option value="Sweet & Light">Sweet & Light (Fruit, Shakes)</option>
            </select>
          </div>
          <div>
            <label className="clinical-label text-[10px] sm:text-xs">Diet Strictness</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.preferences?.strictness}
              onChange={(e) =>
                setD({
                  ...d,
                  preferences: { ...d.preferences, strictness: e.target.value } as NonNullable<
                    IntakeData["preferences"]
                  >,
                })
              }
            >
              <option value="Very Strict">Very Strict (Perfect Macros)</option>
              <option value="Relaxed / Bulking">Relaxed (Lenient Portions)</option>
            </select>
          </div>
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-black/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
        style={{ background: ACCENT }}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Generating Clinical Plan...
          </>
        ) : (
          <>Generate Plan</>
        )}
      </button>
    </form>
  );
}

