"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import Swal from "sweetalert2";

function InfographicViewContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const urlTopic = searchParams.get("topic");
  const urlSubject = searchParams.get("subject");
  const role = searchParams.get("role") || "student";

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [infographicData, setInfographicData] = useState<any>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (planId && planId !== "temp-unsaved") {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/api/teacher/lessons/${planId}`);
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setPlan(data);
            setTopic(data.topic);
            setSubject(data.subject);
            // Support both teacher and student mapped keys
            setInfographicData(data.planData?.infographic || data.infographic || null);
          } else {
            throw new Error(json.error || "Failed to load lesson plan");
          }
        } catch (err) {
          console.error("Error loading lesson plan", err);
          Swal.fire({
            icon: "error",
            title: "Plan Not Found",
            text: "Could not retrieve the saved chapter data from database. Showing default view.",
          });
          // Fallback to URL params
          setTopic(urlTopic || "Agricultural AI");
          setSubject(urlSubject || "Science");
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for unsaved plans: load data from sessionStorage if available
        setTopic(urlTopic || "Topic Overview");
        setSubject(urlSubject || "Subject");
        
        try {
          const tempData = localStorage.getItem("tempInfographicData");
          if (tempData) {
            setInfographicData(JSON.parse(tempData));
          }
        } catch (e) {
          console.error("Failed to parse temp infographic data from local storage");
        }
        
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, urlTopic, urlSubject, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-6" />
        <h3 className="text-white font-semibold text-sm">Loading Visual Explainer Infographic</h3>
        <p className="text-xs text-slate-550 mt-2">Fetching source pedagogical datasets from Smart School servers...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Standalone Nav Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/80 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.close()}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              ← Close Window
            </button>
            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-1">Intelligence Presentation Output</span>
              <h1 className="text-white font-black text-sm md:text-base leading-none">
                Fullscreen classroom visual explainer
              </h1>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-indigo-400 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              🖨️ Print Explainer
            </button>
          </div>
        </div>

        {/* Infographic Main Container */}
        <div className="bg-slate-950/40 border border-slate-800/50 rounded-3xl p-2 md:p-4 shadow-2xl relative overflow-hidden min-h-[500px]">
          {/* Subtle blueprint grid line overlay for math/science */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:30px_30px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            <InteractiveInfographic
              topic={topic}
              subject={subject}
              data={infographicData}
            />
          </div>
        </div>

        {/* Footer Brand */}
        <div className="text-center text-[10px] text-slate-655 font-mono tracking-widest uppercase">
          TN Schools AI smart learning ecosystem · powered by Smart Assistant 2.5 flash
        </div>

      </div>
    </div>
  );
}

export default function InfographicViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-6" />
        <h3 className="text-white font-semibold text-sm">Loading Workspace View...</h3>
      </div>
    }>
      <InfographicViewContent />
    </Suspense>
  );
}
