"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { generateConceptMap } from "@/app/actions/conceptMap";

import Link from "next/link";

export default function ConceptExplanationPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conceptData, setConceptData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError("");
    try {
      const data = await generateConceptMap(topic);
      setConceptData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate concept map.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PortalLayout
      title="Concept Explanation"
      subtitle="Generate student-friendly visual concept maps using AI"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Input Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Generate Concept Map</h2>
            <Link
              href="/teacher/concept-explanation/saved"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <i className="fi fi-rr-bookmark" /> Saved Concept Maps
            </Link>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Solar System, Water Cycle)"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <i className="fi fi-rr-magic-wand" /> Generate
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 font-bold">{error}</p>}
        </div>

        {/* Output Section */}
        {conceptData && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] p-8 sm:p-12 min-h-[800px] border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center relative overflow-hidden">
              
              <div className="relative w-full max-w-5xl mx-auto flex flex-wrap justify-center gap-6 z-10" style={{ perspective: "1000px" }}>
              
              {/* Main Title Note - Center Top */}
              <div className="w-full flex justify-center mb-4">
                <div className="relative bg-yellow-200/90 dark:bg-yellow-300/90 text-slate-900 p-6 md:p-8 rounded-sm shadow-xl transform rotate-1 hover:rotate-0 transition-transform w-[90%] md:w-[600px] text-center border border-yellow-300/50">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-blue-300/40 opacity-70 -rotate-2 mix-blend-multiply"></div>
                  <h1 className="text-3xl md:text-5xl font-black mb-3 uppercase tracking-wider" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    = {conceptData.mainTitle} =
                  </h1>
                  <p className="text-lg md:text-2xl font-bold" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {conceptData.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 justify-center items-start w-full">
                
                {/* Left Column Notes */}
                <div className="flex flex-col gap-6 w-full md:w-[30%]">
                  
                  {/* WHAT IS IT? */}
                  <div className="relative bg-sky-200/90 dark:bg-sky-300/90 text-slate-900 p-6 rounded-sm shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                    {/* Push pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500 shadow-md border-b-2 border-blue-700 z-10">
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <h2 className="text-xl font-black mb-3 uppercase text-blue-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>WHAT IS IT?</h2>
                    <p className="text-sm font-bold leading-relaxed" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {conceptData.whatIsIt}
                    </p>
                  </div>

                  {/* HOW IT WORKS */}
                  <div className="relative bg-green-200/90 dark:bg-green-300/90 text-slate-900 p-5 rounded-sm shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-green-400/40 opacity-70 -rotate-1 mix-blend-multiply"></div>
                    <h2 className="text-xl font-black mb-3 uppercase text-green-900 border-b-2 border-green-400/50 pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>HOW IT WORKS</h2>
                    <ol className="text-sm font-bold leading-relaxed space-y-3 list-decimal pl-4" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {conceptData.howItWorks?.map((step: string, i: number) => (
                        <li key={i} className={i !== 0 ? "border-t border-green-300/50 pt-2" : ""}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* KEY JOBS */}
                  <div className="relative bg-pink-200/90 dark:bg-pink-300/90 text-slate-900 p-5 rounded-sm shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                     <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-5 bg-blue-300/40 opacity-70 rotate-2 mix-blend-multiply"></div>
                    <h2 className="text-xl font-black mb-3 uppercase text-pink-900" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>KEY JOBS</h2>
                    <ul className="text-sm font-bold leading-relaxed space-y-3" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {conceptData.keyJobs?.map((job: string, i: number) => (
                        <li key={i} className={`flex gap-2 ${i !== 0 ? "border-t border-pink-300/50 pt-2" : ""}`}><span>☑️</span> {job}</li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Center Note */}
                <div className="w-full md:w-[35%] flex justify-center z-20">
                  <div className="relative bg-white text-slate-900 p-4 pb-12 rounded-sm shadow-2xl transform rotate-1 w-full max-w-sm border border-slate-100 border-b-4 border-r-4">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-blue-400/30 opacity-70 -rotate-1 mix-blend-multiply z-30"></div>
                    
                    <div className="w-full aspect-[3/4] bg-orange-50/50 rounded border border-orange-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                       <i className="fi fi-rr-magic-wand text-6xl text-amber-500 mb-6 animate-pulse" />
                       <h3 className="text-xl font-black text-slate-800" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>{conceptData.mainTitle}</h3>
                       <p className="text-sm text-slate-500 font-bold mt-2" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>AI Generated Concept Map</p>
                    </div>
                  </div>
                </div>

                {/* Right Column Notes */}
                <div className="flex flex-col gap-6 w-full md:w-[30%]">
                  
                  {/* MAIN PARTS */}
                  <div className="relative bg-pink-100/90 dark:bg-pink-200/90 text-slate-900 p-6 rounded-sm shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                    {/* Push pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-orange-500 shadow-md border-b-2 border-orange-700 z-10">
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                    <h2 className="text-xl font-black mb-3 uppercase text-pink-900 border-b-2 border-pink-300/50 pb-1" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>MAIN PARTS</h2>
                    <ul className="text-sm font-bold leading-loose" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {conceptData.mainParts?.map((part: string, i: number) => (
                        <li key={i}>{(i + 1)}. {part}</li>
                      ))}
                    </ul>
                  </div>

                  {/* FUN FACTS */}
                  <div className="relative bg-yellow-200/90 dark:bg-yellow-300/90 text-slate-900 p-5 rounded-sm shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                    {/* Push pin */}
                    <div className="absolute -top-3 right-8 w-5 h-5 rounded-full bg-yellow-400 shadow-md border-b-2 border-yellow-600 z-10">
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    </div>
                    <h2 className="text-xl font-black mb-3 uppercase text-yellow-900 text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>FUN FACTS</h2>
                    <ul className="text-sm font-bold leading-relaxed space-y-3" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                      {conceptData.funFacts?.map((fact: string, i: number) => (
                        <li key={i} className={i !== conceptData.funFacts.length - 1 ? "border-b border-yellow-400/30 pb-2" : ""}>⭐ {fact}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full mt-2">
                
                {/* TAKE CARE! */}
                <div className="relative bg-sky-200/90 dark:bg-sky-300/90 text-slate-900 p-5 rounded-sm shadow-lg transform rotate-1 hover:rotate-0 transition-transform w-full md:w-72">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-blue-400/40 opacity-70 rotate-2 mix-blend-multiply"></div>
                  <h2 className="text-xl font-black mb-3 uppercase text-blue-900 text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>TAKE CARE!</h2>
                  <ul className="text-sm font-bold leading-relaxed space-y-2 list-disc pl-5" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {conceptData.takeCare?.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* DID YOU KNOW? */}
                <div className="relative bg-green-200/90 dark:bg-green-300/90 text-slate-900 p-5 rounded-sm shadow-lg transform -rotate-2 hover:rotate-0 transition-transform w-full md:w-72">
                  <h2 className="text-xl font-black mb-3 uppercase text-green-900 text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>DID YOU KNOW?</h2>
                  <div className="border-2 border-green-400/60 p-3 rounded-[2rem] text-sm font-bold leading-relaxed text-center" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                    {conceptData.didYouKnow}
                  </div>
                </div>

              </div>

              {/* Footer Banner */}
              <div className="w-full flex justify-center mt-4">
                 <div className="relative bg-yellow-300/90 dark:bg-yellow-400/90 text-slate-900 px-8 py-3 rounded-sm shadow-lg transform rotate-1 hover:rotate-0 transition-transform flex items-center justify-center gap-4">
                   {/* Push pin */}
                   <div className="absolute top-1 left-2 w-4 h-4 rounded-full bg-yellow-500 shadow-sm border-b border-yellow-700 z-10"></div>
                   <h2 className="text-lg font-black uppercase tracking-widest" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                     {conceptData.footerText}
                   </h2>
                 </div>
              </div>

            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => alert("Concept Map saved successfully!")}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <i className="fi fi-rr-disk" /> Save Concept Map
            </button>
          </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
