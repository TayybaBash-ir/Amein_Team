import { notFound } from "next/navigation";
import MealPlanView from "@/components/clima/MealPlanView";

async function getPlan(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const res = await fetch(baseUrl + "/api/plan/" + id, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function SharedPlanPage({ params }: { params: { id: string } }) {
  const plan = await getPlan(params.id);
  
  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <MealPlanView plan={plan} />
      </div>
    </div>
  );
}
