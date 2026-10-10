'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ClinicalIntakeForm from '@/components/clima/ClinicalIntakeForm';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [patientSummary, setPatientSummary] = useState<string>('');

  useEffect(() => {
    // Sync permanent medical baseline from localStorage
    const savedProfile = localStorage.getItem('clima_patient_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const ageText = parsed.age ? `${parsed.age} yr old` : '';
        const genderText = parsed.gender && parsed.gender !== 'unspecified' ? parsed.gender : '';
        const goalText = parsed.healthGoal ? `Goal: ${parsed.healthGoal}` : '';
        
        const summary = [ageText, genderText, goalText].filter(Boolean).join(' • ');
        setPatientSummary(summary ? `Personalized nutrition plan tailored for ${summary}` : '');
      } catch (e) {
        console.error('Error reading patient profile:', e);
      }
    }
  }, []);

  const handleGeneratePlan = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Plan generated successfully:', data);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    // Optional callback for input state changes
  };

  return (
    <div className="min-h-screen bg-[#1A1D1E] text-slate-100">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#1A1D1E]/85 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Title & Subtitle Copy */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Daily Meal Plan
          </h1>
          <p className="text-slate-400 text-sm">
            Tell us about yourself so we can curate meals tailored to your health and weather.
          </p>
          {patientSummary && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{patientSummary}</span>
            </div>
          )}
        </div>

        {/* Single-Line Loading Screen vs Intake Form */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-900/50 rounded-2xl border border-white/10">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Preparing Your Custom Meal Plan...
            </h3>
            <p className="text-sm text-slate-400 animate-pulse">
              Tailoring health-safe dishes to your weather and medical profile...
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/40 rounded-2xl border border-white/10 p-6 sm:p-8">
            <ClinicalIntakeForm 
              onSubmit={handleGeneratePlan} 
              loading={loading} 
              onInputChange={handleInputChange} 
            />
          </div>
        )}
      </main>
    </div>
  );
}