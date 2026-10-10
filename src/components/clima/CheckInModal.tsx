"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdAutoAwesome } from "react-icons/md";

export default function CheckInModal({
  isOpen,
  onClose,
  userProfile,
  onComplete
}: {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  onComplete: (newWeight: number, newModifier: number, macroTweak: string, historyEntry: Record<string, unknown>) => void;
}) {
  const [weight, setWeight] = useState<number>(userProfile?.weight || 70);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    setLoading(true);
    setError("");
    try {
      let feedbackHistory: Record<string, unknown>[] = [];
      try {
        const stored = JSON.parse(localStorage.getItem("clima_progress_history") || "[]");
        if (Array.isArray(stored)) feedbackHistory = stored.slice(-10);
      } catch { /* An empty history is a valid first check-in. */ }

      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: userProfile,
          feedback_text: feedbackText,
          new_weight: weight,
          feedback_history: feedbackHistory,
        })
      });
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* Give a readable error for HTML or malformed responses. */ }
      if (!res.ok) {
        throw new Error(typeof data?.detail === "string"
          ? data.detail
          : "The check-in service is temporarily unavailable. Please try again.");
      }
      if (typeof data?.new_modifier !== "number") {
        throw new Error(data?.error || "The check-in service returned an invalid response. Please try again.");
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to the check-in service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
              <MdAutoAwesome size={18} />
            </div>
            <h2 className="font-bold text-foreground">Progress Check-in</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground">
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-5">
          {!result ? (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Share how the plan felt and your current weight. Your recent check-ins are saved in this browser and used to make small, trend-based adjustments.
              </p>

              {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  How did the plan feel?
                </label>
                <textarea
                  className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
                  rows={4}
                  placeholder="e.g. I followed the plan perfectly but I was starving before dinner and felt tired."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !feedbackText.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "Reviewing your progress..." : "Review progress"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-brand">
                  <MdAutoAwesome /> Personal progress adjustment
                </h3>
                <p className="text-sm leading-relaxed text-foreground">
                  {result.explanation}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Based on {result.history_points_used} check-in{result.history_points_used === 1 ? "" : "s"} · recent weight trend {result.weight_trend_kg_per_checkin} kg per check-in
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-background px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground shadow-sm">
                    Macro Shift: {result.macro_tweak}
                  </span>
                  <span className="rounded-md bg-background px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground shadow-sm">
                    Metabolic Modifier: {result.new_modifier}x
                  </span>
                </div>
              </div>

              <button
                onClick={() => onComplete(
                  result.new_weight,
                  result.new_modifier,
                  result.macro_tweak,
                  {
                    previous_weight: Number(userProfile?.weight ?? weight),
                    new_weight: Number(result.new_weight),
                    weight_change: Number(result.new_weight) - Number(userProfile?.weight ?? weight),
                    feedback_text: feedbackText.trim(),
                    goal: userProfile?.goal || "Maintain",
                    macro_tweak: result.macro_tweak,
                    recorded_at: new Date().toISOString(),
                  },
                )}
                className="w-full rounded-xl bg-foreground py-3 font-bold text-background transition-transform active:scale-95"
              >
                Save check-in & recalculate
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
