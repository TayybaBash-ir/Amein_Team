import requests
import json
import time

BASE_URL = "https://amein-team.vercel.app"
print(f"Starting End-to-End Diagnostics on {BASE_URL}...\n")

def run_test(name, fn):
    print(f"Testing [{name}]...")
    try:
        fn()
        print(f"✅ [{name}] PASSED\n")
    except Exception as e:
        print(f"❌ [{name}] FAILED: {str(e)}\n")

# 1. Test ML Telemetry Logging
def test_ml_log():
    payload = {
        "user_id": "hackathon_judge",
        "action": "skipped",
        "meal_id": "test_meal_1",
        "dish_name": "Diagnostic Chicken Curry",
        "context": {}
    }
    r = requests.post(f"{BASE_URL}/api/interaction", json=payload)
    if r.status_code != 200:
        raise Exception(f"Expected 200, got {r.status_code}. Response: {r.text}")
    print("   -> Successfully logged a 'skipped' interaction.")

# 2. Test ML Profile Generation
def test_ml_profile():
    r = requests.get(f"{BASE_URL}/api/ml-profile?user_id=hackathon_judge")
    if r.status_code != 200:
        raise Exception(f"Expected 200, got {r.status_code}. Response: {r.text}")
    data = r.json()
    prefs = data.get("learned_preferences", {})
    if "chicken" not in prefs:
        raise Exception("Failed to retrieve learned preference for 'chicken'. ML is not reading the telemetry!")
    print(f"   -> ML Profile verified! Penalty for 'chicken': {prefs['chicken']}")

# 3. Test Meal Plan Generation
def test_generate_plan():
    payload = {
        "name": "Jane Doe",
        "age": 30,
        "gender": "Female",
        "height": 165.0,
        "weight": 65.0,
        "goal": "Lose weight",
        "goal_amount": "5kg",
        "dietary_restrictions": ["No Beef"],
        "allergies": [],
        "conditions": [],
        "is_post_discharge": False,
        "spice_tolerance": "Normal",
        "plan_mode": "standard"
    }
    start = time.time()
    r = requests.post(f"{BASE_URL}/api/generate-plan", json=payload)
    elapsed = time.time() - start
    if r.status_code != 200:
        raise Exception(f"Expected 200, got {r.status_code}. Response: {r.text}")
    data = r.json()
    if "plan" not in data or len(data["plan"]) != 7:
        raise Exception("Failed to generate a full 7-day plan.")
    print(f"   -> Generated full 7-day plan in {elapsed:.2f} seconds.")

# 4. Test Swap Meal
def test_swap_meal():
    payload = {
        "patient": {
            "name": "Jane Doe",
            "age": 30,
            "gender": "Female",
            "height": 165.0,
            "weight": 65.0,
            "dietary_restrictions": [],
            "allergies": []
        },
        "slot": "Lunch",
        "target_calories": 500,
        "target_protein": 30,
        "target_carbs": 50,
        "target_fat": 15,
        "previously_selected": []
    }
    r = requests.post(f"{BASE_URL}/api/swap-meal", json=payload)
    if r.status_code != 200:
        raise Exception(f"Expected 200, got {r.status_code}. Response: {r.text}")
    data = r.json()
    if "alternatives" not in data or len(data["alternatives"]) == 0:
        raise Exception("Failed to generate swap alternatives.")
    print(f"   -> Successfully generated {len(data['alternatives'])} swap alternatives.")

run_test("1. ML Interaction Webhook", test_ml_log)
run_test("2. ML Preference Extraction", test_ml_profile)
run_test("3. Core Algorithm Generation", test_generate_plan)
run_test("4. Meal Swap Logic", test_swap_meal)

print("DIAGNOSTICS COMPLETE.")
