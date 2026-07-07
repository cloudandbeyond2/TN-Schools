"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  Atom,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
  Volume2,
  Lightbulb,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PhysicsCircuitLab() {
  const { data: session } = useSession();
  const [voltage, setVoltage] = useState(5); // Volts
  const [resistance, setResistance] = useState(10); // Ohms
  const [switchOn, setSwitchOn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [language, setLanguage] = useState<"en" | "ta">("en");

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isCompleted) setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Calculate current (I = V / R)
  const current = switchOn ? (voltage / resistance).toFixed(2) : "0.00";
  const bulbGlowOpacity = switchOn ? Math.min(1, (voltage / resistance) * 1.5) : 0;

  const handleToggleSwitch = () => {
    setSwitchOn(!switchOn);
    if (!switchOn) {
      Swal.fire({
        title: language === "en" ? "Circuit Closed!" : "மின்சுற்று இணைக்கப்பட்டது!",
        text: language === "en" ? "Electricity is now flowing through the loop." : "மின்சுற்று வழியே மின்னோட்டம் பாய்கிறது.",
        icon: "info",
        confirmButtonColor: "#10b981",
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleVerifyOhmsLaw = () => {
    if (!switchOn) {
      Swal.fire({
        title: language === "en" ? "Switch is Off" : "மின்விசை அணைக்கப்பட்டுள்ளது",
        text: language === "en" ? "Turn on the switch to flow current first." : "மின்னோட்டத்தை இயக்க மின்விசையை அழுத்தவும்.",
        icon: "warning",
        confirmButtonColor: "#f59e0b"
      });
      return;
    }

    setIsCompleted(true);
    Swal.fire({
      title: language === "en" ? "Verification Successful!" : "சரிபார்ப்பு வெற்றிகரமாக முடிந்தது!",
      text: `Ohm's Law verified! V = I * R (${voltage}V = ${current}A * ${resistance}Ω).`,
      icon: "success",
      confirmButtonColor: "#10b981"
    });

    // Save attempt to DB
    const studentId = (session?.user as any)?.studentId || (session?.user as any)?.id;
    if (studentId) {
      fetch(`${API_URL}/api/science/experiments/ohms-law/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          timeSpentSec: timeElapsed,
          completed: true,
          score: 100,
          findings: `Verified Ohm's Law in series circuit. Connected battery (${voltage}V) and resistor (${resistance}Ω). Current was measured as ${current}A.`
        })
      }).then(r => r.json())
        .then(data => {
          if (data.success) {
            Swal.fire({
              title: language === "en" ? "Score Logged!" : "மதிப்பெண் சேமிக்கப்பட்டது!",
              text: language === "en" ? "Experiment completion saved in your record card." : "ஆய்வு நிறைவு உங்கள் சாதனை அட்டையில் சேமிக்கப்பட்டது.",
              icon: "success",
              confirmButtonColor: "#10b981"
            });
          }
        });
    }
  };

  const handleReset = () => {
    setVoltage(5);
    setResistance(10);
    setSwitchOn(false);
    setIsCompleted(false);
    setTimeElapsed(0);
  };

  return (
    <PortalLayout
      title={language === "en" ? "Physics Lab: Ohm's Law & Circuit Sandbox" : "இயற்பியல் ஆய்வகம்: ஓமின் விதி & மின்சுற்று"}
      accentColor="#6366f1"
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
            className="px-3.5 py-1.5 border border-indigo-500/20 text-indigo-650 dark:text-indigo-400 bg-indigo-500/5 rounded-xl text-xs font-bold transition-all"
          >
            🌐 {language === "en" ? "தமிழ்" : "English"}
          </button>
          <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold">
            ⏱️ {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
        {/* Circuit Board representation */}
        <div className="xl:col-span-2 glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col justify-between min-h-[480px]">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-1.5">
              <Atom className="w-5 h-5 text-indigo-500" /> {language === "en" ? "Interactive Circuit Breadboard" : "ஊடாடும் மின்சுற்று பலகை"}
            </h3>

            {/* Visual simulation representation */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-900/60 p-6 sm:p-8 rounded-2xl relative h-auto sm:h-72">
              
              {/* Battery Block */}
              <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center w-24 shrink-0">
                <span className="text-xl">🔋</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 mt-1 block">Battery</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">{voltage} Volts</span>
              </div>

              {/* Wire Connector representation */}
              <div className="hidden sm:block flex-1 h-1 bg-slate-300 dark:bg-slate-700 relative">
                {switchOn && (
                  <div className="absolute top-1/2 left-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping -translate-y-1/2" />
                )}
              </div>
              <div className="block sm:hidden w-1 h-8 bg-slate-300 dark:bg-slate-700 relative">
                {switchOn && (
                  <div className="absolute left-1/2 top-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping -translate-x-1/2" />
                )}
              </div>

              {/* Switch block */}
              <div
                onClick={handleToggleSwitch}
                className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center w-24 shrink-0 cursor-pointer hover:border-indigo-500/40 transition-colors"
              >
                {switchOn ? (
                  <ToggleRight className="w-8 h-8 text-indigo-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 mt-1 block">Switch</span>
              </div>

              <div className="hidden sm:block flex-1 h-1 bg-slate-300 dark:bg-slate-700" />
              <div className="block sm:hidden w-1 h-8 bg-slate-300 dark:bg-slate-700" />

              {/* Lightbulb Block */}
              <div className="flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center w-24 relative">
                <Lightbulb
                  className="w-8 h-8 transition-all"
                  style={{
                    color: switchOn ? "#eab308" : "#94a3b8",
                    filter: switchOn ? `drop-shadow(0 0 ${voltage * 2}px rgba(234, 179, 8, ${bulbGlowOpacity}))` : "none"
                  }}
                />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 mt-1 block">Bulb</span>
                {switchOn && (
                  <span className="text-[9px] text-emerald-500 font-mono mt-0.5">Glow: {Math.round(bulbGlowOpacity * 100)}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Rheostat and Voltage slider controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>⚡ {language === "en" ? "Source Voltage (V)" : "மூல மின்னழுத்தம் (V)"}</span>
                <span className="font-mono text-indigo-500">{voltage} V</span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={voltage}
                onChange={(e) => setVoltage(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>⚙️ {language === "en" ? "Resistor Resistance (R)" : "மின்தடையின் அளவு (R)"}</span>
                <span className="font-mono text-indigo-500">{resistance} Ω</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={resistance}
                onChange={(e) => setResistance(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {language === "en" ? "Reset Experiment" : "ஆய்வை மீட்டமை"}
            </button>
          </div>
        </div>

        {/* Meter Readings & Ohm's Verification */}
        <div className="space-y-6 text-left">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" /> {language === "en" ? "Digital Multimeter" : "மின்னோட்ட அளவீடு"}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-4">
              {language === "en" ? "Formula: I = V / R. Let's observe voltmeter readings." : "சூத்திரம்: I = V / R. வோல்ட்மீட்டர் அளவீடுகளைக் கவனிக்கவும்."}
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-900/60 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-black">Voltage (V)</div>
                  <div className="text-xl font-extrabold text-slate-800 dark:text-slate-250 font-mono mt-1">{switchOn ? voltage : 0} V</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-900/60 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-black">Current (I)</div>
                  <div className="text-xl font-extrabold text-indigo-500 dark:text-indigo-400 font-mono mt-1">{current} A</div>
                </div>
              </div>

              <button
                onClick={handleVerifyOhmsLaw}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {language === "en" ? "Verify Ohm's Law" : "ஓமின் விதியைச் சரிபார்"}
              </button>
            </div>
          </div>

          {/* Theory guide */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-1.5">
              <Volume2 className="w-5 h-5 text-indigo-500 animate-pulse" /> {language === "en" ? "Bilingual Narration Guide" : "இருமொழி வழிகாட்டி"}
            </h4>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              {language === "en" 
                ? "Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points."
                : "ஒரு கடத்தியின் வழியே பாயும் மின்னோட்டம், அதன் முனைகளுக்கு இடைப்பட்ட மின்னழுத்த வேறுபாட்டிற்கு நேர் விகிதத்தில் இருக்கும்."
              }
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
