"use client";

import { useEffect } from "react";
import { MdChevronLeft, MdChevronRight, MdAutoAwesome, MdRestaurant, MdPlayArrow, MdClose } from "react-icons/md";
import type { Meal, ExternalDiningRecommendation } from "@/lib/mock";
import { ACCENT } from "@/lib/theme";
import Ring from "./Ring";
import MealImage from "./MealImage";

interface MealDetailProps {
  meal: Meal;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalMeals?: number;
  index?: number;
  total?: number;
  tdee?: number;
  externalDining?: ExternalDiningRecommendation[];
  onGoToRestaurant?: (r: string, mealId?: string) => void;
}

export default function MealDetail({
  meal,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalMeals,
  index,
  total,
  tdee,
  externalDining,
  onGoToRestaurant,
}: MealDetailProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Extract primary dish name (e.g., "Chicken Jalfrezi" from "Chicken Jalfrezi with Plain Roti")
  const primaryDish = meal.name ? meal.name.split(" with ")[0].trim() : "";

  // Extract link from any available URL property
  const rawLink =
    meal.youtube_url ||
    meal.recipe_url ||
    meal.recipe_link ||
    (meal as Record<string, unknown>).youtubeUrl ||
    (meal as Record<string, unknown>).recipeUrl ||
    (meal as Record<string, unknown>).link;

  const recipeLink =
    typeof rawLink === "string" && rawLink.includes("youtube.com/watch")
      ? rawLink
      : primaryDish
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(primaryDish + " recipe")}`
      : null;

  const activeIndex = index !== undefined ? index : currentIndex;
  const activeTotal = total !== undefined ? total : totalMeals;
  const matchedRestaurant =
    externalDining?.find((item) => item.matched_meal_id === meal.id) ??
    externalDining?.find((item) => item.matched_meal_name === meal.name);

  // Macro Calculation
  const proteinCals = (meal.protein || 0) * 4;
  const fatCals = (meal.fat || 0) * 9;
  const carbsCals = (meal.carbs || 0) * 4;
  const totalMacroCals = proteinCals + fatCals + carbsCals || 1;

  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const fatPct = Math.round((fatCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);

  // Calorie Ring Target Calculation
  const targetCals = tdee ? Math.round(tdee / 3) : 600;
  const caloriePct = Math.min(100, Math.round(((meal.calories || 0) / targetCals) * 100));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" data-no-page-swipe>
      <style>{`nav[aria-label="Main navigation"] { display: none !important; }`}</style>
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border border-border"
        style={{ backgroundColor: "#18181b", color: "#f4f4f5" }}
      >
        {/* Meal Image Header */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <MealImage
            meal={meal}
            className="w-full h-48 object-cover rounded-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 text-sm font-bold"
          >
            <MdClose size={16} aria-hidden="true" />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">{meal.name}</h2>

        {/* Macro Rings / Percentages (Including Calories Ring) */}
        <div className="grid grid-cols-4 gap-2 mb-6 p-4 rounded-2xl bg-surface-2 border border-white/5 text-center">
          <div className="flex flex-col items-center">
            <Ring pct={caloriePct} color="#f97316" size={48} stroke={4}>
              <span className="text-[9px] font-bold text-muted-foreground">{caloriePct}%</span>
            </Ring>
            <p className="text-xs font-semibold mt-2 text-muted-foreground">Calories</p>
            <p className="text-xs font-bold">{meal.calories || 0}kcal</p>
          </div>
          <div className="flex flex-col items-center">
            <Ring pct={proteinPct} color="#34d399" size={48} stroke={4}>
              <span className="text-[9px] font-bold text-muted-foreground">{proteinPct}%</span>
            </Ring>
            <p className="text-xs font-semibold mt-2 text-muted-foreground">Protein</p>
            <p className="text-xs font-bold">{meal.protein || 0}g</p>
          </div>
          <div className="flex flex-col items-center">
            <Ring pct={fatPct} color="#fbbf24" size={48} stroke={4}>
              <span className="text-[9px] font-bold text-muted-foreground">{fatPct}%</span>
            </Ring>
            <p className="text-xs font-semibold mt-2 text-muted-foreground">Fat</p>
            <p className="text-xs font-bold">{meal.fat || 0}g</p>
          </div>
          <div className="flex flex-col items-center">
            <Ring pct={carbsPct} color="#60a5fa" size={48} stroke={4}>
              <span className="text-[9px] font-bold text-muted-foreground">{carbsPct}%</span>
            </Ring>
            <p className="text-xs font-semibold mt-2 text-muted-foreground">Carbs</p>
            <p className="text-xs font-bold">{meal.carbs || 0}g</p>
          </div>
        </div>

        
        {/* Watch Recipe Button */}
        {recipeLink && (
          <div className="mb-6">
            <a href={recipeLink} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-foreground shadow-lg transition-all hover:opacity-90 active:scale-[0.98]" style={{ backgroundColor: ACCENT }}>
              <MdPlayArrow className="w-5 h-5 fill-current" />
              <span>Watch Recipe</span>
            </a>
          </div>
        )}
        
        {/* Restaurant Order Button */}
        {matchedRestaurant && (
            <div className="mb-6">
              <button
                onClick={() => {
                  onClose();
                  if (onGoToRestaurant) onGoToRestaurant(matchedRestaurant.restaurant_name, matchedRestaurant.matched_meal_id || meal.id);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <span>Order online &rarr;</span>
              </button>
            </div>
        )}

        {/* Ingredients Section */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-surface-2 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-brand uppercase mb-3">
              <MdRestaurant className="w-4 h-4" />
              <span>Ingredients</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {meal.ingredients.map((ing, i) => (
                <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-surface-2 text-muted-foreground">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Why This Meal */}
        {meal.why && (
          <div className="mb-6 p-4 rounded-2xl bg-surface-2 border border-white/5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-brand uppercase mb-2">
              <MdAutoAwesome className="w-4 h-4" />
              <span>Serving &amp; meal note</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{meal.why}</p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-2 text-muted-foreground transition"
            >
              <MdChevronLeft className="w-4 h-4" />
              Previous
            </button>
          ) : <div />}

          {activeIndex !== undefined && activeTotal !== undefined && (
            <span className="text-xs font-medium text-muted-foreground">
              {activeIndex + 1} / {activeTotal}
            </span>
          )}

          {onNext ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-xl text-black transition"
              style={{ backgroundColor: ACCENT }}
            >
              Next
              <MdChevronRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
