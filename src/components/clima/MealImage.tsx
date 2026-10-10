"use client";

import { motion } from "framer-motion";
import {
  Coffee, Egg, Pizza, Soup, Fish, Beef, Drumstick, Carrot, 
  Salad, Apple, Croissant, Wheat, Milk, IceCream, UtensilsCrossed, Sandwich, Flame, Leaf
} from "lucide-react";
import type { Meal } from "@/lib/mock";

function getIconForMeal(name: string, slot: string) {
  const n = name.toLowerCase();
  if (n.includes("chicken") || n.includes("murg") || n.includes("tikka")) return Drumstick;
  if (n.includes("beef") || n.includes("gosht") || n.includes("mutton")) return Beef;
  if (n.includes("fish") || n.includes("salmon") || n.includes("tuna")) return Fish;
  if (n.includes("egg") || n.includes("omelet")) return Egg;
  if (n.includes("pizza") || n.includes("cheese")) return Pizza;
  if (n.includes("soup") || n.includes("daal") || n.includes("dal") || n.includes("stew")) return Soup;
  if (n.includes("salad")) return Salad;
  if (n.includes("carrot") || n.includes("veg") || n.includes("sabzi")) return Carrot;
  if (n.includes("apple") || n.includes("fruit")) return Apple;
  if (n.includes("bread") || n.includes("croissant") || n.includes("toast")) return Croissant;
  if (n.includes("rice") || n.includes("roti") || n.includes("naan") || n.includes("wheat") || n.includes("pasta")) return Wheat;
  if (n.includes("milk") || n.includes("yogurt") || n.includes("lassi") || n.includes("smoothie")) return Milk;
  if (n.includes("ice cream") || n.includes("dessert") || n.includes("sweet")) return IceCream;
  if (n.includes("sandwich") || n.includes("burger")) return Sandwich;
  if (n.includes("tea") || n.includes("coffee")) return Coffee;
  if (n.includes("spicy") || n.includes("karahi")) return Flame;

  // Fallback by slot
  const s = slot.toLowerCase();
  if (s === "breakfast") return Coffee;
  if (s === "snack") return Apple;
  
  return UtensilsCrossed;
}

export default function MealImage({
  meal,
  className = "",
}: {
  meal: Meal;
  className?: string;
  emojiSize?: string;
}) {
  const Icon = getIconForMeal(meal.name, meal.slot);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-white/40 drop-shadow-lg"
      >
        <Icon size={48} strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}
