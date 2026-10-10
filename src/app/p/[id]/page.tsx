import { notFound } from "next/navigation";
import MealPlanView from "@/components/clima/MealPlanView";
import { createClient } from "@supabase/supabase-js";

async function getPlan(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://znsqzyxmotdzzylwpdcb.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3F6eXhtb3Rkenp5bHdwZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDg4MTMsImV4cCI6MjEwNjUyNDgxM30.Sp4946ezcz8YEyQ5BfnLW3SwafXni8wt825fhcIgqGY";
  
  if (!supabaseUrl || !supabaseKey) return null;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.from("saved_plans").select("plan_data").eq("id", id).single();
  if (error || !data) return null;
  return data.plan_data;
}

export default async function SharedPlanPage({ params }: { params: { id: string } }) {
  const plan = await getPlan(params.id);
  
  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <MealPlanView plan={plan} />
      </div>
    </div>
  );
}
