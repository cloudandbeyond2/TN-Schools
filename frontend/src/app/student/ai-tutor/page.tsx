"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Bot, Globe, History, MessageSquare, Sliders, Mic, Trash2, Send, X, BookOpen } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface SavedSession {
  _id: string;
  sessionId: string;
  subject: string;
  language: string;
  messages: { role: string; content: string }[];
  createdAt: string;
}

const suggestedQuestions = [
  "Explain Pythagoras Theorem with examples",
  "What is photosynthesis?",
  "Help me understand quadratic equations",
  "Explain the French Revolution",
  "What is Newton's Third Law?",
  "How do I write a formal essay?",
];

const subjects = ["Mathematics", "Science", "Tamil", "English", "Social Science", "Physics", "Chemistry", "Biology"];

export default function AITutorPage() {
  const { data: session } = useSession();
  const studentClass = (session?.user as any)?.class || "10";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [studentId, setStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "வணக்கம்! 👋 I am your AI Tutor. I can help you in Tamil or English. Ask me anything about your syllabus — concepts, homework doubts, exam prep, or anything else!\n\n(Hello! I speak both Tamil and English. What would you like to learn today?)",
      time: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [language, setLanguage] = useState<"bilingual" | "tamil" | "english">("bilingual");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);

  // History list
  const [pastSessions, setPastSessions] = useState<SavedSession[]>([]);

  // 1. Initialize session ID
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    const userId = (session.user as any)?.id;
    if (!userId) return;

    async function fetchStudentAndHistory() {
      try {
        const studentRes = await fetch(`${API_URL}/api/students`);
        const studentJson = await studentRes.json();
        
        let profile = null;
        if (studentJson.success) {
          profile = studentJson.data.find((s: any) => s.userId === userId);
        }

        if (profile) {
          setStudentId(profile.id);
          
          // Load past sessions
          const historyRes = await fetch(`${API_URL}/api/ai/chat/${profile.id}`);
          const historyJson = await historyRes.json();
          if (historyJson.success) {
            setPastSessions(historyJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load student history:", err);
      }
    }

    fetchStudentAndHistory();
  }, [session, API_URL]);

  // Save current chat session to MongoDB database
  const saveChatSession = async (updatedMessages: Message[]) => {
    if (!studentId || !sessionId) return;
    try {
      const formattedMsgs = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          sessionId,
          subject: selectedSubject,
          language,
          messages: formattedMsgs
        })
      });

      // Reload past sessions to update the sidebar
      const historyRes = await fetch(`${API_URL}/api/ai/chat/${studentId}`);
      const historyJson = await historyRes.json();
      if (historyJson.success) {
        setPastSessions(historyJson.data);
      }
    } catch (err) {
      console.error("Failed to save chat session:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input, time: "Now" };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const chatHistory = messages.slice(-15).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: `Grade ${studentClass}`,
          messages: chatHistory,
          currentMessage: userMsg.content,
          language
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        const finalMsgs: Message[] = [
          ...updatedMessages,
          { role: "assistant", content: data.text, time: "Now" }
        ];
        setMessages(finalMsgs);
        saveChatSession(finalMsgs);
      } else {
        throw new Error(data.error || "Failed to fetch AI completion");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI Tutor. Please check your network or try again later.", time: "Now" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Load a past session when clicked
  const loadPastSession = (s: SavedSession) => {
    setSessionId(s.sessionId);
    setSelectedSubject(s.subject);
    setLanguage(s.language as any);
    const mapped = s.messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      time: "Saved"
    }));
    setMessages(mapped);
  };

  return (
    <PortalLayout
      title="AI Tutor"
      subtitle="Your personal bilingual learning assistant"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[520px] sm:h-[600px] lg:h-[calc(100vh-210px)] relative overflow-hidden">
        {/* Mobile Sidebar Overlay Backdrop */}
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}

        {/* Sidebar Controls */}
        <div className={`lg:col-span-1 flex flex-col gap-4 overflow-y-auto transition-all duration-300
          ${showSidebar
            ? "fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 p-6 w-80 shadow-2xl animate-in slide-in-from-left"
            : "hidden lg:flex"}`}
        >
          {/* Mobile Settings Close Header */}
          <div className="flex justify-between items-center lg:hidden border-b border-slate-800 pb-3 mb-2">
            <span className="text-xs font-black text-white uppercase tracking-wider">Tutor Settings</span>
            <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg">
              <X className="w-3.5 h-3.5" /> Close
            </button>
          </div>

          {/* Subject */}
          <div className="glass rounded-2xl p-4 fade-in">
            <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Subject</div>
            <div className="flex flex-wrap gap-1">
              {subjects.map((s) => (
                <button
                  key={s}
                  id={`ai-tutor-subject-${s.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => {
                    setSelectedSubject(s);
                    setShowSidebar(false); // Auto-close on selection
                  }}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-all ${selectedSubject === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          {pastSessions.length > 0 && (
            <div className="glass rounded-2xl p-4 fade-in">
              <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Sessions</div>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {pastSessions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => {
                      loadPastSession(s);
                      setShowSidebar(false); // Auto-close on load
                    }}
                    className="text-left text-[11px] p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/30 truncate flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{s.subject} ({new Date(s.createdAt).toLocaleDateString()})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Language */}
          <div className="glass rounded-2xl p-4 fade-in-2">
            <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Language</div>
            <div className="flex flex-col gap-1">
              {(["bilingual", "tamil", "english"] as const).map((l) => (
                <button
                  key={l}
                  id={`ai-tutor-lang-${l}`}
                  onClick={() => {
                    setLanguage(l);
                    setShowSidebar(false); // Auto-close
                  }}
                  className={`text-left text-xs px-3 py-2 rounded-lg transition-all capitalize flex items-center gap-2 ${language === l ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{l === "bilingual" ? "Tamil + English" : l === "tamil" ? "Tamil Only" : "English Only"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="glass rounded-2xl p-4 fade-in-3 flex-1 overflow-y-auto min-h-[150px]">
            <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Quick Questions</div>
            <div className="flex flex-col gap-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setShowSidebar(false); // Auto-close
                  }}
                  className="text-left text-xs px-3 py-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20 flex items-start gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col glass rounded-2xl overflow-hidden fade-in h-full">
          {/* Chat Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all flex-shrink-0 text-xs font-semibold flex items-center gap-1.5"
                title="Open Settings"
              >
                <Sliders className="w-3.5 h-3.5" /> Settings
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-white truncate">AI Tutor — {selectedSubject}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 truncate">
                  <span className="pulse-dot w-1.5 h-1.5 sm:w-2 sm:h-2"></span>
                  {language === "bilingual" ? "Tamil + English" : language === "tamil" ? "Tamil" : "English"}
                </div>
              </div>
            </div>
            <span className="badge badge-blue text-[9px] sm:text-xs flex-shrink-0">Active</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0 mt-0.5">
                    A
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-slate-800">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  id="ai-tutor-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Ask anything...`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                id="ai-tutor-send-btn"
                onClick={sendMessage}
                className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0 flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-between sm:justify-start gap-3 mt-2 px-1">
              <button id="ai-tutor-voice-btn" className="text-[10px] sm:text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <Mic className="w-3 h-3" /> Voice Input
              </button>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <button id="ai-tutor-clear-btn" onClick={() => setMessages([])} className="text-[10px] sm:text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5">
                <Trash2 className="w-3 h-3" /> Clear Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
