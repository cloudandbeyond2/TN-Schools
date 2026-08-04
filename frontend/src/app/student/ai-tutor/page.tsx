"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

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

const allSubjects = ["Mathematics", "Science", "Tamil", "English", "Social Science", "Physics", "Chemistry", "Biology"];

export default function AITutorPage() {
  const { data: session } = useSession();
  const studentClass = (session?.user as any)?.class || "10";
  const parsedClass = parseInt(String(studentClass).match(/\d+/)?.[0] || "10", 10);
  const displaySubjects = parsedClass >= 11 ? allSubjects : ["Tamil", "English", "Mathematics", "Science", "Social Science"];
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
  const [isChatPoppedOut, setIsChatPoppedOut] = useState(false);

  const [pastSessions, setPastSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subjectParam = params.get("subject");
      const questionParam = params.get("question");

      if (subjectParam) {
        const matched = allSubjects.find(
          (s) => s.toLowerCase() === subjectParam.toLowerCase()
        );
        if (matched) {
          setSelectedSubject(matched);
        } else {
          setSelectedSubject(subjectParam);
        }
      }

      if (questionParam) {
        setInput(questionParam);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
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
      <div className="flex flex-col gap-6 text-left">
        
        {/* Premium Glassmorphism Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <i className="fi fi-sr-robot text-emerald-600 dark:text-emerald-400 flex items-center text-xl" />
              AI Scholar Tutor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bilingual virtual guide tailored to support Standard {studentClass} students
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm rounded-xl border border-emerald-200/20 shadow-sm whitespace-nowrap shrink-0">
            <i className="fi fi-sr-school flex items-center text-sm" />
            Standard {studentClass} Portal
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-270px)] sm:h-[calc(100vh-310px)] lg:h-[calc(100vh-330px)] relative overflow-hidden">
          {/* Mobile Sidebar Overlay Backdrop */}
          {showSidebar && (
            <div
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden animate-in fade-in"
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
              <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <i className="fi fi-sr-cross-small flex items-center text-sm" /> Close
              </button>
            </div>

            {/* Subject */}
            <div className="glass rounded-2xl p-4 fade-in">
              <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Subject</div>
              <div className="flex flex-wrap gap-1">
                {displaySubjects.map((s) => (
                  <button
                    key={s}
                    id={`ai-tutor-subject-${s.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      setSelectedSubject(s);
                      setShowSidebar(false);
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
                        setShowSidebar(false);
                      }}
                      className="text-left text-[11px] p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/30 truncate flex items-center gap-2"
                    >
                      <i className="fi fi-sr-time-past text-indigo-400 flex-shrink-0 text-xs flex items-center" />
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
                      setShowSidebar(false);
                    }}
                    className={`text-left text-xs px-3 py-2 rounded-lg transition-all capitalize flex items-center gap-2 ${language === l ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                  >
                    <i className="fi fi-sr-globe flex-shrink-0 text-xs flex items-center" />
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
                      setShowSidebar(false);
                    }}
                    className="text-left text-xs px-3 py-2 rounded-lg text-slate-455 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20 flex items-start gap-2"
                  >
                    <i className="fi fi-sr-comment-alt text-indigo-400 flex-shrink-0 mt-0.5 text-xs flex items-center" />
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
                  <i className="fi fi-sr-settings-sliders flex items-center text-xs" /> Settings
                </button>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                  <i className="fi fi-sr-robot text-white text-sm flex items-center" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">{selectedSubject} — AI Tutor</div>
                  <div className="text-[10px] sm:text-xs text-slate-550 flex items-center gap-1.5 truncate">
                    <span className="pulse-dot w-1.5 h-1.5 sm:w-2 sm:h-2"></span>
                    {language === "bilingual" ? "Tamil + English" : language === "tamil" ? "Tamil" : "English"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChatPoppedOut(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-pulse"
                  title="Pop out chat to extended readable view"
                >
                  <i className="fi fi-sr-expand flex items-center text-xs" /> Pop out
                </button>
                <span className="badge badge-blue text-[9px] sm:text-xs flex-shrink-0">Active</span>
              </div>
            </div>

            {/* Messages */}
            {(() => {
              const parseBoldText = (text: string, role?: string) => {
                if (!text) return "";
                const parts = text.split(/(\*\*[^*]+\*\*)/g);
                return parts.map((part, idx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    const colorClass = role === "user" ? "!text-white" : "text-white";
                    return <strong key={idx} className={`font-extrabold ${colorClass}`}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
              };

              const renderMarkdownMessage = (content: string, role?: string) => {
                if (!content) return null;
                const lines = content.split("\n");
                return lines.map((line, lineIdx) => {
                  if (line.startsWith("## ") || line.startsWith("### ")) {
                    const headingText = line.replace(/^#{2,3}\s+/, "");
                    const colorClass = role === "user" ? "!text-white" : "text-white";
                    return (
                      <h4 key={lineIdx} className={`font-extrabold text-sm sm:text-base mt-3 mb-1 ${colorClass}`}>
                        {parseBoldText(headingText, role)}
                      </h4>
                    );
                  }
                  if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                    const listText = line.replace(/^\s*[\*\-]\s+/, "");
                    return (
                      <div key={lineIdx} className={`flex items-start gap-1.5 ml-2 my-1.5 ${role === "user" ? "!text-white" : ""}`}>
                        <span className="text-slate-400 mt-1.5 shrink-0 select-none text-[8px]">•</span>
                        <span className="flex-1">{parseBoldText(listText, role)}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={lineIdx} className={`my-1.5 leading-relaxed break-words font-medium ${role === "user" ? "!text-white" : ""}`}>
                      {parseBoldText(line, role)}
                    </p>
                  );
                });
              };

              return (
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-in zoom-in">
                          <i className="fi fi-sr-robot text-white text-sm flex items-center" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 !text-white rounded-tr-sm shadow-md"
                            : "bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/60 shadow-sm"
                        }`}
                      >
                        {renderMarkdownMessage(msg.content, msg.role)}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white flex-shrink-0 mt-0.5 shadow-sm">
                          A
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start px-4 sm:px-5 pb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <i className="fi fi-sr-robot text-white text-sm flex items-center" />
                </div>
                <div className="bg-slate-805 border border-slate-700/65 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-slate-800 bg-slate-900/30">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <input
                    id="ai-tutor-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask anything..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button
                  id="ai-tutor-send-btn"
                  onClick={sendMessage}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0 flex items-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <span>Send</span>
                  <i className="fi fi-sr-paper-plane flex items-center text-xs" />
                </button>
              </div>
              <div className="flex justify-between sm:justify-start gap-3 mt-2 px-1">
                <button id="ai-tutor-voice-btn" className="text-[10px] sm:text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <i className="fi fi-sr-microphone flex items-center text-xs" /> Voice Input
                </button>
                <span className="text-slate-700 hidden sm:inline">·</span>
                <button id="ai-tutor-clear-btn" onClick={() => setMessages([])} className="text-[10px] sm:text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <i className="fi fi-sr-trash flex items-center text-xs" /> Clear Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Popped out Extended Student AI Tutor Chat Modal ───── */}
      {isChatPoppedOut && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[85vh] rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <i className="fi fi-sr-robot text-white text-xl flex items-center" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">
                    AI Tutor <span className="text-xs font-normal text-slate-500 ml-1.5">(Extended View)</span>
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="pulse-dot w-2 h-2" /> Active · {selectedSubject}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatPoppedOut(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-slate-700/60 transition-transform active:scale-95"
              >
                <i className="fi fi-sr-cross-small flex items-center text-base" /> Close
              </button>
            </div>

            {/* Modal Message Stream */}
            {(() => {
              const parseBoldText = (text: string, role?: string) => {
                if (!text) return "";
                const parts = text.split(/(\*\*[^*]+\*\*)/g);
                return parts.map((part, idx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    const colorClass = role === "user" ? "!text-white" : "text-white";
                    return <strong key={idx} className={`font-extrabold ${colorClass}`}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
              };

              const renderMarkdownMessage = (content: string, role?: string) => {
                if (!content) return null;
                const lines = content.split("\n");
                return lines.map((line, lineIdx) => {
                  if (line.startsWith("## ") || line.startsWith("### ")) {
                    const headingText = line.replace(/^#{2,3}\s+/, "");
                    const colorClass = role === "user" ? "!text-white" : "text-white";
                    return (
                      <h4 key={lineIdx} className={`font-extrabold text-base sm:text-lg mt-4 mb-2 ${colorClass}`}>
                        {parseBoldText(headingText, role)}
                      </h4>
                    );
                  }
                  if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                    const listText = line.replace(/^\s*[\*\-]\s+/, "");
                    const textClass = role === "user" ? "!text-white" : "text-slate-350";
                    return (
                      <div key={lineIdx} className={`flex items-start gap-2 ml-3 my-1.5 ${textClass}`}>
                        <span className="text-slate-500 mt-2 shrink-0 select-none text-[8px]">•</span>
                        <span className="flex-1 text-sm sm:text-base">{parseBoldText(listText, role)}</span>
                      </div>
                    );
                  }
                  const textClass = role === "user" ? "!text-white" : "text-slate-350";
                  return (
                    <p key={lineIdx} className={`my-2 leading-relaxed break-words text-sm sm:text-base ${textClass}`}>
                      {parseBoldText(line, role)}
                    </p>
                  );
                });
              };

              return (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-in zoom-in">
                          <i className="fi fi-sr-robot text-white text-sm flex items-center" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-md ${
                          msg.role === "user"
                            ? "bg-indigo-600 !text-white rounded-tr-sm"
                            : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700 shadow-sm"
                        }`}
                      >
                        {renderMarkdownMessage(msg.content, msg.role)}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <i className="fi fi-sr-robot text-white text-sm flex items-center" />
                      </div>
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Input Bar */}
            <div className="p-4 border-t border-slate-800 shrink-0">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-base text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-4 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <span>Send</span>
                  <i className="fi fi-sr-paper-plane flex items-center text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
