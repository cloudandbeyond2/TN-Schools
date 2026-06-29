"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import SlideVisual from "@/components/SlideVisual";
import Swal from "sweetalert2";

function StudioViewContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const urlTopic = searchParams.get("topic");
  const urlSubject = searchParams.get("subject");
  const tool = searchParams.get("tool");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tools State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [podcastIndex, setPodcastIndex] = useState(-1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoScene, setVideoScene] = useState(0);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (planId && planId !== "temp-unsaved") {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/api/teacher/lessons/${planId}`);
          const json = await res.json();
          if (json.success && json.data) {
            setCurrentPlan(json.data);
          } else {
            throw new Error(json.error || "Failed to load lesson plan");
          }
        } catch (err) {
          console.error("Error loading lesson plan", err);
          Swal.fire({
            icon: "error",
            title: "Plan Not Found",
            text: "Could not retrieve the saved chapter data from database.",
          });
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const tempData = localStorage.getItem("tempStudioData");
          if (tempData) {
            setCurrentPlan(JSON.parse(tempData));
          } else {
             Swal.fire({
               icon: "error",
               title: "No Data",
               text: "Could not find temp studio data in local storage.",
             });
          }
        } catch (e) {
          console.error("Failed to parse temp data", e);
        }
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, API_URL]);

  useEffect(() => {
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakPodcast = (script: any[]) => {
    if (isPlayingPodcast) {
      window.speechSynthesis.cancel();
      setIsPlayingPodcast(false);
      setPodcastIndex(-1);
      return;
    }

    setIsPlayingPodcast(true);
    let index = 0;
    setPodcastIndex(0);

    const speakNext = () => {
      if (index >= script.length || !isPlayingPodcast) {
        setIsPlayingPodcast(false);
        setPodcastIndex(-1);
        return;
      }

      setPodcastIndex(index);
      const line = script[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      
      const voices = window.speechSynthesis.getVoices();
      if (line.speaker.includes("Meera")) {
        const tamilVoice = voices.find(v => v.lang.includes("ta"));
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google US English"));
        utterance.voice = tamilVoice || femaleVoice || voices[0];
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else {
        const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google UK English Male"));
        utterance.voice = maleVoice || voices[0];
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        setIsPlayingPodcast(false);
        setPodcastIndex(-1);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const toggleVideoPlayback = (storyboard: any[]) => {
    if (isVideoPlaying) {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      setIsVideoPlaying(false);
    } else {
      setIsVideoPlaying(true);
      if (videoScene >= storyboard.length) setVideoScene(0);
      
      const interval = setInterval(() => {
        setVideoScene((prev) => {
          if (prev < storyboard.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsVideoPlaying(false);
            return prev;
          }
        });
      }, 5000);
      videoIntervalRef.current = interval;
    }
  };

  const theme = {
    bg: isDarkMode ? "bg-slate-950" : "bg-slate-50",
    bgCard: isDarkMode ? "bg-slate-900" : "bg-white",
    bgCardSoft: isDarkMode ? "bg-slate-900/50" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800" : "border-slate-200",
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center text-center p-6`}>
        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-6" />
        <h3 className={`${theme.text} font-semibold text-lg`}>Loading Intelligence Studio...</h3>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center text-center p-6`}>
        <h1 className="text-2xl font-bold text-red-500 mb-4">Plan Not Found</h1>
        <button onClick={() => window.close()} className={`px-6 py-2 ${theme.bgCard} ${theme.text} hover:scale-105 border ${theme.border} transition-all rounded-xl font-bold`}>Close Window</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Header */}
      <header className={`p-4 sm:px-8 border-b ${theme.border} ${theme.bgCardSoft} backdrop-blur-md flex justify-between items-center z-10 shrink-0`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.close()}
            className={`px-4 py-2 rounded-xl border ${theme.border} ${theme.bgCard} hover:scale-105 transition-transform text-sm font-bold flex items-center gap-2 shadow-sm`}
          >
            ← Close Window
          </button>
          <div className="hidden sm:block">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-0.5">Intelligence Studio</span>
            <h2 className={`font-black text-sm`}>{currentPlan.topic}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} text-xs font-bold uppercase tracking-wider`}>
            {tool} View
          </span>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border ${theme.border} ${theme.bgCard} hover:scale-105 transition-transform shadow-sm`}
            title="Toggle Theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col relative">
        
        {tool === "slides" && (
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full h-full">
            {(() => {
              const slides = currentPlan.planData?.slides || ([{title: "Intro", subtitle: "Concept", bullets: ["Summary"], graphicType: "concept", graphicData: {label: "X", values: ["Y"]}}] as any[]);
              const slide = slides[activeSlide] || slides[0];
              const slideNum = activeSlide + 1;
              const totalSlides = slides.length;
              
              const accentPalette = [
                { from: "from-blue-600", to: "to-indigo-600", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600" },
                { from: "from-emerald-600", to: "to-teal-600", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600" },
                { from: "from-violet-600", to: "to-purple-600", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-600" },
                { from: "from-amber-500", to: "to-orange-500", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-500" },
              ];
              const accent = accentPalette[activeSlide % accentPalette.length];

              return (
                <div className="flex flex-col h-full gap-6 flex-1 min-h-[600px]">
                  <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 border border-slate-200`}>
                    <div className={`h-2 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />
                    <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-12 flex-1 relative">
                      <div className="flex-1 flex flex-col justify-center">
                        <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${accent.badge} w-max mb-6 shadow-md`}>Slide {slideNum} / {totalSlides}</span>
                        <h1 className="font-black text-4xl lg:text-5xl text-slate-900 mb-4 leading-tight">{slide.title}</h1>
                        <p className={`text-lg font-bold ${accent.text} uppercase tracking-wider mb-10`}>{slide.subtitle || "Concept Overview"}</p>
                        <ul className="space-y-6">
                          {slide.bullets?.map((b: string, idx: number) => (
                            <li key={idx} className="flex gap-5 text-slate-700 text-lg">
                              <span className={`w-8 h-8 rounded-full text-white text-sm font-black flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br ${accent.from} ${accent.to} shadow-sm`}>{idx+1}</span>
                              <span className="leading-relaxed font-medium">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="w-full lg:w-[450px] shrink-0 bg-slate-50 rounded-3xl border border-slate-100 p-6 flex flex-col shadow-inner">
                        <SlideVisual graphicType={slide.graphicType} graphicData={slide.graphicData} illustrationPrompt={slide.illustrationPrompt} animationSuggestion={slide.animationSuggestion} title={slide.title} subtitle={slide.subtitle} accent={accent} />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center p-4 sm:p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm shrink-0`}>
                    <button disabled={activeSlide === 0} onClick={() => setActiveSlide(p => p-1)} className={`px-6 py-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} font-black text-sm disabled:opacity-30 transition-all uppercase tracking-wider`}>← Previous</button>
                    <div className="flex gap-3 hidden md:flex">
                      {slides.map((_:any, i:number) => (
                        <button key={i} onClick={() => setActiveSlide(i)} className={`h-3 rounded-full transition-all duration-300 ${i === activeSlide ? `w-12 bg-gradient-to-r ${accent.from} ${accent.to} shadow-md` : `w-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'}`}`} />
                      ))}
                    </div>
                    <button disabled={activeSlide === totalSlides - 1} onClick={() => setActiveSlide(p => p+1)} className={`px-6 py-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} font-black text-sm disabled:opacity-30 transition-all uppercase tracking-wider`}>Next Slide →</button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tool === "visualExplain" && (
          <div className={`flex-1 ${theme.bgCard} rounded-3xl border ${theme.border} shadow-xl overflow-hidden`}>
            <InteractiveInfographic topic={currentPlan.topic} subject={currentPlan.subject} data={currentPlan.planData?.infographic || (currentPlan as any).infographic} />
          </div>
        )}

        {tool === "podcast" && (
          <div className="max-w-4xl mx-auto w-full space-y-8 py-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-10 rounded-[3rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center text-white gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
              <div>
                <span className="px-4 py-1.5 rounded-full bg-white/20 font-black text-xs uppercase tracking-widest backdrop-blur-md mb-4 inline-block shadow-sm">AI Audio Generation</span>
                <h1 className="font-black text-4xl sm:text-5xl mb-3 leading-tight drop-shadow-sm">{currentPlan.topic}</h1>
                <p className="text-lg font-medium opacity-95 max-w-lg drop-shadow-sm">Listen to the AI generated host summary featuring bilingual context.</p>
              </div>
              <button 
                onClick={() => speakPodcast(currentPlan.planData?.podcast?.script || [])} 
                className="w-24 h-24 shrink-0 rounded-full bg-white text-orange-600 flex items-center justify-center text-4xl shadow-2xl hover:scale-110 transition-transform z-10 border-4 border-white/40"
              >
                {isPlayingPodcast ? "⏹" : "▶️"}
              </button>
            </div>
            
            <div className="space-y-4">
              {currentPlan.planData?.podcast?.script?.map((line:any, idx:number) => (
                <div key={idx} className={`p-6 rounded-3xl border transition-all duration-300 ${podcastIndex === idx ? (isDarkMode ? 'bg-orange-500/20 border-orange-500/50 scale-[1.02] shadow-md' : 'bg-orange-50 border-orange-300 scale-[1.02] shadow-md') : `${theme.bgCard} ${theme.border}`}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                      {line.speaker[0]}
                    </div>
                    <div className="font-black text-xs uppercase text-orange-500 tracking-widest">{line.speaker}</div>
                  </div>
                  <p className={`${theme.text} leading-relaxed text-lg font-medium pl-11`}>{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tool === "video" && (
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center gap-6 py-8">
            <div className={`w-full rounded-[2rem] p-8 sm:p-12 relative flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} shadow-sm`}>
              
              <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'} shadow-sm`}>
                Scene {videoScene + 1}
              </div>
              
              <div className="w-full aspect-video max-w-3xl mx-auto rounded-3xl overflow-hidden relative mt-8 mb-8 group bg-slate-900 border border-slate-700/20 shadow-2xl">
                <img 
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent((currentPlan.planData?.videoStoryboard?.[videoScene]?.visualDescription || "educational scene") + ", highly detailed, 3d, cinematic, beautiful educational animation style, vibrant")}?width=1280&height=720&nologo=true`} 
                  alt="Generated Scene"
                  className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-110"
                />
                
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 flex flex-col items-center justify-end text-center pointer-events-none">
                  <p className="text-white/90 text-sm md:text-base font-semibold max-w-2xl drop-shadow-md">
                     {currentPlan.planData?.videoStoryboard?.[videoScene]?.visualDescription}
                  </p>
                </div>
              </div>

              <div className={`w-full max-w-xl rounded-2xl p-8 text-sm sm:text-base leading-relaxed text-center shadow-lg ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-500'}`}>
                <p className="mb-6">
                  {currentPlan.planData?.videoStoryboard?.[videoScene]?.narrationText}
                </p>
                <p className="font-tamil">
                  {currentPlan.planData?.videoStoryboard?.[videoScene]?.subtitles}
                </p>
              </div>

            </div>
            
            {/* Control Bar */}
            <div className={`flex items-center justify-between p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border ${theme.border}`}>
              <button 
                onClick={() => toggleVideoPlayback(currentPlan.planData?.videoStoryboard || [])} 
                className={`px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-all`}
              >
                {isVideoPlaying ? "PAUSE VIDEO SIMULATION" : "PLAY VIDEO SIMULATION"}
              </button>
              
              <div className="flex items-center gap-2 pr-2">
                 {currentPlan.planData?.videoStoryboard?.map((s:any, idx:number) => (
                   <button 
                     key={idx} 
                     onClick={() => { 
                       if(videoIntervalRef.current) clearInterval(videoIntervalRef.current); 
                       setIsVideoPlaying(false); 
                       setVideoScene(idx); 
                     }} 
                     className={`w-8 h-8 rounded-full font-black text-xs transition-all flex items-center justify-center ${videoScene === idx ? 'bg-rose-500 text-white' : `${isDarkMode?'bg-slate-700 hover:bg-slate-600':'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}`}
                   >
                     {idx + 1}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        )}

        {tool === "bilingual" && (
          <div className="max-w-5xl mx-auto w-full py-8">
            <div className={`p-8 rounded-[2rem] ${theme.bgCard} border ${theme.border} shadow-xl overflow-hidden`}>
              <div className="mb-8">
                <h3 className={`font-black text-2xl ${theme.text} mb-2`}>Bilingual Glossary Matrix</h3>
                <p className={`${theme.textMuted}`}>Key terms mapped to Tamil equivalents to support regional learners.</p>
              </div>
              
              <div className={`rounded-2xl border ${theme.border} overflow-hidden`}>
                <table className="w-full text-left">
                  <thead className={`${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-100/80'} backdrop-blur-md`}>
                    <tr className={`border-b ${theme.border}`}>
                      <th className={`py-5 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>English Term</th>
                      <th className={`py-5 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>Tamil Equivalent</th>
                      <th className={`py-5 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>Pronunciation</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {currentPlan.planData?.bilingual?.map((item:any, i:number) => (
                      <tr key={i} className={`hover:${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                        <td className={`py-5 px-6 font-bold text-lg ${theme.text}`}>{item.english}</td>
                        <td className="py-5 px-6 font-bold text-indigo-500 font-tamil text-2xl">{item.tamil}</td>
                        <td className={`py-5 px-6 text-base font-medium ${theme.textMuted}`}>{item.pronunciation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tool === "assessment" && (
          <div className="max-w-5xl mx-auto w-full space-y-6 py-8">
            <div className="mb-6">
               <h3 className={`font-black text-3xl ${theme.text} mb-2`}>Exit Ticket Assessment</h3>
               <p className={`${theme.textMuted} text-lg`}>End-of-class multiple choice questions to verify student comprehension.</p>
            </div>
            
            <div className="grid gap-6">
              {currentPlan.planData?.exitTickets?.map((ticket:any, i:number) => (
                <div key={i} className={`p-8 rounded-[2rem] ${theme.bgCard} border ${theme.border} shadow-xl hover:shadow-2xl transition-shadow`}>
                  <div className="flex gap-4 mb-6 items-start">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500 text-white font-black flex items-center justify-center text-lg shadow-md">
                      {i+1}
                    </div>
                    <h4 className={`font-black text-xl leading-relaxed ${theme.text}`}>{ticket.question}</h4>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-8 pl-14">
                    {ticket.options?.map((opt:string, oIdx:number) => (
                      <div key={oIdx} className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border ${theme.text} font-medium text-base hover:scale-[1.02] transition-transform cursor-default`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  
                  <div className={`ml-14 p-6 rounded-2xl ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'} border relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
                    <p className={`text-emerald-600 font-black text-lg mb-2 uppercase tracking-wide`}>
                      Answer: {ticket.answer}
                    </p>
                    <p className={`text-emerald-700 dark:text-emerald-500/90 text-base font-medium leading-relaxed`}>
                      {ticket.rationale}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudioViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>}>
      <StudioViewContent />
    </Suspense>
  );
}
