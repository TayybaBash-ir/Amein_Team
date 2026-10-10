"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, LayoutDashboard, UtensilsCrossed, User, List, ShieldCheck } from "lucide-react";
import AuthButton from "@/components/clima/AuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
};

const conditionOptions = [
  "High Cholesterol",
  "Hypertension",
  "Diabetes",
  "Kidney Disease",
  "Gastritis / GORD",
  "Low BP",
];

const fieldClassName = "h-11 rounded-xl border-slate-700 bg-[#10131b] text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500";

function getBmi(profile: Profile) {
  const heightInMeters = Number(profile.height) / 100;
  const weight = Number(profile.weight);
  if (!heightInMeters || !weight || !Number.isFinite(heightInMeters) || !Number.isFinite(weight)) return null;
  return weight / (heightInMeters * heightInMeters);
}

function toProfile(stored: Record<string, unknown>): Profile {
  return {
    ...initialProfile,
    name: typeof stored.name === "string" ? stored.name : initialProfile.name,
    age: Number(stored.age) || initialProfile.age,
    gender: typeof stored.gender === "string" ? stored.gender : initialProfile.gender,
    height: Number(stored.height) || initialProfile.height,
    weight: Number(stored.weight) || initialProfile.weight,
    allergies: Array.isArray(stored.allergies) ? stored.allergies.join(", ") : typeof stored.allergies === "string" ? stored.allergies : "",
    dietary_restrictions: Array.isArray(stored.dietary_restrictions) ? stored.dietary_restrictions.join(", ") : typeof stored.dietary_restrictions === "string" ? stored.dietary_restrictions : "",
    conditions: Array.isArray(stored.conditions) ? stored.conditions.filter((item): item is string => typeof item === "string") : [],
    medical_history_notes: typeof stored.medical_history_notes === "string" ? stored.medical_history_notes : "",
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const bmi = getBmi(profile);

  useEffect(() => {
    const storedData = localStorage.getItem("clima_patient_profile");
    if (!storedData) {
      setIsEditing(true);
      return;
    }
    try {
      setProfile(toProfile(JSON.parse(storedData)));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to parse local profile data", error);
      setIsEditing(true);
    }
  }, []);

  const toggleCondition = (condition: string) => setProfile((current) => ({
    ...current,
    conditions: current.conditions.includes(condition)
      ? current.conditions.filter((item) => item !== condition)
      : [...current.conditions, condition],
  }));

  const handleSave = () => {
    let existingData: Record<string, unknown> = {};
    try {
      existingData = JSON.parse(localStorage.getItem("clima_patient_profile") || "{}");
    } catch {
      // Replace an invalid stored record with the valid permanent profile.
    }
    // Keep dashboard-owned temporary recovery preferences intact, but only edit
    // permanent baseline fields from this page.
    const permanentProfile = { ...existingData, ...profile };
    localStorage.setItem("clima_patient_profile", JSON.stringify(permanentProfile));
    setSaved(true);
    setIsEditing(false);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const summaryTile = (label: string, value: string) => (
    <div key={label} className="rounded-xl border border-slate-800 bg-[#10131b] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1D1E] text-slate-100 selection:bg-emerald-500/30">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#1A1D1E]/85 px-4 py-3 backdrop-blur-xl print:hidden sm:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#4a7c59] to-[#2c4c36] shadow-lg transition-transform group-hover:scale-105"><Leaf size={16} className="text-white" /></span>
            <span className="font-sans text-lg font-bold tracking-tight text-white">ClimaDiet</span>
          </Link>
          <span className="hidden h-6 w-px bg-white/10 sm:block" />
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"><LayoutDashboard size={16} />Home</Link>
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"><UtensilsCrossed size={16} />Restaurants</Link>
            <Link href="/profile" aria-current="page" className="flex items-center gap-2 rounded-lg bg-[#4a7c59] px-3 py-2 text-sm font-medium text-white"><User size={16} />Profile</Link>
            <Link href="/plans" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"><List size={16} />Saved Plans</Link>
          </div>
        </div>
        <div className="ml-2 shrink-0"><AuthButton /></div>
      </nav>
      <div className="flex gap-2 overflow-x-auto border-b border-white/5 bg-[#1A1D1E] p-3 md:hidden print:hidden">
        <Link href="/dashboard" className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-neutral-400">Home</Link>
        <Link href="/dashboard" className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-neutral-400">Restaurants</Link>
        <Link href="/profile" aria-current="page" className="whitespace-nowrap rounded-lg bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white">Profile</Link>
        <Link href="/plans" className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-neutral-400">Saved Plans</Link>
      </div>

      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 pt-2">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-emerald-400">PATIENT MASTER MEDICAL PROFILE</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Permanent Health Baseline</h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-400">Your long-term medical history and dietary constraints for personalized meal planning.</p>
          </div>
          {!isEditing && <Button onClick={() => setIsEditing(true)} className="h-auto shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-semibold text-emerald-300 transition hover:bg-emerald-500/20">✏️ Edit Medical Profile</Button>}
        </header>
        {saved && <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">Medical profile saved.</div>}

        {!isEditing ? (
          <section className="space-y-6 rounded-2xl border border-slate-800 bg-[#181C27] p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Permanent Medical Baseline</h2>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-300">PATIENT MASTER MEDICAL PROFILE</span>
            </div>
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Physical Metrics</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {summaryTile("Name", profile.name || "Patient")}
                {summaryTile("Age", `${profile.age} years`)}
                {summaryTile("Gender", profile.gender || "Unspecified")}
                {summaryTile("Height", `${profile.height} cm`)}
                {summaryTile("Weight", `${profile.weight} kg`)}
                {summaryTile("BMI", bmi ? bmi.toFixed(1) : "—")}
              </div>
            </section>
            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Permanent Chronic Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.conditions.length ? profile.conditions.map((condition) => <span key={condition} className="rounded-full border border-cyan-500/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-300">{condition}</span>) : <p className="text-sm text-slate-500">No chronic conditions recorded.</p>}
              </div>
            </section>
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#10131b] p-4"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Allergies</h3><p className="mt-2 text-sm text-slate-200">{profile.allergies || "None recorded"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-[#10131b] p-4"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Long-Term Dietary Restrictions</h3><p className="mt-2 text-sm text-slate-200">{profile.dietary_restrictions || "None recorded"}</p></div>
            </section>
            <section className="rounded-xl border border-slate-800 bg-[#10131b] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctor&apos;s Clinical Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{profile.medical_history_notes || "No clinical notes recorded."}</p>
            </section>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="space-y-5 rounded-2xl border border-slate-800 bg-[#181C27] p-6 shadow-2xl">
              <h2 className="text-xs font-bold tracking-wider text-slate-300">1. PERMANENT PHYSICAL METRICS</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="patient-name" className="text-slate-300">Name</Label><Input id="patient-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={fieldClassName} /></div>
                <div className="space-y-2"><Label htmlFor="patient-age" className="text-slate-300">Age</Label><Input id="patient-age" type="number" min="1" value={profile.age} onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })} className={fieldClassName} /></div>
                <div className="space-y-2"><Label htmlFor="patient-gender" className="text-slate-300">Gender</Label><select id="patient-gender" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="h-11 w-full rounded-xl border border-slate-700 bg-[#10131b] px-3 text-slate-100 focus:border-emerald-500 focus:outline-none"><option>Unspecified</option><option>Female</option><option>Male</option><option>Other</option></select></div>
                <div className="space-y-2"><Label htmlFor="patient-height" className="text-slate-300">Height (cm)</Label><Input id="patient-height" type="number" min="1" value={profile.height} onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })} className={fieldClassName} /></div>
                <div className="space-y-2"><Label htmlFor="patient-weight" className="text-slate-300">Weight (kg)</Label><Input id="patient-weight" type="number" min="1" step="0.1" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })} className={fieldClassName} /></div>
                <div className="space-y-2"><Label htmlFor="patient-bmi" className="text-slate-300">BMI (calculated)</Label><Input id="patient-bmi" readOnly value={bmi ? bmi.toFixed(1) : "—"} className={`${fieldClassName} text-emerald-300`} /></div>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-slate-800 bg-[#181C27] p-6 shadow-2xl">
              <h2 className="text-xs font-bold tracking-wider text-slate-300">2. PERMANENT MEDICAL HISTORY &amp; DIETARY BASELINES</h2>
              <div>
                <p className="mb-3 text-sm text-slate-400">Select any ongoing chronic conditions.</p>
                <div className="flex flex-wrap gap-2">
                  {conditionOptions.map((condition) => <button key={condition} type="button" onClick={() => toggleCondition(condition)} aria-pressed={profile.conditions.includes(condition)} className={`rounded-full border px-3.5 py-2 text-sm transition-all ${profile.conditions.includes(condition) ? "border-cyan-500 bg-emerald-500/20 font-semibold text-emerald-300" : "border-slate-700 bg-[#10131b] text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>{condition}</button>)}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="patient-allergies" className="text-slate-300">Permanent Allergies</Label><Input id="patient-allergies" placeholder="e.g. Nuts, Dairy" value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })} className={fieldClassName} /></div>
                <div className="space-y-2"><Label htmlFor="patient-diet" className="text-slate-300">Long-Term Dietary Restrictions</Label><Input id="patient-diet" placeholder="e.g. Halal, Vegetarian" value={profile.dietary_restrictions} onChange={(e) => setProfile({ ...profile, dietary_restrictions: e.target.value })} className={fieldClassName} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="medical-notes" className="text-slate-300">Doctor&apos;s Clinical Notes</Label><textarea id="medical-notes" rows={4} placeholder="Permanent medical guidelines provided by your healthcare team..." value={profile.medical_history_notes} onChange={(e) => setProfile({ ...profile, medical_history_notes: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-[#10131b] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" /></div>
            </section>
            <Button onClick={handleSave} className="h-auto w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500"><ShieldCheck className="mr-2" size={18} />💾 Save Profile Settings</Button>
          </div>
        )}
      </main>
    </div>
  );
}
