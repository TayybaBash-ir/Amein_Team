from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

class UserPreferences(BaseModel):
    cuisine: str = "Balanced Mix"
    carb: str = "Surprise Me"
    snack: str = "Savory & Salty"
    strictness: str = "Very Strict"

class PatientIntake(BaseModel):
    preferences: Optional[UserPreferences] = None
    name: Optional[str] = "Patient"
    age: Optional[int] = 30
    gender: Optional[str] = "Unspecified"
    height: Optional[float] = 170.0
    weight: Optional[float] = 70.0
    allergies: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)
    medical_history_notes: Optional[str] = ""
    is_post_discharge: bool = False
    recovery_type: Optional[str] = None
    spice_tolerance: Optional[str] = "Normal"
    goal: Optional[str] = "Maintain"
    goal_amount: str = ""
    city: Optional[str] = "Lahore"
    country: Optional[str] = "Pakistan"
    start_date: Optional[str] = Field(default=None, description="Start date YYYY-MM-DD")
    activity: str = "sedentary"
    acute_illness: Optional[str] = Field(default=None, description='e.g. flu, cough, sore throat')
    weekly_budget: Optional[str] = Field(default='No Limit', description='e.g., No Limit, Under 5,000 PKR, 5,000 - 10,000 PKR')
    pantry_input: Optional[str] = Field(default=None, description="Natural language description of pantry items")
    allow_external_dining: bool = Field(
        default=False,
        description="Include optional external dining recommendations such as Foodpanda",
    )
    pantry_items: Optional[List[str]] = Field(default=None, description="Ingredients available at home")
    strict_pantry_mode: bool = False

# --- Output Models for LLM Structured Output ---

class Meal(BaseModel):
    id: str = Field(..., description="Unique ID like 'day1-breakfast'")
    day: str = Field(..., description="e.g., 'Day 1', 'Day 2'")
    slot: str = Field(..., description="MUST be exactly 'Breakfast', 'Lunch', 'Snack', or 'Dinner'.")
    name: str = Field(..., description="Name of the food or meal")
    ingredients: List[str] = Field(..., description="List of all main ingredients to allow strict allergy validation")
    image_keyword: str = Field(..., description="1-2 word search term for the image (e.g. 'biryani', 'salad')")
    image: Optional[str] = Field(None, description="Image URL populated by backend")
    image_url: Optional[str] = Field(None, description="Image URL from database")
    recipe_url: Optional[str] = Field(None, description="YouTube or recipe URL")
    recipe_link: Optional[str] = Field(None, description="Alias for recipe_url")
    youtube_url: Optional[str] = Field(None, description="Direct YouTube watch URL")
    calories: float = Field(..., description="Estimated calories")
    protein: float = Field(..., description="Protein in grams")
    carbs: float = Field(..., description="Carbohydrates in grams")
    fat: float = Field(..., description="Fat in grams")
    why: str = Field(..., description="Why this fits the local real-time weather and their conditions")
    benefits: List[str] = Field(..., description="3-4 short points on why this meal helps them")
    estimated_cost: Optional[float] = Field(None, description="Estimated cost in PKR")

# --- Final API Response Models ---

class NutritionTargets(BaseModel):
    bmi: float
    bmi_category: str
    bmr: int
    tdee: int
    target_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    constraints_applied: List[str]

class WeatherInfo(BaseModel):
    location: str
    forecast: List[Dict[str, Any]]

class DailyTotals(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float

class ValidationInfo(BaseModel):
    valid: bool
    messages: List[str]

class DayPlan(BaseModel):
    date: str
    day_label: str
    weather: Optional[Dict[str, Any]]
    meals: List[Meal]
    daily_totals: DailyTotals
    validation: ValidationInfo

class MealPlan(BaseModel):
    days: List[DayPlan]
    overall_validation: ValidationInfo

class ExternalDiningRecommendation(BaseModel):
    restaurant_name: str
    dish_name: str
    item_name: Optional[str] = None
    price: Optional[float] = None
    protein: float
    kitchen_note: str
    order_url: Optional[str] = None
    foodpanda_url: Optional[str] = None
    matched_meal_id: Optional[str] = None
    matched_meal_name: Optional[str] = None


class PlanResponse(BaseModel):
    patient: PatientIntake
    nutrition: NutritionTargets
    weather: WeatherInfo
    meal_plan: MealPlan
    external_dining: List[ExternalDiningRecommendation] = Field(default_factory=list)
    outside_order_matches: List[List[ExternalDiningRecommendation]] = Field(default_factory=list)

class SwapRequest(BaseModel):
    patient: PatientIntake
    slot: str
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fat: float
    previously_selected: List[str] = Field(default_factory=list)

class SwapResponse(BaseModel):
    alternatives: List[Meal]
