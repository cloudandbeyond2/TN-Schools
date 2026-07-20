"use client";
import { CheckCircle, MessageSquare, Bot, Zap, Megaphone } from "lucide-react";


import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

import Swal from "sweetalert2";

interface Parent {
  id: string;
  name: string;
  studentName: string;
  studentClass: string;
  phone: string;
  unreadCount?: number;
  lastMessage?: string;
}

interface Message {
  sender: "teacher" | "parent";
  text: string;
  time: string;
}

export default function CommunicationPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // AI draft selector states
  const [draftType, setDraftType] = useState<"performance" | "attendance" | "general">("performance");
  const [draftTone, setDraftTone] = useState<"supportive" | "urgent" | "encouraging">("supportive");

  const fetchParentsAndMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/headmaster/parents${schoolId ? `?schoolId=${schoolId}` : ""}`);
      const data = await res.json();
      if (data.success && data.data) {
        setParents(data.data);
        if (data.data.length > 0) {
          const firstParent = data.data[0];
          setSelectedParentId(firstParent.id);
          // Fetch messages for first parent
          const msgRes = await fetch(`${API_URL}/api/teacher/messages/${firstParent.id}`);
          const msgData = await msgRes.json();
          if (msgData.success) {
            setChats((prev) => ({ ...prev, [firstParent.id]: msgData.data }));
          }
        }
      }
    } catch (err) {
      console.error("Error loading parent communication:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentsAndMessages();
  }, [schoolId]);

  const handleSelectParent = async (id: string) => {
    setSelectedParentId(id);
    try {
      const msgRes = await fetch(`${API_URL}/api/teacher/messages/${id}`);
      const msgData = await msgRes.json();
      if (msgData.success) {
        setChats((prev) => ({ ...prev, [id]: msgData.data }));
      }
    } catch (err) {
      console.error("Error fetching chats for parent:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedParentId) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParentId,
          sender: "teacher",
          text: chatInput,
        }),
      });
      const result = await res.json();
      if (result.success) {
        const newMsg: Message = result.data;
        const currentMsgs = chats[selectedParentId] || [];
        setChats({
          ...chats,
          [selectedParentId]: [...currentMsgs, newMsg],
        });
        setChatInput("");
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: "Your message has been sent to the parent successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Send Message",
          text: result.error || "Failed to send message to parent.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected network error occurred while sending the message.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleGenerateAIDraft = () => {
    if (!selectedParent) return;
    let text = "";
    if (draftType === "performance") {
      if (draftTone === "urgent") {
        text = `வணக்கம், ${selectedParent.name}. ${selectedParent.studentName}-ன் கணிதத் தேர்வு மதிப்பெண்கள் மிகவும் குறைவாக உள்ளன. அவரது முன்னேற்றத்திற்கு உதவ, Remediations-ஐப் பின்பற்றவும். (Hello ${selectedParent.name}, ${selectedParent.studentName}'s maths exam marks have dropped significantly. Please ensure they practice remedial questions immediately.)`;
      } else if (draftTone === "encouraging") {
        text = `வணக்கம், ${selectedParent.name}. ${selectedParent.studentName} படிப்படியாக முன்னேறி வருகிறார். உங்கள் ஆதரவுக்கு நன்றி! (Hello ${selectedParent.name}, ${selectedParent.studentName} is showing steady progress in mathematical reasoning. Thank you for supporting their work!)`;
      } else {
        text = `வணக்கம், ${selectedParent.name}. ${selectedParent.studentName} சமன்பாடுகளைத் தீர்ப்பதில் கூடுதல் பயிற்சி தேவை. நாங்கள் சில பயிற்சித் தாள்களை வழங்குகிறோம். (Hello ${selectedParent.name}, ${selectedParent.studentName} needs practice in solving basic algebra worksheets. We are providing supportive practice sheets.)`;
      }
    } else if (draftType === "attendance") {
      text = `வணக்கம், ${selectedParent.name}. ${selectedParent.studentName} கடந்த சில வகுப்புகளுக்கு வரவில்லை. வருகை இன்றியமையாதது. (Hello ${selectedParent.name}, ${selectedParent.studentName} has missed multiple classes recently. Regular attendance is critical for syllabus mastery.)`;
    } else {
      text = `வணக்கம், ${selectedParent.name}. பெற்றோர்-ஆசிரியர் கூட்டம் சனிக்கிழமை காலை 10 மணிக்கு நடைபெறும். (Hello ${selectedParent.name}, please note that our Parent-Teacher Meet is scheduled for Saturday at 10 AM. Looking forward to meeting you.)`;
    }

    setChatInput(text);
    setToastMessage("AI Draft loaded into input text area!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedParent = parents.find((p) => p.id === selectedParentId);
  const messages = selectedParent ? (chats[selectedParent.id] || []) : [];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பெற்றோர் தொடர்பு" : "Parent Communication"}
      subtitle={lang === "தமிழ்" ? "பெற்றோர்கள் மற்றும் பாதுகாவலர்களுக்கு இருமொழி நேரடி செய்தி மற்றும் AI-உதவி அறிவிப்புகள்" : "Bilingual direct messaging and AI-assisted updates to parents and guardians"}
    >
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <span><CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" /></span> {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "தொடர்பு சேனல் ஏற்றப்படுகிறது..." : "Loading communication channel..."}</div>
      ) : parents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-190px)]">
          {/* Chat sidebar contacts */}
          <div className="lg:col-span-1 theme-card p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider"><MessageSquare className="w-4 h-4 inline mr-1" /> {lang === "தமிழ்" ? "உள்வரும் அரட்டைகள்" : "Inbox Chats"}</h3>
              <span className="badge badge-yellow">{lang === "தமிழ்" ? "செயலில்" : "Active"}</span>
            </div>

            <div className="space-y-2">
              {parents.map((p) => {
                const isSelected = p.id === selectedParentId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectParent(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-[var(--text-heading)] truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[9px] text-[var(--text-muted)] font-medium">({p.studentName})</span>
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] truncate">{p.phone}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messaging Box */}
          {selectedParent && (
            <div className="lg:col-span-2 flex flex-col theme-card overflow-hidden">
              {/* Active parent header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-main)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                    {selectedParent.name[0]}
                  </div>
                  <div>
                    <h4 className="text-[var(--text-heading)] font-semibold text-xs">{selectedParent.name}</h4>
                    <p className="text-[9px] text-[var(--text-muted)]">
                      {lang === "தமிழ்" 
                        ? `${selectedParent.studentName} -ன் பெற்றோர் (வகுப்பு ${selectedParent.studentClass})`
                        : `Parent of ${selectedParent.studentName} (Class ${selectedParent.studentClass})`
                      }
                    </p>
                  </div>
                </div>
                <span className="badge badge-green text-[9px]">{lang === "தமிழ்" ? "செயலில் உள்ள அரட்டை" : "Active chat"}</span>
              </div>

              {/* Conversation history list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--bg-card)]">
                {messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isTeacher = msg.sender === "teacher";
                    return (
                      <div key={i} className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isTeacher
                              ? "bg-[var(--primary)] text-white shadow-md rounded-tr-none"
                              : "bg-[var(--bg-main)] text-[var(--text-heading)] rounded-tl-none border border-[var(--border-light)]"
                          }`}
                        >
                          <div>{msg.text}</div>
                          <div className={`text-[8px] text-right mt-1.5 ${isTeacher ? "text-indigo-100" : "text-[var(--text-muted)]"}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "செய்தி பதிவுகள் இல்லை. கீழே அரட்டையைத் தொடங்கவும்." : "No message logs. Start conversation below."}</div>
                )}
              </div>

              {/* Message input controls */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === "தமிழ்" ? "உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும்..." : "Type your reply here..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary py-2.5 px-6 font-bold text-xs shadow-none hover:shadow-[var(--primary-shadow-1)] rounded-xl"
                  >
                    {lang === "தமிழ்" ? "அனுப்பு" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Helper Column */}
          <div className="lg:col-span-1 theme-card p-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-[var(--border)] pb-3 mb-4">
                <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span><Bot className="w-4 h-4 inline mr-1 text-blue-500" /></span> {lang === "தமிழ்" ? "AI ஸ்மார்ட் கம்போசர்" : "AI Smart Composer"}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{lang === "தமிழ்" ? "இருமொழி அறிவிப்புகளை உருவாக்கவும்" : "Generate translation-ready bilingual updates"}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1.5 uppercase tracking-wider">{lang === "தமிழ்" ? "தலைப்பு" : "Update Topic"}</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["performance", "attendance", "general"] as const).map((type) => {
                      const typeTranslated =
                        type === "performance" ? (lang === "தமிழ்" ? "செயல்திறன்" : "performance") :
                        type === "attendance" ? (lang === "தமிழ்" ? "வருகை" : "attendance") :
                        (lang === "தமிழ்" ? "பொதுவான" : "general");
                      return (
                        <button
                          key={type}
                          onClick={() => setDraftType(type)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all border ${
                            draftType === type ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm" : "bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                          }`}
                        >
                          {typeTranslated}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1.5 uppercase tracking-wider">{lang === "தமிழ்" ? "செய்தியின் குரல்" : "Message Tone"}</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["supportive", "urgent", "encouraging"] as const).map((tone) => {
                      const toneTranslated =
                        tone === "supportive" ? (lang === "தமிழ்" ? "ஆதரவான" : "supportive") :
                        tone === "urgent" ? (lang === "தமிழ்" ? "அவசரமான" : "urgent") :
                        (lang === "தமிழ்" ? "ஊக்கமளிக்கும்" : "encouraging");
                      return (
                        <button
                          key={tone}
                          onClick={() => setDraftTone(tone)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all border ${
                            draftTone === tone ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm" : "bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                          }`}
                        >
                          {toneTranslated}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={handleGenerateAIDraft}
                className="w-full py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-xs font-semibold text-[var(--text-heading)] border border-[var(--border)] flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Zap className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "AI வரைவைச் செருகவும்" : "Insert AI Draft"}
              </button>
              <div className="p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-[10px] text-[var(--text-muted)] leading-relaxed italic">
                <Megaphone className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "AI செய்திகளை **தமிழ்** மற்றும் **ஆங்கிலம்** ஆகிய இரு மொழிகளிலும் உருவாக்குகிறது, இதனால் பெற்றோர் தங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கலாம்." : "AI generates messages both in **Tamil** and **English** so parents can select their preferred reading medium."}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">
          {lang === "தமிழ்" ? "தரவுத்தளத்தில் இந்த பள்ளிக்கு பெற்றோர் பதிவுகள் எதுவும் கிடைக்கவில்லை." : "No parent records found for this school in the PostgreSQL database."}
        </div>
      )}
    </PortalLayout>
  );
}
