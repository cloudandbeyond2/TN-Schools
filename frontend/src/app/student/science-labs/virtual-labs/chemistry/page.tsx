"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  FlaskConical,
  Award,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
  Volume2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ChemistryLabSimulator() {
  const { data: session } = useSession();
  const [buretteVolume, setBuretteVolume] = useState(0); // mL of NaOH added
  const [swirling, setSwirling] = useState(false);
  const [isIndicatorAdded, setIsIndicatorAdded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isCompleted) setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Color change calculations: equivalence point is at 20mL of NaOH
  const getLiquidColor = () => {
    if (!isIndicatorAdded) return "bg-sky-50/50 dark:bg-sky-950/20"; // clear colorless liquid
    if (buretteVolume < 19.5) return "bg-sky-50/50 dark:bg-sky-950/20"; // still acidic (colorless)
    if (buretteVolume >= 19.5 && buretteVolume <= 20.5) return "bg-pink-300/40 dark:bg-pink-500/10"; // equivalence point (light pink)
    return "bg-pink-600/70 dark:bg-pink-500/45"; // over-titrated basic (deep pink)
  };

  const handleAddIndicator = () => {
    setIsIndicatorAdded(true);
    Swal.fire({
      title: language === "en" ? "Indicator Added!" : "காட்டி சேர்க்கப்பட்டது!",
      text: language === "en" ? "2 drops of Phenolphthalein added. Liquid is colorless." : "2 சொட்டுகள் பினோல்ப்தலீன் சேர்க்கப்பட்டது. திரவம் நிறமற்றது.",
      icon: "info",
      confirmButtonColor: "#10b981",
    });
  };

  const handleCheckAnswer = () => {
    const numericAns = parseFloat(studentAnswer);
    if (numericAns === 0.1) {
      setIsAnswerCorrect(true);
      setIsCompleted(true);
      Swal.fire({
        title: language === "en" ? "Correct Molarity!" : "சரியான மோலாரிட்டி!",
        text: language === "en" ? "NaOh Molarity is indeed 0.1 M. Excellent!" : "NaOh மோலாரிட்டி 0.1 M ஆகும். அருமை!",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
      // Save attempt to DB
      const studentId = (session?.user as any)?.studentId || (session?.user as any)?.id;
      if (studentId) {
        fetch(`${API_URL}/api/science/experiments/titration/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            timeSpentSec: timeElapsed,
            completed: true,
            score: 100,
            findings: `Titrated HCl with NaOH. Equivalence point reached at 20.0mL. Calculated Molarity: 0.1M.`
          })
        }).then(r => r.json())
          .then(data => {
            if (data.success) {
              Swal.fire({
                title: language === "en" ? "Marks Saved!" : "மதிப்பெண்கள் சேமிக்கப்பட்டன!",
                text: language === "en" ? "Lab report saved under your accomplishments." : "ஆய்வக அறிக்கை உங்கள் சாதனைகளின் கீழ் சேமிக்கப்பட்டது.",
                icon: "success",
                confirmButtonColor: "#10b981",
              });
            }
          });
      }
    } else {
      setIsAnswerCorrect(false);
      Swal.fire({
        title: language === "en" ? "Incorrect Molarity" : "தவறான மோலாரிட்டி",
        text: language === "en" ? "Re-evaluate standard formula N1V1 = N2V2." : "N1V1 = N2V2 சூத்திரத்தை மீண்டும் சரிபார்க்கவும்.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleReset = () => {
    setBuretteVolume(0);
    setIsIndicatorAdded(false);
    setIsCompleted(false);
    setStudentAnswer("");
    setIsAnswerCorrect(null);
    setTimeElapsed(0);
  };

  return (
    <PortalLayout
      title={language === "en" ? "Chemistry Lab: Acid-Base Titration" : "வேதியியல் ஆய்வகம்: அமில-கார நடுநிலையாக்கல்"}
      accentColor="#10b981"
      hideSidebar={true}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/student/science-labs"
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> {language === "en" ? "Back to Campus" : "வளாகத்திற்குத் திரும்பு"}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className="px-3.5 py-1.5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl text-xs font-bold transition-all"
          >
            🌐 {language === "en" ? "தமிழ்" : "English"}
          </button>
          <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold">
            ⏱️ {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Lab Simulator Column */}
        <div className="xl:col-span-2 glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col justify-between min-h-[480px]">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-1.5">
              <FlaskConical className="w-5 h-5 text-emerald-500" /> {language === "en" ? "Interactive Titration Setup" : "ஊடாடும் நடுநிலையாக்கல் வடிவமைப்பு"}
            </h3>

            {/* Visual simulation representation */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900/60 p-6 sm:p-8 rounded-2xl relative h-auto sm:h-72">
              
              {/* Burette Setup */}
              <div className="flex flex-col items-center relative">
                <div className="w-3.5 h-44 bg-slate-200/80 dark:bg-slate-800/80 border-2 border-slate-350 dark:border-slate-700 rounded-b relative flex flex-col justify-end overflow-hidden">
                  <div
                    className="bg-sky-400/50 w-full transition-all"
                    style={{ height: `${Math.max(0, 100 - (buretteVolume * 5))}%` }}
                  />
                  {/* Markings */}
                  <div className="absolute inset-y-0 right-1 flex flex-col justify-between text-[8px] text-slate-500 font-mono">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
                <div className="w-2.5 h-6 bg-slate-450 dark:bg-slate-600 flex items-center justify-center text-[8px] text-white font-bold select-none cursor-pointer">
                  VALVE
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-mono">{buretteVolume.toFixed(1)} mL added</span>
              </div>

              {/* Conical Flask Setup */}
              <div className="flex flex-col items-center relative">
                <div className={`w-28 h-32 relative border-4 border-slate-350 dark:border-slate-600 rounded-b-3xl flex flex-col justify-end overflow-hidden transition-all ${swirling ? "animate-pulse" : ""}`}>
                  <div className={`w-full h-12 transition-all ${getLiquidColor()} relative`}>
                    {swirling && (
                      <div className="absolute inset-0 bg-white/20 animate-spin w-full h-full rounded-full" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-mono">20.0 mL HCl Solution</span>
              </div>
            </div>
          </div>

          {/* Controller and sliders */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handleAddIndicator}
                disabled={isIndicatorAdded}
                className="px-4 py-2 border-2 border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                💧 {language === "en" ? "Add Phenolphthalein Indicator" : "பினோல்ப்தலீன் காட்டி சேர்க்கவும்"}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {language === "en" ? "Reset Experiment" : "ஆய்வை மீட்டமை"}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                {language === "en" ? "Release NaOH from Burette Valve" : "பியூரெட் வால்வில் இருந்து NaOH-ஐ வெளியிடவும்"}
              </label>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={buretteVolume}
                disabled={!isIndicatorAdded}
                onChange={(e) => {
                  setBuretteVolume(parseFloat(e.target.value));
                  setSwirling(true);
                  setTimeout(() => setSwirling(false), 500);
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Calculations and Theory Column */}
        <div className="space-y-6 text-left">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-500" /> {language === "en" ? "Molarity Calculations" : "மோலாரிட்டி கணக்கீடுகள்"}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-4">
              {language === "en" ? "Determine molarity using formula:" : "சூத்திரத்தைப் பயன்படுத்தி மோலாரிட்டியைத் தீர்மானிக்கவும்:"}  
              <br />
              <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-indigo-500 dark:text-indigo-400 font-mono text-sm block mt-2 text-center">
                M1 * V1 = M2 * V2
              </code>
            </p>
            
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-150 dark:border-slate-900/60 text-xs font-mono space-y-1 text-slate-650 dark:text-slate-400">
                <div>• HCl Vol (V1) = 20.0 mL</div>
                <div>• HCl Molarity (M1) = 0.1 M</div>
                <div>• NaOH Vol (V2) = 20.0 mL (titration endpoint)</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  {language === "en" ? "Calculate Molarity of NaOH (M2)" : "NaOH (M2)-ன் மோலாரிட்டியை கணக்கிடவும்"}
                </label>
                <input
                  type="number"
                  step={0.01}
                  placeholder="e.g. 0.1"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-850 dark:text-slate-100 font-mono"
                />
              </div>

              <button
                onClick={handleCheckAnswer}
                disabled={!isIndicatorAdded || buretteVolume === 0}
                className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {language === "en" ? "Verify Calculation" : "மதிப்பைச் சரிபார்"}
              </button>
            </div>
          </div>

          {/* Safety & Theory */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-1.5">
              <Volume2 className="w-5 h-5 text-indigo-500 animate-pulse" /> {language === "en" ? "Tamil / English Audio Guide" : "தமிழ் / ஆங்கில ஆடியோ வழிகாட்டி"}
            </h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              {language === "en" 
                ? "HCl reacts with NaOH to form NaCl and water. At the equivalence point, the solution turns light pink because all acid has been neutralized."
                : "ஹைட்ரோகுளோரிக் அமிலம் சோடியம் ஹைட்ராக்சைடுடன் வினைபுரிந்து சோடியம் குளோரைடு மற்றும் தண்ணீரை உருவாக்குகிறது. நடுநிலையாக்கல் புள்ளியில் கரைசல் வெளிர் இளஞ்சிவப்பு நிறமாக மாறும்."
              }
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
