const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const importReplacement = `import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znsqzyxmotdzzylwpdcb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3F6eXhtb3Rkenp5bHdwZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDg4MTMsImV4cCI6MjEwNjUyNDgxM30.Sp4946ezcz8YEyQ5BfnLW3SwafXni8wt825fhcIgqGY";
const supabase = createClient(supabaseUrl, supabaseKey);`;

c = c.replace(/import \{ useState, useEffect \} from "react";/, importReplacement);

const authGuard = `
  const [user, setUser] = useState(undefined);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clima_patient_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setHasProfile(!!(p.age && p.weight && p.height));
      } else {
        setHasProfile(false);
      }
    } catch {
      setHasProfile(false);
    }
  }, []);

  if (user === undefined) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" /></div>;

  if (user === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark shadow-xl shadow-brand/20 mb-6">
          <MdEco size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to ClimaDiet</h1>
        <p className="text-muted-foreground max-w-sm mb-8">Your personalized clinical nutrition journey starts here. Please sign in to continue.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
          className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors font-bold shadow-lg"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 border border-border shadow-xl mb-6">
          <MdPerson size={32} className="text-brand" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground max-w-md mb-8">Before we can generate your perfect meal plan, we need some basic health information to calibrate our clinical AI.</p>
        <button 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-6 py-4 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors font-bold shadow-lg shadow-brand/25"
        >
          Setup My Profile
        </button>
      </div>
    );
  }

  const [step, setStep] = useState<ScreenStep>("home");`;

c = c.replace(/const \[step, setStep\] = useState<ScreenStep>\(\"home\"\);/, authGuard);

fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
console.log('Dashboard Auth Guard implemented!');
