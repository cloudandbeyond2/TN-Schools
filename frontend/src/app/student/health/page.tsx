"use client";

import React, { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  HeartPulse, 
  Activity, 
  Scale, 
  Ruler, 
  Eye, 
  Stethoscope, 
  Syringe, 
  Droplet,
  User,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function StudentHealthReportPage() {
  const { data: session } = useSession();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const studentName = session?.user?.name || "Student";
  // The session email is stored as rollNumber@tn.gov.in for students
  const rollNumber = session?.user?.email?.split('@')[0] || "";

  useEffect(() => {
    async function fetchHealthData() {
      if (!rollNumber) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/headmaster/health/${rollNumber}`);
        const data = await res.json();
        if (data.success && data.data) {
          setHealthData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch health data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (rollNumber) {
      fetchHealthData();
    } else if (session === null) {
      setLoading(false);
    }
  }, [rollNumber, session]);

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "amber" };
    if (bmi < 25) return { label: "Healthy", color: "emerald" };
    return { label: "Overweight", color: "rose" };
  };

  if (loading) {
    return (
      <PortalLayout title="My Health Report 🏥" subtitle="View your latest school medical checkup details.">
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500 font-bold">Loading health report...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!healthData) {
    return (
      <PortalLayout title="My Health Report 🏥" subtitle="View your latest school medical checkup details.">
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500 font-bold text-lg">No health report available yet.</p>
        </div>
      </PortalLayout>
    );
  }

  const bmiValue = healthData.bmi || 0;
  const bmiStatus = getBmiStatus(bmiValue);
  
  // Parse vision and notes from DB
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
  let vaccines = ["Up to date (General)"];

  if (healthData.notes) {
    allergies = [healthData.notes];
  }

  const lastDentalStr = healthData.dental || "N/A";
  let formattedDentalDate = "N/A";
  if (healthData.lastCheckupDate) {
    formattedDentalDate = new Date(healthData.lastCheckupDate).toLocaleDateString();
  }

  return (
    <PortalLayout title="My Health Report 🏥" subtitle="View your latest school medical checkup details.">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Left Column: Core Vitals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 dark:bg-sky-900/20 rounded-bl-full pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center text-sky-500 shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{studentName}</h2>
              <p className="text-sm font-bold text-slate-500">Roll No: {rollNumber}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md">Cleared for Sports</span>
                {(leftEye !== "N/A" || rightEye !== "N/A") && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-amber-100 text-amber-600 rounded-md">Vision Checked</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-sky-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-sky-500 transition-all">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.height || "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Height (cm)</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-sky-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-sky-500 transition-all">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.weight || "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weight (kg)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-sky-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-rose-500 transition-all">
                <Droplet className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{healthData.bloodGroup || "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Blood Group</p>
            </div>

            <div className={`bg-${bmiStatus.color}-50 dark:bg-${bmiStatus.color}-900/20 p-5 rounded-3xl border-2 border-${bmiStatus.color}-200 dark:border-${bmiStatus.color}-800 text-center`}>
              <div className={`w-10 h-10 mx-auto bg-${bmiStatus.color}-100 dark:bg-${bmiStatus.color}-800/50 rounded-xl flex items-center justify-center text-${bmiStatus.color}-600 dark:text-${bmiStatus.color}-400 mb-3`}>
                <Activity className="w-5 h-5" />
              </div>
              <h3 className={`text-2xl font-black text-${bmiStatus.color}-700 dark:text-${bmiStatus.color}-400`}>{bmiValue || "—"}</h3>
              <p className={`text-[10px] font-black text-${bmiStatus.color}-600 dark:text-${bmiStatus.color}-500 uppercase tracking-widest mt-1`}>BMI: {bmiValue ? bmiStatus.label : "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vision Check */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 text-sky-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-700 dark:text-slate-200">Vision Check</h3>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Left Eye (L)</span>
                  <span className="text-xl font-black text-slate-700 dark:text-white">{leftEye}</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Right Eye (R)</span>
                  <span className="text-xl font-black text-slate-700 dark:text-white">{rightEye}</span>
                </div>
              </div>
            </div>

            {/* Dental & Medical */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-700 dark:text-slate-200">Dental & Checkup</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Dental Details</span>
                  <span className="text-sm font-black text-slate-700 dark:text-white">{lastDentalStr}</span>
                </div>
                {healthData.lastCheckupDate && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Checkup Date</span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{formattedDentalDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Vaccines & Allergies */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-sky-500" /> Vaccinations
            </h3>
            <ul className="space-y-3">
              {vaccines.map((v, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50">
            <h3 className="font-black text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Known Allergies & Notes
            </h3>
            <div className="flex flex-wrap gap-2">
              {allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-black rounded-lg">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </PortalLayout>
  );
}
