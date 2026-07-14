"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Prediction {
  id: string;
  category: string;
  title: string;
  prediction: string;
  confidence: number;
  trend: string;
  detail: string;
  recommendations: string[];
  color: string;
}

const colorClass: Record<string, string> = {
  red: "text-red-400",
  green: "text-emerald-400",
  orange: "text-amber-400",
  blue: "text-blue-400",
  violet: "text-violet-400",
};

export default function MinisterPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/predictions`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setPredictions(json.data);
          setActiveId(json.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const sel = predictions.find(p => p.id === activeId);

  return (
    <PortalLayout title="AI Predictions" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-xs text-red-300">🤖 <strong>AI Intelligence Engine</strong> — Powered by 5 years of state education data, 48,000 school feeds, and predictive ML models. Confidence intervals shown.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
          <span className="text-xs text-slate-500">Loading AI predictions...</span>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-800 text-center">
          <span className="text-3xl block mb-3">🤖</span>
          <p className="text-sm text-slate-400 font-medium">No predictions available yet.</p>
          <p className="text-xs text-slate-600 mt-1">Run the minister seed script to populate this table.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {predictions.map(p => (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`kpi-card cursor-pointer transition-all ${activeId === p.id ? "ring-2 ring-red-500/40 bg-red-500/5" : "hover:scale-[1.02]"}`}
              >
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">{p.category}</div>
                <div className={`text-xl font-extrabold ${colorClass[p.color] || "text-white"} mb-2`}>{p.prediction}</div>
                <div className="text-[10px] text-slate-400 leading-tight mb-3">{p.title}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${p.confidence}%` }} /></div>
                  <span className="text-[10px] text-red-400 font-bold">{p.confidence}%</span>
                </div>
                <div className="text-[9px] text-slate-600 mt-1">Confidence</div>
              </div>
            ))}
          </div>

          {sel && (
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">AI Analysis:</span>
                <h2 className="text-base font-semibold text-white">{sel.title}</h2>
                <span className={`badge ml-auto ${sel.trend === "Increasing" || sel.trend === "UP" ? "badge-red" : "badge-green"}`}>{sel.trend === "Increasing" || sel.trend === "UP" ? "📈 Rising" : "📉 Declining"}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 mb-4">
                    <div className="text-[10px] text-slate-500 mb-1">Predicted Value</div>
                    <div className={`text-3xl font-extrabold ${colorClass[sel.color] || "text-white"}`}>{sel.prediction}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] text-slate-400">Confidence:</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full"><div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${sel.confidence}%` }} /></div>
                      <span className="text-xs font-bold text-red-400">{sel.confidence}%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-2 font-bold">AI ANALYSIS</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{sel.detail}</p>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-3">Ministerial Action Recommendations</div>
                  <div className="space-y-3">
                    {sel.recommendations.map((r, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-red-500/20 transition-all">
                        <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{r}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => alert("Action plan exported and dispatched to relevant departments.")}
                    className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    🚀 Dispatch Action Plan to Departments
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
