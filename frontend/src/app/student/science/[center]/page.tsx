"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { LucideIcon } from "@/components/LucideIcon";
import { Sparkles, ChevronLeft, TrendingUp, Award, ArrowLeft, Check, X, HelpCircle, Eye, EyeOff } from "lucide-react";
import { getCenterTopics } from "@/data/centerTopics";

// Define structured mock question bank data for Classes 9 and 10
interface QuestionData {
  mcq: { question: string; options: string[]; answer: string; explanation: string }[];
  pyq: { question: string; answer: string; year: string }[];
  diagram: { title: string; image: string; labels: string[]; explanation: string }[];
  qa: { question: string; marks: number; answer: string }[];
}

const QUESTION_BANK_DATA: Record<string, QuestionData> = {
  "9": {
    mcq: [
      {
        question: "What is the SI unit of gravitational constant (G)?",
        options: ["N m²/kg²", "N m/kg", "N m²/kg", "N/kg²"],
        answer: "N m²/kg²",
        explanation: "Since F = G(m1*m2)/d², G = F*d²/(m1*m2). So, the unit is N m²/kg²."
      },
      {
        question: "Which plastid gives yellow or orange color to fruits and flowers?",
        options: ["Chloroplast", "Chromoplast", "Leucoplast", "Amyloplast"],
        answer: "Chromoplast",
        explanation: "Chromoplasts contain carotenoid pigments that provide yellow, orange, or red colors to flowers and fruits."
      },
      {
        question: "The displacement of an object is proportional to the square of time. The object moves with:",
        options: ["Uniform velocity", "Uniform acceleration", "Decreasing acceleration", "Non-uniform velocity"],
        answer: "Uniform acceleration",
        explanation: "From s = ut + 1/2 at², if u = 0, then displacement s is proportional to t², which implies uniform acceleration."
      }
    ],
    pyq: [
      {
        question: "State the Law of Conservation of Momentum and write its formula.",
        answer: "In the absence of an external force, the total momentum of a system remains unchanged. Formula: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.",
        year: "2024 Final Exam"
      },
      {
        question: "Explain the differences between speed and velocity.",
        answer: "Speed is scalar, indicating how fast an object moves (distance/time). Velocity is vector, indicating speed in a specific direction (displacement/time).",
        year: "2023 Mid-Term"
      }
    ],
    diagram: [
      {
        title: "Plant Cell Structure",
        image: "🧬",
        labels: ["Cell Wall", "Cell Membrane", "Cytoplasm", "Nucleus", "Vacuole"],
        explanation: "Unlike animal cells, plant cells have a rigid outer cell wall and large central vacuoles."
      }
    ],
    qa: [
      {
        question: "What are the postulates of Dalton's atomic theory?",
        marks: 5,
        answer: "1. Matter is made of indivisible atoms. 2. Atoms of an element are identical in mass and properties. 3. Atoms cannot be created or destroyed. 4. Compounds are formed by combinations of atoms in simple ratios."
      }
    ]
  },
  "10": {
    mcq: [
      {
        question: "Which of the following is used to prevent the rusting of iron by coating it with zinc?",
        options: ["Galvanization", "Electrolysis", "Alloying", "Tinning"],
        answer: "Galvanization",
        explanation: "Galvanization is the process of applying a protective zinc coating to steel or iron to prevent rusting."
      },
      {
        question: "The refractive index of water is:",
        options: ["1.33", "1.50", "2.42", "1.00"],
        answer: "1.33",
        explanation: "The refractive index of water is a measure of how much light bends when entering it, which is approximately 1.33."
      },
      {
        question: "What is the critical angle for glass-air interface if the refractive index is 1.5?",
        options: ["41.8°", "48.6°", "24.4°", "30.0°"],
        answer: "41.8°",
        explanation: "Using sin(c) = 1/n, sin(c) = 1/1.5 = 0.67. Critical angle c = arcsin(0.67) ≈ 41.8°."
      }
    ],
    pyq: [
      {
        question: "State Ohm's Law and write its mathematical relation.",
        answer: "At constant temperature, the current (I) flowing through a conductor is directly proportional to the potential difference (V) across its ends. Relation: V = I × R.",
        year: "2025 SSLC Board"
      },
      {
        question: "Why do stars twinkle but planets do not?",
        answer: "Stars are point sources of light, so atmospheric refraction fluctuates their light rapidly. Planets are closer, acting as extended sources, averaging out the twinkle effect.",
        year: "2024 SSLC Board"
      }
    ],
    diagram: [
      {
        title: "Structure of a Neuron (Nerve Cell)",
        image: "🧠",
        labels: ["Dendrite", "Soma (Cell Body)", "Nucleus", "Axon", "Myelin Sheath", "Nerve Ending"],
        explanation: "Neurons are the structural and functional units of the nervous system, transmitting electrical signals."
      }
    ],
    qa: [
      {
        question: "Explain the modern atomic theory postulates.",
        marks: 5,
        answer: "1. Atoms are divisible into protons, neutrons, and electrons. 2. Atoms of the same element can have different atomic masses (isotopes). 3. Atoms of different elements can have the same atomic mass (isobars). 4. Atoms can be transmuted."
      }
    ]
  }
};

export default function ScienceCenterPage() {
  const params = useParams();
  const slug = String(params?.center || "");
  const center = getCenterTopics(slug);

  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class === "9" ? "9" : "10"; // Default to Class 10

  const classData = QUESTION_BANK_DATA[studentClass];

  const [progress, setProgress] = useState(0);
  const [badge, setBadge] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  // Collapsible answers for PYQ / Short Answers
  const [visibleAnswers, setVisibleAnswers] = useState<Record<string, boolean>>({});

  if (!center) {
    return (
      <PortalLayout title="Science Center" subtitle="Not found">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-5xl mb-3">🔭</div>
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">This centre is being prepared</h3>
          <Link href="/student/science-campus" className="inline-flex items-center gap-1 mt-4 text-sm font-black text-sky-600">
            <ArrowLeft className="w-4 h-4" /> Back to Science Campus
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const totalItems = center.groups.reduce((n, g) => n + g.items.length, 0);

  const handleSelectItem = (key: string) => {
    setActive(key);
    setProgress((p) => {
      const np = Math.min(100, p + Math.ceil(100 / totalItems));
      if (np >= 100) setBadge(true);
      return np;
    });
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const toggleAnswerVisibility = (key: string) => {
    setVisibleAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PortalLayout title={center.title} subtitle={center.titleTa ? `${center.titleTa} · ${center.tagline}` : center.tagline}>
      <div className="flex flex-col gap-6 text-left">
        <Link href="/student/science-campus" className="inline-flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-4 h-4" /> Science Campus
        </Link>

        {/* hero */}
        <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${center.grad} text-white p-8 shadow-lg`}>
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center shrink-0">
              <LucideIcon name={center.icon} className="w-9 h-9 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Class {studentClass} · {totalItems} tabs
              </span>
              <h2 className="text-2xl md:text-3xl font-black mb-1">{center.title}</h2>
              <p className="text-white/85 text-sm font-medium max-w-2xl">{center.tagline}</p>
            </div>
          </div>
        </div>

        {/* progress */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200"><TrendingUp className="w-4 h-4 text-emerald-500" /> Explore progress</h3>
            <span className="text-sm font-black text-emerald-600">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          {badge && <span className="inline-flex items-center gap-1 mt-3 text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 text-white"><Award className="w-3.5 h-3.5" /> {center.title} Explorer!</span>}
        </div>

        {/* topic groups */}
        {center.groups.map((g) => (
          <section key={g.heading}>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">{g.heading}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {g.items.map((it) => {
                const key = `${g.heading}:${it.label}`;
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectItem(key)}
                    className={`group relative rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isActive ? "border-purple-400 bg-purple-50/20 dark:bg-slate-900" : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <span className="text-2xl">{it.emoji}</span>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-2 leading-tight">{it.label}</p>
                    <span className="text-[9px] font-black text-slate-350 group-hover:text-purple-500">{isActive ? "✓ active" : "open"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Interactive content area for Question Bank */}
        {active && slug === "question-bank" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-purple-100 dark:border-slate-700 shadow-sm space-y-6">
            
            {/* 1. MCQ Tab */}
            {active === "Types:MCQ" && (
              <div>
                <h3 className="text-lg font-black text-slate-850 dark:text-white mb-1">Class {studentClass} Science Multiple Choice Questions</h3>
                <p className="text-xs text-slate-400 mb-6">Choose the correct answer and view the explanation.</p>
                <div className="space-y-6">
                  {classData.mcq.map((q, idx) => {
                    const selected = selectedAnswers[idx];
                    return (
                      <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="font-bold text-sm text-slate-800 dark:text-white mb-3">Q{idx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt) => {
                            const isCorrect = opt === q.answer;
                            const isSelected = selected === opt;
                            let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100";
                            
                            if (selected) {
                              if (isCorrect) {
                                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20";
                              } else if (isSelected) {
                                btnStyle = "bg-red-50 border-red-500 text-red-700 dark:bg-red-950/20";
                              } else {
                                btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={!!selected}
                                onClick={() => handleSelectOption(idx, opt)}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {selected && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                                {selected && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600" />}
                              </button>
                            );
                          })}
                        </div>
                        {selected && (
                          <div className="mt-3">
                            <button 
                              onClick={() => setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <HelpCircle className="w-3.5 h-3.5" /> {showExplanation[idx] ? "Hide Explanation" : "View Explanation"}
                            </button>
                            {showExplanation[idx] && (
                              <p className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PYQ Tab */}
            {active === "Types:Previous Year Questions" && (
              <div>
                <h3 className="text-lg font-black text-slate-850 dark:text-white mb-1">Previous Year Board & Term Questions</h3>
                <p className="text-xs text-slate-400 mb-6">Review frequently asked school and board exam questions.</p>
                <div className="space-y-4">
                  {classData.pyq.map((q, idx) => {
                    const key = `pyq-${idx}`;
                    const show = visibleAnswers[key];
                    return (
                      <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase tracking-wider mb-2">{q.year}</span>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">Q. {q.question}</p>
                          </div>
                          <button
                            onClick={() => toggleAnswerVisibility(key)}
                            className="p-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-500"
                          >
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {show && (
                          <div className="mt-4 p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                            <p className="text-xs font-black text-emerald-800 dark:text-emerald-400 mb-1">Correct Answer:</p>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Diagram Practice Tab */}
            {active === "Types:Diagram Practice" && (
              <div>
                <h3 className="text-lg font-black text-slate-850 dark:text-white mb-1">Science Diagram Labeller</h3>
                <p className="text-xs text-slate-400 mb-6">Review important board diagram structures and practice their parts.</p>
                <div className="space-y-6">
                  {classData.diagram.map((d, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-32 h-32 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-5xl select-none shrink-0 shadow-inner">
                        {d.image}
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="font-black text-base text-slate-800 dark:text-white">{d.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          {d.labels.map((lbl) => (
                            <span key={lbl} className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-indigo-100/70 text-indigo-750 border border-indigo-200">
                              📍 {lbl}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{d.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Short/Long Answers Tab */}
            {active === "Types:Short/Long Answers" && (
              <div>
                <h3 className="text-lg font-black text-slate-850 dark:text-white mb-1">Standard Short & Long Q&A</h3>
                <p className="text-xs text-slate-400 mb-6">Detailed explanations tailored to board grading systems.</p>
                <div className="space-y-4">
                  {classData.qa.map((q, idx) => {
                    const key = `qa-${idx}`;
                    const show = visibleAnswers[key];
                    return (
                      <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider mb-2">{q.marks} Marks Question</span>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">Q. {q.question}</p>
                          </div>
                          <button
                            onClick={() => toggleAnswerVisibility(key)}
                            className="p-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-500"
                          >
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {show && (
                          <div className="mt-4 p-4 bg-purple-55/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-xl">
                            <p className="text-xs font-black text-purple-800 dark:text-purple-400 mb-1">Postulates & Explanation:</p>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Browse Tree Tab */}
            {active.startsWith("Browse:") && (
              <div>
                <h3 className="text-base font-black text-slate-850 dark:text-white mb-2">Browse Question Catalog</h3>
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs font-black text-slate-800 dark:text-white mb-3">📍 Interactive Indexing for Class {studentClass}th</p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">📂 <span>Unit 1: Laws of Motion & Forces</span></li>
                    <li className="flex items-center gap-2">📂 <span>Unit 2: Matter & Atoms</span></li>
                    <li className="flex items-center gap-2">📂 <span>Unit 3: Plant & Animal Biology</span></li>
                  </ul>
                  <p className="text-[10px] text-slate-400 mt-4">Select any unit to load specific mock questions inside the AI Tutor tool.</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Fallback detail note for other general centers */}
        {active && slug !== "question-bank" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-emerald-100 dark:border-slate-700">
            <p className="text-sm font-black text-slate-800 dark:text-white">{active.split(":").pop()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive 3D content, animations and a guided lesson for this topic are on the way. Meanwhile, ask the AI Tutor or open the Book Library for the related chapter.
            </p>
            <div className="flex gap-2 mt-3">
              <Link href="/student/ai-tutor" className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200">🤖 Ask AI Tutor</Link>
              <Link href="/student/science-library" className="text-xs font-black px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200">📚 Book Library</Link>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
