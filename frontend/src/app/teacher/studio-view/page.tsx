"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import SlideVisual from "@/components/SlideVisual";
import Swal from "sweetalert2";

// Realistic AI image via Pollinations (free, no key)
const pol = (prompt: string, w = 900, h = 650) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true`;

// Lazy-generation config per Studio tool
const LAZY: Record<string, { field: string; url: string; label: string }> = {
  slides: { field: "slides", url: "generate-lesson-slides", label: "concept slides" },
  assessment: { field: "quiz", url: "generate-lesson-quiz", label: "quiz questions" },
  podcast: { field: "podcast", url: "generate-lesson-podcast", label: "audio podcast" },
  video: { field: "videoStoryboard", url: "generate-lesson-video", label: "video storyboard" },
};

// Content-matched Flaticon icon for a slide, by graphicType
const slideTypeIcon: Record<string, string> = {
  hero: "fi-sr-graduation-cap",
  concept: "fi-sr-bulb",
  application: "fi-sr-globe",
  process: "fi-sr-diagram-project",
  formula: "fi-sr-chart-histogram",
  comparison: "fi-sr-chart-pie-alt",
  experiment: "fi-sr-diagram-project",
  quiz: "fi-sr-checkbox",
  summary: "fi-sr-clipboard-list",
};
const bulletIcons = ["fi-sr-badge-check", "fi-sr-bulb", "fi-sr-diagram-project", "fi-sr-chart-histogram", "fi-sr-globe", "fi-sr-book-alt"];

function StudioViewContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const tool = searchParams.get("tool") || "";

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

  // Quiz interactive state
  const [quizPick, setQuizPick] = useState<Record<number, string>>({});

  const [genLoading, setGenLoading] = useState(false);

  // Track whether the current slide's AI image failed to load
  const [slideImgError, setSlideImgError] = useState(false);
  useEffect(() => { setSlideImgError(false); }, [activeSlide]);

  // Sync theme with the app's chosen theme on first paint
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

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
          Swal.fire({ icon: "error", title: "Plan Not Found", text: "Could not retrieve the saved chapter data from database." });
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const tempData = localStorage.getItem("tempStudioData");
          if (tempData) setCurrentPlan(JSON.parse(tempData));
          else Swal.fire({ icon: "error", title: "No Data", text: "Could not find temp studio data in local storage." });
        } catch (e) {
          console.error("Failed to parse temp data", e);
        }
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, API_URL]);

  // Generic lazy generation for the active tool (slides / quiz / podcast / video)
  useEffect(() => {
    const cfg = LAZY[tool];
    if (!cfg || !currentPlan || genLoading) return;
    const existing = currentPlan.planData?.[cfg.field];
    const hasData = cfg.field === "podcast" ? existing?.script?.length : existing?.length;
    if (hasData) return;

    (async () => {
      setGenLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/ai/${cfg.url}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: currentPlan.grade, subject: currentPlan.subject, topic: currentPlan.topic }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const value = json.data;
          setCurrentPlan((prev: any) => ({ ...prev, planData: { ...prev.planData, [cfg.field]: value } }));
          if (planId && planId !== "temp-unsaved") {
            fetch(`${API_URL}/api/teacher/lessons/${planId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planData: { ...currentPlan.planData, [cfg.field]: value } }),
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error(`${cfg.label} generation failed`, e);
      } finally {
        setGenLoading(false);
      }
    })();
  }, [tool, currentPlan, genLoading, API_URL, planId]);

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
      if (index >= script.length) {
        setIsPlayingPodcast(false);
        setPodcastIndex(-1);
        return;
      }
      setPodcastIndex(index);
      const line = script[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      const voices = window.speechSynthesis.getVoices();
      if (line.speaker.includes("Meera")) {
        const tamilVoice = voices.find((v) => v.lang.includes("ta"));
        const femaleVoice = voices.find((v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google US English"));
        utterance.voice = tamilVoice || femaleVoice || voices[0];
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else {
        const maleVoice = voices.find((v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google UK English Male"));
        utterance.voice = maleVoice || voices[0];
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      }
      utterance.onend = () => { index++; speakNext(); };
      utterance.onerror = () => { setIsPlayingPodcast(false); setPodcastIndex(-1); };
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
          if (prev < storyboard.length - 1) return prev + 1;
          clearInterval(interval);
          setIsVideoPlaying(false);
          return prev;
        });
      }, 6000);
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

  const toolMeta: Record<string, { label: string; icon: string; chip: string }> = {
    slides: { label: "Slide Deck", icon: "fi-sr-diagram-project", chip: "from-blue-500 to-indigo-600" },
    visualExplain: { label: "Infographic", icon: "fi-sr-chart-histogram", chip: "from-emerald-500 to-teal-600" },
    podcast: { label: "Audio Podcast", icon: "fi-sr-comments", chip: "from-amber-500 to-orange-600" },
    video: { label: "Explainer Video", icon: "fi-sr-film", chip: "from-rose-500 to-pink-600" },
    bilingual: { label: "Bilingual Glossary", icon: "fi-sr-globe", chip: "from-violet-500 to-purple-600" },
    assessment: { label: "Quiz & Assessment", icon: "fi-sr-checkbox", chip: "from-sky-500 to-indigo-600" },
  };
  const meta = toolMeta[tool] || { label: tool, icon: "fi-sr-brain", chip: "from-slate-500 to-slate-700" };

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

  const genActive = genLoading && LAZY[tool];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col font-sans transition-colors duration-300`}>

      {/* Header */}
      <header className={`p-4 sm:px-8 border-b ${theme.border} ${theme.bgCardSoft} backdrop-blur-md flex justify-between items-center z-10 shrink-0 sticky top-0`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.close()}
            className={`px-4 py-2 rounded-xl border ${theme.border} ${theme.bgCard} hover:scale-105 transition-transform text-sm font-bold flex items-center gap-2 shadow-sm`}
          >
            <i className="fi fi-sr-cross-small leading-none" /> Close
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${meta.chip} text-white text-lg shadow-md`}>
              <i className={`fi ${meta.icon} leading-none`} />
            </span>
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-0.5">{meta.label}</span>
              <h2 className="font-black text-sm">{currentPlan.topic}</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-flex px-3 py-1 rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-200"} text-xs font-bold uppercase tracking-wider items-center gap-1.5`}>
            <i className="fi fi-sr-graduation-cap leading-none text-amber-500" /> {currentPlan.grade} · {currentPlan.subject}
          </span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-10 rounded-lg border ${theme.border} ${theme.bgCard} hover:scale-105 transition-transform shadow-sm flex items-center justify-center`}
            title="Toggle Theme"
          >
            <i className={`fi ${isDarkMode ? "fi-sr-brightness" : "fi-sr-moon-stars"} leading-none`} />
          </button>
        </div>
      </header>

      {/* Main Content Area — full cover width */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8 flex flex-col relative">

        {/* Generic generation loader */}
        {genActive && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-24">
            <div className="relative w-20 h-20">
              <div className={`w-20 h-20 rounded-full border-4 bg-gradient-to-br ${meta.chip} opacity-20`} />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin" style={{ color: "#6366f1" }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color: "#6366f1" }}>
                <i className={`fi ${meta.icon} leading-none`} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">Generating {LAZY[tool].label}…</h3>
              <p className="text-sm text-slate-500">AI is building this for “{currentPlan.topic}”. This takes ~20–40 seconds.</p>
            </div>
          </div>
        )}

        {/* ================= SLIDES ================= */}
        {tool === "slides" && !genActive && (currentPlan.planData?.slides?.length) && (() => {
          const slides = currentPlan.planData.slides;
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
          const typeIcon = slideTypeIcon[slide.graphicType] || "fi-sr-bulb";
          const imgPrompt = `${slide.illustrationPrompt || slide.title}, ${currentPlan.subject}, ${currentPlan.topic}, educational illustration, realistic, highly detailed, clean bright background`;

          return (
            <div className="flex-1 flex flex-col w-full gap-6 pb-8">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 border border-slate-200">
                <div className={`h-2 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />
                <div className="p-6 md:p-10 xl:p-12 flex flex-col lg:flex-row gap-10 flex-1 relative">
                  {/* Left: content */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl text-white text-xl bg-gradient-to-br ${accent.from} ${accent.to} shadow-md`}>
                        <i className={`fi ${typeIcon} leading-none`} />
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white ${accent.badge} shadow-md`}>Slide {slideNum} / {totalSlides}</span>
                    </div>
                    <h1 className="font-black text-3xl lg:text-5xl text-slate-900 mb-3 leading-tight">{slide.title}</h1>
                    <p className={`text-base lg:text-lg font-bold ${accent.text} uppercase tracking-wider mb-8`}>{slide.subtitle || "Concept Overview"}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {slide.bullets?.map((b: string, idx: number) => {
                        const splitIdx = b.indexOf(":");
                        const hasTitle = splitIdx > 0 && splitIdx < 50;
                        const bTitle = hasTitle ? b.substring(0, splitIdx) : `Key Point ${idx + 1}`;
                        const bDesc = hasTitle ? b.substring(splitIdx + 1).trim() : b;
                        return (
                          <div key={idx} className="p-5 rounded-3xl border border-slate-100 bg-slate-50 flex items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition-all">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${accent.from} ${accent.to} shadow-md text-white text-lg`}>
                              <i className={`fi ${bulletIcons[idx % bulletIcons.length]} leading-none`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className={`font-bold ${accent.text} text-base mb-1`}>{bTitle}</h4>
                              <p className="text-slate-600 leading-relaxed text-sm font-medium">{bDesc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(slide.teacherNotes || slide.studentActivity) && (
                      <div className="grid sm:grid-cols-2 gap-4 mt-6">
                        {slide.teacherNotes && (
                          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-3">
                            <i className="fi fi-sr-graduation-cap text-indigo-500 text-lg leading-none mt-0.5" />
                            <div><span className="block text-[10px] font-black text-indigo-500 uppercase tracking-wider">Teacher Note</span><p className="text-slate-600 text-xs font-medium">{slide.teacherNotes}</p></div>
                          </div>
                        )}
                        {slide.studentActivity && (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
                            <i className="fi fi-sr-bulb text-emerald-500 text-lg leading-none mt-0.5" />
                            <div><span className="block text-[10px] font-black text-emerald-500 uppercase tracking-wider">Student Activity</span><p className="text-slate-600 text-xs font-medium">{slide.studentActivity}</p></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: realistic image + infographic diagram */}
                  <div className="w-full lg:w-5/12 xl:w-2/5 shrink-0 flex flex-col gap-5">
                    <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-100 aspect-[4/3]">
                      {!slideImgError ? (
                        <img
                          src={pol(imgPrompt, 900, 675)}
                          alt={slide.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={() => setSlideImgError(true)}
                        />
                      ) : (
                        /* ── Rich fallback panel when Pollinations image unavailable ── */
                        <div className={`w-full h-full flex flex-col gap-3 p-4 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100`}>
                          {/* Header strip */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white bg-gradient-to-r ${accent.from} ${accent.to} shrink-0`}>
                            <i className={`fi ${typeIcon} leading-none text-sm`} />
                            <span className="text-[10px] font-black uppercase tracking-widest flex-1">{slide.graphicType?.replace(/_/g,' ') || 'Visual Overview'}</span>
                            <i className="fi fi-sr-picture leading-none text-white/60 text-[9px]" />
                          </div>

                          {/* Teacher Note */}
                          {slide.teacherNotes && (
                            <div className="flex gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 shrink-0">
                              <i className="fi fi-sr-graduation-cap text-indigo-500 text-sm leading-none mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <span className="block text-[8px] font-black text-indigo-500 uppercase tracking-wider mb-0.5">Teacher Note</span>
                                <p className="text-[10px] text-slate-700 leading-relaxed font-medium break-words">{slide.teacherNotes}</p>
                              </div>
                            </div>
                          )}

                          {/* Student Activity */}
                          {slide.studentActivity && (
                            <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                              <i className="fi fi-sr-bulb text-emerald-500 text-sm leading-none mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <span className="block text-[8px] font-black text-emerald-500 uppercase tracking-wider mb-0.5">Student Activity</span>
                                <p className="text-[10px] text-slate-700 leading-relaxed font-medium break-words">{slide.studentActivity}</p>
                              </div>
                            </div>
                          )}

                          {/* Bullet icon flow — condensed */}
                          {slide.bullets?.slice(0, 4).map((b: string, idx: number) => {
                            const splitIdx = b.indexOf(':');
                            const hasTitle = splitIdx > 0 && splitIdx < 50;
                            const bTitle = hasTitle ? b.substring(0, splitIdx) : `Point ${idx + 1}`;
                            const bDesc = hasTitle ? b.substring(splitIdx + 1).trim() : b;
                            return (
                              <div key={idx} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-100 shrink-0">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] bg-gradient-to-br ${accent.from} ${accent.to}`}>
                                  <i className={`fi ${bulletIcons[idx % bulletIcons.length]} leading-none`} />
                                </span>
                                <div className="min-w-0">
                                  <p className={`text-[9px] font-black ${accent.text} leading-none mb-0.5`}>{bTitle}</p>
                                  <p className="text-[9px] text-slate-500 leading-snug font-medium break-words line-clamp-2">{bDesc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!slideImgError && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <i className="fi fi-sr-picture leading-none" /> AI Visual
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 flex-1 flex flex-col shadow-inner relative overflow-hidden min-h-[220px]">
                      <SlideVisual graphicType={slide.graphicType} graphicData={slide.graphicData} illustrationPrompt={slide.illustrationPrompt} animationSuggestion={slide.animationSuggestion} title={slide.title} subtitle={slide.subtitle} accent={accent} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <div className={`flex justify-between items-center p-4 sm:p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm shrink-0`}>
                <button disabled={activeSlide === 0} onClick={() => setActiveSlide((p) => p - 1)} className={`px-5 py-3 rounded-xl ${isDarkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"} font-black text-sm disabled:opacity-30 transition-all uppercase tracking-wider flex items-center gap-2`}><i className="fi fi-sr-arrow-small-left leading-none" /> Prev</button>
                <div className="gap-2 hidden md:flex flex-wrap justify-center max-w-[60%]">
                  {slides.map((_: any, i: number) => (
                    <button key={i} onClick={() => setActiveSlide(i)} className={`h-3 rounded-full transition-all duration-300 ${i === activeSlide ? `w-10 bg-gradient-to-r ${accent.from} ${accent.to} shadow-md` : `w-3 ${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"}`}`} />
                  ))}
                </div>
                <button disabled={activeSlide === totalSlides - 1} onClick={() => setActiveSlide((p) => p + 1)} className={`px-5 py-3 rounded-xl ${isDarkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"} font-black text-sm disabled:opacity-30 transition-all uppercase tracking-wider flex items-center gap-2`}>Next <i className="fi fi-sr-arrow-small-right leading-none" /></button>
              </div>
            </div>
          );
        })()}

        {/* ================= INFOGRAPHIC ================= */}
        {tool === "visualExplain" && (
          <div className="flex-1 w-full pb-10">
            <InteractiveInfographic topic={currentPlan.topic} subject={currentPlan.subject} data={currentPlan.planData?.infographic || (currentPlan as any).infographic} />
          </div>
        )}

        {/* ================= PODCAST ================= */}
        {tool === "podcast" && !genActive && (currentPlan.planData?.podcast?.script?.length) && (
          <div className="w-full max-w-6xl mx-auto space-y-8 py-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-center text-white gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="px-4 py-1.5 rounded-full bg-white/20 font-black text-xs uppercase tracking-widest backdrop-blur-md mb-4 inline-flex items-center gap-2 shadow-sm"><i className="fi fi-sr-comments leading-none" /> AI Audio Generation</span>
                <h1 className="font-black text-3xl sm:text-5xl mb-3 leading-tight">{currentPlan.topic}</h1>
                <p className="text-base sm:text-lg font-medium opacity-95 max-w-lg">Bilingual host summary — Arjun (English) &amp; Meera (Tamil).</p>
              </div>
              <button onClick={() => speakPodcast(currentPlan.planData.podcast.script)} className="w-24 h-24 shrink-0 rounded-full bg-white text-orange-600 flex items-center justify-center text-4xl shadow-2xl hover:scale-110 transition-transform z-10 border-4 border-white/40">
                <i className={`fi ${isPlayingPodcast ? "fi-sr-pause" : "fi-sr-play"} leading-none`} />
              </button>
            </div>

            <div className="space-y-4">
              {currentPlan.planData.podcast.script.map((line: any, idx: number) => {
                const isMeera = String(line.speaker).includes("Meera");
                return (
                  <div key={idx} className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${podcastIndex === idx ? (isDarkMode ? "bg-orange-500/20 border-orange-500/50 scale-[1.01] shadow-md" : "bg-orange-50 border-orange-300 scale-[1.01] shadow-md") : `${theme.bgCard} ${theme.border}`}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm ${isMeera ? "bg-gradient-to-br from-rose-400 to-pink-500" : "bg-gradient-to-br from-sky-400 to-indigo-500"}`}>
                        <i className="fi fi-sr-user leading-none text-sm" />
                      </div>
                      <div className={`font-black text-xs uppercase tracking-widest ${isMeera ? "text-rose-500" : "text-sky-500"}`}>{line.speaker}</div>
                      {podcastIndex === idx && <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1 animate-pulse"><i className="fi fi-sr-volume leading-none" /> speaking</span>}
                    </div>
                    <p className={`${theme.text} leading-relaxed text-base sm:text-lg font-medium pl-12 ${line.lang === "ta" ? "font-tamil" : ""}`}>{line.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIDEO ================= */}
        {tool === "video" && !genActive && (currentPlan.planData?.videoStoryboard?.length) && (() => {
          const board = currentPlan.planData.videoStoryboard;
          const scene = board[videoScene] || board[0];
          return (
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-4">
              <div className={`w-full rounded-[2rem] p-6 sm:p-10 relative flex flex-col items-center text-center ${isDarkMode ? "bg-slate-800" : "bg-slate-100"} shadow-sm`}>
                <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isDarkMode ? "bg-slate-700 text-white" : "bg-white text-slate-900"} shadow-sm flex items-center gap-1.5`}>
                  <i className="fi fi-sr-film leading-none text-rose-500" /> Scene {videoScene + 1} / {board.length}
                </div>

                <div className="w-full aspect-video max-w-4xl mx-auto rounded-3xl overflow-hidden relative mt-10 mb-8 group bg-slate-900 border border-slate-700/20 shadow-2xl">
                  <img
                    src={pol((scene?.visualDescription || "educational scene") + ", cinematic, highly detailed, 3d, beautiful educational animation style, vibrant", 1280, 720)}
                    alt="Generated Scene"
                    className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 flex flex-col items-center justify-end text-center pointer-events-none">
                    <p className="text-white/90 text-sm md:text-base font-semibold max-w-2xl drop-shadow-md">{scene?.visualDescription}</p>
                  </div>
                </div>

                <div className={`w-full max-w-2xl rounded-2xl p-6 sm:p-8 text-sm sm:text-base leading-relaxed text-center shadow-lg ${isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-500"}`}>
                  <p className="mb-4">{scene?.narrationText}</p>
                  <p className="font-tamil text-rose-500 font-semibold">{scene?.subtitles}</p>
                </div>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-full ${isDarkMode ? "bg-slate-800" : "bg-white"} shadow-sm border ${theme.border}`}>
                <button onClick={() => toggleVideoPlayback(board)} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-all flex items-center gap-2">
                  <i className={`fi ${isVideoPlaying ? "fi-sr-pause" : "fi-sr-play"} leading-none`} /> {isVideoPlaying ? "Pause" : "Play"} Simulation
                </button>
                <div className="flex items-center gap-2 pr-2">
                  {board.map((_: any, idx: number) => (
                    <button key={idx} onClick={() => { if (videoIntervalRef.current) clearInterval(videoIntervalRef.current); setIsVideoPlaying(false); setVideoScene(idx); }} className={`w-8 h-8 rounded-full font-black text-xs transition-all flex items-center justify-center ${videoScene === idx ? "bg-rose-500 text-white" : `${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}`}>{idx + 1}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= BILINGUAL ================= */}
        {tool === "bilingual" && (
          <div className="w-full max-w-6xl mx-auto py-4">
            <div className={`p-6 sm:p-8 rounded-[2rem] ${theme.bgCard} border ${theme.border} shadow-xl overflow-hidden`}>
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl shadow-md"><i className="fi fi-sr-globe leading-none" /></span>
                <div>
                  <h3 className={`font-black text-2xl ${theme.text}`}>Bilingual Glossary Matrix</h3>
                  <p className={`${theme.textMuted} text-sm`}>Key terms mapped to Tamil equivalents for regional learners.</p>
                </div>
              </div>
              <div className={`rounded-2xl border ${theme.border} overflow-x-auto`}>
                <table className="w-full text-left min-w-[560px]">
                  <thead className={`${isDarkMode ? "bg-slate-900/80" : "bg-slate-100/80"} backdrop-blur-md`}>
                    <tr className={`border-b ${theme.border}`}>
                      <th className={`py-4 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>English Term</th>
                      <th className={`py-4 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>Tamil Equivalent</th>
                      <th className={`py-4 px-6 font-black ${theme.textMuted} uppercase text-xs tracking-widest`}>Pronunciation</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {currentPlan.planData?.bilingual?.map((item: any, i: number) => (
                      <tr key={i} className={`${isDarkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"} transition-colors`}>
                        <td className={`py-4 px-6 font-bold text-lg ${theme.text}`}>{item.english}</td>
                        <td className="py-4 px-6 font-bold text-violet-500 font-tamil text-2xl">{item.tamil}</td>
                        <td className={`py-4 px-6 text-base font-medium ${theme.textMuted} italic`}>{item.pronunciation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ASSESSMENT (10 interactive bilingual quiz) ================= */}
        {tool === "assessment" && !genActive && (currentPlan.planData?.quiz?.length || currentPlan.planData?.exitTickets?.length) && (() => {
          const quiz = (currentPlan.planData?.quiz?.length ? currentPlan.planData.quiz : currentPlan.planData.exitTickets) as any[];
          const diffColor: Record<string, string> = { Easy: "bg-emerald-100 text-emerald-700", Medium: "bg-amber-100 text-amber-700", Hard: "bg-rose-100 text-rose-700" };
          return (
            <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-xl shadow-md"><i className="fi fi-sr-checkbox leading-none" /></span>
                <div>
                  <h3 className={`font-black text-2xl sm:text-3xl ${theme.text}`}>Quiz &amp; Assessment</h3>
                  <p className={`${theme.textMuted}`}>{quiz.length} bilingual questions — click an option to check your answer.</p>
                </div>
              </div>

              <div className="grid gap-5">
                {quiz.map((q: any, i: number) => {
                  const picked = quizPick[i];
                  const answered = picked !== undefined;
                  return (
                    <div key={i} className={`p-6 sm:p-7 rounded-[1.75rem] ${theme.bgCard} border ${theme.border} shadow-lg`}>
                      <div className="flex gap-4 mb-4 items-start">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-md">{i + 1}</div>
                        <div className="min-w-0 flex-1">
                          {q.difficulty && <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${diffColor[q.difficulty] || "bg-slate-100 text-slate-600"}`}>{q.difficulty}</span>}
                          <h4 className={`font-black text-lg leading-snug ${theme.text}`}>{q.question}</h4>
                          {q.questionTa && <p className="font-tamil text-indigo-500 text-base mt-1 leading-relaxed">{q.questionTa}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 sm:pl-14">
                        {q.options?.map((opt: string, oIdx: number) => {
                          const isCorrect = opt === q.answer;
                          let cls = `${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"} ${theme.text}`;
                          let icon = "";
                          if (answered) {
                            if (isCorrect) { cls = "bg-emerald-50 border-emerald-400 text-emerald-800"; icon = "fi-sr-check-circle"; }
                            else if (opt === picked) { cls = "bg-rose-50 border-rose-400 text-rose-800"; icon = "fi-sr-cross-circle"; }
                            else cls += " opacity-60";
                          }
                          return (
                            <button key={oIdx} disabled={answered} onClick={() => setQuizPick((p) => ({ ...p, [i]: opt }))}
                              className={`p-4 rounded-2xl border ${cls} font-medium text-sm sm:text-base text-left transition-all flex items-center justify-between gap-2 ${!answered ? "hover:scale-[1.01] hover:border-indigo-400 cursor-pointer" : "cursor-default"}`}>
                              <span>{opt}</span>
                              {icon && <i className={`fi ${icon} leading-none text-lg shrink-0`} />}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div className={`mt-4 sm:ml-14 p-4 rounded-2xl ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"} border relative overflow-hidden`}>
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                          <p className="text-emerald-600 font-black text-sm mb-1 uppercase tracking-wide flex items-center gap-2"><i className="fi fi-sr-badge-check leading-none" /> Answer: {q.answer}</p>
                          <p className="text-emerald-700 dark:text-emerald-500/90 text-sm font-medium leading-relaxed">{q.rationale}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
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
