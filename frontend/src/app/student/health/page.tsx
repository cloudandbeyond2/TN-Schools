"use client";

import React, { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

export default function StudentHealthReportPage() {
  const { data: session } = useSession();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const studentName = session?.user?.name || "Student";
  const rollNumber =
    (session?.user as any)?.rollNumber ||
    (session?.user as any)?.emisId ||
    (session?.user as any)?.id ||
    session?.user?.email?.split("@")[0] ||
    "";

  useEffect(() => {
    async function fetchHealthData() {
      if (!rollNumber) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
    }

    fetchHealthData();
  }, [rollNumber, session]);

  const getBmiStatus = (bmi: number) => {
    if (!bmi) return { label: "N/A", color: "slate" };
    if (bmi < 18.5) return { label: "Underweight", color: "amber" };
    if (bmi < 25) return { label: "Healthy", color: "emerald" };
    return { label: "Overweight", color: "rose" };
  };

  if (loading) {
    return (
      <PortalLayout title="My Health Report" subtitle="View your latest school medical checkup details.">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PortalLayout>
    );
  }

  // If no health record exists in DB for this student
  if (!healthData) {
    return (
      <PortalLayout title="My Health Report" subtitle="View your latest school medical checkup details.">
        <div className="mt-4">
          <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md text-left">
            <div className="relative z-10">
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <i className="fi fi-rr-heart text-rose-600 dark:text-rose-400 flex items-center" />
                My Health Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <i className="fi fi-rr-stethoscope text-rose-500 dark:text-rose-400 flex items-center mr-1" />
                View your latest school medical checkup details, height, weight, and vaccination history.
              </p>
            </div>
            <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 font-extrabold text-sm rounded-xl border border-rose-200/20 shadow-sm">
              <i className="fi fi-rr-shield-check flex items-center text-sm" />
              Student Wellness Registry
            </span>
          </div>

          <div className="flex flex-col justify-center items-center min-h-[300px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
              <i className="fi fi-rr-heart-cross text-3xl flex items-center" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">No Health Record Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              No official medical checkup record has been entered for your profile yet. Vitals and medical reports will appear here once submitted by your Headmaster or Physical Education Teacher.
            </p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Actual database values
  const bmiValue = healthData.bmi || 0;
  const bmiStatus = getBmiStatus(bmiValue);

  const visionStr = healthData.vision || "";
  let leftEye = "—";
  let rightEye = "—";
  if (visionStr.includes(",")) {
    const parts = visionStr.split(",");
    leftEye = parts[0].trim();
    rightEye = parts[1]?.trim() || "—";
  } else if (visionStr) {
    leftEye = visionStr;
    rightEye = visionStr;
  }

  const allergies = healthData.notes ? [healthData.notes] : [];
  const lastDentalStr = healthData.dental || "—";
  const formattedDentalDate = healthData.lastCheckupDate
    ? new Date(healthData.lastCheckupDate).toLocaleDateString()
    : "—";

  return (
    <PortalLayout title="My Health Report" subtitle="View your latest school medical checkup details.">
      {/* Main header banner card */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 mt-4 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md text-left">
        <div className="relative z-10">
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <i className="fi fi-rr-heart text-rose-600 dark:text-rose-400 flex items-center" />
            My Health Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <i className="fi fi-rr-stethoscope text-rose-500 dark:text-rose-400 flex items-center mr-1" />
            View your latest school medical checkup details, height, weight, and vaccination history.
          </p>
        </div>
        <span className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 font-extrabold text-sm rounded-xl border border-rose-200/20 shadow-sm">
          <i className="fi fi-rr-shield-check flex items-center text-sm" />
          Student Wellness Registry
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Left Column: Core Vitals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex items-center gap-6 relative overflow-hidden text-left">
            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/50 text-sky-500 rounded-2xl flex items-center justify-center shrink-0">
              <i className="fi fi-rr-user text-3xl flex items-center" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{studentName}</h2>
              <p className="text-sm font-bold text-slate-500">Roll / Identifier: {rollNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="w-10 h-10 mx-auto bg-sky-50 dark:bg-sky-950/40 rounded-xl flex items-center justify-center text-sky-500 mb-3">
                <i className="fi fi-rr-ruler-vertical text-lg flex items-center" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.height ? `${healthData.height}` : "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Height (cm)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="w-10 h-10 mx-auto bg-sky-50 dark:bg-sky-950/40 rounded-xl flex items-center justify-center text-sky-500 mb-3">
                <i className="fi fi-rr-scale text-lg flex items-center" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.weight ? `${healthData.weight}` : "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weight (kg)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="w-10 h-10 mx-auto bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center text-rose-500 mb-3">
                <i className="fi fi-rr-heart text-lg text-rose-500 flex items-center" />
              </div>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{healthData.bloodGroup || "—"}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Blood Group</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 text-center">
              <div className="w-10 h-10 mx-auto bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-500 mb-3">
                <i className="fi fi-rr-chart-line-up text-lg flex items-center" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{bmiValue || "—"}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                BMI: {bmiStatus.label}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vision Check */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 text-sky-500 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-eye text-lg flex items-center" />
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

            {/* Dental & Checkup */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 rounded-xl flex items-center justify-center">
                  <i className="fi fi-rr-stethoscope text-lg flex items-center" />
                </div>
                <h3 className="font-black text-slate-700 dark:text-slate-200">Dental & Checkup</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <i className="fi fi-rr-calendar text-sm flex items-center" /> Dental Details
                  </span>
                  <span className="text-xs font-black text-slate-700 dark:text-white">{lastDentalStr}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <i className="fi fi-rr-checkbox text-xs flex items-center" /> Checkup Date
                  </span>
                  <span className="text-xs font-black text-slate-700 dark:text-white">{formattedDentalDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medical Notes & Allergies */}
        <div className="space-y-6 text-left">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50">
            <h3 className="font-black text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
              <i className="fi fi-rr-info text-lg flex items-center" /> Medical Notes & Allergies
            </h3>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black rounded-lg">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No notes or allergies recorded.</p>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
