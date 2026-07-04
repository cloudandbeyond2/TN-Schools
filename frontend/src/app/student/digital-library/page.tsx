"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  BookOpen, 
  Search, 
  Book, 
  Video, 
  ArrowRight, 
  Star, 
  Bookmark, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  X, 
  ChevronRight, 
  Download, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  Layers, 
  Languages,
  BookmarkCheck,
  Send,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";

interface LibraryResource {
  id: string;
  title: string;
  type: string;
  subject: string;
  class: string;
  size: string;
  description: string;
  tags: string[];
  fileUrl?: string;
  aiContent?: string;
  views?: number;
  downloads?: number;
  coverImage?: string;
  teacherName?: string;
  teacherId?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Curated colors for subjects
const subjectColor: Record<string, { main: string; gradient: string; text: string; bg: string; border: string }> = {
  Mathematics: { main: "#6366f1", gradient: "from-indigo-500 to-purple-600", text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/20", border: "border-indigo-100 dark:border-indigo-900/50" },
  Physics: { main: "#3b82f6", gradient: "from-blue-500 to-indigo-600", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900/50" },
  Chemistry: { main: "#ec4899", gradient: "from-pink-500 to-rose-600", text: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/20", border: "border-pink-100 dark:border-pink-900/50" },
  Biology: { main: "#10b981", gradient: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900/50" },
  Tamil: { main: "#f97316", gradient: "from-orange-500 to-amber-600", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-100 dark:border-orange-900/50" },
  English: { main: "#06b6d4", gradient: "from-cyan-500 to-sky-600", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/20", border: "border-cyan-100 dark:border-cyan-900/50" },
  History: { main: "#eab308", gradient: "from-yellow-500 to-amber-600", text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/20", border: "border-yellow-100 dark:border-yellow-900/50" },
  "Social Science": { main: "#a855f7", gradient: "from-purple-500 to-pink-600", text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-100 dark:border-purple-900/50" }
};

const typeIcon: Record<string, string> = { PDF: "📄", Video: "🎬", "E-Book": "📚", Worksheet: "📋", PPT: "📊", Audio: "🎵" };

// High-quality state board resources to seed library when empty or for offline fallback
const defaultStateTextbooks: LibraryResource[] = [];

export default function DigitalLibraryPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const studentClassFromSession = (session?.user as any)?.class || "10";

  // State Variables
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClass, setSelectedClass] = useState<string>(studentClassFromSession);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  
  // Bookmarks & Recents
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<LibraryResource[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [continueLearning, setContinueLearning] = useState<any[]>([]);

  // Custom Modal State
  const [activeModalResource, setActiveModalResource] = useState<LibraryResource | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"summary" | "points" | "mindmap" | "flashcards" | "questions" | "quiz" | "chat">("summary");
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [bookmarkedFlashcards, setBookmarkedFlashcards] = useState<string[]>([]);
  
  // AI Study Companion States
  const [companionData, setCompanionData] = useState<any | null>(null);
  const [companionLoading, setCompanionLoading] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  
  // Quiz Running State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // AI Chat Tutor State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model" | "system"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Dynamic AI Quiz Generation State
  const [generatedQuiz, setGeneratedQuiz] = useState<any[] | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Origin Filter (Teacher assignments vs global textbooks)
  const [originFilter, setOriginFilter] = useState<"all" | "teacher" | "textbooks">("all");

  const categories = [
    { id: "all", label: "All Formats" },
    { id: "PDF", label: "PDF Books" },
    { id: "Video", label: "Video Lectures" },
    { id: "Worksheet", label: "Worksheets" },
    { id: "E-Book", label: "E-Books" },
  ];

  const subjectsList = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Tamil", "English", "Social Science"];

  // Fetch from Database
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      
      const res = await fetch(`${API}/api/digital-library?${params}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setResources(data.data);
      } else {
        setResources([]);
      }
    } catch (e) {
      console.error(e);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Synchronize class from session once it loads asynchronously
  useEffect(() => {
    const sessionClass = (session?.user as any)?.class;
    if (sessionClass) {
      setSelectedClass(String(sessionClass));
    }
  }, [session]);

  const fetchProgress = useCallback(async () => {
    if (!(session?.user as any)?.id) return;
    try {
      const res = await fetch(`${API}/api/digital-library/progress?studentId=${(session?.user as any)?.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContinueLearning(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch library progress", e);
    }
  }, [session]);

  // Load Bookmarks & Recently Viewed on Mount
  useEffect(() => {
    fetchResources();
    fetchProgress();
    
    try {
      const savedBookmarks = localStorage.getItem("tn_library_bookmarks");
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

      const savedRecents = localStorage.getItem("tn_library_recent");
      if (savedRecents) setRecentlyViewed(JSON.parse(savedRecents));
    } catch (err) {
      console.error("Failed to load local storage:", err);
    }
  }, [fetchResources, fetchProgress]);

  // Time & progress tracker sync for active reading modal
  useEffect(() => {
    if (!activeModalResource || !(session?.user as any)?.id) return;
    
    let lastSyncTime = Date.now();

    const interval = setInterval(async () => {
      const now = Date.now();
      const timeDiffSeconds = Math.round((now - lastSyncTime) / 1000);
      if (timeDiffSeconds >= 5) {
        lastSyncTime = now;
        let progressPercent = 20;
        if (activeModalTab === "points") progressPercent = 40;
        else if (activeModalTab === "mindmap") progressPercent = 55;
        else if (activeModalTab === "flashcards") progressPercent = 70;
        else if (activeModalTab === "questions") progressPercent = 85;
        else if (activeModalTab === "quiz") progressPercent = quizFinished ? 100 : 95;
        else if (activeModalTab === "chat") progressPercent = 98;

        const chapterNames: Record<string, string> = {
          summary: "📚 Summary Overview",
          points: "💡 Key Takeaways",
          mindmap: "🗺️ Concept Mind Map",
          flashcards: "🎴 Study Flashcards",
          questions: "📝 Exam Q&A Revision",
          quiz: "🎯 Self-Assessment Quiz",
          chat: "💬 AI Tutor Session"
        };

        try {
          await fetch(`${API}/api/digital-library/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: (session?.user as any)?.id,
              resourceId: activeModalResource.id,
              resourceTitle: activeModalResource.title,
              subject: activeModalResource.subject,
              type: activeModalResource.type,
              lastChapter: chapterNames[activeModalTab] || "Summary",
              progressPercent,
              timeSpentSeconds: timeDiffSeconds
            })
          });
          fetchProgress();
        } catch (e) {
          console.error("Failed to sync study progress:", e);
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      const totalSessionSeconds = Math.round((Date.now() - lastSyncTime) / 1000);
      if (totalSessionSeconds > 0) {
        let progressPercent = 20;
        if (activeModalTab === "points") progressPercent = 40;
        else if (activeModalTab === "mindmap") progressPercent = 55;
        else if (activeModalTab === "flashcards") progressPercent = 70;
        else if (activeModalTab === "questions") progressPercent = 85;
        else if (activeModalTab === "quiz") progressPercent = quizFinished ? 100 : 95;
        else if (activeModalTab === "chat") progressPercent = 98;

        const chapterNames: Record<string, string> = {
          summary: "📚 Summary Overview",
          points: "💡 Key Takeaways",
          mindmap: "🗺️ Concept Mind Map",
          flashcards: "🎴 Study Flashcards",
          questions: "📝 Exam Q&A Revision",
          quiz: "🎯 Self-Assessment Quiz",
          chat: "💬 AI Tutor Session"
        };

        fetch(`${API}/api/digital-library/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: (session?.user as any)?.id,
            resourceId: activeModalResource.id,
            resourceTitle: activeModalResource.title,
            subject: activeModalResource.subject,
            type: activeModalResource.type,
            lastChapter: chapterNames[activeModalTab] || "Summary",
            progressPercent,
            timeSpentSeconds: totalSessionSeconds
          })
        }).then(() => fetchProgress()).catch(() => {});
      }
    };
  }, [activeModalResource, activeModalTab, quizFinished, session, fetchProgress]);

  // Toggle Bookmark
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (bookmarks.includes(id)) {
      updated = bookmarks.filter(b => b !== id);
    } else {
      updated = [...bookmarks, id];
    }
    setBookmarks(updated);
    localStorage.setItem("tn_library_bookmarks", JSON.stringify(updated));
  };

  // Open resource
  const handleOpenResource = (res: LibraryResource) => {
    // 1. Add to Recently Viewed
    let updatedRecents = [res, ...recentlyViewed.filter(item => item.id !== res.id)];
    if (updatedRecents.length > 4) {
      updatedRecents = updatedRecents.slice(0, 4);
    }
    setRecentlyViewed(updatedRecents);
    localStorage.setItem("tn_library_recent", JSON.stringify(updatedRecents));

    // Increment view count on backend asynchronously
    fetch(`${API}/api/digital-library/${res.id}`).catch(() => {});

    // 2. Open PDF/Video in new tab if requested and not showing study notes
    if (res.fileUrl && !res.aiContent) {
      window.open(res.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 3. Otherwise, open custom modal
    setActiveModalResource(res);
    setActiveModalTab("summary");
    
    // Reset Quiz State
    setGeneratedQuiz(null);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setQuizSubmitted(false);
    setQuizFinished(false);

    // Reset Companion state
    setCompanionData(null);
    setCompanionLoading(false);
    setRevealedAnswers([]);
    setCurrentFlashcardIdx(0);
    setFlashcardFlipped(false);

    // Fetch Companion
    fetchCompanionData(res);

    // Initialize Chat Messages
    setChatMessages([
      {
        role: "model",
        content: `✨ Vanakkam! I am your AI Study Tutor. Ask me any doubts about **"${res.title}"**. I can explain concepts in English, Tamil, or both!`
      }
    ]);
  };

  // Chat message submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeModalResource) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      // Map message structure for backend
      const formattedHistory = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const res = await fetch(`${API}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeModalResource.subject,
          grade: activeModalResource.class,
          messages: formattedHistory,
          currentMessage: userMsg,
          language: "bilingual"
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setChatMessages(prev => [...prev, { role: "model", content: data.text }]);
      } else {
        throw new Error("Chat tutor failed");
      }
    } catch (err) {
      console.error(err);
      // Fallback mock educational response in Tamil/English
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev, 
          { 
            role: "model", 
            content: `Here is a helpful tip about **${activeModalResource.title}**: Make sure you practice solving the textbook questions. Let me know if you want me to explain any specific concept or mathematical formula! (Gemini offline fallback response)` 
          }
        ]);
      }, 800);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!activeModalResource) return;
    setGeneratingQuiz(true);
    try {
      const res = await fetch(`${API}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: activeModalResource.class,
          subject: activeModalResource.subject,
          topic: activeModalResource.title,
          difficulty: "Medium",
          mcqCount: 3,
          shortCount: 0,
          longCount: 0
        })
      });
      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data)) {
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        const mappedQuestions = data.data
          .filter((q: any) => q.type === "mcq" && q.options)
          .map((q: any) => {
            const cleanAnswer = q.answer.trim().charAt(0).toUpperCase();
            return {
              question: q.text,
              options: q.options,
              answerIndex: letterMap[cleanAnswer] !== undefined ? letterMap[cleanAnswer] : 0
            };
          });

        if (mappedQuestions.length > 0) {
          setGeneratedQuiz(mappedQuestions);
          setCurrentQuizIndex(0);
          setSelectedQuizAnswer(null);
          setQuizScore(0);
          setQuizSubmitted(false);
          setQuizFinished(false);
        } else {
          throw new Error("No MCQs returned");
        }
      } else {
        throw new Error("Failed to generate quiz");
      }
    } catch (err) {
      console.error(err);
      // Fallback simple quiz on the fly based on title to keep it working
      const mockQuestions = [
        {
          question: `Which of the following is the main topic covered in this resource "${activeModalResource.title}"?`,
          options: [`A) ${activeModalResource.subject}`, `B) Unrelated topics`, `C) None of the above`, `D) General study`],
          answerIndex: 0
        },
        {
          question: `What is the recommended target grade level for this study guide?`,
          options: [`A) Class 6`, `B) Class 8`, `C) Class ${activeModalResource.class}`, `D) College Level`],
          answerIndex: 2
        }
      ];
      setGeneratedQuiz(mockQuestions);
      setCurrentQuizIndex(0);
      setSelectedQuizAnswer(null);
      setQuizScore(0);
      setQuizSubmitted(false);
      setQuizFinished(false);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const fetchFlashcardBookmarks = useCallback(async () => {
    if (!(session?.user as any)?.id) return;
    try {
      const res = await fetch(`${API}/api/digital-library/flashcards/bookmarks?studentId=${(session?.user as any)?.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setBookmarkedFlashcards(data.data.map((b: any) => b.flashcardId));
      }
    } catch (e) {
      console.error("Failed to fetch flashcard bookmarks:", e);
    }
  }, [session]);

  const toggleFlashcardBookmark = async (fc: { id: string; front: string; back: string }) => {
    if (!(session?.user as any)?.id || !activeModalResource) return;
    try {
      const res = await fetch(`${API}/api/digital-library/flashcards/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: (session?.user as any)?.id,
          resourceId: activeModalResource.id,
          flashcardId: fc.id,
          front: fc.front,
          back: fc.back
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.bookmarked) {
          setBookmarkedFlashcards(prev => [...prev, fc.id]);
        } else {
          setBookmarkedFlashcards(prev => prev.filter(id => id !== fc.id));
        }
      }
    } catch (e) {
      console.error("Failed to toggle flashcard bookmark:", e);
    }
  };

  const fetchCompanionData = async (res: LibraryResource) => {
    setCompanionLoading(true);
    try {
      const response = await fetch(`${API}/api/ai/companion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: res.id,
          title: res.title,
          subject: res.subject,
          grade: res.class,
          description: res.description,
          aiContent: res.aiContent
        })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCompanionData(data.data);
        fetchFlashcardBookmarks();
      } else {
        throw new Error("Failed to load companion");
      }
    } catch (err) {
      console.error("Companion error, using offline fallback:", err);
      setCompanionData({
        summary: `<p>Welcome to the AI Study Companion. This lesson covers key concepts regarding <strong>${res.title}</strong> in the subject of <strong>${res.subject}</strong>.</p><p>Please review the notes and try the interactive practice quiz!</p>`,
        keyPoints: [
          `Key concept analysis of ${res.title}.`,
          `Essential standard board syllabus coverage.`,
          `Revision summary for exam preparation.`
        ],
        formulas: [
          `Subject focus: ${res.subject}`,
          `Target class standard: Class ${res.class}`
        ],
        mindMap: `[${res.subject}] ➔ [${res.title}] ➔ [Summary & Key Points] ➔ [Exam Q&A]`,
        examQuestions: [
          { question: `What is the primary topic of ${res.title}?`, answerKey: `The primary topic covers the core syllabus of ${res.subject} under the TN State Board curriculum.`, marks: 2 },
          { question: `Who assigned this learning resource?`, answerKey: `This resource was assigned/curated for revision by school teachers or is reference state textbook material.`, marks: 2 }
        ],
        flashcards: [
          { id: "fc-1", front: `What is the core topic of ${res.title}?`, back: `This material covers key chapters of ${res.subject} for Class ${res.class}.` },
          { id: "fc-2", front: "Revision Strategy", back: "Read the key points, study the mind map, and take the practice quiz." }
        ],
        visualMindMap: {
          topic: res.title,
          branches: [
            { title: "Syllabus Focus", details: [`Core subject: ${res.subject}`, `Target grade: Class ${res.class}`] },
            { title: "Self Study Guide", details: ["Read companion summary", "Practice interactive quiz questions"] }
          ]
        }
      });
      fetchFlashcardBookmarks();
    } finally {
      setCompanionLoading(false);
    }
  };

  const toggleRevealAnswer = (idx: number) => {
    if (revealedAnswers.includes(idx)) {
      setRevealedAnswers(prev => prev.filter(i => i !== idx));
    } else {
      setRevealedAnswers(prev => [...prev, idx]);
    }
  };

  // Parser for AI Content
  const parsedAi = activeModalResource ? (() => {
    const raw = activeModalResource.aiContent;
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (data.explanation || data.keyNotes || data.quiz) {
        return {
          explanation: data.explanation || "",
          keyNotes: Array.isArray(data.keyNotes) ? data.keyNotes : [],
          quiz: Array.isArray(data.quiz) ? data.quiz : []
        };
      }
      if (data.content) {
        return { explanation: data.content, keyNotes: [], quiz: [] };
      }
      return { explanation: typeof data === 'string' ? data : JSON.stringify(data), keyNotes: [], quiz: [] };
    } catch (e) {
      return { explanation: raw, keyNotes: [], quiz: [] };
    }
  })() : null;

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswer(optionIdx);
  };

  // Submit Quiz Answer
  const handleSubmitQuizAnswer = () => {
    const activeQuiz = generatedQuiz || (parsedAi && parsedAi.quiz && parsedAi.quiz.length > 0 ? parsedAi.quiz : null);
    if (selectedQuizAnswer === null || !activeQuiz) return;
    const correctIdx = activeQuiz[currentQuizIndex].answerIndex;
    
    if (selectedQuizAnswer === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
    setQuizSubmitted(true);
  };

  // Next Quiz Question or Complete
  const handleNextQuizQuestion = () => {
    const activeQuiz = generatedQuiz || (parsedAi && parsedAi.quiz && parsedAi.quiz.length > 0 ? parsedAi.quiz : null);
    if (!activeQuiz) return;
    
    if (currentQuizIndex + 1 < activeQuiz.length) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  // Filter Logic
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || res.type === selectedCategory;
    const matchesClass = selectedClass === "All" || res.class === selectedClass;
    const matchesSubject = selectedSubject === "All" || res.subject === selectedSubject;
    const matchesBookmark = !showBookmarksOnly || bookmarks.includes(res.id);

    let matchesOrigin = true;
    if (originFilter === "teacher") {
      matchesOrigin = !!res.teacherId || !!res.teacherName;
    } else if (originFilter === "textbooks") {
      matchesOrigin = !res.teacherId && !res.teacherName;
    }

    return matchesSearch && matchesCategory && matchesClass && matchesSubject && matchesBookmark && matchesOrigin;
  });

  return (
    <PortalLayout title="Digital Library 📖" subtitle="Access textbooks, interactive study guides, and test your knowledge" accentColor="#6366f1">
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Banner with modern mesh gradient & search */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-8 md:p-10 shadow-2xl border border-indigo-500/20">
          <div className="absolute -right-16 -top-16 opacity-15 transform rotate-12 scale-150 pointer-events-none mix-blend-overlay">
            <BookOpen className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-500/30 backdrop-blur-md rounded-full border border-indigo-400/20 text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> AI-Powered Study Lounge
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans leading-tight">
                Empower Your Learning Path
              </h2>
              <p className="text-indigo-100 text-sm md:text-base leading-relaxed">
                Unlock official TN Board textbooks, interactive slides, and micro-video lectures curated by your teachers. Take practice quizzes with instant AI evaluations.
              </p>
            </div>

            {/* Premium Glassmorphic Search box */}
            <div className="w-full md:w-80 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-2.5 rounded-2xl shadow-inner flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-200 pl-1 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, chapter..."
                className="w-full bg-transparent border-0 text-white placeholder-indigo-200/70 focus:ring-0 focus:outline-none text-sm pr-2"
              />
            </div>
          </div>
        </div>

        {/* Continue Learning Panel from MongoDB */}
        {continueLearning.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Continue Learning
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {continueLearning.slice(0, 4).map((prog: any) => {
                const subConf = subjectColor[prog.subject] || { text: "text-purple-600", bg: "bg-purple-50", main: "#8b5cf6", gradient: "from-purple-500 to-pink-600", border: "border-purple-100" };
                
                // Find matching resource in our main resources state to trigger modal open
                const matchingResource = resources.find(r => r.id === prog.resourceId);
                
                return (
                  <div
                    key={`prog-${prog.resourceId}`}
                    onClick={() => {
                      if (matchingResource) handleOpenResource(matchingResource);
                    }}
                    className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer hover:border-indigo-500/40 transition-all group space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-lg flex items-center justify-center shrink-0">
                        {typeIcon[prog.type] || "📄"}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {prog.resourceTitle}
                        </p>
                        <span className={`text-[10px] font-semibold ${subConf.text}`}>
                          Class {prog.class || "11"} • {prog.subject}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <p className="text-[9px] text-slate-400 truncate italic">
                        Last opened: {prog.lastChapter || "Summary"}
                      </p>
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-500">
                        <span>Progress ({Math.round(prog.timeSpentSeconds / 60)}m read)</span>
                        <span>{prog.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${prog.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Subject Tabs Scrolling Panel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
              {subjectsList.map((subject) => {
                const isActive = selectedSubject === subject;
                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-750"
                    }`}
                  >
                    {subject === "All" ? "🎒 All Subjects" : subject}
                  </button>
                );
              })}
            </div>

            {/* Quick dropdown selectors */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span>Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="All">All Classes</option>
                  {["1","2","3","4","5","6","7","8","9","10","11","12"].map(c => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              {/* Bookmark filter toggle */}
              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  showBookmarksOnly
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? "fill-white" : ""}`} />
                {showBookmarksOnly ? "Show All" : "Favorites"}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Categories Horizontal Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2 ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600/90 text-white border-indigo-600 shadow-sm"
                    : "bg-transparent border-slate-200/60 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Origin Filter Tabs (School Teacher Assignments vs Reference Books) */}
        <div className="flex justify-start border-b border-slate-205 dark:border-slate-800/80 pb-2">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {[
              { id: "all", label: "📚 All Materials" },
              { id: "teacher", label: "🧑‍🏫 Assigned by Teachers" },
              { id: "textbooks", label: "📖 State board Textbooks" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOriginFilter(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  originFilter === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8">
            <HelpCircle className="w-12 h-12 text-slate-350 dark:text-slate-750 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">No learning resources found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters, clearing your search query, or disabling the Favorites filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => {
              const subConf = subjectColor[res.subject] || { text: "text-purple-600", bg: "bg-purple-50", main: "#8b5cf6", gradient: "from-purple-500 to-pink-600", border: "border-purple-100" };
              const isBookmarked = bookmarks.includes(res.id);

              return (
                <div
                  key={res.id}
                  onClick={() => handleOpenResource(res)}
                  className="group relative bg-white dark:bg-slate-900 border-2 border-slate-105 dark:border-slate-800/80 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Subject Colored Top Cover Banner representing virtual book spine */}
                  <div 
                    className={`h-36 bg-gradient-to-br ${subConf.gradient} relative p-5 text-white flex flex-col justify-between overflow-hidden shrink-0 bg-cover bg-center`}
                    style={res.coverImage ? { backgroundImage: `url(${res.coverImage})` } : undefined}
                  >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                    
                    {/* Math/Science grid patterns in background */}
                    <div className="absolute right-2 bottom-2 text-white/10 font-bold text-7xl select-none font-mono tracking-tighter">
                      {res.type === "Video" ? "VIDEO" : res.subject.slice(0, 3).toUpperCase()}
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                        {res.subject}
                      </span>
                      <button
                        onClick={(e) => toggleBookmark(res.id, e)}
                        className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 backdrop-blur-sm text-white transition-all transform active:scale-95"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>

                    <div className="space-y-0.5 z-10">
                      <span className="text-[10px] font-bold text-white/80">Class {res.class} Syllabus</span>
                      <h4 className="text-sm font-black line-clamp-2 leading-snug drop-shadow-sm">{res.title}</h4>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {res.description || "Interactive digital syllabus content, concept breakdowns, and self-assessment materials for class revision."}
                      </p>

                      {/* Teacher / Author Uploader Badge */}
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="text-xs shrink-0">👤</span>
                        {res.teacherName ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            Assigned by: <span className="font-extrabold">{res.teacherName}</span> (Teacher)
                          </span>
                        ) : res.teacherId ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            Assigned by: <span className="font-extrabold">Teacher</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-450">
                            TN State Board Textbook
                          </span>
                        )}
                      </div>

                      {/* Tag Pills */}
                      {res.tags && res.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {res.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-slate-105 dark:bg-slate-800 text-slate-500 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {res.type === "Video" ? <Video className="w-3.5 h-3.5" /> : <Book className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          {res.type} • {res.size}
                        </span>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${subConf.text} group-hover:gap-2 transition-all`}>
                        {res.type === "Video" ? "Watch Video" : "Open Book"} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CUSTOM INTERACTIVE STUDY MODAL */}
        {activeModalResource && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Top Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-150 dark:border-slate-800/80 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      subjectColor[activeModalResource.subject]?.text || "text-indigo-500"
                    } ${subjectColor[activeModalResource.subject]?.bg || "bg-indigo-50"} ${
                      subjectColor[activeModalResource.subject]?.border || "border-indigo-100"
                    }`}>
                      {activeModalResource.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Class {activeModalResource.class}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {activeModalResource.type}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-805 dark:text-slate-100 leading-snug">
                    {activeModalResource.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalResource(null)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-850 px-6 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto scrollbar-none">
                {[
                  { id: "summary", label: "📚 Summary", icon: BookOpen },
                  { id: "points", label: "💡 Key Takeaways", icon: Layers },
                  { id: "mindmap", label: "🗺️ Mind Map", icon: HelpCircle },
                  { id: "flashcards", label: "🎴 Flashcards", icon: BookmarkCheck },
                  { id: "questions", label: "📝 Exam Q&A", icon: FileText },
                  { id: "quiz", label: "🎯 Practice Quiz", icon: Star },
                  { id: "chat", label: "💬 Ask AI Tutor", icon: Sparkles },
                ].map(tab => {
                  const isActive = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-black border-b-2 -mb-px transition-all whitespace-nowrap ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                          : "border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[40vh] max-h-[60vh] bg-white dark:bg-slate-950">

                {/* AI Companion Loader */}
                {companionLoading && ["summary", "points", "mindmap", "questions"].includes(activeModalTab) && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold animate-pulse">Generating AI Study Companion...</p>
                  </div>
                )}

                {/* Summary Tab */}
                {activeModalTab === "summary" && !companionLoading && companionData && (
                  <div className="space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                      <div 
                        className="leading-relaxed space-y-4 text-sm"
                        dangerouslySetInnerHTML={{ __html: companionData.summary }} 
                      />
                    </div>

                    {/* External PDF / Video Link Drawer */}
                    {activeModalResource.fileUrl && (
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-indigo-500">
                            {activeModalResource.type === "Video" ? <Play className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                              {activeModalResource.type === "Video" ? "Watch Video Lectures" : "Download Official PDF"}
                            </p>
                            <span className="text-[10px] text-slate-400">Size: {activeModalResource.size} • Safe external download links</span>
                          </div>
                        </div>

                        <a
                          href={activeModalResource.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                        >
                          {activeModalResource.type === "Video" ? (
                            <>Play Lecture <Video className="w-4 h-4" /></>
                          ) : (
                            <>Download File <Download className="w-4 h-4" /></>
                          )}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Takeaways Tab */}
                {activeModalTab === "points" && !companionLoading && companionData && (
                  <div className="space-y-6">
                    {/* Key Points */}
                    {companionData.keyPoints && companionData.keyPoints.length > 0 && (
                      <div className="border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 rounded-r-2xl">
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                          💡 Core Takeaways
                        </h4>
                        <ul className="list-disc pl-5 space-y-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {companionData.keyPoints.map((point: string, idx: number) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Important Formulas */}
                    {companionData.formulas && companionData.formulas.length > 0 && (
                      <div className="border-l-4 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 rounded-r-2xl">
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                          📐 Important Formulas & Rules
                        </h4>
                        <ul className="space-y-3 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                          {companionData.formulas.map((formula: string, idx: number) => (
                            <li key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm font-mono flex items-center justify-between gap-4">
                              <span>{formula}</span>
                              <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md">Fact</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Mind Map Tab */}
                {activeModalTab === "mindmap" && !companionLoading && companionData && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-855 p-6 rounded-3xl shadow-inner text-center">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-between">
                        <span>🗺️ Topic Concept Flow</span>
                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          Interactive Visual Map
                        </span>
                      </h4>

                      {companionData.visualMindMap ? (
                        <div className="space-y-4">
                          {/* Root Node */}
                          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl text-center shadow-lg text-white max-w-md mx-auto border border-white/10">
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Main Concept</span>
                            <h4 className="text-xs md:text-sm font-black mt-0.5">{companionData.visualMindMap.topic}</h4>
                          </div>

                          {/* Connection line down */}
                          <div className="w-0.5 h-6 bg-slate-250 dark:bg-slate-800 mx-auto" />

                          {/* Child Branches Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companionData.visualMindMap.branches && companionData.visualMindMap.branches.map((branch: any, bIdx: number) => (
                              <div key={bIdx} className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl relative flex flex-col space-y-2 text-left hover:border-indigo-400/40 transition-all">
                                <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-850 pb-1.5 flex items-center gap-1.5">
                                  📌 {branch.title}
                                </h5>
                                <ul className="space-y-1 text-left list-disc list-inside">
                                  {branch.details && branch.details.map((detail: string, dIdx: number) => (
                                    <li key={dIdx} className="text-[10px] md:text-[11px] text-slate-550 dark:text-slate-450 leading-relaxed font-semibold">
                                      {detail}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <pre className="font-mono text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm overflow-x-auto">
                          {companionData.mindMap}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Flashcards Tab */}
                {activeModalTab === "flashcards" && !companionLoading && companionData && (() => {
                  const cards = companionData.flashcards || [];
                  if (cards.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-550 dark:text-slate-450 italic">
                        No flashcards available for this topic.
                      </div>
                    );
                  }

                  const activeCard = cards[currentFlashcardIdx] || cards[0];
                  const isBookmarked = bookmarkedFlashcards.includes(activeCard.id);

                  return (
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="flex items-center justify-between text-xs text-slate-450">
                        <span>Card {currentFlashcardIdx + 1} of {cards.length}</span>
                        <span>Click card to Flip</span>
                      </div>

                      {/* Flip-card Container with Perspective */}
                      <div 
                        className="w-full h-64 cursor-pointer relative"
                        style={{ perspective: "1000px" }}
                        onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      >
                        {/* Rotator container */}
                        <div 
                          className="w-full h-full relative"
                          style={{ 
                            transform: flashcardFlipped ? "rotateY(180deg)" : "rotateY(0deg)", 
                            transformStyle: "preserve-3d", 
                            transition: "transform 0.6s" 
                          }}
                        >
                          {/* Front Face */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-850 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-sm select-none"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="w-full flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-650 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                                Front Side
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFlashcardBookmark(activeCard);
                                }}
                                className="p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-400 hover:text-amber-500 transition-colors"
                              >
                                <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                              </button>
                            </div>
                            <h3 className="text-sm md:text-base font-black text-slate-850 dark:text-white leading-relaxed px-4">
                              {activeCard.front}
                            </h3>
                            <span className="text-[10px] font-bold text-indigo-600 animate-pulse">
                              🔄 Click to Reveal Answer
                            </span>
                          </div>

                          {/* Back Face */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white dark:from-slate-900 dark:to-slate-850 border-2 border-indigo-500 dark:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-md select-none"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <div className="w-full flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest text-purple-650 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                                Back Side (Explanation)
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFlashcardBookmark(activeCard);
                                }}
                                className="p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-400 hover:text-amber-500 transition-colors"
                              >
                                <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                              </button>
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans px-4">
                              {activeCard.back}
                            </p>
                            <span className="text-[10px] font-bold text-purple-600">
                              🔄 Click to Flip Back
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Slideshow Controls */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          disabled={currentFlashcardIdx === 0}
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setTimeout(() => setCurrentFlashcardIdx(prev => prev - 1), 150);
                          }}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer bg-transparent"
                        >
                          ◀ Previous
                        </button>
                        <button
                          type="button"
                          disabled={currentFlashcardIdx === cards.length - 1}
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setTimeout(() => setCurrentFlashcardIdx(prev => prev + 1), 150);
                          }}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer bg-transparent"
                        >
                          Next ▶
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Exam Q&A Tab */}
                {activeModalTab === "questions" && !companionLoading && companionData && (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Exam Preparation Q&A</span>
                      <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">5 Questions</span>
                    </div>

                    <div className="space-y-3">
                      {companionData.examQuestions && companionData.examQuestions.map((q: any, idx: number) => {
                        const isRevealed = revealedAnswers.includes(idx);
                        return (
                          <div 
                            key={idx}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-indigo-500/20"
                          >
                            <div 
                              onClick={() => toggleRevealAnswer(idx)}
                              className="p-4 md:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-855/30 transition-all select-none"
                            >
                              <div className="space-y-1 text-left">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                                  Question {idx + 1} • {q.marks || 5} Marks
                                </span>
                                <h4 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
                                  {q.question}
                                </h4>
                              </div>
                              <span className="text-xs text-slate-400 shrink-0 mt-1">
                                {isRevealed ? "🔼" : "🔽"}
                              </span>
                            </div>

                            {isRevealed && (
                              <div className="px-4 pb-4 md:px-5 md:pb-5 pt-3 border-t border-slate-50 dark:border-slate-850/85 bg-slate-50/50 dark:bg-slate-900/30 text-left">
                                <h5 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                                  ✅ Model Answer Key
                                </h5>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                  {q.answerKey}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: INTERACTIVE PRACTICE QUIZ */}
                {activeModalTab === "quiz" && (() => {
                  const activeQuiz = generatedQuiz || (parsedAi && parsedAi.quiz && parsedAi.quiz.length > 0 ? parsedAi.quiz : null);
                  return (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      {activeQuiz && activeQuiz.length > 0 ? (
                        <div>
                          {/* Progress Bar */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                              Question {currentQuizIndex + 1} of {activeQuiz.length}
                            </span>
                            <span className="text-[10px] font-black text-slate-400">
                              Score: {quizScore} / {activeQuiz.length}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden mb-6">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300"
                              style={{ width: `${((currentQuizIndex + (quizFinished ? 1 : 0)) / activeQuiz.length) * 100}%` }}
                            />
                          </div>

                          {!quizFinished ? (
                            <div className="space-y-6">
                              <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                                {activeQuiz[currentQuizIndex].question}
                              </h4>

                              {/* Quiz Option Rows */}
                              <div className="space-y-3">
                                {activeQuiz[currentQuizIndex].options.map((option: string, idx: number) => {
                                  const isSelected = selectedQuizAnswer === idx;
                                  const correctIdx = activeQuiz[currentQuizIndex].answerIndex;
                                  
                                  let optClass = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                                  let icon = null;

                                  if (quizSubmitted) {
                                    if (idx === correctIdx) {
                                      optClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-bold";
                                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                                    } else if (isSelected) {
                                      optClass = "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400";
                                      icon = <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
                                    } else {
                                      optClass = "border-slate-200 dark:border-slate-800 opacity-60 text-slate-400";
                                    }
                                  } else if (isSelected) {
                                    optClass = "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-400 font-bold";
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => handleSelectQuizOption(idx)}
                                      disabled={quizSubmitted}
                                      className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between gap-3 text-xs md:text-sm transition-all focus:outline-none ${optClass}`}
                                    >
                                      <span>{option}</span>
                                      {icon}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end pt-4">
                                {!quizSubmitted ? (
                                  <button
                                    onClick={handleSubmitQuizAnswer}
                                    disabled={selectedQuizAnswer === null}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10"
                                  >
                                    Submit Answer
                                  </button>
                                ) : (
                                  <button
                                    onClick={handleNextQuizQuestion}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                                  >
                                    {currentQuizIndex + 1 < activeQuiz.length ? "Next Question" : "Complete Quiz"}
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            // Final score page
                            <div className="text-center py-10 space-y-5">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-4xl mb-2">
                                🏆
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-805 dark:text-white">Quiz Finished!</h4>
                                <p className="text-xs text-slate-400 mt-1">Excellent practice! Testing yourself is the best way to retain information.</p>
                              </div>
                              
                              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {quizScore} / {activeQuiz.length} Correct
                              </div>

                              <button
                                onClick={() => {
                                  setCurrentQuizIndex(0);
                                  setSelectedQuizAnswer(null);
                                  setQuizScore(0);
                                  setQuizSubmitted(false);
                                  setQuizFinished(false);
                                }}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 mx-auto"
                              >
                                <RotateCcw className="w-4 h-4" /> Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-4">
                          <HelpCircle className="w-12 h-12 text-slate-350 dark:text-slate-750 mx-auto" />
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No interactive quiz has been uploaded for this resource yet.</p>
                          <p className="text-xs text-slate-450 max-w-md mx-auto mb-4">
                            Teachers can add multiple choice questions during upload. However, you can generate a custom quiz dynamically using our AI Tutor!
                          </p>
                          <button
                            onClick={handleGenerateQuiz}
                            disabled={generatingQuiz}
                            className="px-6 py-2.5 disabled:opacity-60 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 mx-auto border-none cursor-pointer"
                            style={{ 
                              background: 'linear-gradient(to right, #4f46e5, #9333ea)', 
                              color: '#ffffff' 
                            }}
                          >
                            {generatingQuiz ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                Generating Quiz...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                Generate Quiz with AI
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 3: ASK AI TUTOR CHAT */}
                {activeModalTab === "chat" && (
                  <div className="flex flex-col h-[50vh]">
                    
                    {/* Chat Bubble List */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850">
                      {chatMessages.map((msg, idx) => {
                        const isAI = msg.role === "model";
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-start gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm select-none ${
                              isAI 
                                ? "bg-indigo-150 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"
                                : "bg-slate-200 dark:bg-slate-805 text-slate-700 dark:text-slate-300"
                            }`}>
                              {isAI ? "🪄" : "🧑‍🎓"}
                            </div>
                            <div className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                              isAI
                                ? "bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                : "bg-indigo-600 text-white text-right"
                            }`}>
                              <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      {chatLoading && (
                        <div className="flex items-center gap-2 mr-auto max-w-[80%] bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          <span className="text-xs">AI is typing notes...</span>
                        </div>
                      )}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask me a doubt, or type 'quiz me'..."
                        disabled={chatLoading}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
