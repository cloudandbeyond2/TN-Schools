"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  Compass, Sparkles, CheckCircle2, BookMarked, User, 
  Flame, Award, Heart, Smile, Play, Send, RefreshCw, 
  AlertCircle, HelpCircle, Brain, BookOpen, GraduationCap 
} from "lucide-react";
import Swal from "sweetalert2";

interface StudentProfile {
  id: string;
  studentName: string;
  class: string;
  section: string;
  schoolId: string;
  rollNumber: string;
}

interface Mark {
  id: string;
  subject: string;
  examType: string;
  scored: number;
  maxMarks: number;
}

interface HabitLog {
  id: string;
  date: string;
  reflectionJournal?: string;
  screenTimeBreak: boolean;
  sleepHours: number;
  pointsEarned: number;
}

interface RewardProfile {
  points: number;
  streak: number;
  badges: string[];
  lastLoggedDate?: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API = getApiBase();

// Standard Badge definitions with icons and colors
const BADGE_DETAILS: Record<string, { label: string; desc: string; icon: string; color: string }> = {
  "Self-Care Rookie": { label: "Self-Care Rookie", desc: "Logged your first self-care habits!", icon: "🌱", color: "from-emerald-400 to-teal-500" },
  "Self-Care Champion": { label: "Self-Care Champion", desc: "Earned over 150 total self-care points!", icon: "👑", color: "from-pink-500 to-rose-600 animate-pulse" },
  "Consistency Beginner": { label: "Consistency Beginner", desc: "Maintained a 3-day habits streak!", icon: "🔥", color: "from-amber-400 to-orange-500" },
  "Habit Master": { label: "Habit Master", desc: "Maintained an epic 7-day self-care streak!", icon: "🏆", color: "from-purple-500 to-indigo-600" },
  "Self-Reflective Mindset": { label: "Reflective Mindset", desc: "Wrote a thoughtful reflection journal entry.", icon: "🧠", color: "from-blue-400 to-cyan-500" },
  "Rest & Recovery": { label: "Rest & Recovery", desc: "Logged 7-9 hours of healthy sleep.", icon: "💤", color: "from-sky-400 to-indigo-500" }
};

const getDynamicCards = (subject: string): Array<{ id: number; category: string; front: string; back: string; icon: string }> => {
  const sub = (subject || "").toLowerCase();
  
  if (sub.includes("math")) {
    return [
      { id: 1, category: "Mathematics", front: "How can I improve my speed in solving Algebra?", back: "Write down each step. Practice 5 algebra problems daily, and learn to visualize algebraic graphs.", icon: "📐" },
      { id: 2, category: "Mathematics", front: "What is the best way to memorize Geometry/Trig formulas?", back: "Create a formula sheet. Write formulas from memory every morning. Apply them in simple problems first.", icon: "📏" },
      { id: 3, category: "Mathematics", front: "How should I handle difficult calculations in exams?", back: "Do rough calculations in a dedicated side-column. Double-check simple operations like addition and signs.", icon: "📈" },
      { id: 4, category: "Mathematics", front: "Why am I making silly math errors, and how to avoid them?", back: "Silly errors happen due to rush or panic. Practice under timed conditions and read questions twice.", icon: "❌" },
      { id: 5, category: "Mathematics", front: "How can I practice Active Recall for Mathematics?", back: "Try explaining a solved math proof/problem to a classmate or out loud without looking at the solution.", icon: "🧠" }
    ];
  } else if (sub.includes("sci") || sub.includes("phys") || sub.includes("chem") || sub.includes("biol")) {
    return [
      { id: 1, category: "Science", front: "How do I remember chemistry valencies & elements?", back: "Use acronyms or mnemonics (like 'Happy Henry' for elements). Study the periodic table layout 5 mins daily.", icon: "🧪" },
      { id: 2, category: "Science", front: "What is a good way to balance chemical equations?", back: "List the number of atoms of each element on both reactant & product sides. Adjust coefficients starting from largest molecule.", icon: "⚗️" },
      { id: 3, category: "Science", front: "How can I study complex Biology diagram structures?", back: "Practice drawing diagram outlines and labeling them from memory. Active recall works best for anatomical labels.", icon: "🐸" },
      { id: 4, category: "Science", front: "How do I write a perfect Science Lab Report?", back: "Structure clearly: Aim, Apparatus, Procedure, Observations, Calculations, and Precautions.", icon: "📝" },
      { id: 5, category: "Science", front: "How can I practice Active Recall for Science?", back: "Cover notes and draw pathways or write summaries of scientific principles from raw memory.", icon: "🧠" }
    ];
  } else if (sub.includes("eng")) {
    return [
      { id: 1, category: "English", front: "How can I improve my English grammar score?", back: "Practice daily error-spotting exercises. Focus on subject-verb agreement and tense consistency.", icon: "🗣️" },
      { id: 2, category: "English", front: "What is the best way to write creative essays?", back: "Start with an outline (Introduction, Body Paragraphs, Conclusion). Use active voice and varied vocabulary.", icon: "📝" },
      { id: 3, category: "English", front: "How do I answer comprehension passages quickly?", back: "Read the questions first, then scan the passage to locate keywords. Highlight sections in the text.", icon: "📖" },
      { id: 4, category: "English", front: "How can I memorize English vocabulary words?", back: "Learn 3 new words daily and use them in sentences. Use index cards (flashcards) to test yourself.", icon: "📚" },
      { id: 5, category: "English", front: "What study habit works best for English literature?", back: "Write summaries of character sketches and main themes from memory (active recall) instead of just re-reading.", icon: "🧠" }
    ];
  } else if (sub.includes("tam")) {
    return [
      { id: 1, category: "தமிழ் (Tamil)", front: "தமிழ் இலக்கணம் எளிதாகப் படிப்பது எப்படி?", back: "இலக்கண விதிகளை எடுத்துக்காட்டுகளுடன் ஒப்பிட்டுப் படியுங்கள். தினசரி பயிற்சி வினாக்களை எழுதிப் பாருங்கள்.", icon: "📜" },
      { id: 2, category: "தமிழ் (Tamil)", front: "மனப்பாடப் பகுதிகளை எளிதில் நினைவில் கொள்வது எப்படி?", back: "செய்யுள் வரிகளை எழுதிப் பார்த்துப் பழகுங்கள். பாடலை இராகத்துடன் பாடிப் பார்ப்பது நினைவாற்றலை அதிகரிக்கும்.", icon: "🧠" },
      { id: 3, category: "தமிழ் (Tamil)", front: "தமிழ்க் கட்டுரை எழுதும்போது பிழைகளைத் தவிர்ப்பது எப்படி?", back: "எழுத்து மற்றும் சந்திப் பிழைகளைத் தவிர்க்க கட்டுரைகளை எழுதிப் பார்த்து, திருத்தங்கள் செய்து பழகுங்கள்.", icon: "✍️" },
      { id: 4, category: "தமிழ் (Tamil)", front: "தமிழ் உரைநடை வினாக்களுக்கு விடையளிப்பது எப்படி?", back: "உரைநடைப் பகுதியை முழுமையாகப் படித்து, வினாக்களின் மையப் பொருளைத் தெளிவாகவும் சுருக்கமாகவும் எழுதுங்கள்.", icon: "📖" },
      { id: 5, category: "தமிழ் (Tamil)", front: "தமிழ் மொழித் திறனை வளர்க்க சிறந்த வழிமுறை என்ன?", back: "தமிழ் நாளிதழ்கள் மற்றும் கதைகளைப் படியுங்கள். புதிய சொற்களைப் பயன்படுத்தி வாக்கியங்கள் அமைத்துப் பழகுங்கள்.", icon: "🗣️" }
    ];
  } else if (sub.includes("soc") || sub.includes("hist") || sub.includes("geog") || sub.includes("civ")) {
    return [
      { id: 1, category: "Social Science", front: "How do I remember historical timeline dates easily?", back: "Draw a chronological timeline sheet on your wall. Group events by patterns or connections.", icon: "📅" },
      { id: 2, category: "Social Science", front: "What is the best way to practice map marking in Geography?", back: "Use blank maps. Mark 5 major rivers, cities, or mountain ranges from memory daily.", icon: "🗺️" },
      { id: 3, category: "Social Science", front: "How can I write detailed long answers in Civics/Economics?", back: "Answer in bullet points. Include subheadings and underline key terms (e.g. articles or definitions).", icon: "📝" },
      { id: 4, category: "Social Science", front: "How do I avoid getting confused between similar historical events?", back: "Create comparative tables highlighting causes, major leaders, and consequences of each event side-by-side.", icon: "🔍" },
      { id: 5, category: "Social Science", front: "How can I practice Active Recall for History?", back: "Close the book and write down a summary of the causes and outcomes of a war/movement from memory.", icon: "🧠" }
    ];
  }
  
  // Default general study cards
  return [
    { id: 1, category: "Study Habits", front: "What is the Pomodoro Technique?", back: "Study intensely for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer 20-minute break. It prevents brain fatigue and boosts focus!", icon: "⏰" },
    { id: 2, category: "Study Habits", front: "How does Active Recall work?", back: "Instead of just reading a textbook, close it and force your brain to retrieve the information by writing down everything you remember. This strengthens memory pathways!", icon: "🧠" },
    { id: 3, category: "Choosing Streams", front: "Should I choose Science or Commerce in Class 11?", back: "Choose Science if you love logical problem-solving (Math, Physics) or medicine/engineering. Choose Commerce if you like business, finance, accounting, or entrepreneurship.", icon: "🎓" },
    { id: 4, category: "Choosing Streams", front: "What are Vocational Career Options?", back: "Vocational courses prepare you for immediate jobs in fields like Information Technology, Agriculture, Electrical Equipment Maintenance, and Health Assistant. High demand & hands-on!", icon: "🔧" },
    { id: 5, category: "Test-Taking Skills", front: "How can I avoid panic during a difficult test?", back: "Scan the entire paper first. Answer all easy questions first to build momentum and confidence. Budget your time (e.g., 1.5 minutes per mark) and read questions twice.", icon: "📝" }
  ];
};

export default function PersonalGuidePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const sessionName = session?.user?.name || "Student";

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [lowestSubject, setLowestSubject] = useState<string>("");
  const [lowestScore, setLowestScore] = useState<number>(0);

  // Marks modal state
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [inputMarks, setInputMarks] = useState({
    Mathematics: 75,
    Science: 75,
    English: 75,
    Tamil: 75,
    "Social Science": 75
  });
  const [savingMarks, setSavingMarks] = useState(false);

  const handleMarksSave = async () => {
    if (!student) return;
    setSavingMarks(true);
    try {
      const subjects = Object.keys(inputMarks) as Array<keyof typeof inputMarks>;
      for (const sub of subjects) {
        await fetch(`${API}/api/personal-guide/marks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            subject: sub,
            scored: Number(inputMarks[sub]),
            maxMarks: 100,
            examType: "Mock Exam"
          })
        });
      }
      setShowMarksModal(false);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: "Marks Saved Successfully",
        text: "Your academic personal guide has been updated with new focus recommendations!",
        confirmButtonColor: "#ec4899"
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Failed to save marks", text: "Please try again later." });
    } finally {
      setSavingMarks(false);
    }
  };
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"academic" | "personal" | "career" | "gamification" | "chatbot">("academic");

  // Career Planner state
  const [selectedInterest, setSelectedInterest] = useState<string>("");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedPathway, setSelectedPathway] = useState<string>("");
  
  // Gamification state
  const [screenTimeBreak, setScreenTimeBreak] = useState(false);
  const [sleepHours, setSleepHours] = useState(8);
  const [reflectionJournal, setReflectionJournal] = useState("");
  const [rewardProfile, setRewardProfile] = useState<RewardProfile>({ points: 0, streak: 0, badges: [] });
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [growthQuote, setGrowthQuote] = useState("Your efforts determine your intelligence. Embrace the challenge!");

  // Flashcards state
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);

  // Breathing tool state (High School focus)
  const [breathingText, setBreathingText] = useState("Inhale...");
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingActive, setBreathingActive] = useState(false);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Emotions Wheel state (Middle School focus)
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionAdvice, setEmotionAdvice] = useState<string>("");



  // Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: `Hello! I am your AI Mentor. How can I assist you with choosing subjects, building study habits, handling stress, or discussing your career options today?` }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit] = useState(5);
  const [loading, setLoading] = useState(true);

  // Flashcards flip tracker state
  const [flippedFlashcards, setFlippedFlashcards] = useState<Record<number, boolean>>({});

  // Curated Flashcards dynamically based on lowest subject
  const flashcards = getDynamicCards(lowestSubject);

  // Curated study and stream flashcards for the bottom section
  const bottomFlashcards = [
    { id: 1, category: "Study Habits", front: "What is the Pomodoro Technique?", back: "Study intensely for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer 20-minute break. It prevents brain fatigue and boosts focus!", icon: "⏰" },
    { id: 2, category: "Study Habits", front: "How does Active Recall work?", back: "Instead of just reading a textbook, close it and force your brain to retrieve the information by writing down everything you remember. This strengthens memory pathways!", icon: "🧠" },
    { id: 3, category: "Choosing Streams", front: "Should I choose Science or Commerce in Class 11?", back: "Choose Science if you love logical problem-solving (Math, Physics) or medicine/engineering. Choose Commerce if you like business, finance, accounting, or entrepreneurship.", icon: "🎓" },
    { id: 4, category: "Choosing Streams", front: "What are Vocational Career Options?", back: "Vocational courses prepare you for immediate jobs in fields like Information Technology, Agriculture, Electrical Equipment Maintenance, and Health Assistant. High demand & hands-on!", icon: "🔧" },
    { id: 5, category: "Test-Taking Skills", front: "How can I avoid panic during a difficult test?", back: "Scan the entire paper first. Answer all easy questions first to build momentum. Budget your time and read questions twice.", icon: "📝" },
    { id: 6, category: "Study Habits", front: "What is Spaced Repetition?", back: "Review information at increasing intervals (e.g., 1 day, 3 days, 7 days, 30 days) to prevent forgetting. It moves knowledge into your long-term memory!", icon: "📅" }
  ];

  // Fetch student, marks, habits, and rewards
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1. Fetch student profile
      const resStudent = await fetch(`${API}/api/students?userId=${userId}`);
      const dataStudent = await resStudent.json();
      if (dataStudent.success && dataStudent.data.length > 0) {
        const studentRec = dataStudent.data[0];
        setStudent(studentRec);

        // 2. Fetch full student details with marks
        const resFull = await fetch(`${API}/api/students/${studentRec.id}`);
        const dataFull = await resFull.json();
        if (dataFull.success && dataFull.data) {
          const fetchedMarks = dataFull.data.marks || [];
          setMarks(fetchedMarks);

          // Find lowest mark
          if (fetchedMarks.length > 0) {
            const lowest = fetchedMarks.reduce((min: Mark, m: Mark) => m.scored < min.scored ? m : min, fetchedMarks[0]);
            setLowestSubject(lowest.subject);
            setLowestScore(lowest.scored);
          }
        }

        // 3. Fetch habits logs
        const resHabits = await fetch(`${API}/api/personal-guide/habits?studentId=${studentRec.id}`);
        const dataHabits = await resHabits.json();
        if (dataHabits.success) {
          setHabitLogs(dataHabits.data);
          // Pre-populate today's logs if present
          const todayStr = new Date().toISOString().split("T")[0];
          const todayLog = dataHabits.data.find((l: HabitLog) => l.date === todayStr);
          if (todayLog) {
            setScreenTimeBreak(todayLog.screenTimeBreak);
            setSleepHours(todayLog.sleepHours);
            setReflectionJournal(todayLog.reflectionJournal || "");
          }
        }

        // 4. Fetch rewards profile
        const resRewards = await fetch(`${API}/api/personal-guide/rewards?studentId=${studentRec.id}`);
        const dataRewards = await resRewards.json();
        if (dataRewards.success) {
          setRewardProfile(dataRewards.data);
        }

        // 5. Fetch chatbot quota status
        const resQuota = await fetch(`${API}/api/personal-guide/quota-status?studentId=${studentRec.id}`);
        const dataQuota = await resQuota.json();
        if (dataQuota.success) {
          setQuotaUsed(dataQuota.count);
        }
      }
    } catch (e) {
      console.error("Error loading data: ", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Breathing Box Timer logic
  useEffect(() => {
    if (breathingActive) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // State machine for 4-7-8 breathing
            setBreathingText((current) => {
              if (current === "Inhale...") {
                setBreathingTimer(7);
                return "Hold breath...";
              } else if (current === "Hold breath...") {
                setBreathingTimer(8);
                return "Exhale slowly...";
              } else {
                setBreathingTimer(4);
                return "Inhale...";
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      setBreathingText("Click to Start");
      setBreathingTimer(4);
    }

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [breathingActive]);

  // Handler for emotions choice
  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    let advice = "";
    switch (emotion) {
      case "Anxious / Stressed":
        advice = "Try the 4-7-8 breathing practice in the 'Personal Wellness' tab. Remember: test marks do not define your worth. Your effort matters most!";
        break;
      case "Lonely / Left Out":
        advice = "Feeling left out is common during school shifts. Try participating in extracurricular school clubs or talking with your advisor teacher.";
        break;
      case "Angry / Frustrated":
        advice = "Frustration is a normal raw emotion. When you feel this way, take a 5-minute screen break, write down your thoughts, or go for a brisk walk.";
        break;
      case "Unmotivated / Tired":
        advice = "Carol Dweck says: 'Effort is what ignites ability.' Break your syllabus into small tasks and start with just 10 minutes of study today.";
        break;
      case "Happy / Proud":
        advice = "Fantastic! Celebrate your progress. Reflect on what strategies worked well and how you can apply them to other challenges.";
        break;
      default:
        advice = "Check in with how you feel daily. Sharing your feelings with a trusted mentor is a great self-reliance tool.";
    }
    setEmotionAdvice(advice);
  };

  // Submit habits log
  const handleHabitSubmit = async () => {
    if (!student) return;
    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch(`${API}/api/personal-guide/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          date: todayStr,
          screenTimeBreak,
          sleepHours,
          reflectionJournal
        })
      });

      const data = await response.json();
      if (data.success) {
        setRewardProfile(data.data);
        setGrowthQuote(data.quote);
        
        // Refresh habit logs list
        const resHabits = await fetch(`${API}/api/personal-guide/habits?studentId=${student.id}`);
        const dataHabits = await resHabits.json();
        if (dataHabits.success) {
          setHabitLogs(dataHabits.data);
        }

        Swal.fire({
          icon: "success",
          title: "Self-Care Logged!",
          text: data.message,
          background: "var(--bg-card)",
          color: "var(--text-main)",
          confirmButtonColor: "#ec4899"
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Connection Error", text: "Failed to connect to the backend server." });
    }
  };

  // Send message to AI Chatbot
  const handleSendChat = async (presetMessage?: string) => {
    const textToSend = presetMessage || inputMessage;
    if (!textToSend.trim() || !student) return;
    if (quotaUsed >= quotaLimit) {
      Swal.fire({
        icon: "warning",
        title: "Daily Quota Reached",
        text: "You have used your 5 messages for today. Time for a screen-time break!",
        confirmButtonColor: "#ec4899"
      });
      return;
    }

    setSendingChat(true);
    const updatedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...chatMessages,
      { role: 'user', content: textToSend }
    ];
    setChatMessages(updatedMessages);
    setInputMessage("");

    try {
      const res = await fetch(`${API}/api/personal-guide/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.studentName,
          className: `Class ${student.class}-${student.section}`,
          messages: chatMessages,
          currentMessage: textToSend,
          lowestSubject,
          lowestScore,
          selectedEmotion
        })
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages([...updatedMessages, { role: 'assistant' as const, content: data.text }]);
        setQuotaUsed(data.quotaUsed);
      } else {
        Swal.fire({ icon: "error", title: "Failed to fetch response", text: data.error });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Error", text: "Network error during AI chatbot response." });
    } finally {
      setSendingChat(false);
    }
  };

  // Check the student's grade level mapping
  const isHighSchool = student ? parseInt(student.class, 10) >= 9 : true;
  const gradeLevel = student ? parseInt(student.class, 10) : 9;
  const isMiddleSchool = gradeLevel >= 6 && gradeLevel <= 8;
  const isHighSchoolSecondary = gradeLevel === 9 || gradeLevel === 10;
  const isHigherSecondary = gradeLevel === 11 || gradeLevel === 12;

  if (loading) {
    return (
      <PortalLayout title="Personal Guide 🧭" subtitle="Setting up your guide..." accentColor="#ec4899">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Personalizing your mentor deck...</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout 
      title="Personal Guide 🧭" 
      subtitle={`Welcome back, ${sessionName} · Class ${student?.class || "9"}-${student?.section || "A"} · AI Support Hub`} 
      accentColor="#ec4899"
    >
      <div className="space-y-6 text-left animate-in fade-in duration-500">
        
        {/* Dynamic Warning Alert: Low Marks Alert */}
        {lowestSubject && lowestScore < 50 && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Dynamic Academic Focus Alert</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Your latest results show a score of <strong className="text-amber-500">{lowestScore}%</strong> in <strong>{lowestSubject}</strong>. 
                Don't worry! We have preloaded study cards below to help you practice Active Recall for {lowestSubject}. Click on the "Academic Help" tab to build your study habits.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Grade Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-pink-500 to-rose-600 text-white p-6 md:p-8 shadow-xl border-2 border-pink-100 dark:border-pink-900/60">
          <div className="absolute right-0 top-0 opacity-15 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <Compass className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-black tracking-wider text-[9px] uppercase border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> 
              {isHighSchool ? "High School (9th-12th) stress coach" : "Middle School (6th-8th) emotional coach"}
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">Your Effort Shapes Your Path</h2>
            <p className="text-pink-50 max-w-xl text-xs md:text-sm font-medium leading-relaxed">
              {isHighSchool 
                ? "Anxiety relief, self-reliance, peer boundaries, and future anxiety management tools curated just for you."
                : "Bullying prevention, digital etiquette, and tools for understanding your emotions safely."
              }
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
          {[
            { id: "academic", label: "Academic Help 📖", color: "border-pink-500 text-pink-500" },
            { id: "career", label: "Career Planner 🎓", color: "border-violet-500 text-violet-500" },
            { id: "personal", label: "Personal Wellness 🧘", color: "border-emerald-500 text-emerald-500" },
            { id: "gamification", label: "Self-Care Tracker 🏆", color: "border-amber-500 text-amber-500" },
            { id: "chatbot", label: "AI Mentor Chatbot 🤖", color: "border-indigo-500 text-indigo-500" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-[2px] ${
                activeTab === tab.id
                  ? tab.color
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* Academic Help Tab */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Target Focus Subject */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <GraduationCap className="w-5 h-5 text-pink-500" />
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Subject Advice</h3>
                </div>
                
                {lowestSubject ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Lowest Scoring Subject</span>
                      <h4 className="text-base font-extrabold text-red-500 mt-1">{lowestSubject} ({lowestScore}%)</h4>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Let's focus on effort! Spend 15 minutes everyday practicing <strong>Active Recall</strong> flashcards specifically for {lowestSubject}. Avoid comparing your mark with friends. What matters is your progress over yesterday.
                    </p>
                    
                    <div className="pt-2 pb-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Your Next Steps:</span>
                      <ul className="text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-2">
                        <li className="flex items-center gap-2">✅ Review today's {lowestSubject} class notes.</li>
                        <li className="flex items-center gap-2">✅ Do 3 textbook practice problems.</li>
                        <li className="flex items-center gap-2">✅ Ask your teacher for study tips during breaks.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">No subject marks recorded yet. Click below to enter your marks for custom focus alerts!</p>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    const prefilled = { Mathematics: 75, Science: 75, English: 75, Tamil: 75, "Social Science": 75 };
                    marks.forEach(m => {
                      if (m.subject in prefilled) {
                        prefilled[m.subject as keyof typeof prefilled] = m.scored;
                      }
                    });
                    setInputMarks(prefilled);
                    setShowMarksModal(true);
                  }}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  📝 Enter / Edit My Marks
                </button>
              </div>

              {/* Study Habit Flashcards */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-500" />
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Suggested Doubt Cards</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Click card to ask AI Mentor instantly!</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card) => (
                    <div 
                      key={card.id}
                      onClick={() => {
                        setActiveTab("chatbot");
                        handleSendChat(card.front);
                      }}
                      className="cursor-pointer h-36 rounded-xl border border-slate-200 dark:border-slate-800 relative transition-all bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-2xl">{card.icon}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{card.front}</h4>
                        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">{card.category}</span>
                        <div className="text-[10px] text-pink-500 font-bold mt-1 flex items-center justify-center gap-1">
                          💬 Ask AI Mentor →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Flippable Study Flashcards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-500" />
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">study & stream flashcards</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Click card to reveal technique</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bottomFlashcards.map((card) => {
                  const isFlipped = !!flippedFlashcards[card.id];
                  return (
                    <div 
                      key={card.id}
                      onClick={() => setFlippedFlashcards({ ...flippedFlashcards, [card.id]: !isFlipped })}
                      className="cursor-pointer h-36 rounded-xl border border-slate-200 dark:border-slate-800 relative transition-all bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden hover:border-pink-500/50"
                    >
                      {isFlipped ? (
                        <div className="space-y-1 w-full animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-[9px] uppercase font-black text-pink-500 tracking-wider">Solution / Tip</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {card.back}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                          <span className="text-2xl">{card.icon}</span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{card.front}</h4>
                          <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">{card.category}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Career Planner Tab */}
        {activeTab === "career" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <GraduationCap className="w-5 h-5 text-violet-500" />
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Career & Stream Guidance</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Discover your potential, plan your studies, and chart your path forward.</p>
                </div>
              </div>

              {isMiddleSchool ? (
                // MIDDLE SCHOOL: INTEREST EXPLORER
                <div className="space-y-5">
                  <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400">Class 6th-8th: Interest Explorer 🧭</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      Choose an activity domain that excites you the most. We will map it to real-world roles and stream suggestions!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: "tech", label: "Science & Tech 🔬", desc: "For kids who love experimenting, computers, and puzzle solving.", icon: "💻" },
                      { id: "arts", label: "Arts & Languages 🎨", desc: "For kids who love storytelling, drawing, music, and writing.", icon: "🎨" },
                      { id: "sports", label: "Sports & Health ⚽", desc: "For kids who love playing outdoors, fitness, and body sciences.", icon: "🏃" },
                      { id: "biz", label: "Business & Leadership 📈", desc: "For kids who love organizing games, math, and selling things.", icon: "🤝" }
                    ].map((interest) => (
                      <button
                        key={interest.id}
                        onClick={() => setSelectedInterest(interest.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedInterest === interest.id
                            ? "border-violet-500 bg-violet-500/5 dark:bg-violet-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-violet-300"
                        }`}
                      >
                        <span className="text-2xl">{interest.icon}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">{interest.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{interest.desc}</p>
                      </button>
                    ))}
                  </div>

                  {selectedInterest && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                      {selectedInterest === "tech" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🔬 Science & Technology Path</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Future Careers:</strong> Software Engineer, Doctor, Robot Specialist, Astronaut, Researcher.
                            <br />
                            <strong>High School Path:</strong> In Class 11, you would enjoy Group 1 (Physics, Chemistry, Maths, Biology/CS). Keep practicing problem-solving and ask questions in science lab sessions!
                          </p>
                        </>
                      )}
                      {selectedInterest === "arts" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🎨 Arts, Writing & Languages Path</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Future Careers:</strong> Storyteller, Graphic Designer, Journalist, Teacher, Translator, UI/UX Designer.
                            <br />
                            <strong>High School Path:</strong> In Class 11, you would enjoy Group 3 (Humanities/Arts) or General streams. Read widely in school library and practice creative writing!
                          </p>
                        </>
                      )}
                      {selectedInterest === "sports" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">⚽ Sports, Health & Physical Science Path</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Future Careers:</strong> Sports Coach, Physiotherapist, Fitness Trainer, Sports Psychologist, nutritionist.
                            <br />
                            <strong>High School Path:</strong> Focus on general science or physical training classes. Participate in inter-school competitions and track your nutrition!
                          </p>
                        </>
                      )}
                      {selectedInterest === "biz" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">📈 Business, Numbers & Economics Path</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Future Careers:</strong> Business Owner, Auditor, Banker, Manager, Economist.
                            <br />
                            <strong>High School Path:</strong> In Class 11, you would enjoy Group 2 (Commerce, Accountancy, Economics, Business Maths). Practice logical thinking and organizing school stall days!
                          </p>
                        </>
                      )}
                      <button
                        onClick={() => {
                          const interestMap: Record<string, string> = {
                            tech: "Science & Technology",
                            arts: "Arts & Languages",
                            sports: "Sports & Health",
                            biz: "Business & Leadership"
                          };
                          setActiveTab("chatbot");
                          handleSendChat(`I ran the Interest Explorer and got matching path: ${interestMap[selectedInterest]}. Can you explain what career choices I can make in Tamil Nadu government schools based on this interest?`);
                        }}
                        className="py-1.5 px-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm flex items-center gap-1 w-fit"
                      >
                        💬 Discuss this with AI Mentor
                      </button>
                    </div>
                  )}
                </div>
              ) : isHighSchoolSecondary ? (
                // HIGH SCHOOL SECONDARY: CHOOSE STREAMS (Grades 9 & 10)
                <div className="space-y-5">
                  <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400">Class 9th-10th: Stream Selector Advisor 📊</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      Explore the standard streams offered in Class 11. Choose a stream to read its details and check matches!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: "group1", label: "Group 1: Science & Math", desc: "Physics, Chem, Biology, Maths or CS. Leads to Medicine/Engineering.", icon: "🧬" },
                      { id: "group2", label: "Group 2: Commerce", desc: "Commerce, Accountancy, Economics, Business Math. Leads to Finance/CA.", icon: "💰" },
                      { id: "group3", label: "Group 3: Humanities", desc: "History, Civics, Geography, Economics. Leads to Law/Civil Services.", icon: "🏛️" },
                      { id: "group4", label: "Group 4: Vocational", desc: "IT, Agriculture, Nursing, Electrical. Leads to ITI/Direct Jobs.", icon: "🔧" }
                    ].map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setSelectedStream(stream.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedStream === stream.id
                            ? "border-violet-500 bg-violet-500/5 dark:bg-violet-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-violet-300"
                        }`}
                      >
                        <span className="text-2xl">{stream.icon}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">{stream.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{stream.desc}</p>
                      </button>
                    ))}
                  </div>

                  {selectedStream && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                      {selectedStream === "group1" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🧬 Group 1 (Science Stream)</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Subjects:</strong> Physics, Chemistry, Biology/Computer Science, Mathematics.
                            <br />
                            <strong>Pathways:</strong> Engineering (TNEA/JEE), MBBS/BDS (NEET), BSc Chemistry/Physics/Maths, Agriculture (TNAU).
                            <br />
                            <strong>Advice:</strong> Requires strong study consistency (Pomodoro) and daily practice of numericals/diagrams.
                          </p>
                        </>
                      )}
                      {selectedStream === "group2" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">💰 Group 2 (Commerce Stream)</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Subjects:</strong> Commerce, Accountancy, Economics, Business Mathematics / Computer Applications.
                            <br />
                            <strong>Pathways:</strong> BCom, BBA, CA (Chartered Accountancy), CS (Company Secretary), Actuarial Science.
                            <br />
                            <strong>Advice:</strong> Focus on understanding ledger systems, business principles, and basic math. Perfect if you love organization and numbers!
                          </p>
                        </>
                      )}
                      {selectedStream === "group3" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🏛️ Group 3 (Humanities Stream)</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Subjects:</strong> History, Geography, Economics, Political Science.
                            <br />
                            <strong>Pathways:</strong> BA History/English, Law (CLAT/TNDALU), Civil Services (UPSC), Journalism, Tourism.
                            <br />
                            <strong>Advice:</strong> Emphasizes critical analysis, essay writing, and timelines. Great for understanding society and government systems!
                          </p>
                        </>
                      )}
                      {selectedStream === "group4" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🔧 Group 4 (Vocational Stream)</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Subjects:</strong> General Machinist, Auto Mechanic, IT, Nursing Assistant, Agriculture.
                            <br />
                            <strong>Pathways:</strong> ITI certificate courses, Polytechnic Diplomas, immediate apprenticeship entry, or self-employment.
                            <br />
                            <strong>Advice:</strong> Hands-on skill oriented. Highly demanded in industries. Excellent choice for direct job preparation after Class 12.
                          </p>
                        </>
                      )}
                      <button
                        onClick={() => {
                          const streamMap: Record<string, string> = {
                            group1: "Group 1 (Science)",
                            group2: "Group 2 (Commerce)",
                            group3: "Group 3 (Humanities)",
                            group4: "Group 4 (Vocational)"
                          };
                          setActiveTab("chatbot");
                          handleSendChat(`I am in Class 10 and reviewing streams. I am interested in ${streamMap[selectedStream]}. Can you advise me on what career options open up for this group and what study habits I need?`);
                        }}
                        className="py-1.5 px-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm flex items-center gap-1 w-fit"
                      >
                        💬 Discuss this stream with AI Mentor
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // HIGHER SECONDARY: CAREER ROADMAPS (Grades 11 & 12)
                <div className="space-y-5">
                  <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400">Class 11th-12th: Career Pathway Roadmap 🗺️</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      Choose your career goal below. We will provide preparation guidance and quick links to preparation resources!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "jee", label: "Engineering (JEE/TNEA) ⚙️", desc: "Focuses on Physics, Chem, Math. Entrance exams lead to IIT/NIT or state engineering colleges.", icon: "⚙️" },
                      { id: "neet", label: "Medical & Allied (NEET) 🩺", desc: "Requires Biology focus. Leads to MBBS, BDS, Nursing, or veterinary courses.", icon: "🩺" },
                      { id: "finance", label: "Finance & Corporate (CA/CS) 📊", desc: "Requires CA Foundation or BCom. Leads to accountant and corporate controller roles.", icon: "💼" },
                      { id: "upsc", label: "Civil Services & Law (UPSC/CLAT) 🏛️", desc: "Leads to IAS, IPS, or Advocate. Focuses on history, general knowledge, and reasoning.", icon: "⚖️" },
                      { id: "voc", label: "Vocational & Polytechnic 🔧", desc: "Leads to ITI diplomas, technical trades, and immediate job entries. High skill focus.", icon: "🔧" }
                    ].map((path) => (
                      <button
                        key={path.id}
                        onClick={() => setSelectedPathway(path.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedPathway === path.id
                            ? "border-violet-500 bg-violet-500/5 dark:bg-violet-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-violet-300"
                        }`}
                      >
                        <span className="text-2xl">{path.icon}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2">{path.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{path.desc}</p>
                      </button>
                    ))}
                  </div>

                  {selectedPathway && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
                      {selectedPathway === "jee" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">⚙️ Engineering Pathway</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Key Exams:</strong> JEE Main (for IITs/NITs) and TNEA (Tamil Nadu Engineering Admissions - based on Class 12 board marks).
                            <br />
                            <strong>Preparation Check:</strong> Solve daily maths problems. Build strong conceptual clarity in Physics and Chemistry. Link to our study dashboard for notes.
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Link href="/student/competitive-exams" className="py-1 px-2.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border border-violet-500/20 font-bold rounded-lg text-[9px] transition-colors">
                              📖 Go to Competitive Exams Prep Page
                            </Link>
                          </div>
                        </>
                      )}
                      {selectedPathway === "neet" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🩺 Medical (NEET) Pathway</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Key Exam:</strong> National Eligibility cum Entrance Test (NEET).
                            <br />
                            <strong>Preparation Check:</strong> Thoroughly study and draw Biology diagrams (anatomies, plant cycles). Revise chemistry organic naming reactions.
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Link href="/student/neet-prep" className="py-1 px-2.5 bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border border-violet-500/20 font-bold rounded-lg text-[9px] transition-colors">
                              🩺 Go to NEET Prep Center
                            </Link>
                          </div>
                        </>
                      )}
                      {selectedPathway === "finance" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">💼 Finance, CA & Business Pathway</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Key Exams:</strong> CA Foundation (Chartered Accountancy) or CUET (for central university commerce courses).
                            <br />
                            <strong>Preparation Check:</strong> Learn double-entry bookkeeping rules. Develop business calculations. Practice accounting templates daily.
                          </p>
                        </>
                      )}
                      {selectedPathway === "upsc" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">⚖️ Civil Services & Law Pathway</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Key Exams:</strong> CLAT (Common Law Admission Test for NLUs) or preparation pathways for TNPSC / UPSC after graduation.
                            <br />
                            <strong>Preparation Check:</strong> Read newspapers daily (editorial columns). Develop logical reasoning arguments and understand government policies.
                          </p>
                        </>
                      )}
                      {selectedPathway === "voc" && (
                        <>
                          <h4 className="text-xs font-bold text-violet-500">🔧 Vocational, ITI & Polytechnic Trade Pathway</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <strong>Key Entry:</strong> State Polytechnic/ITI diploma counselling after Class 10 or 12.
                            <br />
                            <strong>Preparation Check:</strong> Learn hands-on workshop practices. High employment scope in electronics assembly, CNC, and auto sectors in TN.
                          </p>
                        </>
                      )}
                      <button
                        onClick={() => {
                          const pathwayMap: Record<string, string> = {
                            jee: "Engineering (JEE/TNEA)",
                            neet: "Medical (NEET)",
                            finance: "Finance & BCom (CA)",
                            upsc: "Civil Services & Law",
                            voc: "Vocational / Polytechnic"
                          };
                          setActiveTab("chatbot");
                          handleSendChat(`I am in Class 12 and looking at the ${pathwayMap[selectedPathway]} pathway. Can you guide me on the study plan, required preparation strategies, and how to stay motivated?`);
                        }}
                        className="py-1.5 px-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm flex items-center gap-1 w-fit"
                      >
                        💬 Discuss this pathway with AI Mentor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Wellness Tab */}
        {activeTab === "personal" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Heart className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Personal Wellness & Mindset</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Comfort, stress management, cyber-safety, and setting healthy boundaries.</p>
                </div>
              </div>

              {/* Mood indicator */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">How do you feel today?</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Happy / Proud", icon: "😊", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
                    { label: "Anxious / Stressed", icon: "😰", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20" },
                    { label: "Lonely / Left Out", icon: "🥺", color: "text-pink-500 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20" },
                    { label: "Angry / Frustrated", icon: "😤", color: "text-rose-500 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20" },
                    { label: "Unmotivated / Tired", icon: "🥱", color: "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" }
                  ].map((emotion) => (
                    <button
                      key={emotion.label}
                      onClick={() => handleEmotionSelect(emotion.label)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all text-xs font-bold ${
                        selectedEmotion === emotion.label
                          ? "ring-2 ring-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500"
                          : emotion.color
                      }`}
                    >
                      <span className="text-2xl">{emotion.icon}</span>
                      <span>{emotion.label.split(" / ")[0]}</span>
                    </button>
                  ))}
                </div>

                {selectedEmotion && emotionAdvice && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">🧘 Supportive Mindset Advice</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {emotionAdvice}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("chatbot");
                        handleSendChat(`I'm feeling ${selectedEmotion} today. Can you offer some support, motivation, and help me feel better?`);
                      }}
                      className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[9px] transition-colors shadow-sm flex items-center gap-1"
                    >
                      💬 Discuss this feeling with AI Mentor
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic wellness block */}
              {isMiddleSchool ? (
                // MIDDLE SCHOOL: BULLYING & CYBER-SAFETY CORNER
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">🛡️ Bullying & Cyber-safety Prevention Corner</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      Being safe online and in school makes you strong. Click on common scenarios below to read what to do:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        title: "Mean Comments Online 📱", 
                        scenario: "Someone posts bad words on your social page or mobile groups.", 
                        action: "Do not respond to them! Take screenshots as evidence, block their number, and talk to your parent or class teacher immediately." 
                      },
                      { 
                        title: "Teasing at School 🏫", 
                        scenario: "A classmate makes fun of your score or excludes you during games.", 
                        action: "Walk away with confidence. Remember, their bad behavior reflects on them, not you. Keep close to supportive friends and tell your teacher." 
                      },
                      { 
                        title: "Digital Etiquette (Netiquette) 🤝", 
                        scenario: "Sharing passwords or sending anonymous messages.", 
                        action: "Never share passwords, EMIS IDs, or phone numbers with anyone. Always type kind words online. Treat others as you want to be treated." 
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 leading-normal">{item.scenario}</p>
                        <div className="p-2.5 bg-emerald-500/5 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed border border-emerald-500/10">
                          <strong>What to do:</strong> {item.action}
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("chatbot");
                            handleSendChat(`Can you help me understand how to handle this situation: ${item.title}? ${item.scenario}`);
                          }}
                          className="text-[9px] text-emerald-500 font-bold hover:underline"
                        >
                          Discuss safety steps with AI →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // HIGH SCHOOL: 4-7-8 BREATHING & PEER PRESSURE
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  
                  {/* Breathing Box */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">🌬️ Interactive 4-7-8 Breathing Balloon</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Anxiety or exam pressure can be handled by practicing deep breathing. Inhale for 4 seconds, hold for 7 seconds, and exhale slowly for 8 seconds.
                      </p>
                      <ul className="text-[10px] text-slate-400 space-y-1">
                        <li>• Step 1: Click the balloon to start or pause.</li>
                        <li>• Step 2: Breathe in through your nose (Balloon expands).</li>
                        <li>• Step 3: Hold your breath (Balloon stays large).</li>
                        <li>• Step 4: Exhale completely (Balloon shrinks).</li>
                      </ul>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-60 relative overflow-hidden">
                      <div 
                        onClick={() => setBreathingActive(!breathingActive)}
                        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-[4000ms] ease-in-out shadow-lg ${
                          breathingActive 
                            ? breathingText === "Inhale..." 
                              ? "bg-indigo-500 scale-125 ring-8 ring-indigo-500/20" 
                              : breathingText === "Hold breath..." 
                                ? "bg-purple-500 scale-125 ring-8 ring-purple-500/30" 
                                : "bg-teal-500 scale-90 ring-8 ring-teal-500/20 duration-[8000ms]" 
                            : "bg-slate-400 dark:bg-slate-800 hover:bg-emerald-500"
                        }`}
                      >
                        <span className="text-[11px] font-black">{breathingText}</span>
                        <span className="text-2xl font-extrabold mt-0.5">{breathingTimer}s</span>
                        <span className="text-[8px] uppercase font-bold tracking-wider mt-1 opacity-80">
                          {breathingActive ? "Click to Pause" : "Click to Start"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peer Pressure Guides */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">🧩 Peer Pressure Boundaries Guide</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { 
                          title: "Late Night Media Chat 📱", 
                          scenario: "Your group is texting late at night, but you want to sleep for exams.", 
                          boundary: "I am heading off to sleep now. Good luck for tomorrow, talk then!",
                          tip: "Log a screen break. Rested brains score 15% higher than sleep-deprived ones."
                        },
                        { 
                          title: "Mark / Score Comparison 📈", 
                          scenario: "Friends are bragging about marks, making you feel bad about yours.", 
                          boundary: "That's a nice score! I'm happy with my own progress since last exam.",
                          tip: "Growth Mindset: Intelligence is plastic. Only compare yourself with your yesterday."
                        },
                        { 
                          title: "Study vs Bunking Class 🏫", 
                          scenario: "Friends ask you to skip class or skip homework to play games.", 
                          boundary: "I have to finish my lessons first, but I can join you for play in the evening!",
                          tip: "Set boundaries without breaking friendships. Good friends respect your goals."
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">{item.scenario}</p>
                          <div className="p-2 bg-emerald-500/5 rounded-lg text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed border border-emerald-500/10">
                            <strong>What to say (Boundary):</strong> <span className="italic">"{item.boundary}"</span>
                          </div>
                          <p className="text-[9px] text-slate-400">💡 <strong>Coach tip:</strong> {item.tip}</p>
                          <button
                            onClick={() => {
                              setActiveTab("chatbot");
                              handleSendChat(`I want to discuss peer pressure boundary: ${item.title}. The situation is: ${item.scenario}. How can I stick to this boundary?`);
                            }}
                            className="text-[9px] text-emerald-500 font-bold hover:underline"
                          >
                            Discuss boundary with AI Mentor →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Self-Care Tracker Tab (Gamification) */}
        {activeTab === "gamification" && (
          <div className="space-y-6">
            
            {/* Gamification Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Tracker Form */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Log Self-Care Efforts</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Carol Dweck's Growth Mindset: We praise effort & self-care progress.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  {/* Habits inputs */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Screen-Time Break</h4>
                      <p className="text-[10px] text-slate-400">Did you take a 1+ hour break from mobile screens today?</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={screenTimeBreak}
                      onChange={(e) => setScreenTimeBreak(e.target.checked)}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-400 border-slate-300 rounded" 
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Sleep Log</h4>
                        <p className="text-[10px] text-slate-400">How many hours of sleep did you get last night?</p>
                      </div>
                      <span className="text-xs font-extrabold text-amber-500">{sleepHours} hours</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="12" 
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Reflection Journal</h4>
                    <p className="text-[10px] text-slate-400">What challenges did you face today? How did your effort make you stronger?</p>
                    <textarea 
                      rows={3} 
                      value={reflectionJournal}
                      onChange={(e) => setReflectionJournal(e.target.value)}
                      placeholder="Today, I struggled with maths algebra, but I practiced 3 problems and didn't give up..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleHabitSubmit}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Submit Effort & Log Self-Care
                  </button>

                </div>
              </div>

              {/* Reward stats */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Your Progress</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Points */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400">Effort Points</span>
                        <div className="text-xl font-extrabold text-amber-500">{rewardProfile.points} pts</div>
                      </div>
                      <span className="text-2xl">⭐</span>
                    </div>

                    {/* Streak */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl">
                      <div>
                        <span className="text-[9px] uppercase font-black text-slate-400">Daily Streak</span>
                        <div className="text-xl font-extrabold text-orange-500">{rewardProfile.streak} days</div>
                      </div>
                      <div className="flex items-center text-orange-500 animate-bounce">
                        <Flame className="w-6 h-6 fill-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Growth mindset citation */}
                  <div className="mt-4 p-3 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
                      "{growthQuote}"
                    </p>
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-2.5 rounded-lg text-center mt-4">
                  🔒 <strong>No Competitive Leaderboard</strong>: Self-care is a private journey. We only celebrate your personal effort!
                </div>
              </div>

            </div>

            {/* Badges Cabinet */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                🏆 effort badges cabinet
              </h3>

              {rewardProfile.badges.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No badges earned yet. Submit your self-care efforts above to unlock your first badge!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rewardProfile.badges.map((badgeKey) => {
                    const detail = BADGE_DETAILS[badgeKey] || { label: badgeKey, desc: "Awarded for self-care efforts.", icon: "🏅", color: "from-slate-400 to-slate-500" };
                    return (
                      <div 
                        key={badgeKey}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${detail.color} flex items-center justify-center text-lg shadow-sm shrink-0`}>
                          {detail.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{detail.label}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{detail.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Habit logs history */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                📅 Self-Care History (Last 30 Logs)
              </h3>
              
              {habitLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">No habit logs found. Start logging today!</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {habitLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row justify-between gap-2 md:items-center text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{log.date}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 font-bold rounded">+{log.pointsEarned} pts</span>
                        </div>
                        {log.reflectionJournal && (
                          <p className="text-[10px] text-slate-400 italic">"{log.reflectionJournal}"</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {log.screenTimeBreak && (
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold rounded">📱 Screen Break</span>
                        )}
                        <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-500 font-bold rounded">💤 {log.sleepHours}h Sleep</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* AI Mentor Chatbot Tab */}
        {activeTab === "chatbot" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            
            {/* Chatbot Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">AI Coach & Career Mentor</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Safe conversation space focused on your mindset and choices.</p>
                </div>
              </div>

              {/* Daily Quota Counter */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Daily messages:</span>
                <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2" style={{ width: `${(quotaUsed / quotaLimit) * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-extrabold text-indigo-500">{quotaUsed} / {quotaLimit}</span>
              </div>
            </div>

            {/* Chat panel */}
            <div className="flex flex-col h-96 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl overflow-hidden">
              
              {/* Message scroll */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-2.5 max-w-lg ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white shrink-0 ${
                      msg.role === 'user' ? 'bg-pink-500' : 'bg-indigo-500'
                    }`}>
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-pink-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white shrink-0">🤖</div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-400 text-xs rounded-tl-none animate-pulse">
                      AI Mentor is writing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat footer presets */}
              {chatMessages.length === 1 && (
                <div className="p-3 border-t border-slate-150 dark:border-slate-855 flex flex-wrap gap-2 justify-center bg-white dark:bg-slate-900">
                  {[
                    "How can I study better?",
                    "I feel stressed about exams",
                    "Suggest a career after Class 10/12"
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSendChat(preset)}
                      className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-400 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-150 dark:border-slate-855 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder={quotaUsed >= quotaLimit ? "Daily quota exceeded" : "Ask your AI Mentor..."}
                  disabled={quotaUsed >= quotaLimit || sendingChat}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 flex-1 transition-colors"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={quotaUsed >= quotaLimit || sendingChat || !inputMessage.trim()}
                  className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center text-white shadow transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      {/* ── Enter Marks Modal ─────────────────────────────────── */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">📝 Enter / Edit My Marks</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Self-report your marks to update study guidance</p>
              </div>
              <button
                onClick={() => setShowMarksModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {Object.keys(inputMarks).map((sub) => (
                <div key={sub} className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputMarks[sub as keyof typeof inputMarks]}
                    onChange={(e) => setInputMarks({
                      ...inputMarks,
                      [sub]: Math.min(100, Math.max(0, Number(e.target.value) || 0))
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              ))}

              <button
                onClick={handleMarksSave}
                disabled={savingMarks}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                {savingMarks ? "Saving Marks..." : "✅ Save Marks & Update Guidance"}
              </button>
            </div>
          </div>
        </div>
      )}



      </div>
    </PortalLayout>
  );
}
