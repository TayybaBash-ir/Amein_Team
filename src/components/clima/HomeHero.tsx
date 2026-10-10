"use client";

import { motion } from "framer-motion";
import { MdArrowForward } from "react-icons/md";

// ── Inline SVG Illustrations ──────────────────────────────────────────────────

function WellnessIllustration() {
  return (
    <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Person sitting, reading / meditating */}
      <circle cx="110" cy="60" r="22" stroke="#4a7c59" strokeWidth="2" fill="none" />
      <path d="M98 82 Q110 72 122 82" stroke="#4a7c59" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <path d="M90 100 Q110 88 130 100 L135 145 H85 Z" stroke="#4a7c59" strokeWidth="1.5" fill="none" />
      {/* Legs crossed */}
      <path d="M85 145 Q75 160 65 158" stroke="#4a7c59" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M135 145 Q145 160 155 158" stroke="#4a7c59" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Arms resting */}
      <path d="M90 110 Q75 118 70 128" stroke="#4a7c59" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M130 110 Q145 118 150 128" stroke="#4a7c59" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Floating leaves / sparkles */}
      <path d="M40 40 Q50 30 55 40 Q50 50 40 40Z" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
      <path d="M165 50 Q175 40 180 50 Q175 60 165 50Z" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
      <path d="M30 80 L36 74 M33 74 L33 80" stroke="#4a7c59" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M180 90 L186 84 M183 84 L183 90" stroke="#4a7c59" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Food items floating */}
      <circle cx="55" cy="120" r="8" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
      <path d="M51 116 Q55 112 59 116" stroke="#4a7c59" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="168" cy="115" r="7" stroke="#4a7c59" strokeWidth="1.5" fill="none"/>
      <path d="M165 115 Q168 110 171 115" stroke="#4a7c59" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Small hearts */}
      <path d="M100 38 Q102 35 104 38 Q106 35 108 38 Q108 42 104 46 Q100 42 100 38Z" stroke="#4a7c59" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function NutritionIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Bowl */}
      <path d="M20 55 Q20 90 60 90 Q100 90 100 55 Z" stroke="rgba(74,124,89,0.8)" strokeWidth="2" fill="none"/>
      <path d="M15 55 H105" stroke="rgba(74,124,89,0.8)" strokeWidth="2" strokeLinecap="round"/>
      {/* Steam lines */}
      <path d="M40 45 Q42 35 40 25" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M60 42 Q62 32 60 22" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M80 45 Q82 35 80 25" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Food in bowl */}
      <circle cx="45" cy="68" r="6" stroke="rgba(74,124,89,0.8)" strokeWidth="1.5" fill="none"/>
      <circle cx="60" cy="72" r="5" stroke="rgba(74,124,89,0.8)" strokeWidth="1.5" fill="none"/>
      <circle cx="75" cy="68" r="6" stroke="rgba(74,124,89,0.8)" strokeWidth="1.5" fill="none"/>
      {/* Chopsticks */}
      <path d="M88 15 L80 60" stroke="rgba(74,124,89,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M95 12 L87 60" stroke="rgba(74,124,89,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function WeatherIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Sun */}
      <circle cx="60" cy="48" r="18" stroke="rgba(224,148,56,0.8)" strokeWidth="2" fill="none"/>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line
          key={i}
          x1={60 + Math.cos((angle * Math.PI)/180) * 22}
          y1={48 + Math.sin((angle * Math.PI)/180) * 22}
          x2={60 + Math.cos((angle * Math.PI)/180) * 28}
          y2={48 + Math.sin((angle * Math.PI)/180) * 28}
          stroke="rgba(224,148,56,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {/* Cloud */}
      <path d="M25 80 Q25 70 35 70 Q38 62 48 64 Q52 58 62 62 Q70 58 74 66 Q84 66 84 76 Q84 84 74 84 H35 Q25 84 25 80Z"
        stroke="rgba(74,124,89,0.7)" strokeWidth="1.5" fill="none"/>
      {/* Rain drops */}
      <path d="M40 90 L38 98" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M55 92 L53 100" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M70 90 L68 98" stroke="rgba(74,124,89,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ClockIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="40" stroke="rgba(74,124,89,0.8)" strokeWidth="2" fill="none"/>
      <circle cx="60" cy="60" r="3" fill="rgba(74,124,89,0.9)"/>
      {/* Hour hand */}
      <path d="M60 60 L60 30" stroke="rgba(74,124,89,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Minute hand */}
      <path d="M60 60 L80 60" stroke="rgba(74,124,89,0.7)" strokeWidth="2" strokeLinecap="round"/>
      {/* Tick marks */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
        <line
          key={i}
          x1={60 + Math.cos((angle * Math.PI)/180) * 36}
          y1={60 + Math.sin((angle * Math.PI)/180) * 36}
          x2={60 + Math.cos((angle * Math.PI)/180) * (i % 3 === 0 ? 32 : 34)}
          y2={60 + Math.sin((angle * Math.PI)/180) * (i % 3 === 0 ? 32 : 34)}
          stroke="rgba(74,124,89,0.5)"
          strokeWidth={i % 3 === 0 ? 2 : 1}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ── Feature Cards Data ────────────────────────────────────────────────────────
const features = [
  {
    id: "recovery",
    icon: <NutritionIllustration />,
    label: "Recovery Mode",
    sub: "Healing & sickness",
    glow: "rgba(99,102,241,0.15)", // Indigo glow
  },
  {
    id: "restaurants",
    icon: <WeatherIllustration />,
    label: "Restaurants",
    sub: "Local matched meals",
    glow: "rgba(224,148,56,0.12)",
  },
  {
    id: "saved",
    icon: <ClockIllustration />,
    label: "Saved Plans",
    sub: "Past meal history",
    glow: "rgba(74,124,89,0.15)",
  },
];

// ── HomeHero ──────────────────────────────────────────────────────────────────
export default function HomeHero({ onAction }: { onAction: (action: 'standard' | 'recovery' | 'restaurants' | 'saved') => void }) {
  return (
    <div className="relative flex flex-col items-center justify-start min-h-[85vh] pt-10 pb-32 overflow-hidden">

      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-60 -right-20 w-[300px] h-[300px] rounded-full bg-emerald-500/8 blur-[100px]" />

      {/* ── Hero Text ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="text-center px-4 max-w-2xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI-Powered Clinical Nutrition
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15] mb-4">
          Your body. Your climate.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Your perfect diet.</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          ClimaDiet builds a personalized 7-day meal plan based on your health, real-time local weather, and what's already in your kitchen.
        </p>
      </motion.div>

      {/* ── Hero Illustration Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-sm mx-auto mb-10 px-4"
      >
        {/* Glassmorphic card */}
        <div className="relative rounded-3xl border border-border bg-card backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
          {/* Top tag */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Weekly</span>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400">Active</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Wellness Journey</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Embark on a holistic journey guided by AI, real weather data, and your personal health signals.
          </p>
          {/* Illustration */}
          <div className="h-36 w-full mb-5">
            <WellnessIllustration />
          </div>
          {/* CTA inside card */}
          <button
            onClick={() => onAction('standard')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-white transition-all duration-200"
          >
            Build my plan <MdArrowForward size={18} />
          </button>
        </div>

        {/* Floating mini badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -right-2 top-8 rounded-2xl border border-border bg-background/80 backdrop-blur-lg px-3 py-2 shadow-xl"
        >
          <p className="text-[10px] text-muted-foreground">BMI</p>
          <p className="text-base font-bold text-foreground">22.4</p>
          <p className="text-[10px] text-indigo-400">Healthy ✓</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute -left-2 bottom-16 rounded-2xl border border-border bg-background/80 backdrop-blur-lg px-3 py-2 shadow-xl"
        >
          <p className="text-[10px] text-muted-foreground">Today&apos;s Calories</p>
          <p className="text-base font-bold text-foreground">1,840 kcal</p>
          <div className="mt-1 h-1 w-20 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-indigo-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Feature Shortcut Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="w-full max-w-2xl mx-auto px-4 grid grid-cols-3 gap-3"
      >
        {features.map((f, i) => (
          <motion.button
            key={f.label}
            onClick={() => onAction(f.id as any)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card backdrop-blur-md p-3 text-center hover:border-border transition-all duration-200"
            style={{ boxShadow: `0 4px 24px ${f.glow}` }}
          >
            <div className="h-14 w-14">
              {f.icon}
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">{f.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{f.sub}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Bottom blur fade ── */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A1D1E] to-transparent" />
    </div>
  );
}


