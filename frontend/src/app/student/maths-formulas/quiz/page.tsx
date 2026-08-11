"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { samacheerFormulas, SamacheerFormula } from "@/data/samacheer-formulas";
import { useSession } from "next-auth/react";

export default function QuizPage() {
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [lang, setLang] = useState<"en" | "ta">("en");
  
  const [formulasInitialized, setFormulasInitialized] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const unaskedFormulasRef = useRef<SamacheerFormula[]>([]);

  const { data: session } = useSession();
  const [activeStandard, setActiveStandard] = useState<string | null>(null);
  const [filteredFormulas, setFilteredFormulas] = useState<SamacheerFormula[]>([]);

  useEffect(() => {
    async function fetchStudentClass() {
      if (!session?.user) return;
      const availableStandards = new Set(samacheerFormulas.map(f => f.standard));
      const sessionClass = (session.user as any)?.classId || (session.user as any)?.class;
      let std = "6";
      
      if (sessionClass) {
        const match = String(sessionClass).match(/\d+/);
        if (match && availableStandards.has(match[0])) {
          std = match[0];
          setActiveStandard(std);
          return;
        }
      }
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const userId = (session.user as any).id;
        const res = await fetch(`${apiUrl}/api/students?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const profile = json.data[0];
          if (profile && profile.class) {
            const match = profile.class.match(/\d+/);
            if (match && availableStandards.has(match[0])) {
              std = match[0];
            }
          }
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
      setActiveStandard(std);
    }
    fetchStudentClass();
  }, [session]);

  useEffect(() => {
    if (activeStandard) {
      const formulas = samacheerFormulas.filter(f => f.standard === activeStandard);
      setFilteredFormulas(formulas);
      unaskedFormulasRef.current = [...formulas].sort(() => Math.random() - 0.5);
      setFormulasInitialized(true);
    }
  }, [activeStandard]);

  const generateQuiz = useCallback(() => {
    if (!formulasInitialized || filteredFormulas.length === 0) return;
    
    if (unaskedFormulasRef.current.length === 0) {
      setQuizCompleted(true);
      setCurrentQuiz(null);
      return;
    }

    const formulaObj = unaskedFormulasRef.current.pop()!;

    const tokens = formulaObj.formula.split(/\s+/).filter((t: string) => !['=', '×', '+', '-', '/', ':', '::', '(', ')'].includes(t.trim()));
    let answer = tokens[Math.floor(Math.random() * tokens.length)] || formulaObj.formula;
    
    const questionStr = formulaObj.formula.replace(answer, "_____");
    
    const allTokens = filteredFormulas.flatMap((f: any) => f.formula.split(/\s+/).filter((t: string) => !['=', '×', '+', '-', '/', ':', '::', '(', ')'].includes(t.trim())));
    const uniqueTokens = Array.from(new Set(allTokens)).filter(t => t !== answer);
    
    uniqueTokens.sort(() => Math.random() - 0.5);
    const distractors = uniqueTokens.slice(0, 3);
    while(distractors.length < 3) distractors.push(String(Math.floor(Math.random()*10)));
    
    const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
    
    setCurrentQuiz({ formulaObj, questionStr, answer, options });
    setFeedback(null);
  }, [formulasInitialized, filteredFormulas]);

  useEffect(() => {
    if (formulasInitialized && !currentQuiz) {
      generateQuiz();
    }
  }, [formulasInitialized, currentQuiz, generateQuiz]);

  if (quizCompleted) return (
    <PortalLayout title="Maths Quiz" subtitle="Completed!" themeClass="theme-student">
       <div className="mt-12 bg-emerald-950 rounded-[2.5rem] p-12 border border-emerald-800/40 shadow-xl text-center">
         <h2 className="text-3xl font-black text-emerald-400 mb-4">Quiz Completed! 🎉</h2>
         <p className="text-xl text-white mb-6">You've answered all questions for your standard.</p>
         <div className="text-2xl font-black text-yellow-400">Final Score: {score}</div>
         <button 
           onClick={() => {
             setQuizCompleted(false);
             unaskedFormulasRef.current = [...filteredFormulas].sort(() => Math.random() - 0.5);
             setScore(0);
             generateQuiz();
           }}
           className="mt-8 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
         >
           Restart Quiz
         </button>
       </div>
    </PortalLayout>
  );

  if (!currentQuiz) return (
    <PortalLayout title="Maths Quiz" subtitle="Loading..." themeClass="theme-student">
       <div className="p-8 text-center text-white">Loading quiz...</div>
    </PortalLayout>
  );

  const quizTitle = currentQuiz.formulaObj.title[lang] || currentQuiz.formulaObj.title.en;

  return (
    <PortalLayout title="Maths Magic Quiz" subtitle="Test yourself!" themeClass="theme-student">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(l => l === "en" ? "ta" : "en")}
          className="p-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {lang === "en" ? "English" : "தமிழ்"}
        </button>
      </div>
      <div className="mt-4 bg-indigo-950 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-indigo-800/40 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 font-black tracking-widest text-xs md:text-sm uppercase mb-2" style={{ color: "#fde047", WebkitTextFillColor: "#fde047" }}>
              <i className="fi fi-sr-play-alt text-yellow-400 text-sm flex items-center" />
              Fill in the Blanks
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-3 md:mb-4 leading-tight !text-white" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
              {quizTitle}
            </h2>
            <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-center backdrop-blur-md">
              <span className="font-mono text-2xl md:text-4xl font-black text-yellow-300 drop-shadow-md" style={{ color: "#fde047", WebkitTextFillColor: "#fde047" }}>
                {currentQuiz.questionStr}
              </span>
            </div>
            {feedback === "correct" && <div className="text-emerald-400 font-black mt-3 md:mt-4 text-sm md:text-base animate-bounce">Great Job! +10 Points 🌟</div>}
            {feedback === "wrong" && <div className="text-rose-400 font-black mt-3 md:mt-4 text-sm md:text-base animate-pulse">Oops! Try again! 🤔</div>}
          </div>
          <div className="flex-1 w-full flex flex-col gap-3">
            <div className="text-right font-black mb-2 text-sm md:text-base" style={{ color: "#c7d2fe", WebkitTextFillColor: "#c7d2fe" }}>
              Score: <span className="text-white text-lg md:text-xl font-mono" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>{score}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {currentQuiz.options.map((opt: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => {
                    if (opt === currentQuiz.answer) {
                      setFeedback("correct");
                      setScore(s => s + 10);
                      setTimeout(generateQuiz, 1500);
                    } else {
                      setFeedback("wrong");
                    }
                  }}
                  disabled={feedback === "correct"}
                  className="p-3 md:p-4 bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 font-mono font-black text-lg md:text-xl rounded-xl md:rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 active:translate-y-1 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={generateQuiz} className="mt-4 text-indigo-300 hover:text-white font-bold text-sm underline text-right">Skip Question</button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
