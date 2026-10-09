import React from "react";

interface Props {
  restaurantName: string;
  dishName: string;
  price: number | null;
  protein: number;
  kitchenNote: string;
  orderUrl?: string | null;
  matchedMealName?: string | null;
}

export const RestaurantRecommendationCard: React.FC<Props> = ({
  restaurantName,
  dishName,
  price,
  protein,
  kitchenNote,
  orderUrl,
  matchedMealName,
}) => {
  const link = orderUrl;
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#24282a] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          {restaurantName}
        </span>
        <span className="shrink-0 rounded-md bg-[#edf3ec] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#346538]">
          Clinically matched
        </span>
      </div>

      <h4 className="text-base font-semibold tracking-tight text-white">{dishName}</h4>
      {matchedMealName ? (
        <p className="text-xs text-neutral-500">Matches planned meal: {matchedMealName}</p>
      ) : null}

      <div className="flex justify-between font-mono text-sm tabular-nums text-neutral-300">
        <span>
          Price: <strong className="text-white">{price === null ? "Check menu" : `${price} PKR`}</strong>
        </span>
        <span>
          Protein: <strong className="text-white">{protein}g</strong>
        </span>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-xs leading-relaxed text-neutral-300">
        <strong className="text-neutral-200">Kitchen note: </strong>
        {kitchenNote}
      </div>

      <button
        type="button"
        disabled={!link}
        className="w-full rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => link && window.open(link, "_blank", "noopener,noreferrer")}
      >
        View Menu / Order Item
      </button>
    </article>
  );
};
