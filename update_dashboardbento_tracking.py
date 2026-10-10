import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_call = "<MealPlanView plan={todayPlanResponse} onGoToRestaurant={onGoToRestaurant} />"
new_call = "<MealPlanView plan={todayPlanResponse} onGoToRestaurant={onGoToRestaurant} isTracking={true} hideHeading={true} />"

c = c.replace(old_call, new_call)

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("DashboardBento tracking enabled!")
