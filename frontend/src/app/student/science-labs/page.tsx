"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  FlaskConical,
  Atom,
  Dna,
  Rocket,
  Globe,
  Compass,
  Award,
  BookOpen,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpenCheck
} from "lucide-react";

// Get API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Lab {
  id: string;
  name: string;
  icon: string;
  description: string;
  experiments: any[];
}

export default function ScienceLabsDashboard() {
  const { data: session } = useSession();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [activeTab, setActiveTab] = useState<"labs" | "spaces" | "library">("labs");
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  useEffect(() => {
    fetch(`${API_URL}/api/science/labs`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setLabs(json.data);
          if (json.data.length > 0) {
            setSelectedLab(json.data[0]);
          }
        }
      })
      .catch((err) => console.error("Error loading labs:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    setAiResponse("");
    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain this science question to a school student in ${language === "en" ? "English" : "Tamil"}: ${aiQuestion}`
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiResponse(data.reply || data.data || "No response received.");
      } else {
        setAiResponse("AI assistant is offline. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Could not connect to AI services.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLabIcon = (iconName: string) => {
    switch (iconName) {
      case "Atom":
        return <Atom className="w-8 h-8 text-indigo-500" />;
      case "Flask":
        return <FlaskConical className="w-8 h-8 text-emerald-500" />;
      case "DNA":
      default:
        return <Dna className="w-8 h-8 text-rose-500" />;
    }
  };

  return (
    <PortalLayout
      title={language === "en" ? "Science Labs & Centers 🧪" : "அறிவியல் ஆய்வகங்கள் & மையங்கள் 🧪"}
      subtitle={language === "en" ? "Interactive 3D simulations & STEM virtual discovery campus" : "ஊடாடும் 3டி உருவகப்படுத்துதல்கள் & ஸ்டெம் மெய்நிகர் கண்டுபிடிப்பு வளாகம்"}
      accentColor="#10b981"
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("labs")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "labs" ? "bg-emerald-650 text-white shadow-md shadow-emerald-500/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🧪 Virtual Labs
          </button>
          <button
            onClick={() => setActiveTab("spaces")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "spaces" ? "bg-emerald-650 text-white shadow-md shadow-emerald-500/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            🚀 Exploration Centers
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "library" ? "bg-emerald-650 text-white shadow-md shadow-emerald-500/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            📚 Science Library
          </button>
        </div>

        {/* Language & Class badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className="px-4 py-2 border-2 border-emerald-500/20 hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl text-xs font-bold transition-all"
          >
            🌐 {language === "en" ? "Tamil Medium" : "English Medium"}
          </button>
          <span className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/50 text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
            Grades 6 - 12
          </span>
        </div>
      </div>

      {activeTab === "labs" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Labs Showcase */}
          <div className="xl:col-span-2 space-y-6 text-left">
            {loading ? (
              <div className="theme-card p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <span>Loading science labs repository...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labs.map((lab) => (
                  <div
                    key={lab.id}
                    onClick={() => setSelectedLab(lab)}
                    className={`bg-white dark:bg-[var(--bg-card)] border-2 rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer ${
                      selectedLab?.id === lab.id ? "border-emerald-500 shadow-md shadow-emerald-500/5" : "border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {getLabIcon(lab.icon)}
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {lab.experiments.length} Experiments
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">{lab.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{lab.description}</p>
                    <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                      Explore Labs <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Lab Experiments Detail */}
            {selectedLab && (
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-6 flex items-center gap-2">
                  🧪 {selectedLab.name} Modules
                </h3>
                <div className="space-y-3">
                  {selectedLab.experiments?.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/10">
                            {exp.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{exp.grade}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{exp.title}</h4>
                      </div>
                      <Link
                        href={`/student/science-labs/virtual-labs/${exp.id.includes("ohms") ? "physics" : "chemistry"}`}
                        className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        Launch Lab <Play className="w-3.5 h-3.5 fill-current" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Science Assistant Widget Sidebar */}
          <div className="space-y-6 text-left">
            <div className="glass rounded-3xl p-6 border border-emerald-500/20 bg-gradient-to-b from-emerald-900/5 to-teal-900/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-xl animate-bounce">🤖</div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">AI Learning Buddy</h3>
                  <p className="text-[10px] text-emerald-650 dark:text-emerald-400 font-semibold">Ready to help you with science</p>
                </div>
              </div>

              <form onSubmit={handleAskAi} className="space-y-3">
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder={language === "en" ? "Ask me anything about physics, chemistry or space..." : "இயற்பியல், வேதியியல் அல்லது விண்வெளி பற்றி கேளுங்கள்..."}
                  rows={3}
                  className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-650 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-250 animate-pulse" /> Ask AI Assistant
                </button>
              </form>

              {aiResponse && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-sans max-h-[160px] overflow-y-auto">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Infographic card */}
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-20 w-32 h-32 bg-indigo-500 rounded-full blur-2xl" />
              <div>
                <span className="text-xl">🏆</span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-3">TN Infographic Hub</h4>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed mt-1">
                  Explore visual science diagrams and 3D maps generated specifically for secondary government schools.
                </p>
              </div>
              <button
                onClick={() => Swal.fire({ title: "Visual Hub", text: "Interactive Infographics are currently synced successfully in student portfolio.", icon: "info" })}
                className="w-fit text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View Infographics →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "spaces" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col justify-between h-56">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Space Science Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Walk through ISRO launches, study satellite trajectories, and navigate the solar orbits inside our planetarium mock module.
              </p>
            </div>
            <button
              onClick={() => Swal.fire({ title: "Space Science Center", text: "Opening orbits and satellite paths... Ready for launch!", icon: "success", confirmButtonColor: "#10b981" })}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-750 text-white rounded-xl text-xs font-bold w-fit flex items-center gap-1"
            >
              Launch Space Center <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col justify-between h-56">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Earth Science Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interact with the dynamic 3D globe. Inspect continental drifts, volcanic ring of fire alignments, and the water cycle.
              </p>
            </div>
            <button
              onClick={() => Swal.fire({ title: "Earth Science", text: "Globe rendered. Ready to view seismic patterns.", icon: "success", confirmButtonColor: "#10b981" })}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-750 text-white rounded-xl text-xs font-bold w-fit flex items-center gap-1"
            >
              Launch Earth Globe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {activeTab === "library" && (
        <div className="glass rounded-3xl p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-left max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center mb-6">
            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">Digital Science Book Library</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Searchable repository containing school science books from grade 6 to 12. View bilingual glossaries, summaries, and formula sheets for every indexed chapter.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => Swal.fire({ title: "Science Library", text: "Opening Tamil Medium Grade 6-10 collection...", icon: "info" })}
              className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/40 transition-colors"
            >
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Tamil Medium Books</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-1 block">Class 6 - 12</span>
            </button>
            <button
              onClick={() => Swal.fire({ title: "Science Library", text: "Opening English Medium Grade 6-10 collection...", icon: "info" })}
              className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/40 transition-colors"
            >
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">English Medium Books</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-1 block">Class 6 - 12</span>
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
