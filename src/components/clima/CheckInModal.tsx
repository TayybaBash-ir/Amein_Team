"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdTrendingUp, MdTrendingDown, MdOutlineThumbsUpDown } from "react-icons/md";

export default function CheckInModal({ isOpen, onClose, userProfile, onComplete }: any) {
  const [step, setStep] = useState(1);
  const [currentWeight, setCurrentWeight] = useState<string>(userProfile?.weight?.toString() || "");
  const [adherence, setAdherence] = useState<number>(3);
  const [feeling, setFeeling] = useState<string>("Normal");

  if (!isOpen) return null;

  const initialWeight = userProfile?.weight || 70;
  const goal = userProfile?.goal || "Maintain";
  const currentNum = parseFloat(currentWeight);
  const weightDiff = currentNum - initialWeight;
  
  // Codex's "Personalized Progress Loop" Rules Engine
  const generateAnalysis = () => {
    let recommendation = "";
    let newModifier = userProfile?.metabolic_modifier || 1.0;
    
    const lossTrend = weightDiff <= -0.5;
    const gainTrend = weightDiff >= 0.5;
    
    if (goal.toLowerCase().includes("gain")) {
      if (lossTrend && adherence >= 4) {
        recommendation = "Your average weight has been falling while your goal is to gain, and you reported following the plan consistently. We recommend a bounded calorie increase (+10%).";
        newModifier += 0.1;
      } else if (lossTrend && adherence < 4) {
        recommendation = "You lost weight but reported low adherence. Try to follow the meals more closely this week before we increase the targets.";
      } else {
        recommendation = "You're on track. We'll maintain the current baseline.";
      }
    } else if (goal.toLowerCase().includes("lose")) {
      if (gainTrend && adherence >= 4) {
        recommendation = "Your weight has slightly increased despite high adherence. We recommend a slight bounded calorie reduction (-5%).";
        newModifier -= 0.05;
      } else if (gainTrend && adherence < 4) {
        recommendation = "You gained weight but adherence was low. We will keep your current targets, focus on consistency this week!";
      } else {
        recommendation = "Great progress! We will maintain the current baseline.";
      }
    } else {
      recommendation = "Your targets are perfectly aligned with maintaining your weight.";
    }

    // Apply feeling bounds
    if (feeling === "Hungry" && newModifier < 1.0) {
      recommendation += " (Since you reported feeling hungry, we won't reduce calories too aggressively).";
      newModifier = Math.max(0.9, newModifier);
    }

    return { recommendation, newModifier };
  };

  const handleApply = () => {
    const { newModifier } = generateAnalysis();
    onComplete(currentNum, newModifier);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl"
          initial={{ y: 30, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.95 }}
        >
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 bg-surface hover:bg-surface-2 transition-colors">
            <MdClose size={20} />
          </button>

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Weekly Check-in</h2>
                <p className="text-sm text-muted-foreground mt-1">Let's refine your personalized progress loop.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">What is your current weight? (kg)</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none focus:border-brand"
                />
                <p className="text-xs text-muted-foreground mt-2">Started week at: {initialWeight} kg</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">How closely did you follow the plan?</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <input
                    type="range"
                    min="1" max="5"
                    value={adherence}
                    onChange={(e) => setAdherence(Number(e.target.value))}
                    className="flex-1 accent-brand"
                  />
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">How did the meals feel?</label>
                <select
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none focus:border-brand"
                >
                  <option value="Hungry">Too small / Hungry</option>
                  <option value="Normal">Manageable / Normal</option>
                  <option value="Too Full">Too filling</option>
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!currentWeight}
                className="mt-4 w-full rounded-xl bg-brand py-3 font-bold text-white transition-all hover:bg-brand-dark disabled:opacity-50"
              >
                Analyze Progress
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className={`p-3 rounded-xl ${weightDiff < 0 ? 'bg-blue-500/20 text-blue-500' : weightDiff > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                  {weightDiff < 0 ? <MdTrendingDown size={24} /> : weightDiff > 0 ? <MdTrendingUp size={24} /> : <MdOutlineThumbsUpDown size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Trend Analysis</h3>
                  <p className="text-sm text-muted-foreground">Weight changed by {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg</p>
                </div>
              </div>

              <div className="bg-surface-2 p-4 rounded-xl border border-border">
                <p className="text-sm leading-relaxed text-foreground">
                  {generateAnalysis().recommendation}
                </p>
              </div>

              <button
                onClick={handleApply}
                className="w-full rounded-xl bg-brand py-3 font-bold text-white transition-all hover:bg-brand-dark mt-2"
              >
                Apply & Complete
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
