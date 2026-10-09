export interface ClinicalIntakeData {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  clinical_conditions: string[];
  climate_location: string;
  ethnicity?: string;
  primary_goal?: string;
  notes?: string;
}

export interface MealItem {
  id?: string;
  name: string;
  reasoning: string;
  category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Hydration';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
  climate_tags?: string[];
  hydration_rating?: 'High' | 'Moderate' | 'Standard' | 'Dehydrating';
  thermal_effect?: 'Cooling' | 'Neutral' | 'Warming' | 'Severe Thermal Strain';
  tef_rating?: 'Low TEF' | 'Moderate TEF' | 'High TEF (Sweat Spike)';
  is_dangerous_for_heat?: boolean;
  warning_badge?: string;
}

export interface HydrationMetrics {
  baseLiters: number;
  heatOffsetLiters: number;
  totalLiters: number;
}

export interface NutritionPlanResponse {
  tdee: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealItem[];
  western_meals?: MealItem[];
  climate_insights?: string;
  hydration?: HydrationMetrics;
  hydration_liters?: number;
  climate_risk_warning?: string;
  recommended_supplements?: string[];
}

export interface QuickPreset {
  id: string;
  title: string;
  subtitle: string;
  climateTag: string;
  data: ClinicalIntakeData;
  mockResult: NutritionPlanResponse;
}
