"use client";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize a client side supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znsqzyxmotdzzylwpdcb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3F6eXhtb3Rkenp5bHdwZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDg4MTMsImV4cCI6MjEwNjUyNDgxM30.Sp4946ezcz8YEyQ5BfnLW3SwafXni8wt825fhcIgqGY";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthButton() {
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (user) {
    return (
      <button 
        onClick={() => supabase.auth.signOut()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 transition-colors text-sm font-bold no-print"
      >
        <LogOut size={16} /> Sign Out
      </button>
    );
  }

  return (
    <button 
      onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors text-sm font-bold no-print"
    >
      <User size={16} /> Login with Google
    </button>
  );
}

