"use client";

import { useEffect, useState } from "react";
import { type PlanResponse } from "@/lib/mock";
import { MdDirectionsRun, MdLocalFireDepartment, MdFavorite, MdGpsFixed } from "react-icons/md";
import { ACCENT } from "@/lib/theme";

const MACROS = [
  { k: "protein_g", label: "Protein", kcal: 4, color: ACCENT },
  { k: "carbs_g", label: "Carbs", kcal: 4, color: "#f5a742" },
  { k: "fat_g", label: "Fat", kcal: 9, color: "#7dd3a8" },
] as const;

export default function MacroScorecard({ plan }: { plan: PlanResponse }) {
  const { nutrition, patient } = plan;
  const metrics = [
    { label: "BMI", value: nutrition.bmi.toFixed(1), detail: nutrition.bmi_category, icon: MdDirectionsRun },
    { label: "BMR", value: `${nutrition.bmr}`, detail: "kcal at rest", icon: MdFavorite },
    { label: "Maintenance (TDEE)", value: `${nutrition.tdee}`, detail: "kcal per day", icon: MdDirectionsRun },
  ];

  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 100); return () => clearTimeout(t); }, []);
  const total = MACROS.reduce((s, m) => s + nutrition[m.k] * m.kcal, 0) || 1;
  const R = 54, C = 2 * Math.PI * R;
  let offset = 0;

  const tile = (label: string, value: string, detail: string, Icon: any, isDouble: boolean = false) => (
    <div key={label} className={`rounded-3xl border border-white/[0.03] bg-white/[0.03] p-4 transition-transform hover:scale-[1.02] ${isDouble ? "col-span-2 sm:col-span-1" : ""}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        <Icon size={14} style={{ color: ACCENT }} /> {label}
      </div>
      <div className="mt-1.5 font-mono text-xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-xs text-neutral-500">{detail}</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <section className="rounded-[2rem] border border-white/[0.04] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] fade-up" aria-labelledby="calculated-summary-title">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h2 id="calculated-summary-title" className="editorial-title text-xl">Your Daily Targets</h2>
            <p className="mt-1 text-sm text-neutral-400">
              {patient.age} years • {patient.gender} • {patient.weight} kg • {patient.height} cm • {patient.goal}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 140 140" className="-rotate-90">
              <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="12" />
              {MACROS.map((m) => {
                const frac = (nutrition[m.k] * m.kcal) / total;
                const el = (
                  <circle key={m.k} cx="70" cy="70" r={R} fill="none" stroke={m.color} strokeWidth="12" strokeLinecap="butt"
                    strokeDasharray={`${on ? Math.max(frac * C - 3, 0) : 0} ${C}`} strokeDashoffset={-offset * C}
                    style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.2,.7,.2,1)" }} />
                );
                offset += frac;
                return el;
              })}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <MdLocalFireDepartment className="mx-auto text-orange-400" size={18} />
                <b className="block text-2xl leading-none text-white">{nutrition.target_calories}</b>
                <span className="text-[10px] text-neutral-400">kcal/day</span>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
            {metrics.map(({ label, value, detail, icon }, i) => tile(label, value, detail, icon, i === 2))}
          </div>
        </div>
      </section>
    </div>
  );
}
