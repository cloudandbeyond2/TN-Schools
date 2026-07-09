"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const discoveredScholarships = [
  { id: 101, name: "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)", amount: "₹1,000 / month", deadline: "Aug 31, 2026", tags: ["State", "Girls Education"] },
  { id: 102, name: "Central Sector Scheme of Scholarships for College & University Students", amount: "₹12,000 / year", deadline: "Aug 31, 2026", tags: ["National", "Merit Based"] },
  { id: 103, name: "Chief Minister's Merit Award", amount: "₹3,000 / year", deadline: "Sep 15, 2026", tags: ["State", "Toppers"] },
  { id: 104, name: "AICTE Pragati Scholarship for Girls", amount: "₹50,000 / year", deadline: "Oct 30, 2026", tags: ["Technical Edu", "Girls"] },
];

interface LiveApplication {
  id: string;
  scheme: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  appliedDate: string;
  remarks: string | null;
}

export default function HigherSecondaryScholarshipsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("tracking");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [applications, setApplications] = useState<LiveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch/Resolve Student ID
  useEffect(() => {
    async function resolveStudentId() {
      try {
        const sessionStudentId = (session?.user as any)?.studentId;
        if (sessionStudentId) {
          setStudentId(sessionStudentId);
          fetchApplications(sessionStudentId);
        } else {
          // Fallback to fetch the first available student in system
          const res = await fetch(`${API_BASE}/api/students`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            const firstStudent = json.data[0].id;
            setStudentId(firstStudent);
            fetchApplications(firstStudent);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to resolve student:", err);
        setLoading(false);
      }
    }
    resolveStudentId();
  }, [session]);

  // 2. Fetch Active Applications from DB
  const fetchApplications = async (sId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/students/${sId}/scholarships`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error("Error loading scholarships:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit a new application
  const handleApply = async (schemeName: string, amountStr: string) => {
    if (!studentId) {
      Swal.fire("Error", "Student record not resolved yet.", "error");
      return;
    }

    // Check if student already applied for this scheme to avoid duplicates
    const alreadyApplied = applications.some(app => app.scheme === schemeName);
    if (alreadyApplied) {
      Swal.fire("Note", "You have already applied for this scholarship scheme.", "info");
      return;
    }

    // Parse amount from string like "₹12,000 / year" or "₹1,000 / month"
    const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, "")) || 0;

    try {
      const response = await fetch(`${API_BASE}/api/students/${studentId}/scholarships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme: schemeName, amount: parsedAmount })
      });
      const json = await response.json();
      if (json.success) {
        Swal.fire("Applied Successfully!", `Your application for "${schemeName}" has been submitted to the verification cell.`, "success");
        fetchApplications(studentId); // Reload active applications
        setActiveTab("tracking"); // Switch back to tracker tab
      } else {
        Swal.fire("Error", json.error || "Failed to submit application.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not reach scholarship server.", "error");
    }
  };

  // Helper to map DB Status to Stepper details
  const getStatusMapping = (status: string) => {
    switch (status) {
      case "DISBURSED":
        return { label: "Disbursed", step: 4, color: "text-emerald-400" };
      case "APPROVED":
        return { label: "Approved / Sanctioned", step: 3, color: "text-indigo-400" };
      case "REJECTED":
        return { label: "Rejected / Deficient", step: 2, color: "text-red-400" };
      case "PENDING":
      default:
        return { label: "Pending Verification", step: 2, color: "text-amber-400" };
    }
  };

  return (
    <PortalLayout
      title="Scholarship Application & Tracking Center"
      subtitle="Discover scholarships, manage your documents, and track your applications."
      avatarLetter="S"
      avatarColor="#8b5cf6"
      themeClass="theme-student"
      accentColor="#8b5cf6"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/student/higher-secondary" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
          <span>←</span> Back to Dashboard
        </Link>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-fit">
          <button 
            onClick={() => setActiveTab("tracking")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "tracking" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-white"}`}
          >
            Active Applications
          </button>
          <button 
            onClick={() => setActiveTab("discovery")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "discovery" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-slate-400 hover:text-white"}`}
          >
            Discover & Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Digital Locker / Docs */}
        <div className="lg:col-span-1 space-y-6">
           
          <div className="glass rounded-3xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">📁</span> e-Sanad Locker
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Your verified documents linked from the e-Sevai/e-Sanad portal. Used for 1-click scholarship applications.
            </p>
            
            <div className="space-y-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm font-bold text-slate-300">Community Cert.</span>
                </div>
                <span className="text-[10px] text-slate-500">Verified</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm font-bold text-slate-300">Income Cert.</span>
                </div>
                <span className="text-[10px] text-slate-500">Verified</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm font-bold text-slate-300">Aadhaar Linked</span>
                </div>
                <span className="text-[10px] text-slate-500">Verified</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm font-bold text-slate-300">Bank Passbook</span>
                </div>
                <span className="text-[10px] text-slate-500">Verified</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-transparent">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>🤖</span> AI Form Autofill
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Since your EMIS profile and e-Sanad Locker are connected, our AI can autofill 90% of scholarship forms automatically.
            </p>
          </div>

        </div>

        {/* Right Column: Tracking / Discovery */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-6 border border-slate-700/50 min-h-full">
            
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeTab === "tracking" ? (
              <>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">📡</span> Application Tracker
                </h2>
                
                <div className="space-y-6">
                  {applications.map((app) => {
                    const mapping = getStatusMapping(app.status);
                    return (
                      <div key={app.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <h3 className="font-bold text-white text-base max-w-sm leading-tight">{app.scheme}</h3>
                          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded border bg-slate-900 ${mapping.color} border-slate-800`}>
                            {mapping.label}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-amber-500 mb-2">
                          Amount: ₹{app.amount.toLocaleString()}
                        </div>
                        
                        {/* Progress Stepper */}
                        {app.status !== "REJECTED" ? (
                          <div className="relative mt-8 mb-4">
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-slate-800 rounded-full"></div>
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                              style={{ width: `${((mapping.step - 1) / 3) * 100}%` }}
                            ></div>
                            
                            <div className="relative flex justify-between z-10">
                              {["Submitted", "Verification", "Sanction", "Disbursed"].map((stepName, i) => {
                                const isCompleted = i < mapping.step;
                                const isCurrent = i === mapping.step - 1;
                                return (
                                  <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                      ${isCompleted ? 'bg-purple-500 border-purple-500 text-white text-[10px]' : 
                                        isCurrent ? 'bg-slate-900 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                                        'bg-slate-900 border-slate-700'}`}
                                    >
                                      {isCompleted && "✓"}
                                    </div>
                                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}>{stepName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mt-2">
                            <strong>Remarks:</strong> {app.remarks || "Documents verification failed. Please check with your class teacher."}
                          </div>
                        )}
                        
                        <p className="text-[10px] text-slate-500 text-right mt-4">Applied on: {new Date(app.appliedDate).toLocaleDateString()}</p>
                      </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No active scholarship applications found. Switch to "Discover & Apply" to register!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="text-2xl">🔍</span> Eligible Scholarships
                </h2>
                <p className="text-sm text-slate-400 mb-6">Based on your academic stream and demographic data, you are eligible to apply for the following:</p>
                
                <div className="space-y-4">
                  {discoveredScholarships.map((scholarship) => {
                    const alreadyApplied = applications.some(app => app.scheme === scholarship.name);
                    return (
                      <div key={scholarship.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-white text-base mb-2">{scholarship.name}</h3>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm font-black text-amber-400">{scholarship.amount}</span>
                            <span className="text-xs text-red-400 font-bold flex items-center gap-1"><span>⏰</span> Ends {scholarship.deadline}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scholarship.tags.map((tag, tidx) => (
                              <span key={tidx} className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleApply(scholarship.name, scholarship.amount)}
                          disabled={alreadyApplied}
                          className={`shrink-0 px-6 py-3 text-white rounded-xl text-sm font-bold shadow-lg transition-colors w-full md:w-auto ${alreadyApplied ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'}`}
                        >
                          {alreadyApplied ? "Applied" : "1-Click Apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
