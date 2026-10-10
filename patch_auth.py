import os

file = 'src/components/clima/AuthButton.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

old_signin = 'onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}'
new_signin = 'onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } })}'

content = content.replace(old_signin, new_signin)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched AuthButton.tsx")
