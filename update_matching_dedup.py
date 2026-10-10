import re

with open('api/matching_engine.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_dedup = """    # Deduplicate by base name
    seen_names = set()
    final_options = []
    for vc in valid_candidates:
        base_name = vc['candidate']['name'].replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip()
        if base_name not in seen_names:
            seen_names.add(base_name)
            final_options.append(vc)
        if len(final_options) >= num_options:
            break
            
    # If we couldn't find enough, try ignoring variety penalty
    if len(final_options) < num_options:
        for cand in candidates:
            base_name = cand['name'].replace(' (Home-style)', '').replace(' (Dum Cooked)', '').strip()"""

new_dedup = """    # Deduplicate by base main ingredient (ignore sides after 'with')
    seen_names = set()
    final_options = []
    for vc in valid_candidates:
        base_name = vc['candidate']['name'].lower().split(' with ')[0].replace(' (home-style)', '').replace(' (dum cooked)', '').strip()
        if base_name not in seen_names:
            seen_names.add(base_name)
            final_options.append(vc)
        if len(final_options) >= num_options:
            break
            
    # If we couldn't find enough, try ignoring variety penalty
    if len(final_options) < num_options:
        for cand in candidates:
            base_name = cand['name'].lower().split(' with ')[0].replace(' (home-style)', '').replace(' (dum cooked)', '').strip()"""

c = c.replace(old_dedup, new_dedup)

with open('api/matching_engine.py', 'w', encoding='utf-8') as f:
    f.write(c)
    
print("Deduplication updated!")
