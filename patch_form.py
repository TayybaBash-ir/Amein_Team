import os
import re

form_file = 'src/components/clima/ClinicalIntakeForm.tsx'
with open(form_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to initial state
if 'weekly_budget: "No Limit",' not in content:
    content = content.replace(
        'goal_amount: "5kg",',
        'goal_amount: "5kg",\n    weekly_budget: "No Limit",'
    )

# Add dropdown UI
dropdown_html = """
          <div className="mt-4">
            <label className="clinical-label text-[10px] sm:text-xs">Weekly Budget</label>
            <select
              className="clinical-input py-1.5 sm:py-2 text-xs sm:text-sm"
              value={d.weekly_budget || "No Limit"}
              onChange={(e) => set("weekly_budget", e.target.value)}
            >
              <option value="Under 5,000 PKR">Under 5,000 PKR</option>
              <option value="5,000 - 10,000 PKR">5,000 - 10,000 PKR</option>
              <option value="10,000 - 15,000 PKR">10,000 - 15,000 PKR</option>
              <option value="No Limit">No Limit</option>
            </select>
          </div>
"""

# Insert before allow_external_dining section or pantry items
if "Weekly Budget</label>" not in content:
    content = content.replace(
        '<label className="clinical-label text-[10px] sm:text-xs flex items-center gap-2">',
        dropdown_html + '\n          <label className="clinical-label text-[10px] sm:text-xs flex items-center gap-2">'
    )

with open(form_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched form")
