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

  // History list
  const [pastSessions, setPastSessions] = useState<SavedSession[]>([]);

  // 1. Initialize session ID
  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  // 2. Fetch student ID & load history
  useEffect(() => {
    if (!session?.user) return;

    async function fetchStudentAndHistory() {
      try {
        const studentRes = await fetch(`${API_URL}/api/students`);
        const studentJson = await studentRes.json();
        
        let profile = null;
        if (studentJson.success) {
          profile = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
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
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          {/* Subject */}
          <div className="glass rounded-2xl p-4 fade-in">
            <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Subject</div>
            <div className="flex flex-wrap gap-1">
              {subjects.map((s) => (
                <button
                  key={s}
                  id={`ai-tutor-subject-${s.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSelectedSubject(s)}
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
                    onClick={() => loadPastSession(s)}
                    className="text-left text-[11px] p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/30 truncate"
                  >
                    📖 {s.subject} ({new Date(s.createdAt).toLocaleDateString()})
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
                  onClick={() => setLanguage(l)}
                  className={`text-left text-xs px-3 py-2 rounded-lg transition-all capitalize ${language === l ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                >
                  {l === "bilingual" ? "🌐 Tamil + English" : l === "tamil" ? "📜 Tamil Only" : "🗣️ English Only"}
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
                  onClick={() => setInput(q)}
                  className="text-left text-xs px-3 py-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col glass rounded-2xl overflow-hidden fade-in">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Tutor — {selectedSubject}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="pulse-dot w-2 h-2"></span>
                {language === "bilingual" ? "Tamil + English Mode" : language === "tamil" ? "Tamil Mode" : "English Mode"}
              </div>
            </div>
            <div className="ml-auto">
              <span className="badge badge-blue">Session Active</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5">
                    A
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-slate-800">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  id="ai-tutor-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Ask anything about ${selectedSubject}...`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                id="ai-tutor-send-btn"
                onClick={sendMessage}
                className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Send →
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button id="ai-tutor-voice-btn" className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">🎤 Voice Input</button>
              <span className="text-slate-700">·</span>
              <button id="ai-tutor-clear-btn" onClick={() => setMessages([])} className="text-xs text-slate-500 hover:text-red-400 transition-colors">🗑️ Clear Chat</button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
