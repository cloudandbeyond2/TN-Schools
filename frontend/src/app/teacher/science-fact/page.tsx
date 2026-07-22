"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  Sparkles,
  Waves,
  Globe,
  FlaskConical,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Brain,
  Award,
  ArrowRight,
  CheckSquare,
  Zap,
  RefreshCw,
  Sun,
  Send,
  User,
  Users,
  Check,
  Flame
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface FactTopic {
  id: string;
  title: string;
  category: string;
  targetClass?: string;
  generatedAt?: string;
  generatedBy?: string;
  scienceFact: string;
  whyItHappens: string;
  didYouKnow: string;
  tryItSteps: string[];
  thinkAboutIt: string;
  thinkHint: string;
  quiz: {
    id: number;
    question: string;
    options: { key: string; text: string }[];
    correct: string;
    explanation: string;
  }[];
}

export default function TeacherScienceFactPage() {
  const [publishedFact, setPublishedFact] = useState<FactTopic | null>(null);
  const [allTopics, setAllTopics] = useState<FactTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [targetClass, setTargetClass] = useState<string>("Class 7-B");
  const [teacherName, setTeacherName] = useState<string>("Mrs. Sumathi Devi");
  const [promptTopic, setPromptTopic] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch current today fact on mount
  useEffect(() => {
    fetchFactData();
  }, []);

  const fetchFactData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/teacher/science-fact/today`);
      const json = await res.json();
      if (json.success) {
        setPublishedFact(json.data);
        if (json.allTopics) setAllTopics(json.allTopics);
      }
    } catch (e) {
      console.error("Failed to fetch published science fact", e);
    } finally {
      setLoading(false);
    }
  };

  // Generate Today's Fact using AI
  const handleGenerateTodayFact = async (selectedTopicId?: string) => {
    try {
      setGenerating(true);
      setSuccessMsg(null);

      const res = await fetch(`${API_BASE}/api/teacher/science-fact/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName,
          targetClass,
          topicId: selectedTopicId,
          promptTopic: promptTopic || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPublishedFact(json.data);
        const msg = json.isAiGenerated
          ? "✨ AI Generated & Published new Science Fact for your class!"
          : "Success! Today's Science Fact generated & published to your class!";
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 6000);
      }
    } catch (e) {
      console.error("Failed to generate science fact", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PortalLayout title="Science Fact Studio" subtitle="Generate and publish daily science facts for your students">
      <div className="w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Top Control Hero (Full Width) */}
        <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                Teacher AI Control Center
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white/90">
                Powered by Gemini AI
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Generate & Publish Today&apos;s Science Fact
            </h1>

            <p className="text-amber-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Clicking <strong className="text-white">&quot;Generate Today Fact&quot;</strong> uses Gemini AI to generate a complete, engaging science fact with an activity, curiosity reflection, and quiz for middle school students!
            </p>

            {/* Target Class, Teacher & AI Prompt Input Controls */}
            <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
                <Users className="w-4 h-4 text-amber-200" />
                <span>Class:</span>
                <input
                  type="text"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="bg-white/20 border border-white/30 text-white text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
                <User className="w-4 h-4 text-amber-200" />
                <span>Teacher:</span>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="bg-white/20 border border-white/30 text-white text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-100 flex-1 min-w-[200px]">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>AI Topic Focus (Optional):</span>
                <input
                  type="text"
                  placeholder="e.g. Magnetism, Volcanoes, Gravity"
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 text-xs rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Main Action Button: Generate Today Fact */}
              <button
                onClick={() => handleGenerateTodayFact()}
                disabled={generating}
                className="px-6 py-2.5 bg-white text-amber-950 hover:bg-amber-100 font-black text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                <Sparkles className={`w-4 h-4 text-amber-600 ${generating ? "animate-spin" : ""}`} />
                <span>{generating ? "AI Generating..." : "Generate Today Fact"}</span>
              </button>
            </div>

            {successMsg && (
              <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Topic Selection Cards for Teacher */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-500" />
              <span>Available Fact Topics for Today</span>
            </h2>
            <span className="text-xs text-slate-400">Click &quot;Publish to Class&quot; to pick a specific topic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allTopics.map((topic) => {
              const isCurrent = publishedFact?.id === topic.id || publishedFact?.title === topic.title;
              return (
                <div
                  key={topic.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {topic.category}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                          Active Today
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {topic.scienceFact}
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerateTodayFact(topic.id)}
                    disabled={generating}
                    className={`w-full text-xs font-bold py-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-white hover:border-amber-500"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isCurrent ? "Currently Active" : "Publish This Fact To Class"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Published Fact Student View Preview */}
        {publishedFact && (
          <div className="w-full space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Live Student Portal View</span>
                </h2>
                <p className="text-xs text-slate-400">
                  This is exactly what your students in {publishedFact.targetClass || targetClass} see when opening their Science Fact page.
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Published by {publishedFact.generatedBy || teacherName}
              </div>
            </div>

            {/* Preview Banner */}
            <div className="w-full bg-gradient-to-r from-teal-700 via-cyan-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-teal-200">
                {publishedFact.category} · Today&apos;s Fact
              </span>
              <h3 className="text-2xl font-black">
                Title: {publishedFact.title}
              </h3>
            </div>

            {/* Core Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Science Fact</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">
                  {publishedFact.scienceFact}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-cyan-50/70 dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 rounded-3xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-cyan-950 dark:text-cyan-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-600" />
                    <span>Why It Happens</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {publishedFact.whyItHappens}
                  </p>
                </div>

                <div className="bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Did You Know?</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {publishedFact.didYouKnow}
                  </p>
                </div>
              </div>
            </div>

            {/* Try It & Think About It Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-500" />
                  <span>Try It Yourself (Activity)</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {publishedFact.tryItSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-50/60 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Think About It</span>
                </h4>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {publishedFact.thinkAboutIt}
                </p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                  Hint: {publishedFact.thinkHint}
                </p>
              </div>
            </div>

            {/* Quiz Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600" />
                <span>Student Quiz Preview ({publishedFact.quiz.length} Questions)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {publishedFact.quiz.map((q) => (
                  <div key={q.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {q.id}. {q.question}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className={`text-[11px] px-2.5 py-1 rounded-lg ${
                            opt.key === q.correct
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          <strong>{opt.key})</strong> {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </PortalLayout>
  );
}
