"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface HonorRecord {
  id: string;
  title: string;
  recipient: string;
  category: "School Award" | "Student Medal" | "Teacher Recognition";
  date: string;
  citation: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function RewardsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [honors, setHonors] = useState<HonorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Honor register Form State
  const [honorTitle, setHonorTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [honorCat, setHonorCat] = useState<"School Award" | "Student Medal" | "Teacher Recognition">("Student Medal");
  const [citationText, setCitationText] = useState("");
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  const fetchHonors = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/rewards?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setHonors(json.data);
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchHonors();
  }, [fetchHonors]);

  const handlePostHonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!honorTitle || !recipientName || !schoolId) return;

    try {
      const res = await fetch(`${API_BASE}/api/headmaster/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          title: honorTitle,
          recipient: recipientName,
          category: honorCat,
          date: "2026",
          citation: citationText || "Honored for outstanding contributions to the institution's community goals."
        })
      });
      const json = await res.json();
      if (json.success) {
        setRewardToast(`✓ New Honor cataloged! '${honorTitle}' added under ${honorCat} roster.`);
        // Reset Form
        setHonorTitle("");
        setRecipientName("");
        setCitationText("");
        fetchHonors(); // Reload dynamic list
        setTimeout(() => setRewardToast(null), 4000);
      } else {
        alert("Failed to record citation: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error posting rewards:", err);
      alert("Server error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this honor record?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/rewards/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setRewardToast("✓ Honor record deleted successfully.");
        fetchHonors();
        setTimeout(() => setRewardToast(null), 4000);
      } else {
        alert("Failed to delete record: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting reward:", err);
      alert("Server error occurred.");
    }
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "விருதுகள், மரியாதைகள் & சான்றிதழ்கள் பலகை" : "Rewards, Honors & Citations Board"}
      subtitle={`${session?.user?.name || "Headmaster"} · School ID: ${schoolId || "33012345"}`}
      avatarLetter={session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "H"}
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl shrink-0 border border-amber-100 dark:border-amber-900/50">
              <i className="fi fi-rr-trophy text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {lang === "தமிழ்" ? "விருதுகள், மரியாதைகள் & சான்றிதழ்கள் மையம்" : "Rewards, Honors & Citations Hub"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                {lang === "தமிழ்"
                  ? "மாணவர்கள், ஆசிரியர்கள் மற்றும் பள்ளி செயல்பாடுகளில் பெற்ற மாநில/மாவட்ட அளவிலான விருதுகளைப் பதிவு செய்து நிர்வகிக்கவும்."
                  : "Register, track, and catalog state recognitions, student athletic medals, and teaching citations won by the school."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{lang === "தமிழ்" ? "விருதுகள்" : "Total Honors"}</span>
              <span className="text-base font-bold text-amber-500 dark:text-amber-400 mt-0.5">{honors.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{lang === "தமிழ்" ? "தரம்" : "DISE Rank"}</span>
              <span className="text-base font-bold text-slate-800 dark:text-white mt-0.5">Grade A+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Honors counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "State Level Recognitions",
            value: `${honors.filter((hn) => hn.category === "School Award").length} ${honors.filter((hn) => hn.category === "School Award").length === 1 ? "Award" : "Awards"}`,
            sub: "Highest ranking in school block.",
            icon: <i className="fi fi-rr-crown text-lg" />,
            color: "text-amber-400",
            bg: "bg-amber-500/10"
          },
          {
            label: "Student Medals",
            value: `${honors.filter((hn) => hn.category === "Student Medal").length} ${honors.filter((hn) => hn.category === "Student Medal").length === 1 ? "Medal" : "Medals"}`,
            sub: "District and state level achievements.",
            icon: <i className="fi fi-rr-trophy text-lg" />,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
          },
          {
            label: "Teacher Citations",
            value: `${honors.filter((hn) => hn.category === "Teacher Recognition").length} ${honors.filter((hn) => hn.category === "Teacher Recognition").length === 1 ? "Educator" : "Educators"}`,
            sub: "ICT, virtual worksheets & pedagogy.",
            icon: <i className="fi fi-rr-badge-check text-lg" />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
          },
          {
            label: "DISE School Rank",
            value: "Grade A+",
            sub: "Composite score (Top 5% statewide).",
            icon: <i className="fi fi-rr-chart-user text-lg" />,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10"
          }
        ].map((kpi, idx) => (
          <div key={idx} className="glass p-4 rounded-2xl border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider truncate">{kpi.label}</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xl font-black text-white">{kpi.value}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {kpi.sub}
              </div>
            </div>
            <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shrink-0 ml-3 flex items-center justify-center`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Honors Listing Board */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
            <i className="fi fi-rr-trophy text-blue-400" /> {lang === "தமிழ்" ? "பள்ளி மரியாதைகள் பதிவுப்புத்தகம்" : "School Honors Ledger"}
          </h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">{lang === "தமிழ்" ? "மாணவர்கள், ஆசிரியர்கள் மற்றும் பள்ளி செயல்பாடுகள் மூலம் வென்ற விருதுகளின் அதிகாரப்பூர்வ பதிவு." : "Official registry of awards won by students, faculty, and school operations."}</p>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-bold flex items-center justify-center gap-2">
              <i className="fi fi-rr-spinner animate-spin text-lg" /> Loading honors ledger...
            </div>
          ) : (
            <div className="space-y-4">
              {honors.map((hn) => (
                <div
                  key={hn.id}
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1">
                        <i className="fi fi-rr-medal text-[10px] text-amber-400" /> {hn.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">Year: {hn.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{hn.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{hn.citation}</p>
                    <div className="text-[11px] text-slate-500">
                      Recipient: <strong className="text-slate-350">{hn.recipient}</strong>
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0">
                    <button
                      onClick={() => handleDelete(hn.id)}
                      title="Delete citation"
                      className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/50 flex items-center justify-center text-slate-400 hover:text-red-450 transition-all cursor-pointer shadow-inner"
                    >
                      <i className="fi fi-rr-trash text-xs" />
                    </button>
                  </div>
                </div>
              ))}
              {honors.length === 0 && (
                <div className="py-6 text-center text-slate-500 italic">
                  No honors recorded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Honor Entry form */}
        <div className="glass rounded-2xl p-6 border border-slate-800 h-fit">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
            <i className="fi fi-rr-medal text-blue-400" /> {lang === "தமிழ்" ? "புதிய மரியாதையை பதிவு செய்" : "Record New Citation"}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
            {lang === "தமிழ்" ? "மாணவர்கள் அல்லது ஆசிரியர்களால் வென்ற சான்றிதழ்கள், அறிவியல் கண்காட்சி அங்கீகாரங்கள் அல்லது விளையாட்டு பதக்கங்களை பதிவு செய்யவும்." : "Register certificates, science fair recognitions, or sports medals won by pupils or teaching staff."}
          </p>

          <form onSubmit={handlePostHonor} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Award / Certificate Title</label>
              <input
                type="text"
                placeholder="E.g., District Chess Runner-up"
                value={honorTitle}
                onChange={(e) => setHonorTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Recipient Name</label>
              <input
                type="text"
                placeholder="E.g., Priya S. (Class 10B)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Award Category</label>
              <select
                value={honorCat}
                onChange={(e) => setHonorCat(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="School Award">School Award</option>
                <option value="Student Medal">Student Medal</option>
                <option value="Teacher Recognition">Teacher Recognition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Citation Details</label>
              <textarea
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                placeholder="Details of the award achievement, jury decision..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Post Citation Record
            </button>
          </form>

          {rewardToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl leading-relaxed">
              {rewardToast}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
