"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

// Empty initial facts, will be fetched from API
interface Fact {
  id: number;
  category: string;
  categoryTa: string;
  title: string;
  titleTa: string;
  fact: string;
  factTa: string;
  image: string;
  color: string;
  icon: string;
  quiz: {
    question: string;
    questionTa: string;
    options: string[];
    optionsTa: string[];
    answer: number;
  }
}

function DiscoveryCard({ 
  item, 
  isActive, 
  onComplete,
  language
}: { 
  item: Fact; 
  isActive: boolean;
  onComplete: () => void;
  language: 'en' | 'ta';
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [quizState, setQuizState] = useState<"idle" | "correct" | "wrong">("idle");
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const handleQuiz = (idx: number) => {
    if (quizState !== "idle") return;
    setSelectedOpt(idx);
    if (idx === item.quiz.answer) {
      setQuizState("correct");
      onComplete(); // Add XP / Streak
    } else {
      setQuizState("wrong");
    }
  };

  const isTamil = language === 'ta';
  const quizOptions = isTamil ? item.quiz.optionsTa : item.quiz.options;

  return (
    <div className="relative w-full h-full snap-start snap-always shrink-0 flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Image & Gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out"
        style={{ 
          backgroundImage: `url(${item.image})`,
          transform: isActive ? 'scale(1)' : 'scale(1.1)'
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${item.color} mix-blend-hard-light opacity-80`} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto h-full flex flex-col justify-end p-6 pb-20 md:pb-12 text-white transition-opacity duration-300" key={language}>
        
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-inner">
            <i className={`${item.icon} text-sm !text-white`}></i>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider shadow-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 !text-white">
            {isTamil ? item.categoryTa : item.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 drop-shadow-xl !text-white">
          {isTamil ? item.titleTa : item.title}
        </h1>

        {/* Fact body */}
        <p className="text-[15px] leading-relaxed mb-6 drop-shadow-md max-w-[95%] font-medium !text-white/95">
          {isTamil ? item.factTa : item.fact}
        </p>

        {/* Quiz Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-5 mb-2 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2 !text-white/90">
            <i className="fi fi-sr-brain"></i> {isTamil ? "உங்கள் அறிவை சோதிக்கவும்" : "Test Your Brain"}
          </p>
          <p className="text-[13px] font-semibold mb-4 leading-snug !text-white">{isTamil ? item.quiz.questionTa : item.quiz.question}</p>
          <div className="space-y-2">
            {quizOptions.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === item.quiz.answer;
              
              let btnClass = "bg-white/10 hover:bg-white/20 border-transparent text-white";
              if (quizState !== "idle") {
                if (isCorrect) {
                  btnClass = "bg-emerald-500/20 border-emerald-400 text-emerald-300";
                } else if (isSelected && !isCorrect) {
                  btnClass = "bg-rose-500/20 border-rose-400 text-rose-300";
                } else {
                  btnClass = "bg-white/5 border-transparent text-white/40 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleQuiz(i)}
                  disabled={quizState !== "idle"}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all duration-300 flex items-center justify-between ${btnClass} !text-white`}
                >
                  {opt}
                  {quizState !== "idle" && isCorrect && <i className="fi fi-sr-check-circle text-lg !text-emerald-400"></i>}
                  {quizState !== "idle" && isSelected && !isCorrect && <i className="fi fi-sr-cross-circle text-lg !text-rose-400"></i>}
                </button>
              );
            })}
          </div>
          {quizState === "correct" && (
            <div className="mt-4 text-center text-[11px] font-black text-emerald-400 animate-bounce drop-shadow-sm">
              🔥 {isTamil ? "சரியான பதில்! +50 XP" : "Correct! +50 XP Earned"}
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Bar (Right Side) */}
      <div className="absolute right-4 bottom-24 md:bottom-16 flex flex-col items-center gap-5 z-20">
        <button 
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-1.5 group transform transition hover:scale-110"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${liked ? 'bg-rose-500' : 'bg-black/40 group-hover:bg-white/30 border border-white/10'}`}>
            <i className={`fi ${liked ? 'fi-sr-heart' : 'fi-rr-heart'} text-xl mt-0.5 !text-white`}></i>
          </div>
          <span className="text-[11px] font-bold drop-shadow-md !text-white">{liked ? '12.4k' : '12.3k'}</span>
        </button>

        <button 
          onClick={() => setSaved(!saved)}
          className="flex flex-col items-center gap-1.5 group transform transition hover:scale-110"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${saved ? 'bg-amber-500' : 'bg-black/40 group-hover:bg-white/30 border border-white/10'}`}>
            <i className={`fi ${saved ? 'fi-sr-bookmark' : 'fi-rr-bookmark'} text-xl mt-0.5 !text-white`}></i>
          </div>
          <span className="text-[11px] font-bold drop-shadow-md !text-white">Save</span>
        </button>

        <button className="flex flex-col items-center gap-1.5 group transform transition hover:scale-110">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-white/30 border border-white/10 shadow-lg transition-all">
            <i className="fi fi-sr-share text-xl !text-white"></i>
          </div>
          <span className="text-[11px] font-bold drop-shadow-md !text-white">Share</span>
        </button>
      </div>

    </div>
  );
}

export default function LearningPlatform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        const res = await apiFetch('/api/ai/daily-discovery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setFacts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch discovery facts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacts();
  }, []);

  // Handle scroll snapping logic to determine active card
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <PortalLayout>
      <div className="relative w-full h-[calc(100vh-80px)] bg-[var(--bg-main)] overflow-hidden flex justify-center items-center">
        
        {/* Language Toggle for mobile (absolute top) */}
        <div className="absolute top-4 right-4 z-50 lg:hidden">
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-full text-white shadow-xl hover:bg-slate-700/80 transition"
          >
            <i className="fi fi-sr-language text-sm"></i>
            <span className="text-xs font-bold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>

        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(100,116,139,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -left-[10%] top-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute right-[5%] bottom-[5%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[120px] pointer-events-none"></div>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-main)]">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {language === 'en' ? 'Generating Daily Facts...' : 'புதிய தகவல்களைத் தயாரிக்கிறது...'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {language === 'en' ? 'Gemini AI is finding mind-blowing concepts' : 'Gemini AI அற்புதமான கருத்துகளைத் தேடுகிறது'}
            </p>
          </div>
        )}

        {/* Feed Container (Phone Mockup style) */}
        {!loading && facts.length > 0 && (
          <div className="relative z-10 w-full max-w-[400px] h-[90vh] md:h-[800px] md:max-h-[85vh] bg-black md:rounded-[40px] md:border-[8px] md:border-slate-800 dark:md:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Scrollable Area */}
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
            >
              {facts.map((item, idx) => (
                <DiscoveryCard 
                  key={item.id} 
                  item={item} 
                  isActive={idx === activeIndex}
                  language={language}
                  onComplete={() => {
                    console.log(`Earned XP for fact ${item.id}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Desktop Sidebar hints */}
        <div className="hidden lg:flex absolute left-12 xl:left-24 top-1/2 -translate-y-1/2 flex-col gap-5 w-80 z-10 pointer-events-none">
          
          <div className="pointer-events-auto">
            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white/10 backdrop-blur-xl border border-slate-700 dark:border-white/20 px-4 py-2 rounded-full text-white shadow-xl hover:bg-slate-800 transition"
            >
              <i className="fi fi-sr-language text-[13px]"></i>
              <span className="text-[13px] font-bold tracking-wide">
                {language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
              </span>
            </button>
          </div>
          
          <div className="text-violet-500 dark:text-violet-400 text-sm font-black tracking-widest uppercase mb-[-10px] mt-4">
            {language === 'en' ? 'New Every Day' : 'தினம் ஒரு புதுமை'}
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            {language === 'en' ? <><span className="text-emerald-500">Daily</span> <br/>Discovery Hub</> : <><span className="text-emerald-500">தினசரி</span> <br/>கண்டுபிடிப்பு மையம்</>}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed mt-2">
            {language === 'en' 
              ? 'Scroll through our TikTok-style feed of mind-blowing concepts. Answer quizzes to earn XP!' 
              : 'எங்கள் டிக்-டாக் போன்ற சுவாரஸ்யமான கருத்துக்களைப் பாருங்கள். XP பெற வினாடி வினாக்களுக்கு பதிலளிக்கவும்!'}
          </p>
          
          <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/40 shadow-xl backdrop-blur-xl border border-white/40 dark:border-white/5 p-4 rounded-3xl text-slate-900 dark:text-white mt-4 w-max pointer-events-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-emerald-500/30">
              <i className="fi fi-sr-flame text-xl"></i>
            </div>
            <div className="pr-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                {language === 'en' ? 'Learning Streak' : 'தொடர் கற்றல்'}
              </p>
              <p className="text-xl font-black">
                {language === 'en' ? '12 Days' : '12 நாட்கள்'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-semibold animate-bounce mt-8">
            <i className="fi fi-sr-mouse"></i> {language === 'en' ? 'Scroll down to explore' : 'ஆராய கீழே ஸ்க்ரோல் செய்யவும்'}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}