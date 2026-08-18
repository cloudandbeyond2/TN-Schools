"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

type Subject = "Biology" | "Chemistry" | "Physics";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Chapter {
  id: string;
  subject: Subject;
  chapter: string;
  difficulty: Difficulty;
  totalQuestions: number;
  attempted: number;
  correct: number;
  status: "Completed" | "In Progress" | "Pending";
  generatedQuestions?: any[];
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  examDate: string;
  myScore: number;
  maxScore: number;
  duration: string;
  myRank: number;
  totalStudents: number;
}

interface Question {
  q: string;
  o: string[];
  a: number; // index of correct option
  exp: string; // explanation
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const studyTips = [
  { icon: "fi-rr-brain", title: "Active Recall", desc: "After each chapter, close your notes and write everything you remember. Repeat 3 times." },
  { icon: "fi-rr-clock", title: "Pomodoro Method", desc: "Study 45 min, break 10 min. Deep focused sessions beat long aimless sessions." },
  { icon: "fi-rr-calendar", title: "Spaced Repetition", desc: "Revisit Biology formulas today, Chemistry in 3 days, Physics in 7 days." },
  { icon: "fi-rr-edit", title: "Previous Year Papers", desc: "Solve 10 years of NEET PYQs — 70% of real questions repeat from previous years!" },
];

const subjectGradient: Record<Subject, string> = {
  Biology: "from-emerald-500 to-teal-500",
  Chemistry: "from-pink-500 to-rose-500",
  Physics: "from-blue-500 to-indigo-500",
};

const subjectBadge: Record<Subject, string> = {
  Biology: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Chemistry: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const diffColor: Record<Difficulty, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const chapterQuestions: Record<Subject, Question[]> = {
  Biology: [
    { q: "Which organelle is referred to as the powerhouse of the cell?", o: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"], a: 0, exp: "Mitochondria produce ATP through cellular respiration, earning them the powerhouse title." },
    { q: "Who discovered the nucleus in the cell?", o: ["Robert Hooke", "Robert Brown", "Antoni van Leeuwenhoek", "Rudolf Virchow"], a: 1, exp: "Robert Brown discovered the nucleus in orchid roots in 1831." },
    { q: "What is the primary site of protein synthesis in a cell?", o: ["Golgi apparatus", "Ribosome", "Lysosome", "Centrosome"], a: 1, exp: "Ribosomes translate mRNA into amino acid chains to synthesize proteins." },
    { q: "Which of the following is responsible for cell division in animal cells?", o: ["Chloroplast", "Centrosome", "Mitochondria", "Vacuole"], a: 1, exp: "Centrosomes organize microtubules during animal cell division (mitosis)." },
    { q: "Which phase of mitosis involves chromosomes aligning at the cell equator?", o: ["Prophase", "Metaphase", "Anaphase", "Telophase"], a: 1, exp: "During Metaphase, chromosomes attach to spindle fibers and line up along the metaphase plate." }
  ],
  Chemistry: [
    { q: "Which of the following has the highest electronegativity?", o: ["Oxygen", "Fluorine", "Nitrogen", "Chlorine"], a: 1, exp: "Fluorine is the most electronegative element in the periodic table (Paulings value of 4.0)." },
    { q: "What is the hybridisation of carbon in methane (CH4)?", o: ["sp", "sp2", "sp3", "dsp2"], a: 2, exp: "Methane has 4 single bonds, meaning tetrahedral geometry and sp3 hybridisation." },
    { q: "Which law states that volume is directly proportional to temperature at constant pressure?", o: ["Boyles Law", "Charles Law", "Avogadros Law", "Daltons Law"], a: 1, exp: "Charles Law states V ∝ T at constant pressure." },
    { q: "Which gas is released when sodium metal reacts with water?", o: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"], a: 1, exp: "Sodium reacts violently with water to form sodium hydroxide and release highly flammable hydrogen gas." },
    { q: "What is the pH of a 10⁻³ M HCl solution?", o: ["3", "7", "11", "1.3"], a: 0, exp: "pH = -log[H+] = -log(10⁻³) = 3." }
  ],
  Physics: [
    { q: "In Wave Optics, what causes the alternating bright and dark fringes in Young's double slit experiment?", o: ["Diffraction", "Interference", "Polarization", "Refraction"], a: 1, exp: "Interference of light waves from coherent sources produces the alternate fringes." },
    { q: "What is the focal length of a plane mirror?", o: ["Zero", "Infinite", "10 cm", "Dependent on object distance"], a: 1, exp: "A plane mirror has no curvature, so its center of curvature and focal length are at infinity." },
    { q: "Which of the following phenomena proves the transverse nature of light waves?", o: ["Interference", "Diffraction", "Polarization", "Photoelectric Effect"], a: 2, exp: "Only transverse waves can be polarized; longitudinal waves (like sound) cannot." },
    { q: "What is the SI unit of magnetic flux?", o: ["Tesla", "Weber", "Henry", "Farad"], a: 1, exp: "Weber (Wb) is the SI unit of magnetic flux; Tesla is the unit of magnetic field strength." },
    { q: "What happens to the resistance of a semiconductor as temperature increases?", o: ["Increases", "Decreases", "Remains same", "First increases then decreases"], a: 1, exp: "Semiconductors have a negative temperature coefficient of resistance, so resistance decreases as temperature rises." }
  ]
};

export default function StudentNEETPrepPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [myTests, setMyTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"syllabus" | "tests" | "tips" | "gemini">("syllabus");
  const [filterSubject, setFilterSubject] = useState<"All" | Subject>("All");

  // Practice States
  const [activePracticeChapter, setActivePracticeChapter] = useState<Chapter | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionAttempted, setSessionAttempted] = useState(0);
  const [savingPractice, setSavingPractice] = useState(false);

  // Gemini AI States
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState<Subject>("Biology");
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>("Medium");
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    if (!schoolId) return;
    try {
      const params = new URLSearchParams();
      params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/chapters?${params}`);
      const data = await res.json();
      if (data.success) setChapters(data.data);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchTests = useCallback(async () => {
    if (!schoolId) return;
    try {
      const params = new URLSearchParams();
      params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/mock-tests?${params}`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((t: any, idx: number) => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          examDate: t.examDate,
          myScore: t.myScore || 0,
          maxScore: t.maxScore || 720,
          duration: t.duration,
          myRank: t.myRank || null,
          totalStudents: t.totalStudents,
        }));
        setMyTests(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchAll = useCallback(async () => {
    if (status === "loading") return;
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.all([fetchSyllabus(), fetchTests()]);
    setLoading(false);
  }, [fetchSyllabus, fetchTests, schoolId, status]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const startPracticeSession = async (ch: Chapter) => {
    if (ch.generatedQuestions && ch.generatedQuestions.length > 0) {
      const mappedQuestions = ch.generatedQuestions.map((q: any) => {
        const ansLetter = String(q.answer).charAt(0).toUpperCase();
        const ansIndex = ansLetter === "A" ? 0 : ansLetter === "B" ? 1 : ansLetter === "C" ? 2 : ansLetter === "D" ? 3 : 0;
        
        // Strip prefix "A) " or "A." if it exists in options for cleaner UI
        const cleanOptions = (q.options || ["A", "B", "C", "D"]).map((opt: string) => {
          return opt.replace(/^[A-D][\.\)]\s*/i, "");
        });

        return {
          q: q.text,
          o: cleanOptions,
          a: ansIndex,
          exp: `This is a model solution generated by Gemini AI for topic: "${ch.chapter}".`,
        };
      });

      setPracticeQuestions(mappedQuestions);
      setCurrentQIndex(ch.attempted < mappedQuestions.length ? ch.attempted : 0);
      setSessionAttempted(0);
      setSelectedAns(null);
      setShowExplanation(false);
      setCorrectCount(0);
      setActivePracticeChapter(ch);
    } else {
      Swal.fire({
        icon: "info",
        title: "No Questions Available",
        text: "Please ask your teacher to generate practice questions for this chapter.",
      });
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedAns !== null) return; // already answered
    setSelectedAns(idx);
    setShowExplanation(true);
    setSessionAttempted((prev) => prev + 1);
    if (idx === practiceQuestions[currentQIndex].a) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQ = () => {
    setSelectedAns(null);
    setShowExplanation(false);
    if (currentQIndex + 1 < practiceQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      savePracticeResults();
    }
  };

  const handleGenerateGeminiQuestions = async () => {
    if (!aiTopic.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Topic Required",
        text: "Please enter a topic title for Gemini to generate practice questions.",
      });
    }

    setGeneratingAi(true);
    try {
      const res = await fetch(`${API}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: "12",
          subject: aiSubject,
          topic: aiTopic.trim(),
          difficulty: aiDifficulty,
          mcqCount: 120,
          shortCount: 0,
          longCount: 0,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const mappedQuestions = data.data.map((q: any) => {
          const ansLetter = String(q.answer).charAt(0).toUpperCase();
          const ansIndex = ansLetter === "A" ? 0 : ansLetter === "B" ? 1 : ansLetter === "C" ? 2 : ansLetter === "D" ? 3 : 0;
          return {
            q: q.text,
            o: q.options || ["A", "B", "C", "D"],
            a: ansIndex,
            exp: `This is a model solution generated by Gemini AI for topic: "${aiTopic.trim()}".`,
          };
        });

        setPracticeQuestions(mappedQuestions);
        setCurrentQIndex(0);
        setSelectedAns(null);
        setShowExplanation(false);
        setCorrectCount(0);
        setActivePracticeChapter({
          id: "gemini",
          subject: aiSubject,
          chapter: `🤖 AI: ${aiTopic.trim()}`,
          difficulty: aiDifficulty,
          totalQuestions: mappedQuestions.length,
          attempted: 0,
          correct: 0,
          status: "Pending",
        });

        Swal.fire({
          icon: "success",
          title: "AI Questions Generated!",
          text: `Gemini has generated 5 customized mock questions on "${aiTopic.trim()}". Starting practice...`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "AI Generation Failed",
          text: data.error || "Failed to generate AI questions. Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Failed to connect to the Gemini AI API.",
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const savePracticeResults = async (earlyClose: boolean = false) => {
    if (!activePracticeChapter) return;
    
    if (earlyClose && sessionAttempted === 0) {
      setActivePracticeChapter(null);
      return;
    }

    setSavingPractice(true);
    const addedAttempted = sessionAttempted;
    const addedCorrect = correctCount;

    if (activePracticeChapter.id === "gemini") {
      setSavingPractice(false);
      setActivePracticeChapter(null);
      const accuracyPct = Math.round((addedCorrect / addedAttempted) * 100);
      Swal.fire({
        title: "🤖 AI Practice Completed!",
        html: `
          <div class="text-sm space-y-2 mt-3">
            <p>You answered <b>${addedCorrect}</b> out of <b>${addedAttempted}</b> correctly.</p>
            <div class="inline-block bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full font-bold text-xs">
              AI Accuracy: ${accuracyPct}%
            </div>
            <p class="text-slate-500 italic mt-2">Excellent job! This AI generated topic has been completed.</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Done",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    let newAttempted = activePracticeChapter.attempted;
    let newCorrect = activePracticeChapter.correct;
    
    if (activePracticeChapter.attempted < activePracticeChapter.totalQuestions) {
      newAttempted = Math.min(activePracticeChapter.attempted + addedAttempted, activePracticeChapter.totalQuestions);
      newCorrect = Math.min(activePracticeChapter.correct + addedCorrect, newAttempted);
    }
    
    let newStatus: "Completed" | "In Progress" | "Pending" = "In Progress";
    if (newAttempted >= activePracticeChapter.totalQuestions) {
      newStatus = "Completed";
    }

    try {
      const res = await fetch(`${API}/api/neet-prep/chapters/${activePracticeChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activePracticeChapter.subject,
          chapter: activePracticeChapter.chapter,
          difficulty: activePracticeChapter.difficulty,
          totalQuestions: activePracticeChapter.totalQuestions,
          attempted: newAttempted,
          correct: newCorrect,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSyllabus();
        const accuracyPct = Math.round((addedCorrect / addedAttempted) * 100);
        Swal.fire({
          title: "🎉 Practice Completed!",
          html: `
            <div class="text-sm space-y-2 mt-3">
              <p>You answered <b>${addedCorrect}</b> out of <b>${addedAttempted}</b> correctly.</p>
              <div class="inline-block bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold text-xs">
                Accuracy: ${accuracyPct}%
              </div>
              <p class="text-slate-500 italic mt-2">Chapter status: <b>${newStatus}</b></p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Done",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({ icon: "error", title: "Error Saving Results", text: data.error || "Failed to update db." });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to the database." });
    } finally {
      setSavingPractice(false);
      setActivePracticeChapter(null);
    }
  };

  const totalAttempted = chapters.reduce((a, c) => a + c.attempted, 0);
  const totalCorrect = chapters.reduce((a, c) => a + c.correct, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const completed = chapters.filter((c) => c.status === "Completed").length;
  const myBestScore = myTests.length > 0 ? Math.max(...myTests.map((t) => t.maxScore > 0 ? Math.round((t.myScore / t.maxScore) * 100) : 0)) : 0;

  const filteredChapters = chapters.filter(
    (c) => filterSubject === "All" || c.subject === filterSubject
  );

  return (
    <PortalLayout title="NEET Preparation" subtitle="Track your syllabus, mock tests & performance for NEET success" accentColor="#ef4444">
      <div className="space-y-6 animate-in fade-in duration-300">

        {/* ── Hero Banner Icon Update ──────────────────────────── */}
        <div 
          className="relative overflow-hidden rounded-3xl text-white p-6 md:p-8 shadow-xl border border-rose-500/20"
          style={{ background: "linear-gradient(135deg, #dc2626 0%, #f43f5e 50%, #db2777 100%)" }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            :root:not(.dark) .banner-title,
            .banner-title {
              color: #ffffff !important;
            }
            :root:not(.dark) .banner-desc,
            .banner-desc {
              color: rgba(255, 255, 255, 0.85) !important;
            }
            :root:not(.dark) .banner-stat-val,
            .banner-stat-val {
              color: #ffffff !important;
            }
            :root:not(.dark) .banner-stat-lbl,
            .banner-stat-lbl {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            :root:not(.dark) .banner-stat-icon,
            .banner-stat-icon {
              color: rgba(255, 255, 255, 0.9) !important;
            }
          ` }} />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-white">
            <i className="fi fi-rr-dna text-[120px] leading-none" />
          </div>
          <div className="relative z-10 text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 shadow-sm border border-white/10">
              <i className="fi fi-rr-bullseye mr-1 text-[10px]" /> NEET UG 2026 Target
            </span>
            <h2 className="banner-title text-2xl md:text-3xl font-black tracking-tight mb-2">Your NEET Dashboard</h2>
            <p className="banner-desc text-xs md:text-sm font-medium max-w-lg leading-relaxed">
              Every chapter you complete brings you one step closer to your medical dream. Track your Biology, Chemistry & Physics progress here.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Chapters Done", value: `${completed}/${chapters.length}`, icon: <i className="banner-stat-icon fi fi-rr-book-alt text-sm" /> },
                { label: "Overall Accuracy", value: `${overallAccuracy}%`, icon: <i className="banner-stat-icon fi fi-rr-bullseye text-sm" /> },
                { label: "Best Mock Score", value: `${myBestScore}%`, icon: <i className="banner-stat-icon fi fi-rr-trophy text-sm" /> },
                { label: "Mock Tests Taken", value: myTests.length, icon: <i className="banner-stat-icon fi fi-rr-list text-sm" /> },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 min-w-[120px] shadow-sm flex flex-col justify-between hover:bg-white/15 transition-all">
                  <div className="banner-stat-val text-sm font-black flex items-center gap-1.5">{s.icon} <span>{s.value}</span></div>
                  <div className="banner-stat-lbl text-[10px] font-bold mt-1.5 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Subject Progress Bars ────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-left">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
            <i className="fi fi-rr-chart-histogram text-red-500" /> Subject-wise Progress
          </h3>
          <div className="space-y-3">
            {(["Biology", "Chemistry", "Physics"] as Subject[]).map((sub) => {
              const subChapters = chapters.filter((c) => c.subject === sub);
              const done = subChapters.filter((c) => c.status === "Completed").length;
              const pct = subChapters.length > 0 ? Math.round((done / subChapters.length) * 100) : 0;
              const totalAttemptedSub = subChapters.reduce((a, c) => a + c.attempted, 0);
              const totalCorrectSub = subChapters.reduce((a, c) => a + c.correct, 0);
              const acc = totalAttemptedSub > 0 ? Math.round((totalCorrectSub / totalAttemptedSub) * 100) : 0;
              return (
                <div key={sub}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${subjectBadge[sub]}`}>{sub}</span>
                      <span className="text-[10px] text-slate-400">{done}/{subChapters.length} chapters · {acc}% accuracy</span>
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-white">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${subjectGradient[sub]} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit">
          {([
            { key: "syllabus", label: "Syllabus", icon: "fi-rr-book-alt" },
            { key: "tests", label: "My Tests", icon: "fi-rr-list" },
            { key: "gemini", label: "AI Gemini Generator", icon: "fi-rr-robot" },
            { key: "tips", label: "Study Tips", icon: "fi-rr-star" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${activeTab === tab.key
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              <i className={`fi ${tab.icon} flex items-center`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Syllabus Tab ──────────────────────────────────────── */}
        {activeTab === "syllabus" && (
          <>
            <div className="flex gap-2 flex-wrap">
              {(["All", "Biology", "Chemistry", "Physics"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSubject(s)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${filterSubject === s
                    ? "bg-red-500 text-white border-red-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-red-300"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
            ) : filteredChapters.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No chapters assigned under this category.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredChapters.map((ch) => {
                  const cappedAttempted = Math.min(ch.attempted, ch.totalQuestions);
                  const cappedCorrect = Math.min(ch.correct, cappedAttempted);
                  const accuracy = cappedAttempted > 0 ? Math.round((cappedCorrect / cappedAttempted) * 100) : 0;
                  const progress = ch.totalQuestions > 0 ? Math.round((cappedAttempted / ch.totalQuestions) * 100) : 0;
                  return (
                    <div key={ch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${subjectBadge[ch.subject] || ""}`}>{ch.subject}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${ch.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                          : ch.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                          }`}>
                          {ch.status === "Completed" ? "✓ Done" : ch.status === "In Progress" ? "● Active" : "○ Pending"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 group-hover:text-red-500 transition-colors leading-tight">{ch.chapter}</h4>

                      <div className="flex gap-2 mb-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${diffColor[ch.difficulty] || "bg-slate-100"}`}>{ch.difficulty}</span>
                        <span className="text-[9px] text-slate-400">{ch.totalQuestions} Qs</span>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">Questions Done</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">{cappedAttempted}/{ch.totalQuestions}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${subjectGradient[ch.subject] || ""}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {ch.attempted > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-400">Accuracy</span>
                            <span className={`font-black ${accuracy >= 80 ? "text-emerald-500" : accuracy >= 60 ? "text-amber-500" : "text-red-500"}`}>
                              {accuracy}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${accuracy >= 80 ? "bg-emerald-500" : accuracy >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <button
                          onClick={() => startPracticeSession(ch)}
                          className={`w-full py-2 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md ${ch.status === "Completed"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ch.status === "In Progress"
                              ? "bg-amber-500 hover:bg-amber-600"
                              : "bg-red-500 hover:bg-red-600"
                            }`}
                        >
                          {ch.status === "Pending" ? (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-rocket" /> Start Practice</span>
                          ) : ch.status === "In Progress" ? (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-play" /> Continue</span>
                          ) : (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-refresh" /> Revise Again</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── My Tests Tab ──────────────────────────────────────── */}
        {activeTab === "tests" && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
              <i className="fi fi-rr-list text-red-500" /> My Mock Test Results
            </h3>
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
            ) : myTests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No scheduled mock tests.</div>
            ) : (
              myTests.map((test) => {
                const scorePct = test.maxScore > 0 ? Math.round((test.myScore / test.maxScore) * 100) : 0;
                return (
                  <div key={test.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fi fi-rr-list text-red-500 flex items-center" />
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{test.title}</h4>
                          <span className="text-[9px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full font-semibold">{test.subject}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><i className="fi fi-rr-calendar" /> {test.examDate}</span>
                          <span className="flex items-center gap-1"><i className="fi fi-rr-clock" /> {test.duration}</span>
                          <span className="flex items-center gap-1"><i className="fi fi-rr-users-alt" /> {test.totalStudents} students</span>
                        </div>
                      </div>

                      <div className="flex gap-5 items-center">
                        <div className="text-center">
                          <div className={`text-xl font-black ${scorePct >= 80 ? "text-emerald-500" : scorePct >= 60 ? "text-amber-500" : "text-red-500"}`}>
                            {test.myScore}/{test.maxScore}
                          </div>
                          <div className="text-[9px] text-slate-400">My Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-blue-500">#{test.myRank}</div>
                          <div className="text-[9px] text-slate-400">Rank</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-black ${scorePct >= 80 ? "text-emerald-500" : scorePct >= 60 ? "text-amber-500" : "text-red-500"}`}>{scorePct}%</div>
                          <div className="text-[9px] text-slate-400">Accuracy</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scorePct >= 80 ? "bg-emerald-500" : scorePct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Gemini AI Tab ────────────────────────────────────── */}
        {activeTab === "gemini" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 animate-in fade-in duration-200 text-left">
            <div className="flex items-center gap-3">
              <i className="fi fi-rr-robot text-violet-500 text-3xl shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Gemini AI Question Generator</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Type any chapter title to generate custom mock practice questions instantly.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold">Select Subject</label>
                <div className="flex gap-2">
                  {(["Biology", "Chemistry", "Physics"] as Subject[]).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setAiSubject(sub)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        aiSubject === sub
                          ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold">Practice Chapter/Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Basis of Inheritance, Chemical Kinetics, Ray Optics..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold">Difficulty Level</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as Difficulty)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <button
                onClick={handleGenerateGeminiQuestions}
                disabled={generatingAi}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {generatingAi ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    Generating Practice Questions...
                  </>
                ) : (
                  <span className="flex items-center gap-1.5"><i className="fi fi-rr-sparkles" /> Generate & Start Practice Session</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Study Tips Tab ────────────────────────────────────── */}
        {activeTab === "tips" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyTips.map((tip, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all text-left">
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-3 shrink-0">
                    <i className={`fi ${tip.icon} text-red-500 text-xl`} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 leading-tight">{tip.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Interactive Practice Modal ───────────────────────── */}
        {activePracticeChapter && practiceQuestions.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 p-5 text-white flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                    NEET Practice Mode
                  </span>
                  <h3 className="text-sm font-bold mt-1 line-clamp-1">
                    {activePracticeChapter.chapter}
                  </h3>
                </div>
                <button
                  onClick={() => savePracticeResults(true)}
                  className="text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 shadow-sm inline-flex items-center gap-1"
                >
                  <i className="fi fi-rr-cross text-[10px]" /> Close
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 shrink-0">
                <div
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${(((currentQIndex - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0)) + (selectedAns !== null ? 1 : 0)) / (practiceQuestions.length - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0))) * 100}%` }}
                />
              </div>

              {/* Question Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                    Question {currentQIndex - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0) + 1} of {practiceQuestions.length - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0)}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold">
                    Score: {correctCount}/{sessionAttempted}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                  {practiceQuestions[currentQIndex].q}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {practiceQuestions[currentQIndex].o.map((option, idx) => {
                    const isCorrectOption = idx === practiceQuestions[currentQIndex].a;
                    const isSelected = idx === selectedAns;

                    let optStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-red-300";
                    if (selectedAns !== null) {
                      if (isCorrectOption) {
                        optStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300";
                      } else if (isSelected) {
                        optStyle = "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300";
                      } else {
                        optStyle = "border-slate-200 dark:border-slate-800 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={selectedAns !== null}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all ${optStyle}`}
                      >
                        <span>{idx + 1}. &nbsp;{option}</span>
                        {selectedAns !== null && isCorrectOption && <span className="text-emerald-500 font-black">✓ Correct</span>}
                        {selectedAns !== null && isSelected && !isCorrectOption && <span className="text-red-500 font-black">✕ Incorrect</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <i className="fi fi-rr-interrogation text-slate-400" /> Explanation
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {practiceQuestions[currentQIndex].exp}
                    </p>
                  </div>
                )}

                {/* Next / Submit Button */}
                {selectedAns !== null && (
                  <button
                    onClick={handleNextQ}
                    disabled={savingPractice}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    {savingPractice
                      ? "Saving..."
                      : currentQIndex + 1 < practiceQuestions.length ? (
                        <span className="flex items-center gap-1">Next Question <i className="fi fi-rr-arrow-right" /></span>
                      ) : (
                        <span className="flex items-center gap-1">Finish & Save Session <i className="fi fi-rr-flag" /></span>
                      )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
