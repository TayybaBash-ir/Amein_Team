"use client";

import { motion } from "framer-motion";
import { MdChevronRight } from "react-icons/md";
import type { Meal } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";
import MealImage from "./MealImage";

export default function MealCard({
  meal,
  index,
  onClick,
}: {
  meal: Meal;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="group flex w-[75vw] max-w-[280px] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-white/10 bg-[#24282a] text-left shadow-lg transition-colors hover:border-white/20 hover:bg-white/[0.06] lg:w-full lg:max-w-none print:w-full print:max-w-none print:block print:border-none print:border-b print:border-neutral-300 print:bg-transparent print:shadow-none print:rounded-none print:py-2 print:my-0"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-t-xl print:hidden">
        <MealImage
          meal={meal}
          className="h-40 w-full rounded-none rounded-t-xl border-0 shadow-none"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {meal.slot}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 print:p-0 print:block">
        <div className="hidden print:inline-block font-bold uppercase text-xs mr-2 text-black">{meal.slot}:</div>
        <h4 className="editorial-title mb-1 line-clamp-1 text-base leading-tight print:line-clamp-none print:inline-block print:text-sm print:font-bold print:text-black print:mb-0">
          {meal.name}
        </h4>
        <div className="mb-2 font-mono text-xs text-neutral-400 print:inline-block print:ml-2 print:text-black print:mb-0 print:text-xs">
          ({meal.calories} kcal • {meal.protein}g protein)
        </div>
        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-neutral-400 print:line-clamp-none print:block print:text-black print:mb-0 print:mt-1">
          Portion to eat: {meal.why}
        </p>
        <div className="mt-auto hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#4a7c59] opacity-0 transition-opacity group-hover:opacity-100 sm:flex no-print">
          View details <MdChevronRight size={12} strokeWidth={3} />
        </div>
      </div>
    </motion.button>
  );
}
