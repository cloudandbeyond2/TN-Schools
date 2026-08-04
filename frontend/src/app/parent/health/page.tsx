"use client";

import React, { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import { 
  Ruler, Scale, Droplet, Activity, Eye, Stethoscope, Ear, 
  ShieldAlert, Award, Shield, Flame, Heart, Zap, History, 
  Calendar, CheckCircle2, RefreshCw, Bell
} from "lucide-react";

interface HealthData {
  height: number | null;
  weight: number | null;
  bloodGroup: string | null;
  vision: string | null;
  hearing: string | null;
  bmi: number | null;
  dental: string | null;
  lastCheckupDate: string | null;
  notes: string | null;
}

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-5 p-3 glass rounded-2xl flex-wrap">
      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 dark:text-slate-400">
        <i className="fi fi-rr-user text-[10px]"></i> Viewing:
      </span>
      {childList.map(c => (
        <button
          key={c.studentId}
          onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
            active?.studentId === c.studentId
              ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

export default function ParentHealthReportPage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [sportsData, setSportsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sportsLoading, setSportsLoading] = useState(false);

  const fetchHealthData = useCallback(async (rollNumber: string) => {
    setLoading(true);
    try {
      const apiUrl = getApiBase();
      const res = await fetch(`${apiUrl}/api/headmaster/health/${rollNumber}`);
      const json = await res.json();
      if (json.success && json.data) {
        setHealthData(json.data);
      } else {
        setHealthData(null);
      }
    } catch (error) {
      console.error("Failed to fetch health data:", error);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSportsData = useCallback(async (studentId: string) => {
    setSportsLoading(true);
    try {
      const apiUrl = getApiBase();
      const res = await fetch(`${apiUrl}/api/sports/${studentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSportsData(json.data);
      } else {
        setSportsData(null);
      }
    } catch (error) {
      console.error("Failed to fetch sports data:", error);
      setSportsData(null);
    } finally {
      setSportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeChild?.rollNumber) {
      fetchHealthData(activeChild.rollNumber);
      fetchSportsData(activeChild.studentId);
    } else {
      setHealthData(null);
      setSportsData(null);
      if (!childrenLoading && !activeChild) {
        setLoading(false);
      }
    }
  }, [activeChild, childrenLoading, fetchHealthData, fetchSportsData]);

  const getBmiStyles = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        label: "Underweight",
        cardBg: "bg-amber-500/[0.03] dark:bg-amber-950/10",
        border: "border-amber-500/20 dark:border-amber-800/30",
        text: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-500/10",
        badgeText: "text-amber-500",
        dotColor: "bg-amber-500"
      };
    }
    if (bmi < 25) {
      return {
        label: "Healthy",
        cardBg: "bg-emerald-500/[0.03] dark:bg-emerald-950/10",
        border: "border-emerald-500/20 dark:border-emerald-800/30",
        text: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-500/10",
        badgeText: "text-emerald-500",
        dotColor: "bg-emerald-500"
      };
    }
    return {
      label: "Overweight",
      cardBg: "bg-rose-500/[0.03] dark:bg-rose-950/10",
      border: "border-rose-500/20 dark:border-rose-800/30",
      text: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-500/10",
      badgeText: "text-rose-500",
      dotColor: "bg-rose-500"
    };
  };

  const getHealthContent = () => {
    if (childrenLoading || loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500 font-bold animate-pulse">Loading health report...</p>
        </div>
      );
    }

    if (children.length === 0) {
      return (
        <div className="glass rounded-2xl p-10 text-center mb-6">
          <div className="text-5xl mb-4">👨‍👩‍👧</div>
          <h2 className="text-white font-bold text-lg mb-2">No Children Linked</h2>
          <p className="text-slate-400 text-sm">
            Your account hasn&apos;t been linked to any student records. Please contact the Headmaster
            to link your ward&apos;s student ID to your parent account.
          </p>
        </div>
      );
    }

    if (!activeChild?.rollNumber) {
      return (
        <div className="glass rounded-2xl p-10 text-center mb-6 border border-slate-800">
          <div className="text-4xl mb-4 text-amber-500">
            <i className="fi fi-rr-info"></i>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Roll Number Missing</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {activeChild?.name || "Child"} does not have a roll number configured in the system.
            Please reach out to the school administration to update the student details.
          </p>
        </div>
      );
    }

    if (!healthData) {
      return (
        <div className="glass rounded-2xl p-10 text-center mb-6 border border-slate-800">
          <div className="text-4xl mb-4 text-emerald-500">
            <i className="fi fi-rr-heart"></i>
          </div>
          <h2 className="text-white font-bold text-lg mb-2">No Health Record Found</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            There is no active health checkup report recorded for {activeChild.name}.
            Medical checkup details will appear here once the school conducts the physical checkup.
          </p>
        </div>
      );
    }

    const bmiValue = healthData.bmi || 0;
    const bmiStyles = getBmiStyles(bmiValue);

    // Parse vision and notes
    const visionStr = healthData.vision || "N/A";
    let leftEye = "N/A";
    let rightEye = "N/A";
    if (visionStr.includes(",")) {
      const parts = visionStr.split(",");
      leftEye = parts[0].trim();
      rightEye = parts[1]?.trim() || "N/A";
    } else {
      leftEye = visionStr;
      rightEye = visionStr;
    }

    let allergies = ["None recorded"];

    if (healthData.notes) {
      allergies = [healthData.notes];
    }

    const lastDentalStr = healthData.dental || "N/A";
    let formattedCheckupDate = "N/A";
    if (healthData.lastCheckupDate) {
      formattedCheckupDate = new Date(healthData.lastCheckupDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
        {/* Left Column: Core Vitals & Measurements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Child Identity Card */}
          <div className="bg-white/70 dark:bg-slate-900/60 rounded-[2rem] p-6 shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none"></div>
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 border border-slate-200 dark:border-slate-700/50">
              <i className="fi fi-rr-user text-3xl"></i>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">{activeChild.name}</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Class {activeChild.class}{activeChild.section} · Roll No: {activeChild.rollNumber}</p>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                  <i className="fi fi-rr-checkbox mr-1"></i> Cleared for Sports
                </span>
                {(leftEye !== "N/A" || rightEye !== "N/A") && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-sky-500/10 text-sky-655 dark:text-sky-400 rounded-md border border-sky-500/20">
                    <i className="fi fi-rr-eye mr-1"></i> Vision Checked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4 KPIs grid (Responsive to all screens: grid-cols-2 to grid-cols-4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Height Card */}
            <div className="group bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl text-center hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center justify-between shadow-sm">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 border border-slate-100 dark:border-slate-700/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-300">
                <i className="fi fi-rr-ruler-triangle text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{healthData.height || "—"}</h3>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">Height (cm)</p>
              </div>
            </div>
            
            {/* Weight Card */}
            <div className="group bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl text-center hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center justify-between shadow-sm">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 border border-slate-100 dark:border-slate-700/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all duration-300">
                <i className="fi fi-rr-balance-scale-left text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{healthData.weight || "—"}</h3>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">Weight (kg)</p>
              </div>
            </div>

            {/* Blood Group Card */}
            <div className="group bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl text-center hover:border-rose-500/30 transition-all duration-300 flex flex-col items-center justify-between shadow-sm">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-rose-550 dark:text-rose-450 mb-3 border border-slate-100 dark:border-slate-700/50 group-hover:bg-rose-500/10 transition-all duration-300">
                <i className="fi fi-rr-raindrops text-lg"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-500 leading-none">{healthData.bloodGroup || "—"}</h3>
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">Blood Group</p>
              </div>
            </div>

            {/* BMI Card */}
            <div className={`group p-5 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center justify-between shadow-sm ${bmiStyles.cardBg} ${bmiStyles.border}`}>
              <div className={`w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-700/50 ${bmiStyles.text} group-hover:bg-emerald-500/10 transition-all duration-300`}>
                <i className="fi fi-rr-pulse text-lg"></i>
              </div>
              <div>
                <h3 className={`text-2xl font-black leading-none ${bmiStyles.text}`}>{bmiValue || "—"}</h3>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${bmiStyles.text}`}>
                  BMI: {bmiValue ? bmiStyles.label : "N/A"}
                </p>
              </div>
            </div>

          </div>

          {/* Vision, Hearing, and Dental details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Vision */}
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-colors duration-300 text-left flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-750 text-sky-500 dark:text-sky-400 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">Vision Check</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Left (L)</span>
                    <span className="text-base font-black text-slate-805 dark:text-white">{leftEye}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Right (R)</span>
                    <span className="text-base font-black text-slate-805 dark:text-white">{rightEye}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hearing Check */}
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-colors duration-300 text-left flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-750 text-emerald-505 dark:text-emerald-450 rounded-xl flex items-center justify-center">
                    <Ear className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">Hearing Check</h3>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-850 flex flex-col justify-center items-center min-h-[74px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Auditory Status</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{healthData.hearing || "Normal"}</span>
                </div>
              </div>
            </div>

            {/* Dental & Medical Checkup */}
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-colors duration-300 text-left flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-750 text-indigo-500 dark:text-indigo-405 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">Dental & Checkup</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Dental Status
                    </span>
                    <span className="text-xs font-black text-slate-805 dark:text-white">{lastDentalStr}</span>
                  </div>
                  {healthData.lastCheckupDate && (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.02] rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Checkup Date
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formattedCheckupDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Physical Fitness Assessment (Dynamic fields based on student sports profile stats) */}
          {sportsData?.stats && sportsData.stats.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-all duration-300 text-left shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <Award className="w-5 h-5 text-amber-500" /> Physical Fitness Assessment
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sportsData.stats.map((stat: any, index: number) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-855 p-4 rounded-2xl flex flex-col justify-between items-center text-center hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}30` }}>
                      {stat.icon === "Zap" && <Zap className="w-4 h-4" />}
                      {stat.icon === "Activity" && <Activity className="w-4 h-4" />}
                      {stat.icon === "Heart" && <Heart className="w-4 h-4" />}
                      {stat.icon !== "Zap" && stat.icon !== "Activity" && stat.icon !== "Heart" && <Award className="w-4 h-4" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">{stat.label}</div>
                    <div className="text-base font-black text-slate-800 dark:text-white">{stat.value}</div>
                    <div className="mt-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                      Score: {stat.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sports Teams & Participation */}
          {sportsData?.teams && sportsData.teams.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-all duration-300 text-left shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" /> Sports Teams & Clubs Roster
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sportsData.teams.map((team: any, index: number) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-855 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${team.color}15`, color: team.color, border: `1px solid ${team.color}30` }}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-850 dark:text-white truncate">{team.name}</div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{team.role} · {team.date}</div>
                      <div className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-550 mt-1 tracking-wider">{team.match}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Fitness Activity and Incident Reports */}
        <div className="space-y-6 text-left">
          
          {/* Known Allergies & Notes */}
          <div className="bg-amber-500/[0.02] p-6 rounded-3xl border border-amber-500/20 shadow-sm">
            <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2 text-sm">
              <i className="fi fi-rr-info text-amber-500 dark:text-amber-400 text-lg"></i> Known Allergies & Notes
            </h3>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Physical Activity Logs */}
          {sportsData?.logs && sportsData.logs.length > 0 && (
            <div className="bg-white/70 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <History className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Physical Activity Logs
              </h3>
              <div className="space-y-3.5">
                {sportsData.logs.map((log: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{log.activity}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">{new Date(log.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span>⏱ {log.duration}</span>
                        <span>•</span>
                        <span>🔥 {log.calories} kcal</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          log.intensity === "High" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                          log.intensity === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {log.intensity} Intensity
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Incidents & Injuries */}
          {sportsData?.injuries && sportsData.injuries.length > 0 && (
            <div className="bg-rose-500/[0.02] p-6 rounded-3xl border border-rose-500/20 text-left shadow-sm">
              <h3 className="font-bold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2 text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" /> Medical Incidents & Injuries
              </h3>
              <div className="space-y-4">
                {sportsData.injuries.map((injury: any, index: number) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-black text-rose-650 dark:text-rose-400">{injury.type}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        injury.status === "Recovered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {injury.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">{injury.description}</p>
                    <div className="mt-2.5 pt-2 border-t border-slate-150 dark:border-slate-850 flex justify-between text-[9px] text-slate-500 dark:text-slate-500 font-bold">
                      <span>Severity: <strong className="text-slate-700 dark:text-slate-400">{injury.severity}</strong></span>
                      <span>Date: {new Date(injury.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle={`${activeChild?.name || 'Child'} · ${activeChild?.rollNumber || 'N/A'}`}
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />
      
      <ParentPortalBanner pageKey="health" />
      
      {getHealthContent()}
    </PortalLayout>
  );
}
