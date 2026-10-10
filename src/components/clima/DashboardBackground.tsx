"use client";

import { useMemo } from "react";
import { 
  MdRestaurant, MdLocalPizza, MdLocalCafe, MdFastfood, MdLunchDining, 
  MdDinnerDining, MdSetMeal, MdBakeryDining, MdIcecream, MdRamenDining, 
  MdSoupKitchen, MdEgg, MdCake, MdLocalBar, MdTapas, MdKebabDining, 
  MdWineBar, MdRiceBowl, MdEmojiFoodBeverage, MdCoffee
} from "react-icons/md";

const icons = [
  MdRestaurant, MdLocalPizza, MdLocalCafe, MdFastfood, MdLunchDining, 
  MdDinnerDining, MdSetMeal, MdBakeryDining, MdIcecream, MdRamenDining, 
  MdSoupKitchen, MdEgg, MdCake, MdLocalBar, MdTapas, MdKebabDining, 
  MdWineBar, MdRiceBowl, MdEmojiFoodBeverage, MdCoffee
];

export default function DashboardBackground() {
  const pattern = useMemo(() => {
    return Array.from({ length: 250 }).map((_, i) => {
      // Deterministic selection so it doesn't mismatch on hydration
      const Icon = icons[(i * 7 + 3) % icons.length];
      return (
        <div key={i} className="p-[14px] sm:p-5 flex items-center justify-center">
          <Icon className="text-brand w-8 h-8 sm:w-10 sm:h-10 opacity-[0.12] dark:opacity-[0.08]" />
        </div>
      );
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      
      {/* Soft pistachio glows in light mode, forest-green glows in dark mode. */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-brand/40 blur-[130px] dark:bg-brand/20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-brand/35 blur-[100px] dark:bg-brand/15" />
      <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] rounded-full bg-brand/30 blur-[150px] dark:bg-brand/10" />

      {/* Noise Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay dark:opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Dense Icon Pattern */}
      <div className="absolute inset-[-20%] flex flex-wrap justify-center items-center -rotate-[8deg] transform scale-110 select-none">
        {pattern}
      </div>
      
      {/* Gradient fade to ensure text/tabs are readable at the edges */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/50 to-transparent z-10" />
    </div>
  );
}
