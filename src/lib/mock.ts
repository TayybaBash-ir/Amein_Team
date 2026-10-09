export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"] as const;
export type Day = (typeof DAYS)[number];
export type Slot = (typeof SLOTS)[number];

export type Meal = {
  id: string;
  day: string;
  slot: Slot;
  name: string;
  ingredients: string[];
  image?: string | null;
  image_url?: string | null;
  recipe_url?: string | null;
  recipe_link?: string | null;
  youtube_url?: string | null;
  emoji?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  why: string;
  benefits: string[];
};

export type ExternalDiningRecommendation = {
  restaurant_name: string;
  dish_name: string;
  item_name?: string | null;
  price: number | null;
  protein: number;
  kitchen_note: string;
  order_url?: string | null;
  matched_meal_id?: string | null;
  matched_meal_name?: string | null;
};

export type PatientIntake = {
  age: number; weight: number; height: number; gender: string; activity: string;
  conditions: string[]; allergies: string[];
  goal: string; goal_amount: string; dietary_restrictions: string[];
  allow_external_dining?: boolean;
  preferences?: { cuisine: string; carb: string; snack: string; strictness: string; };
};
export type IntakeData = PatientIntake;

export type NutritionTargets = {
  bmi: number;
  bmi_category: string;
  bmr: number;
  tdee: number;
  target_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  constraints_applied: string[];
};

export type WeatherDay = {
  time: string;
  temperature_max: number;
  temperature_min: number | null;
  weather_code?: number;
};

export type WeatherInfo = {
  location: string;
  forecast: WeatherDay[];
};

export type DailyTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type ValidationInfo = {
  valid: boolean;
  messages: string[];
};

export type DayPlan = {
  date: string;
  day_label: string;
  weather: WeatherDay | null;
  meals: Meal[];
  daily_totals: DailyTotals;
  validation: ValidationInfo;
};

export type MealPlan = {
  days: DayPlan[];
  overall_validation: ValidationInfo;
};

export type PlanResponse = {
  patient: PatientIntake;
  nutrition: NutritionTargets;
  weather: WeatherInfo;
  meal_plan: MealPlan;
  external_dining?: ExternalDiningRecommendation[];
  outside_order_matches?: ExternalDiningRecommendation[][];
};

export const MOCK_PLAN: PlanResponse = {
  patient: {
    age: 32,
    weight: 70,
    height: 175,
    gender: "Female",
    activity: "Moderately Active",
    conditions: ["Hypertension"],
    allergies: ["Peanuts"],
    goal: "Weight Maintenance",
    goal_amount: "Maintain current weight",
    dietary_restrictions: ["Low Sodium"],
    allow_external_dining: true,
    preferences: {
      cuisine: "Mediterranean",
      carb: "Moderate",
      snack: "Fruits & Nuts",
      strictness: "Flexible",
    },
  },
  nutrition: {
    bmi: 22.9,
    bmi_category: "Normal",
    bmr: 1450,
    tdee: 2000,
    target_calories: 2000,
    protein_g: 130,
    carbs_g: 220,
    fat_g: 65,
    constraints_applied: ["Low Sodium", "Heart-Healthy"],
  },
  weather: {
    location: "San Francisco, CA",
    forecast: [
      { time: "2026-10-05", temperature_max: 22, temperature_min: 14, weather_code: 1 },
      { time: "2026-10-06", temperature_max: 24, temperature_min: 15, weather_code: 1 },
      { time: "2026-10-07", temperature_max: 21, temperature_min: 13, weather_code: 2 },
    ],
  },
  meal_plan: {
    overall_validation: { valid: true, messages: [] },
    days: [
      {
        date: "2026-10-05",
        day_label: "Day 1",
        weather: { time: "2026-10-05", temperature_max: 22, temperature_min: 14, weather_code: 1 },
        daily_totals: { calories: 1980, protein_g: 132, carbs_g: 215, fat_g: 64 },
        validation: { valid: true, messages: [] },
        meals: [
          {
            id: "m1",
            day: "Day 1",
            slot: "Breakfast",
            name: "Greek Yogurt Berry Bowl",
            ingredients: ["Greek Yogurt", "Blueberries", "Chia Seeds", "Honey", "Walnuts"],
            image: null,
            emoji: "????",
            calories: 450,
            protein: 30,
            carbs: 48,
            fat: 14,
            why: "High protein and antioxidants to kickstart metabolism and maintain satiety.",
            benefits: ["Supports gut health", "Sustained morning energy", "Antioxidant rich"],
          },
          {
            id: "m2",
            day: "Day 1",
            slot: "Lunch",
            name: "Grilled Salmon Quinoa Salad",
            ingredients: ["Salmon", "Quinoa", "Spinach", "Avocado", "Olive Oil", "Lemon"],
            image: null,
            emoji: "????",
            calories: 650,
            protein: 42,
            carbs: 55,
            fat: 26,
            why: "Omega-3 rich salmon paired with complex carbs for cardiovascular and brain health.",
            benefits: ["Rich in Omega-3 fatty acids", "Low glycemic index", "Supports heart health"],
          },
          {
            id: "m3",
            day: "Day 1",
            slot: "Snack",
            name: "Apple & Almond Butter",
            ingredients: ["Apple", "Almond Butter"],
            image: null,
            emoji: "????",
            calories: 220,
            protein: 6,
            carbs: 27,
            fat: 11,
            why: "Quick fiber and healthy fats to bridge the gap between lunch and dinner.",
            benefits: ["High fiber", "Prevents blood sugar spikes"],
          },
          {
            id: "m4",
            day: "Day 1",
            slot: "Dinner",
            name: "Herb Roasted Chicken & Vegetables",
            ingredients: ["Chicken Breast", "Sweet Potato", "Broccoli", "Olive Oil", "Herbs"],
            image: null,
            emoji: "????",
            calories: 660,
            protein: 54,
            carbs: 85,
            fat: 13,
            why: "Lean protein with complex carbs and micronutrient-dense greens for evening recovery.",
            benefits: ["Muscle recovery", "Nutrient dense", "Easy digestion"],
          },
        ],
      },
      {
        date: "2026-10-06",
        day_label: "Day 2",
        weather: { time: "2026-10-06", temperature_max: 24, temperature_min: 15, weather_code: 1 },
        daily_totals: { calories: 2010, protein_g: 128, carbs_g: 222, fat_g: 66 },
        validation: { valid: true, messages: [] },
        meals: [
          {
            id: "m5",
            day: "Day 2",
            slot: "Breakfast",
            name: "Avocado & Egg Toast",
            ingredients: ["Whole Grain Bread", "Avocado", "Eggs", "Microgreens", "Chili Flakes"],
            image: null,
            emoji: "????",
            calories: 480,
            protein: 22,
            carbs: 42,
            fat: 24,
            why: "Healthy monounsaturated fats and quality egg protein to sustain morning concentration.",
            benefits: ["Brain booster", "Sustained fullness", "High in choline"],
          },
          {
            id: "m6",
            day: "Day 2",
            slot: "Lunch",
            name: "Mediterranean Chickpea Bowl",
            ingredients: ["Chickpeas", "Cucumber", "Feta Cheese", "Olives", "Tahini Dressing"],
            image: null,
            emoji: "????",
            calories: 610,
            protein: 26,
            carbs: 78,
            fat: 21,
            why: "Plant-based protein powerhouse loaded with prebiotic fiber and healthy fats.",
            benefits: ["High digestive fiber", "Microbiome support", "Rich in minerals"],
          },
          {
            id: "m7",
            day: "Day 2",
            slot: "Snack",
            name: "Protein Berry Smoothie",
            ingredients: ["Whey/Plant Protein", "Mixed Berries", "Almond Milk", "Flaxseed"],
            image: null,
            emoji: "????",
            calories: 250,
            protein: 25,
            carbs: 26,
            fat: 5,
            why: "Rapidly absorbed protein and polyphenols after activity.",
            benefits: ["Post-workout recovery", "Antioxidant boost"],
          },
          {
            id: "m8",
            day: "Day 2",
            slot: "Dinner",
            name: "Baked Cod with Brown Rice & Asparagus",
            ingredients: ["Pacific Cod", "Brown Rice", "Asparagus", "Lemon Herb Sauce"],
            image: null,
            emoji: "????",
            calories: 670,
            protein: 55,
            carbs: 76,
            fat: 16,
            why: "Very lean white fish for easy digestion before sleep.",
            benefits: ["Lean protein source", "Micronutrient rich", "Promotes rest"],
          },
        ],
      },
      {
        date: "2026-10-07",
        day_label: "Day 3",
        weather: { time: "2026-10-07", temperature_max: 21, temperature_min: 13, weather_code: 2 },
        daily_totals: { calories: 1970, protein_g: 131, carbs_g: 218, fat_g: 63 },
        validation: { valid: true, messages: [] },
        meals: [
          {
            id: "m9",
            day: "Day 3",
            slot: "Breakfast",
            name: "Oatmeal with Banana & Flaxseed",
            ingredients: ["Rolled Oats", "Banana", "Flaxseeds", "Almond Milk", "Cinnamon"],
            image: null,
            emoji: "????",
            calories: 430,
            protein: 16,
            carbs: 72,
            fat: 9,
            why: "Beta-glucan fiber from oats supports cholesterol balance and smooth digestion.",
            benefits: ["Heart health", "Steady energy release", "High soluble fiber"],
          },
          {
            id: "m10",
            day: "Day 3",
            slot: "Lunch",
            name: "Turkey & Avocado Wrap",
            ingredients: ["Whole Wheat Wrap", "Turkey Breast", "Avocado", "Lettuce", "Tomato"],
            image: null,
            emoji: "????",
            calories: 590,
            protein: 40,
            carbs: 52,
            fat: 22,
            why: "Balanced macronutrient distribution for midday productivity.",
            benefits: ["Sustained energy", "High lean protein", "Vitamin B rich"],
          },
          {
            id: "m11",
            day: "Day 3",
            slot: "Snack",
            name: "Mixed Nuts & Dark Chocolate",
            ingredients: ["Almonds", "Walnuts", "70% Dark Chocolate"],
            image: null,
            emoji: "????",
            calories: 230,
            protein: 7,
            carbs: 18,
            fat: 16,
            why: "Magnesium and healthy fats for cognitive refresh.",
            benefits: ["Focus enhancement", "Heart-healthy fats"],
          },
          {
            id: "m12",
            day: "Day 3",
            slot: "Dinner",
            name: "Stir-Fried Tofu & Asian Vegetables",
            ingredients: ["Firm Tofu", "Bell Peppers", "Snap Peas", "Sesame Oil", "Brown Rice"],
            image: null,
            emoji: "????",
            calories: 720,
            protein: 38,
            carbs: 76,
            fat: 26,
            why: "Nutrient-dense phytonutrients and plant protein.",
            benefits: ["Antioxidant support", "Balanced amino acids"],
          },
        ],
      },
    ],
  },
};

export async function generatePlan(data: IntakeData): Promise<PlanResponse> {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 150_000);

  try {
    const r = await fetch(`${url}/api/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const responseData = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(responseData.detail || `Plan generation failed (${r.status}). Please try again.`);
    }

    return responseData as PlanResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Plan generation timed out after 150 seconds. Check that the API is running and try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the plan generation API. Check that the backend is running, then try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}



