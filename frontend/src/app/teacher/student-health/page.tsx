"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
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
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus
} from "lucide-react";

export default function TeacherStudentHealthPage() {
  const [selectedStudent, setSelectedStudent] = useState("Arjun M.");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUpdateModal(false);
    showToast("Health record updated successfully! 🏥");
  };

  // Mock data for currently selected student
  const healthData = {
    height: 158, // cm
    weight: 48, // kg
    bloodGroup: "O+",
    bmi: 19.2,
    eyePower: { left: "-0.50", right: "-0.75" },
    lastDental: "12 Oct 2025",
    allergies: ["Dust", "Peanuts"],
    vaccines: ["Typhoid Booster (2025)", "Tetanus (2024)"]
  };

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "amber" };
    if (bmi < 25) return { label: "Healthy", color: "emerald" };
    return { label: "Overweight", color: "rose" };
  };

  const bmiStatus = getBmiStatus(healthData.bmi);

  return (
    <PortalLayout title="Student Health Report 🏥" subtitle="Track and manage student physical well-being.">
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search student name or ID..." 
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all"
            defaultValue="Arjun M."
          />
        </div>
        <button 
          onClick={() => setShowUpdateModal(true)}
          className="w-full md:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Update Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Vitals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/20 rounded-bl-full pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{selectedStudent}</h2>
              <p className="text-sm font-bold text-slate-500">Class 9B • Roll No: 14</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md">Cleared for Sports</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-amber-100 text-amber-600 rounded-md">Needs Glasses</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-rose-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-rose-500 transition-all">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.height}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Height (cm)</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-rose-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-rose-500 transition-all">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{healthData.weight}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weight (kg)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 text-center relative overflow-hidden group hover:border-rose-300 transition-colors">
              <div className="w-10 h-10 mx-auto bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 group-hover:text-rose-500 transition-all">
                <Droplet className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{healthData.bloodGroup}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Blood Group</p>
            </div>

            <div className={`bg-${bmiStatus.color}-50 dark:bg-${bmiStatus.color}-900/20 p-5 rounded-3xl border-2 border-${bmiStatus.color}-200 dark:border-${bmiStatus.color}-800 text-center`}>
              <div className={`w-10 h-10 mx-auto bg-${bmiStatus.color}-100 dark:bg-${bmiStatus.color}-800/50 rounded-xl flex items-center justify-center text-${bmiStatus.color}-600 dark:text-${bmiStatus.color}-400 mb-3`}>
                <Activity className="w-5 h-5" />
              </div>
              <h3 className={`text-2xl font-black text-${bmiStatus.color}-700 dark:text-${bmiStatus.color}-400`}>{healthData.bmi}</h3>
              <p className={`text-[10px] font-black text-${bmiStatus.color}-600 dark:text-${bmiStatus.color}-500 uppercase tracking-widest mt-1`}>BMI: {bmiStatus.label}</p>
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
                  <span className="text-xl font-black text-slate-700 dark:text-white">{healthData.eyePower.left}</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Right Eye (R)</span>
                  <span className="text-xl font-black text-slate-700 dark:text-white">{healthData.eyePower.right}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4" /> Wears corrective lenses
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
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Last Dental</span>
                  <span className="text-sm font-black text-slate-700 dark:text-white">{healthData.lastDental}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> General Health</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">Excellent</span>
                </div>
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
              {healthData.vaccines.map((v, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50">
            <h3 className="font-black text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Known Allergies
            </h3>
            <div className="flex flex-wrap gap-2">
              {healthData.allergies.map((a, i) => (
                <span key={i} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-black rounded-lg">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Update Health Record</h3>
              <p className="text-sm font-bold text-slate-500">Updating for {selectedStudent}</p>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Height (cm)</label>
                  <input type="number" defaultValue={healthData.height} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input type="number" defaultValue={healthData.weight} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-rose-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Eye Power (L)</label>
                  <input type="text" defaultValue={healthData.eyePower.left} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Eye Power (R)</label>
                  <input type="text" defaultValue={healthData.eyePower.right} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-rose-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="flex-1 py-3 rounded-xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black shadow-md shadow-rose-500/20 transition-colors">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl z-[60] animate-in slide-in-from-bottom-4">
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}
    </PortalLayout>
  );
}
