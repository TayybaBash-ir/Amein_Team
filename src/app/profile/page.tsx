"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdEco, MdArrowBack, MdPerson, MdEdit, MdSave, MdFavorite, MdNoFood, MdRestaurant } from "react-icons/md";
import AuthButton from "@/components/clima/AuthButton";
import { motion, AnimatePresence } from "framer-motion";

type Profile = {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  allergies: string;
  dietary_restrictions: string;
  conditions: string[];
  medical_history_notes: string;
  activity: string;
  goal: string;
  goal_amount: string;
  city: string;
  country: string;
};

const initialProfile: Profile = {
  name: "Patient",
  age: 30,
  gender: "Unspecified",
  height: 170,
  weight: 70,
  allergies: "",
  dietary_restrictions: "",
  conditions: [],
  medical_history_notes: "",
  activity: "Sedentary (desk job)",
  goal: "Maintain weight",
  goal_amount: "",
  city: "Lahore",
  country: "Pakistan",
};

const conditionOptions = [
  "High Cholesterol", "Hypertension", "Diabetes",
  "Kidney Disease", "Gastritis / GORD", "Low BP",
  "PCOS", "Celiac Disease", "Gout", "Thyroid",
];

function getBmi(profile: Profile) {
  const h = Number(profile.height) / 100;
  const w = Number(profile.weight);
  if (!h || !w) return null;
  return w / (h * h);
}

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
  if (bmi < 25) return { label: "Healthy", color: "text-brand" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-400" };
  return { label: "Obese", color: "text-red-400" };
}

function toProfile(stored: Record<string, unknown>): Profile {
  const asList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    ...initialProfile,
    name: typeof stored.name === "string" ? stored.name : initialProfile.name,
    age: Number(stored.age) || initialProfile.age,
    gender: typeof stored.gender === "string" ? stored.gender : initialProfile.gender,
    height: Number(stored.height) || initialProfile.height,
    weight: Number(stored.weight) || initialProfile.weight,
    allergies: Array.isArray(stored.allergies)
      ? (stored.allergies as string[]).join(", ")
      : typeof stored.allergies === "string" ? stored.allergies : "",
    dietary_restrictions: Array.isArray(stored.dietary_restrictions)
      ? (stored.dietary_restrictions as string[]).join(", ")
      : typeof stored.dietary_restrictions === "string" ? stored.dietary_restrictions : "",
    conditions: asList(stored.conditions),
    medical_history_notes: typeof stored.medical_history_notes === "string" ? stored.medical_history_notes : "",
  };
}

const inputClass = "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/20 placeholder:text-neutral-600 [&>option]:bg-background";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("clima_patient_profile");
      if (raw) setProfile(toProfile(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  const bmi = getBmi(profile);
  const bmiCategory = bmi ? getBmiCategory(bmi) : null;

  function toggleCondition(c: string) {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c)
        ? prev.conditions.filter(x => x !== c)
        : [...prev.conditions, c],
    }));
  }

  function handleSave() {
    try {
      const existing = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
      localStorage.setItem("clima_patient_profile", JSON.stringify({ ...existing, ...profile }));
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
  }

  const statTile = (label: string, value: string, sub?: string) => (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
            title="Back to dashboard"
          >
            <MdArrowBack size={18} />
          </Link>
          <Link href="/dashboard" className="group flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/20 transition-transform group-hover:scale-105">
              <MdEco size={16} className="text-foreground" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-foreground">ClimaDiet</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <MdPerson size={12} /> Medical Profile
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {profile.name || "Your Profile"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved locally • used automatically in every plan you generate.
            </p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              isEditing
                ? "bg-brand text-foreground hover:bg-brand-dark shadow-lg shadow-brand/25"
                : "bg-surface text-foreground hover:bg-surface-2 border border-border"
            }`}
          >
            {isEditing ? <><MdSave size={16} /> Save</> : <><MdEdit size={16} /> Edit</>}
          </button>
        </motion.div>

        {/* Saved toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand"
            >
              ✓ Profile saved successfully
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mb-5 grid grid-cols-3 gap-3"
        >
          {statTile("Age", `${profile.age}y`)}
          {statTile("Weight", `${profile.weight} kg`)}
          {statTile("BMI", bmi ? bmi.toFixed(1) : "-", bmiCategory?.label)}
        </motion.div>

        {/* Physical Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-4 rounded-3xl border border-border bg-surface p-5 sm:p-6"
        >
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Metrics</h2>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><label className={labelClass}>Name</label><input className={inputClass} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
              <div><label className={labelClass}>Age</label><input type="number" className={inputClass} value={profile.age} onChange={e => setProfile({ ...profile, age: +e.target.value })} /></div>
              <div><label className={labelClass}>Gender</label>
                <select className={inputClass} value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                  <option>Unspecified</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div><label className={labelClass}>Height (cm)</label><input type="number" className={inputClass} value={profile.height} onChange={e => setProfile({ ...profile, height: +e.target.value })} /></div>
              <div><label className={labelClass}>Weight (kg)</label><input type="number" className={inputClass} value={profile.weight} onChange={e => setProfile({ ...profile, weight: +e.target.value })} /></div>
              <div><label className={labelClass}>Activity Level</label><select className={inputClass} value={profile.activity} onChange={e => setProfile({ ...profile, activity: e.target.value })}><option>Sedentary (desk job)</option><option>Lightly active (1-3 days/wk)</option><option>Moderately active (3-5 days/wk)</option><option>Very active (6-7 days/wk)</option><option>Extra active (athlete)</option></select></div>
              <div><label className={labelClass}>Primary Goal</label><select className={inputClass} value={profile.goal} onChange={e => setProfile({ ...profile, goal: e.target.value })}><option>Lose weight</option><option>Gain muscle</option><option>Maintain weight</option><option>Improve overall health</option></select></div>
              <div><label className={labelClass}>Goal Target</label><input className={inputClass} value={profile.goal_amount || ""} placeholder="e.g. 5kg" onChange={e => setProfile({ ...profile, goal_amount: e.target.value })} /></div>
              <div><label className={labelClass}>City</label><input className={inputClass} value={profile.city || ""} onChange={e => setProfile({ ...profile, city: e.target.value })} /></div>
              <div><label className={labelClass}>Country</label><input className={inputClass} value={profile.country || ""} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div>
              <div>
                <label className={labelClass}>BMI</label>
                <input readOnly className={`${inputClass} text-muted-foreground`} value={bmi ? bmi.toFixed(1) : "-"} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Name", profile.name], ["Age", `${profile.age} years`],
                ["Gender", profile.gender], ["Height", `${profile.height} cm`],
                ["Weight", `${profile.weight} kg`],
                ["BMI", bmi ? `${bmi.toFixed(1)} • ${bmiCategory?.label}` : "-"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">{k}</p>
                  <p className="text-sm font-semibold text-foreground">{v}</p>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Conditions */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-4 rounded-3xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MdFavorite size={16} className="text-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chronic Conditions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map(c => (
              <button
                key={c}
                type="button"
                disabled={!isEditing}
                onClick={() => toggleCondition(c)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  profile.conditions.includes(c)
                    ? "border-brand/50 bg-brand/15 text-brand"
                    : isEditing
                      ? "border-border bg-surface text-muted-foreground hover:border-border hover:text-foreground"
                      : "border-border bg-surface text-neutral-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {!profile.conditions.length && (
            <p className="mt-3 text-xs text-neutral-600">No chronic conditions recorded.</p>
          )}
        </motion.section>

        {/* Diet & Allergies */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-4 rounded-3xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MdRestaurant size={16} className="text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diet & Allergies</h2>
          </div>
          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Allergies</label><input placeholder="e.g. Nuts, Dairy" className={inputClass} value={profile.allergies} onChange={e => setProfile({ ...profile, allergies: e.target.value })} /></div>
              <div><label className={labelClass}>Dietary Restrictions</label><input placeholder="e.g. Halal, Vegan" className={inputClass} value={profile.dietary_restrictions} onChange={e => setProfile({ ...profile, dietary_restrictions: e.target.value })} /></div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Allergies</p>
                <p className="text-sm text-foreground">{profile.allergies || "None recorded"}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">Dietary Restrictions</p>
                <p className="text-sm text-foreground">{profile.dietary_restrictions || "None recorded"}</p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Clinical Notes */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-8 rounded-3xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MdNoFood size={16} className="text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor&apos;s Clinical Notes</h2>
          </div>
          {isEditing ? (
            <textarea
              rows={4}
              placeholder="Permanent medical guidelines provided by your healthcare team..."
              className={`${inputClass} resize-none`}
              value={profile.medical_history_notes}
              onChange={e => setProfile({ ...profile, medical_history_notes: e.target.value })}
            />
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {profile.medical_history_notes || "No clinical notes recorded."}
            </p>
          )}
        </motion.section>

<<<<<<< HEAD
          {/* Save button (bottom) */}
          {isEditing && (
            <motion.button
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={handleSave}
              className="w-full rounded-2xl bg-brand py-4 text-sm font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all mb-8"
            >
              <MdSave size={16} className="inline mr-2 -mt-0.5" /> Save Profile
            </motion.button>
          )}

          {/* Sign Out Button at the very bottom */}
          <div className="mt-8 pt-8 border-t border-border flex flex-col items-center">
            <p className="text-xs text-muted-foreground mb-4">Account Management</p>
            <AuthButton />
          </div>
        </main>
      </div>
    );
  }


=======
        {/* Save button (bottom) */}
        {isEditing && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={handleSave}
            className="w-full rounded-2xl bg-[#4a7c59] py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-[#3d6849] transition-all mb-8"
          >
            <MdSave size={16} className="inline mr-2 -mt-0.5" /> Save Profile
          </motion.button>
        )}
>>>>>>> 78f3c72ef32d612f60d19ce60b1f95bbfd314150

        {/* Sign Out Button at the very bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-4">Account Management</p>
          <AuthButton />
        </div>
      </main>
    </div>
  );
}
