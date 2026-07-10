"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface LiveStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  pulse: boolean;
}

interface AlertFeed {
  type: string;
  msg: string;
  time: string;
}

export default function MinisterLivePage() {
  const [paused, setPaused] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStat[]>([]);
  const [alerts, setAlerts] = useState<AlertFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchLive = () => {
    if (paused) return;
    fetch(`${API_URL}/api/analytics/minister/live`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setLiveStats(json.data.liveStats);
          setAlerts(json.data.alerts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [paused, API_URL]);

  return (
    <PortalLayout title="Live State View" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${paused ? "bg-slate-500" : "bg-red-500 animate-pulse"}`} />
          <span className="text-xs text-slate-400 font-semibold">{paused ? "Feed Paused" : "LIVE — Real-time State Dashboard"}</span>
        </div>
        <button onClick={() => setPaused(!paused)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${paused ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}>
          {paused ? "▶ Resume Feed" : "⏸ Pause Feed"}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-xs py-10 text-center">Loading live state view telemetry...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {liveStats.map(k => (
              <div key={k.label} className="kpi-card relative overflow-hidden">
                {k.pulse && !paused && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{k.icon}</span>
                </div>
                <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
                <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-white">🚨 Live Alert Feed</h2>
                <span className={`text-[10px] font-bold ${paused ? "text-slate-500" : "text-red-400"}`}>{paused ? "PAUSED" : "● LIVE"}</span>
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-xs leading-relaxed ${a.type === "CRITICAL" ? "bg-red-500/10 border-red-500/20" : a.type === "WARNING" ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-800/60 border-slate-700"}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold text-[9px] ${a.type === "CRITICAL" ? "text-red-400" : a.type === "WARNING" ? "text-amber-400" : "text-slate-400"}`}>{a.type}</span>
                      <span className="text-[9px] text-slate-600">{a.time}</span>
                    </div>
                    <p className={a.type === "CRITICAL" ? "text-red-300" : a.type === "WARNING" ? "text-amber-300" : "text-slate-400"}>{a.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-4">📡 State Coverage Map</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { region: "Northern TN", coverage: 88, districts: 12 },
                  { region: "Southern TN", coverage: 82, districts: 10 },
                  { region: "Western TN", coverage: 85, districts: 8 },
                  { region: "Eastern TN", coverage: 86, districts: 8 }
                ].map(r => (
                  <div key={r.region} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-white mb-1">{r.region}</div>
                    <div className="text-[10px] text-slate-500 mb-2">{r.districts} districts reporting</div>
                    <div className="h-2 bg-slate-800 rounded-full mb-1">
                      <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${r.coverage}%` }} />
                    </div>
                    <div className={`text-xs font-bold ${r.coverage >= 86 ? "text-emerald-400" : "text-amber-400"}`}>{r.coverage}% reporting</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] text-red-300">📡 Live data feed from schools. Offline / not reporting alerts are generated dynamically.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
