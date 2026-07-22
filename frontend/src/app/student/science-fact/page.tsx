"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
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
  Volume2,
  BookOpen,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  Sun
} from "lucide-react";

interface FactTopic {
  id: string;
  title: string;
  category: string;
  accentGradient: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
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

const FACT_TOPICS: FactTopic[] = [
  {
    id: "sound-water",
    title: "Sound Travels Four Times Faster In Water",
    category: "Physics & Waves",
    accentGradient: "from-cyan-600 via-teal-600 to-indigo-700",
    badgeBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    icon: Waves,
    scienceFact:
      "Have you ever tried calling out to a friend across a swimming pool versus shouting through the air? In air, sound moves fast, but in water, it travels nearly four times faster. When you speak in air, sound waves bump into gas molecules, which are spread far apart. Water is a liquid, so its molecules are packed much closer together. Because of this tight packing, water molecules quickly pass energy to their neighbors like a game of tag. This allows sound to zoom through oceans and lakes at incredible speeds, which is why whales can communicate across hundreds of miles underwater.",
    whyItHappens:
      "Sound is a wave of energy that relies on particles to travel from one point to another. Since particles in liquids like water are much closer together than in gases like air, sound energy transfers from one particle to the next much more quickly. Therefore, materials with closely packed molecules allow sound waves to travel at significantly higher speeds.",
    didYouKnow:
      "In solid materials like iron or steel, where molecules are packed even tighter than in water, sound travels nearly fifteen times faster than it does in open air!",
    tryItSteps: [
      "Tap two plastic spoons together in open air and listen carefully to the loudness of the sound.",
      "Next, fill a large bowl with clean tap water.",
      "Place your ear gently against the outside wall of the bowl, submerge the two spoons completely in the water, and tap them together again.",
      "Notice how much louder, sharper, and clearer the tapping sound feels when it travels through the water and the container wall compared to open air."
    ],
    thinkAboutIt:
      "If sound travels so well through water, how do you think marine animals like dolphins use sound to explore their environment and locate objects in dark ocean waters?",
    thinkHint:
      "Dolphins send out high-pitched clicking sounds that bounce off fish and rocks. Because sound moves fast in water, the echo returns quickly, giving them a clear 'sound map' of their surroundings!",
    quiz: [
      {
        id: 1,
        question: "How much faster does sound travel in water compared to air?",
        options: [
          { key: "A", text: "Two times faster" },
          { key: "B", text: "Four times faster" },
          { key: "C", text: "Ten times faster" },
          { key: "D", text: "It travels at the exact same speed" }
        ],
        correct: "B",
        explanation: "Sound travels nearly four times faster through liquid water than through gas in the air."
      },
      {
        id: 2,
        question: "Why does sound travel faster through water than through air?",
        options: [
          { key: "A", text: "Water is colder than air" },
          { key: "B", text: "Water molecules are packed closer together than air molecules" },
          { key: "C", text: "Air molecules are heavier than water molecules" },
          { key: "D", text: "Water eliminates gravity" }
        ],
        correct: "B",
        explanation: "The denser packing of liquid molecules allows mechanical energy to transfer faster between neighboring particles."
      },
      {
        id: 3,
        question: "In which of the following states of matter does sound travel the fastest?",
        options: [
          { key: "A", text: "Gas" },
          { key: "B", text: "Liquid" },
          { key: "C", text: "Solid" },
          { key: "D", text: "Vacuum" }
        ],
        correct: "C",
        explanation: "Solids have the most tightly packed particles, allowing sound waves to travel fastest of all."
      }
    ]
  },
  {
    id: "venus-heat",
    title: "Venus Is Hotter Than Mercury Despite Being Further",
    category: "Space & Astronomy",
    accentGradient: "from-amber-600 via-orange-600 to-rose-700",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    icon: Sun,
    scienceFact:
      "Mercury is the closest planet to the Sun, so you might think it would be the hottest planet in our solar system. However, Venus takes the crown as the hottest planet, even though it is twice as far from the Sun! This happens because Mercury has almost no atmosphere to trap heat, meaning its night side freezes while its day side bakes. Venus, on the other hand, is wrapped in a thick blanket of clouds made of carbon dioxide. This thick atmosphere traps solar heat just like a car with closed windows on a sunny summer day.",
    whyItHappens:
      "The thick layer of carbon dioxide surrounding Venus causes an extreme greenhouse effect. Heat from the Sun passes through the upper cloud layer but gets trapped underneath, unable to escape back into space. This continuous heat trapping creates scorching surface temperatures of nearly 465 degrees Celsius both day and night.",
    didYouKnow:
      "A single day on Venus is longer than a year on Venus because the planet rotates extremely slowly on its axis while orbiting the Sun!",
    tryItSteps: [
      "Place two identical small cups of room-temperature water on a sunny windowsill.",
      "Cover one cup tightly with clear plastic wrap or a transparent glass jar, and leave the second cup uncovered in open air.",
      "Wait 20 minutes, then dip your fingertip into both cups to compare their temperatures.",
      "Notice how the covered cup becomes significantly warmer because trapped air cannot carry the heat away, mimicking a planetary greenhouse effect."
    ],
    thinkAboutIt:
      "How does understanding the atmospheric heat trapping on Venus help scientists protect Earth's climate and environment?",
    thinkHint:
      "Studying Venus teaches scientists how greenhouse gases trap thermal energy in an atmosphere, highlighting why keeping Earth's atmospheric gases balanced is vital for life!",
    quiz: [
      {
        id: 1,
        question: "Which planet is the hottest in our solar system?",
        options: [
          { key: "A", text: "Mercury" },
          { key: "B", text: "Venus" },
          { key: "C", text: "Mars" },
          { key: "D", text: "Jupiter" }
        ],
        correct: "B",
        explanation: "Venus is the hottest planet in our solar system with surface temperatures around 465 degrees Celsius."
      },
      {
        id: 2,
        question: "Why is Venus hotter than Mercury despite being further from the Sun?",
        options: [
          { key: "A", text: "Venus is closer to the Earth" },
          { key: "B", text: "Venus has a thick atmosphere that traps heat like a blanket" },
          { key: "C", text: "Mercury is made entirely of ice" },
          { key: "D", text: "Venus generates its own light" }
        ],
        correct: "B",
        explanation: "Venus has a dense atmosphere rich in carbon dioxide that creates a powerful heat-trapping greenhouse effect."
      },
      {
        id: 3,
        question: "What is the process called when an atmosphere traps solar thermal energy?",
        options: [
          { key: "A", text: "The greenhouse effect" },
          { key: "B", text: "Photosynthesis" },
          { key: "C", text: "Evaporation" },
          { key: "D", text: "Condensation" }
        ],
        correct: "A",
        explanation: "The greenhouse effect occurs when atmospheric gases trap heat from solar radiation."
      }
    ]
  }
];

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function ScienceFactPage() {
  const { data: session } = useSession();
  const studentClassStr = (session?.user as any)?.class || "7";
  const studentSection = (session?.user as any)?.section || "B";
  const studentFullClass = `Class ${studentClassStr}-${studentSection}`;

  const [topics, setTopics] = useState<FactTopic[]>(FACT_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState<string>("sound-water");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [publishedByInfo, setPublishedByInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayFact();
  }, [studentFullClass, studentClassStr]);

  const fetchTodayFact = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/teacher/science-fact/today?targetClass=${encodeURIComponent(studentFullClass)}&classNum=${studentClassStr}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        const publishedFact = json.data;
        const formattedFact: FactTopic = {
          id: publishedFact.id || "published-today",
          title: publishedFact.title,
          category: publishedFact.category || "Science Discovery",
          accentGradient: "from-cyan-600 via-teal-600 to-indigo-700",
          badgeBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
          icon: Waves,
          scienceFact: publishedFact.scienceFact,
          whyItHappens: publishedFact.whyItHappens,
          didYouKnow: publishedFact.didYouKnow,
          tryItSteps: publishedFact.tryItSteps || [],
          thinkAboutIt: publishedFact.thinkAboutIt,
          thinkHint: publishedFact.thinkHint || "",
          quiz: publishedFact.quiz || []
        };

        setTopics((prev) => {
          const exists = prev.some((t) => t.title === formattedFact.title);
          if (exists) return prev;
          return [formattedFact, ...prev];
        });

        setActiveTopicId(formattedFact.id);
        if (publishedFact.generatedBy) {
          setPublishedByInfo(`Published by ${publishedFact.generatedBy} (${publishedFact.targetClass || "Class 7-B"})`);
        }
      }
    } catch (e) {
      console.error("Could not fetch today's published science fact", e);
    }
  };

  const currentTopic = topics.find((t) => t.id === activeTopicId) || topics[0] || FACT_TOPICS[0];
  const TopicIcon = currentTopic.icon || Waves;

  const handleTopicSwitch = (topicId: string) => {
    setActiveTopicId(topicId);
    setSelectedAnswers({});
    setShowResults(false);
    setCompletedSteps({});
    setShowHint(false);
  };

  const handleSelectOption = (qId: number, optionKey: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const calculateScore = () => {
    let score = 0;
    currentTopic.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) score++;
    });
    return score;
  };

  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = currentTopic.tryItSteps.length;
  const activityProgressPct = Math.round((completedStepsCount / totalSteps) * 100);

  return (
    <PortalLayout title="Science Fact" subtitle="Curious, engaging science for middle school explorers (Classes 6-8)">
      <div className="w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Topic Selector Tabs (Full Width Bar) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-violet-500" />
            <span>Select Science Topic:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {topics.map((topic) => {
              const isActive = topic.id === activeTopicId;
              const IconComp = topic.icon || Waves;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSwitch(topic.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md scale-[1.02] border border-teal-500 font-extrabold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold border border-transparent"
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                  <span className={isActive ? "text-white font-extrabold" : "text-slate-700 dark:text-slate-200"}>
                    {topic.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Banner (Full Width) */}
        <div className={`w-full bg-gradient-to-r ${currentTopic.accentGradient} text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden`}>
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
            <TopicIcon className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                Middle School Science (Classes 6–8)
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white/90">
                {currentTopic.category}
              </span>
              {publishedByInfo && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400">
                  {publishedByInfo}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Title: {currentTopic.title}
            </h1>

            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-3xl">
              Discover real-world scientific phenomena explained through everyday examples, simple observations, and interactive quizzes.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Core Fact & Science Explanation */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Fact Card (Takes 2 Columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Science Fact</h2>
                  <p className="text-xs text-slate-400">Core explanation for students</p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                {currentTopic.scienceFact}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-100">Key Takeaway: </span>
                Particle density directly impacts how effectively energy moves through matter.
              </div>
            </div>
          </div>

          {/* Side Column: Why It Happens & Did You Know */}
          <div className="space-y-6 flex flex-col">
            
            {/* Why It Happens Card */}
            <div className="bg-cyan-50/70 dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm flex-1 space-y-3">
              <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-bold text-lg">
                <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3>Why It Happens</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {currentTopic.whyItHappens}
              </p>
            </div>

            {/* Did You Know? Card */}
            <div className="bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 shadow-sm flex-1 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-bold text-lg">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3>Did You Know?</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {currentTopic.didYouKnow}
              </p>
            </div>

          </div>
        </div>

        {/* 2-Column Grid: Try It Yourself & Think About It */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Try It Yourself Card (Interactive Checklist) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Try It Yourself</h2>
                  <p className="text-xs text-slate-400">Safe hands-on observation</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activityProgressPct}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${activityProgressPct}%` }}
              />
            </div>

            <div className="space-y-3">
              {currentTopic.tryItSteps.map((stepText, idx) => {
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isDone
                        ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    <CheckSquare className={`w-5 h-5 shrink-0 mt-0.5 ${isDone ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    <div className="text-sm font-medium leading-relaxed">
                      <span className="font-bold mr-1.5">Step {idx + 1}:</span>
                      {stepText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Think About It Reflection Card */}
          <div className="bg-indigo-50/60 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-950 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-950 dark:text-indigo-200">Think About It</h2>
                  <p className="text-xs text-indigo-500/80">Curiosity discussion question</p>
                </div>
              </div>

              <p className="text-slate-800 dark:text-slate-200 text-base sm:text-lg font-medium leading-relaxed">
                {currentTopic.thinkAboutIt}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
              >
                {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showHint ? "Hide Curiosity Hint" : "Reveal Curiosity Hint"}</span>
              </button>

              {showHint && (
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Hint: </span>
                  {currentTopic.thinkHint}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Fun Quiz Section (Full Width Card) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fun Quiz</h2>
                <p className="text-xs text-slate-400">Test your understanding (3 Questions)</p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Classes 6–8 Knowledge Check
            </span>
          </div>

          {/* Quiz Questions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {currentTopic.quiz.map((q) => {
              const selectedOpt = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {q.id}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedOpt === opt.key;
                        const isCorrect = opt.key === q.correct;

                        let btnStyle = "w-full text-left text-xs sm:text-sm p-3 rounded-xl border transition-all font-medium flex items-center justify-between ";

                        if (showResults) {
                          if (isCorrect) {
                            btnStyle += "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold";
                          } else if (isSelected && !isCorrect) {
                            btnStyle += "bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-200 font-semibold";
                          } else {
                            btnStyle += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
                          }
                        } else {
                          if (isSelected) {
                            btnStyle += "bg-teal-600 border-teal-600 text-white shadow-sm font-semibold";
                          } else {
                            btnStyle += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400";
                          }
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={btnStyle}
                          >
                            <span>
                              <strong className="mr-2">{opt.key})</strong> {opt.text}
                            </span>
                            {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {showResults && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                      <strong>Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(selectedAnswers).length < currentTopic.quiz.length}
                className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Submit & Check Answers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-teal-50 dark:bg-teal-950/40 p-4 rounded-2xl border border-teal-200 dark:border-teal-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm">
                    {calculateScore()}/{currentTopic.quiz.length}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-teal-900 dark:text-teal-200">
                      {calculateScore() === currentTopic.quiz.length ? "Excellent Work! 100% Correct!" : "Good Effort! Review the answers above."}
                    </div>
                    <div className="text-xs text-teal-700 dark:text-teal-400">
                      You answered {calculateScore()} out of {currentTopic.quiz.length} questions correctly.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowResults(false);
                    setSelectedAnswers({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            )}

            {/* Answer Key Footer */}
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span className="font-bold text-slate-600 dark:text-slate-400">Answer Key:</span>
              {currentTopic.quiz.map((q) => (
                <span key={q.id}>
                  {q.id}. <strong className="text-slate-700 dark:text-slate-300">{q.correct}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
