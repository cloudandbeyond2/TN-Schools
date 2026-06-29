// "use client";
// import { useSession } from "next-auth/react";
// import PortalLayout from "@/components/PortalLayout";
// import Link from "next/link";
// import { useState, useRef, useEffect } from "react";

// const t = {
//   en: {
//     metrics: [
//       { label: "Daily Steps", value: "6,240", target: "8,000", icon: "🚶‍♂️", color: "from-blue-500 to-cyan-400", percent: 78 },
//       { label: "Sleep Last Night", value: "7h 15m", target: "8h", icon: "😴", color: "from-indigo-500 to-purple-400", percent: 90 },
//       { label: "Hydration", value: "4 Glasses", target: "8", icon: "💧", color: "from-sky-500 to-blue-400", percent: 50 },
//       { label: "Mindfulness", value: "10 mins", target: "15", icon: "🧘‍♀️", color: "from-emerald-500 to-teal-400", percent: 66 },
//     ],
//     activities: [
//       { title: "5-Minute Focus Breathing", category: "Mindfulness", time: "5 min", icon: "🌬️", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500/30", href: "/student/wellness/activity/mindfulness" },
//       { title: "Study Break Stretches", category: "Physical Health", time: "10 min", icon: "🤸‍♂️", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-500/30", href: "/student/wellness/activity/physical-health" },
//       { title: "Lofi Focus Beats", category: "Mental Focus", time: "30 min", icon: "🎧", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-500/30", href: "/student/wellness/activity/mental-focus" },
//       { title: "Digital Detox Challenge", category: "Habit", time: "2 Hours", icon: "📵", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-500/30", href: "/student/wellness/activity/habit" },
//     ],
//     moods: [
//       { emoji: "🤩", id: "great", label: "Great", color: "hover:bg-emerald-500/20 hover:border-emerald-500", active: "bg-emerald-500/30 border-emerald-500" },
//       { emoji: "🙂", id: "good", label: "Good", color: "hover:bg-blue-500/20 hover:border-blue-500", active: "bg-blue-500/30 border-blue-500" },
//       { emoji: "😐", id: "okay", label: "Okay", color: "hover:bg-amber-500/20 hover:border-amber-500", active: "bg-amber-500/30 border-amber-500" },
//       { emoji: "😫", id: "stressed", label: "Stressed", color: "hover:bg-orange-500/20 hover:border-orange-500", active: "bg-orange-500/30 border-orange-500" },
//       { emoji: "😴", id: "tired", label: "Tired", color: "hover:bg-purple-500/20 hover:border-purple-500", active: "bg-purple-500/30 border-purple-500" },
//     ],
//     messages: {
//       great: "Awesome! Keep up the positive energy today!",
//       good: "Glad to hear it! Have a productive day.",
//       okay: "That's perfectly fine. Take things one step at a time today.",
//       stressed: "I hear you. Remember it's okay to take breaks. Try the 5-minute breathing exercise below.",
//       tired: "Make sure you hydrate and try to get some early sleep tonight. Don't push too hard.",
//     },
//     chat: {
//       title: "AI Wellness Companion",
//       placeholder: "Type a message...",
//       send: "Send",
//       back: "Back",
//       welcome: "Hello! I'm here to listen. How are you doing?",
//       reply: "Thank you for sharing that with me. Remember to take it one breath at a time, I'm always here for you."
//     }
//   },
//   ta: {
//     metrics: [
//       { label: "தினசரி நடைகள்", value: "6,240", target: "8,000", icon: "🚶‍♂️", color: "from-blue-500 to-cyan-400", percent: 78 },
//       { label: "நேற்றிரவு தூக்கம்", value: "7h 15m", target: "8h", icon: "😴", color: "from-indigo-500 to-purple-400", percent: 90 },
//       { label: "நீர்ச்சத்து", value: "4 குவளை", target: "8", icon: "💧", color: "from-sky-500 to-blue-400", percent: 50 },
//       { label: "மனக்குவிப்பு", value: "10 நிமி", target: "15", icon: "🧘‍♀️", color: "from-emerald-500 to-teal-400", percent: 66 },
//     ],
//     activities: [
//       { title: "5 நிமிட கவனக் குவியம் மூச்சுப்பயிற்சி", category: "மனதைக் குவித்தல்", time: "5 நிமி", icon: "🌬️", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500/30", href: "/student/wellness/activity/mindfulness" },
//       { title: "படிப்பு இடைவேளை நீட்சிகள்", category: "உடல் நலம்", time: "10 நிமி", icon: "🤸‍♂️", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-500/30", href: "/student/wellness/activity/physical-health" },
//       { title: "லோஃபி ஃபோகஸ் பீட்ஸ்", category: "மனக் குவிப்பு", time: "30 நிமி", icon: "🎧", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-500/30", href: "/student/wellness/activity/mental-focus" },
//       { title: "டிஜிட்டல் டிடாக்ஸ் சவால்", category: "பழக்கம்", time: "2 மணி", icon: "📵", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-500/30", href: "/student/wellness/activity/habit" },
//     ],
//     moods: [
//       { emoji: "🤩", id: "great", label: "மிக நன்று", color: "hover:bg-emerald-500/20 hover:border-emerald-500", active: "bg-emerald-500/30 border-emerald-500" },
//       { emoji: "🙂", id: "good", label: "நன்று", color: "hover:bg-blue-500/20 hover:border-blue-500", active: "bg-blue-500/30 border-blue-500" },
//       { emoji: "😐", id: "okay", label: "பரவாயில்லை", color: "hover:bg-amber-500/20 hover:border-amber-500", active: "bg-amber-500/30 border-amber-500" },
//       { emoji: "😫", id: "stressed", label: "மன அழுத்தம்", color: "hover:bg-orange-500/20 hover:border-orange-500", active: "bg-orange-500/30 border-orange-500" },
//       { emoji: "😴", id: "tired", label: "சோர்வு", color: "hover:bg-purple-500/20 hover:border-purple-500", active: "bg-purple-500/30 border-purple-500" },
//     ],
//     messages: {
//       great: "அருமை! இன்றைய நாளை நேர்மறை ஆற்றலோடு தொடருங்கள்!",
//       good: "மகிழ்ச்சி! இன்று பயனுள்ள நாளாக அமையட்டும்.",
//       okay: "பரவாயில்லை. இன்றைய நாளைப் படிப்படியாக முன்னெடுத்துச் செல்லுங்கள்.",
//       stressed: "உங்கள் நிலை புரிகிறது. ஓய்வு எடுப்பது தவறில்லை. கீழே உள்ள 5 நிமிட மூச்சுப் பயிற்சியை முயற்சிக்கவும்.",
//       tired: "நிறைய தண்ணீர் குடிக்கவும், இன்று சீக்கிரம் தூங்கவும். அதிகமாக உழைத்து சோர்வடைய வேண்டாம்.",
//     },
//     chat: {
//       title: "AI நல்வாழ்வுத் தோழன்",
//       placeholder: "செய்தியை தட்டச்சு செய்யவும்...",
//       send: "அனுப்பு",
//       back: "பின்செல்ல",
//       welcome: "வணக்கம்! நான் உங்கள் பேச்சைக் கேட்கக் காத்திருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?",
//       reply: "உங்களது எண்ணங்களைப் பகிர்ந்து கொண்டதற்கு நன்றி. பதற்றமடையாமல் நிதானமாக இருங்கள், நான் எப்போதும் உங்களுடன் இருப்பேன்."
//     }
//   }
// };

// export default function WellnessPage() {
//   const { data: session } = useSession();
//   const [selectedMood, setSelectedMood] = useState<string | null>(null);
//   const [journalText, setJournalText] = useState("");
//   const [lang, setLang] = useState<"en" | "ta">("en");
  
//   // Chat Integration State
//   const [isChatting, setIsChatting] = useState(false);
//   const [chatInput, setChatInput] = useState("");
//   const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
//   const chatEndRef = useRef<HTMLDivElement>(null);

//   const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; status: "success" | "error" }>({
//     isOpen: false,
//     message: "",
//     status: "success",
//   });

//   const data = t[lang];

//   // Auto Scroll Chat Window
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages, isChatting]);

//   // Initializing active chat defaults
//   const startChat = () => {
//     setIsChatting(true);
//     if (chatMessages.length === 0) {
//       setChatMessages([{ sender: "ai", text: data.chat.welcome }]);
//     }
//   };

//   const sendChatMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!chatInput.trim()) return;

//     const userMsg = chatInput;
//     setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
//     setChatInput("");

//     setTimeout(() => {
//       setChatMessages((prev) => [...prev, { sender: "ai", text: data.chat.reply }]);
//     }, 800);
//   };

//  const saveJournal = async () => {

//   if (!journalText.trim()) {
//     setAlertModal({
//       isOpen: true,
//       message:
//         lang === "ta"
//           ? "தயவுசெய்து உங்கள் நன்றியுணர்வு பதிவை உள்ளிடவும்."
//           : "Please enter your gratitude journal entry.",
//       status: "error",
//     });
//     return;
//   }

//   try {
//     const res = await fetch("http://localhost:5000/api/wellness", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         studentId: (session?.user as any)?.id,
//         mood: selectedMood || "good",
//         stressScore:
//           selectedMood === "stressed" ? 9 :
//           selectedMood === "tired" ? 7 :
//           selectedMood === "okay" ? 5 :
//           selectedMood === "good" ? 3 : 1,
//         notes: journalText,
//       }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       setAlertModal({
//         isOpen: true,
//         message:
//           lang === "ta"
//             ? "நல்வாழ்வுப் பதிவு வெற்றிகரமாகச் சேமிக்கப்பட்டது!"
//             : "Wellness entry saved successfully!",
//         status: "success",
//       });

//       // Optional: Clear journal after save
//       setJournalText("");
//       setSelectedMood(null);

//     } else {
//       setAlertModal({
//         isOpen: true,
//         message:
//           data.error ||
//           (lang === "ta"
//             ? "ஏதோ தவறு நடந்துவிட்டது."
//             : "An error occurred."),
//         status: "error",
//       });
//     }
//   } catch (err) {
//     console.error("Save Error:", err);

//     setAlertModal({
//       isOpen: true,
//       message:
//         lang === "ta"
//           ? "சேவையகத்துடன் இணைக்க முடியவில்லை."
//           : "Could not connect to server.",
//       status: "error",
//     });
//   }
// };
//   return (
//     <PortalLayout
//       title={lang === 'ta' ? "மாணவர் நல்வாழ்வு மையம்" : "Student Wellness Hub"}
//       subtitle={lang === 'ta' ? "ஆழமாக மூச்சு விடுங்கள். உங்கள் மதிப்பெண்களைப் போலவே உங்கள் மன மற்றும் உடல் நலமும் முக்கியமானது." : "Take a deep breath. Your mental and physical health matters just as much as your grades."}
//       avatarLetter="A"
//       avatarColor="#10b981"
//       themeClass="theme-student"
//       accentColor="#10b981"
//     >
//       <div className="flex justify-end mb-4">
//         <button 
//           onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
//           className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
//         >
//           {lang === 'en' ? 'Translate to Tamil / தமிழில் மாற்றுக' : 'Translate to English'}
//         </button>
//       </div>

//       {/* Daily Check-in */}
//       <div className="glass rounded-3xl p-4 sm:p-6 mb-6 fade-in border border-emerald-500/20 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent">
//         <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-2">{lang === 'ta' ? "அர்ஜுன், இன்று நீங்கள் எப்படி உணருகிறீர்கள்?" : "How are you feeling today, Arjun?"}</h2>
//         <p className="text-xs sm:text-sm text-black dark:text-slate-400 mb-5">{lang === 'ta' ? "உங்கள் தினசரி மனநிலை பதிவு உங்களுக்குத் தேவையான நல்வாழ்வுப் பரிந்துரைகளை வழங்க உதவுகிறது." : "Your daily mood check-in helps us personalize your wellness recommendations."}</p>
        
//         <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
//           {data.moods.map((mood) => (
//             <button
//               key={mood.id}
//               onClick={() => setSelectedMood(mood.id)}
//               className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex-1 min-w-[75px] max-w-[110px] sm:min-w-[80px]
//                 ${selectedMood === mood.id ? mood.active : `border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 ${mood.color}`}
//               `}
//             >
//               <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{mood.emoji}</span>
//               <span className={`text-[10px] sm:text-xs font-bold ${selectedMood === mood.id ? 'text-black dark:text-white' : 'text-black dark:text-slate-400'}`}>{mood.label}</span>
//             </button>
//           ))}
//         </div>
        
//         {selectedMood && (
//           <div className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex items-start sm:items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2">
//             <div className="text-xl sm:text-2xl mt-0.5 sm:mt-0">🤖</div>
//             <div>
//               <p className="text-xs sm:text-sm text-black dark:text-slate-300">
//                 {(data.messages as any)[selectedMood]}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* KPI Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 fade-in-2">
//         {data.metrics.map((metric, idx) => (
//           <div key={idx} className="glass rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group bg-white dark:bg-transparent">
//              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${metric.color}`}></div>
//              <div className="flex justify-between items-start mb-4">
//                 <span className="text-2xl sm:text-3xl bg-slate-100 dark:bg-slate-800 p-2 rounded-xl group-hover:scale-110 transition-transform">{metric.icon}</span>
//                 <span className="text-[10px] sm:text-xs font-bold text-black dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">{lang === 'ta' ? 'இலக்கு' : 'Goal'}: {metric.target}</span>
//              </div>
//              <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-1">{metric.value}</h3>
//              <p className="text-[11px] sm:text-xs text-black dark:text-slate-400 font-medium">{metric.label}</p>
//              <div className="mt-4 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
//                 <div className={`h-full rounded-full bg-gradient-to-r ${metric.color}`} style={{ width: `${metric.percent}%` }}></div>
//              </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Container Layout rows columns layout blocks */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
//         {/* Recommended Activities */}
//         <div className="lg:col-span-2 glass rounded-3xl p-4 sm:p-6 fade-in-3 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
//             <h2 className="text-base sm:text-lg font-bold text-black dark:text-white flex items-center gap-2">
//               <span className="text-xl sm:text-2xl">🌿</span> {lang === 'ta' ? 'நல்வாழ்வுப் பயிற்சிகள்' : 'Wellness Activities'}
//             </h2>
//             <button className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-left sm:text-right">{lang === 'ta' ? 'நூலகத்தைப் பார்க்கவும் →' : 'View Library →'}</button>
//           </div>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {data.activities.map((act, idx) => (
//               <Link href={act.href} key={idx} className={`block p-4 sm:p-5 rounded-2xl border ${act.border} ${act.bg} hover:brightness-105 dark:hover:brightness-110 transition-all cursor-pointer group`}>
//                 <div className="flex justify-between items-start mb-4">
//                    <div className="text-2xl sm:text-3xl bg-white dark:bg-slate-900/50 p-2 rounded-xl group-hover:scale-110 transition-transform">{act.icon}</div>
//                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900/50 ${act.color}`}>{act.category}</span>
//                 </div>
//                 <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mb-2">{act.title}</h3>
//                 <div className="flex justify-between items-center mt-4">
//                   <span className="text-[11px] sm:text-xs text-black dark:text-slate-300 flex items-center gap-1"><span>⏱️</span> {act.time}</span>
//                   <button className={`text-xs sm:text-sm font-bold ${act.color}`}>{lang === 'ta' ? 'தொடங்கு →' : 'Start →'}</button>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Side Panels - Active Interactive AI Companion & Journal */}
//         <div className="space-y-6 fade-in-4">
          
//           {/* AI Companion Card with Active Interactive Chat Flow States */}
//           <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent min-h-[340px] flex flex-col justify-between">
//             {!isChatting ? (
//               <div className="flex flex-col items-center text-center my-auto">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-lg shadow-purple-500/20">
//                   🫂
//                 </div>
//                 <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mb-2">{lang === 'ta' ? 'யாரிடமாவது பேச வேண்டுமா?' : 'Need someone to talk to?'}</h3>
//                 <p className="text-xs sm:text-sm text-black dark:text-slate-400 mb-6">{lang === 'ta' ? 'எங்கள் AI நல்வாழ்வுத் தோழன் உங்களுக்கு உதவக் காத்திருக்கிறான், இது முற்றிலும் ரகசியமானது மற்றும் தப்பெண்ணமற்றது.' : 'Our AI Wellness Companion is here to listen, completely anonymous and judgment-free.'}</p>
//                 <button 
//                   onClick={startChat}
//                   className="w-full py-2.5 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors text-sm"
//                 >
//                   {lang === 'ta' ? 'AI தோழனிடம் பேசுங்கள்' : 'Chat with AI Companion'}
//                 </button>
//                 <p className="text-[9px] sm:text-[10px] text-black dark:text-slate-500 mt-4 text-center leading-relaxed">
//                   {lang === 'ta' ? 'நீங்கள் மனவேதனையில் இருந்தால், தயவுசெய்து பள்ளி ஆலோசகரை Ext: 204 என்ற எண்ணிலோ அல்லது தேசிய மாணவர் உதவி எண்ணான 14446 என்ற எண்ணிலோ தொடர்பு கொள்ளவும்.' : 'If you are in distress, please contact the School Counselor at Ext: 204 or the National Student Helpline: 14446.'}
//                 </p>
//               </div>
//             ) : (
//               <div className="flex flex-col h-[320px] justify-between w-full">
//                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
//                   <span className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
//                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//                     {data.chat.title}
//                   </span>
//                   <button 
//                     onClick={() => setIsChatting(false)}
//                     className="text-xs font-medium text-slate-500 hover:text-black dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
//                   >
//                     {data.chat.back}
//                   </button>
//                 </div>

//                 {/* Message Log Thread Stream */}
//                 <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs mb-2 max-h-[220px]">
//                   {chatMessages.map((msg, i) => (
//                     <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//                       <div className={`p-2.5 rounded-xl max-w-[85%] break-words ${
//                         msg.sender === "user" 
//                           ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-none" 
//                           : "bg-slate-100 text-black dark:bg-slate-800 dark:text-slate-200 rounded-tl-none"
//                       }`}>
//                         {msg.text}
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={chatEndRef} />
//                 </div>

//                 {/* Text Form Input Field */}
//                 <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
//                   <input
//                     type="text"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     placeholder={data.chat.placeholder}
//                     className="flex-1 bg-slate-50 dark:bg-slate-900 text-xs text-black dark:text-white rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
//                   />
//                   <button 
//                     type="submit" 
//                     className="bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
//                   >
//                     {data.chat.send}
//                   </button>
//                 </form>
//               </div>
//             )}
//           </div>

//           {/* Gratitude Journal */}
//           <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
//             <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mb-3 flex items-center gap-2">
//               <span className="text-lg sm:text-xl">✍️</span> {lang === 'ta' ? 'நன்றியுணர்வு இதழ்' : 'Gratitude Journal'}
//             </h3>
//             <textarea
//               value={journalText}
//               onChange={(e) => setJournalText(e.target.value)}
//               placeholder={lang === 'ta' ? 'இன்று நீங்கள் எதற்கு நன்றியுடன் இருக்கிறீர்கள்?' : 'What are you thankful for today?'}
//               className="w-full h-24 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-black dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none mb-3"
//             />
//           <button
//   onClick={saveJournal}
//   disabled={!journalText.trim()}
//   className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
//     !journalText.trim()
//       ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
//       : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
//   }`}
// >
//   {lang === 'ta' ? 'பதிவைச் சேமிக்கவும்' : 'Save Entry'}
// </button>
//           </div>

//         </div>

//       </div>

//       {/* Modal Notification Alerts */}
//       {alertModal.isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl scale-in animate-in zoom-in-95 duration-200">
//             <div className="flex flex-col items-center text-center">
//               <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 ${
//                 alertModal.status === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
//               }`}>
//                 {alertModal.status === "success" ? "🎉" : "⚠️"}
//               </div>
//               <h4 className="text-sm sm:text-base font-bold text-black dark:text-white mb-2">
//                 {alertModal.status === "success" 
//                   ? (lang === 'ta' ? 'வெற்றி!' : 'Success!') 
//                   : (lang === 'ta' ? 'பிழை!' : 'Notice!')}
//               </h4>
//               <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 px-1">
//                 {alertModal.message}
//               </p>
//               <button
//                 onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
//                 className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-colors shadow-lg ${
//                   alertModal.status === "success" 
//                     ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10" 
//                     : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
//                 }`}
//               >
//                 {lang === 'ta' ? 'சரி' : 'OK'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </PortalLayout>
//   );
// }




"use client";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const t = {
  en: {
    metrics: [
      { label: "Daily Steps", value: "6,240", target: "8,000", icon: "🚶‍♂️", color: "from-blue-500 to-cyan-400", percent: 78 },
      { label: "Sleep Last Night", value: "7h 15m", target: "8h", icon: "😴", color: "from-indigo-500 to-purple-400", percent: 90 },
      { label: "Hydration", value: "4 Glasses", target: "8", icon: "💧", color: "from-sky-500 to-blue-400", percent: 50 },
      { label: "Mindfulness", value: "10 mins", target: "15", icon: "🧘‍♀️", color: "from-emerald-500 to-teal-400", percent: 66 },
    ],
    activities: [
      { title: "5-Minute Focus Breathing", category: "Mindfulness", time: "5 min", icon: "🌬️", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500/30", href: "/student/wellness/activity/mindfulness" },
      { title: "Study Break Stretches", category: "Physical Health", time: "10 min", icon: "🤸‍♂️", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-500/30", href: "/student/wellness/activity/physical-health" },
      { title: "Lofi Focus Beats", category: "Mental Focus", time: "30 min", icon: "🎧", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-500/30", href: "/student/wellness/activity/mental-focus" },
      { title: "Digital Detox Challenge", category: "Habit", time: "2 Hours", icon: "📵", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-500/30", href: "/student/wellness/activity/habit" },
    ],
    moods: [
      { emoji: "🤩", id: "great", label: "Great", color: "hover:bg-emerald-500/20 hover:border-emerald-500", active: "bg-emerald-500/30 border-emerald-500" },
      { emoji: "🙂", id: "good", label: "Good", color: "hover:bg-blue-500/20 hover:border-blue-500", active: "bg-blue-500/30 border-blue-500" },
      { emoji: "😐", id: "okay", label: "Okay", color: "hover:bg-amber-500/20 hover:border-amber-500", active: "bg-amber-500/30 border-amber-500" },
      { emoji: "😫", id: "stressed", label: "Stressed", color: "hover:bg-orange-500/20 hover:border-orange-500", active: "bg-orange-500/30 border-orange-500" },
      { emoji: "😴", id: "tired", label: "Tired", color: "hover:bg-purple-500/20 hover:border-purple-500", active: "bg-purple-500/30 border-purple-500" },
    ],
    messages: {
      great: "Awesome! Keep up the positive energy today!",
      good: "Glad to hear it! Have a productive day.",
      okay: "That's perfectly fine. Take things one step at a time today.",
      stressed: "I hear you. Remember it's okay to take breaks. Try the 5-minute breathing exercise below.",
      tired: "Make sure you hydrate and try to get some early sleep tonight. Don't push too hard.",
    },
    chat: {
      title: "AI Wellness Companion",
      placeholder: "Type a message...",
      send: "Send",
      back: "Back",
      welcome: "Hello! I'm here to listen. How are you doing?",
      reply: "Thank you for sharing that with me. Remember to take it one breath at a time, I'm always here for you.",
      error: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
      offline: "Could not connect to the AI service. Please check your connection and try again.",
    }
  },
  ta: {
    metrics: [
      { label: "தினசரி நடைகள்", value: "6,240", target: "8,000", icon: "🚶‍♂️", color: "from-blue-500 to-cyan-400", percent: 78 },
      { label: "நேற்றிரவு தூக்கம்", value: "7h 15m", target: "8h", icon: "😴", color: "from-indigo-500 to-purple-400", percent: 90 },
      { label: "நீர்ச்சத்து", value: "4 குவளை", target: "8", icon: "💧", color: "from-sky-500 to-blue-400", percent: 50 },
      { label: "மனக்குவிப்பு", value: "10 நிமி", target: "15", icon: "🧘‍♀️", color: "from-emerald-500 to-teal-400", percent: 66 },
    ],
    activities: [
      { title: "5 நிமிட கவனக் குவியம் மூச்சுப்பயிற்சி", category: "மனதைக் குவித்தல்", time: "5 நிமி", icon: "🌬️", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500/30", href: "/student/wellness/activity/mindfulness" },
      { title: "படிப்பு இடைவேளை நீட்சிகள்", category: "உடல் நலம்", time: "10 நிமி", icon: "🤸‍♂️", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-500/30", href: "/student/wellness/activity/physical-health" },
      { title: "லோஃபி ஃபோகஸ் பீட்ஸ்", category: "மனக் குவிப்பு", time: "30 நிமி", icon: "🎧", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-500/30", href: "/student/wellness/activity/mental-focus" },
      { title: "டிஜிட்டல் டிடாக்ஸ் சவால்", category: "பழக்கம்", time: "2 மணி", icon: "📵", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-500/30", href: "/student/wellness/activity/habit" },
    ],
    moods: [
      { emoji: "🤩", id: "great", label: "மிக நன்று", color: "hover:bg-emerald-500/20 hover:border-emerald-500", active: "bg-emerald-500/30 border-emerald-500" },
      { emoji: "🙂", id: "good", label: "நன்று", color: "hover:bg-blue-500/20 hover:border-blue-500", active: "bg-blue-500/30 border-blue-500" },
      { emoji: "😐", id: "okay", label: "பரவாயில்லை", color: "hover:bg-amber-500/20 hover:border-amber-500", active: "bg-amber-500/30 border-amber-500" },
      { emoji: "😫", id: "stressed", label: "மன அழுத்தம்", color: "hover:bg-orange-500/20 hover:border-orange-500", active: "bg-orange-500/30 border-orange-500" },
      { emoji: "😴", id: "tired", label: "சோர்வு", color: "hover:bg-purple-500/20 hover:border-purple-500", active: "bg-purple-500/30 border-purple-500" },
    ],
    messages: {
      great: "அருமை! இன்றைய நாளை நேர்மறை ஆற்றலோடு தொடருங்கள்!",
      good: "மகிழ்ச்சி! இன்று பயனுள்ள நாளாக அமையட்டும்.",
      okay: "பரவாயில்லை. இன்றைய நாளைப் படிப்படியாக முன்னெடுத்துச் செல்லுங்கள்.",
      stressed: "உங்கள் நிலை புரிகிறது. ஓய்வு எடுப்பது தவறில்லை. கீழே உள்ள 5 நிமிட மூச்சுப் பயிற்சியை முயற்சிக்கவும்.",
      tired: "நிறைய தண்ணீர் குடிக்கவும், இன்று சீக்கிரம் தூங்கவும். அதிகமாக உழைத்து சோர்வடைய வேண்டாம்.",
    },
    chat: {
      title: "AI நல்வாழ்வுத் தோழன்",
      placeholder: "செய்தியை தட்டச்சு செய்யவும்...",
      send: "அனுப்பு",
      back: "பின்செல்ல",
      welcome: "வணக்கம்! நான் உங்கள் பேச்சைக் கேட்கக் காத்திருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்?",
      reply: "உங்களது எண்ணங்களைப் பகிர்ந்து கொண்டதற்கு நன்றி. பதற்றமடையாமல் நிதானமாக இருங்கள், நான் எப்போதும் உங்களுடன் இருப்பேன்.",
      error: "மன்னிக்கவும், இப்போது பதிலளிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      offline: "சேவையகத்துடன் இணைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    }
  }
};

// Point this at your backend. Override with NEXT_PUBLIC_API_BASE_URL in .env.local for prod.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function WellnessPage() {
  const { data: session } = useSession();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const [lang, setLang] = useState<"en" | "ta">("en");

  // Chat Integration State
  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; status: "success" | "error" }>({
    isOpen: false,
    message: "",
    status: "success",
  });

  const data = t[lang];

  // Auto Scroll Chat Window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatting]);

  // Initializing active chat defaults
  const startChat = () => {
    setIsChatting(true);
    if (chatMessages.length === 0) {
      setChatMessages([{ sender: "ai", text: data.chat.welcome }]);
    }
  };

  // ---- Real Gemini-backed chat (replaces the old setTimeout fake reply) ----
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg = chatInput;
    const updatedHistory = [...chatMessages, { sender: "user" as const, text: userMsg }];
    setChatMessages(updatedHistory);
    setChatInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Wellness",
          grade: "General",
          language: lang === "ta" ? "Tamil" : "English",
          messages: updatedHistory.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          currentMessage: userMsg,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && result.text) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: result.text }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.chat.error }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.chat.offline }]);
    } finally {
      setIsSending(false);
    }
  };

  const saveJournal = async () => {
    if (!journalText.trim()) {
      setAlertModal({
        isOpen: true,
        message:
          lang === "ta"
            ? "தயவுசெய்து உங்கள் நன்றியுணர்வு பதிவை உள்ளிடவும்."
            : "Please enter your gratitude journal entry.",
        status: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/wellness`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: (session?.user as any)?.id,
          mood: selectedMood || "good",
          stressScore:
            selectedMood === "stressed" ? 9 :
            selectedMood === "tired" ? 7 :
            selectedMood === "okay" ? 5 :
            selectedMood === "good" ? 3 : 1,
          notes: journalText,
        }),
      });

      const resData = await res.json();

      if (resData.success) {
        setAlertModal({
          isOpen: true,
          message:
            lang === "ta"
              ? "நல்வாழ்வுப் பதிவு வெற்றிகரமாகச் சேமிக்கப்பட்டது!"
              : "Wellness entry saved successfully!",
          status: "success",
        });

        setJournalText("");
        setSelectedMood(null);
      } else {
        setAlertModal({
          isOpen: true,
          message:
            resData.error ||
            (lang === "ta"
              ? "ஏதோ தவறு நடந்துவிட்டது."
              : "An error occurred."),
          status: "error",
        });
      }
    } catch (err) {
      console.error("Save Error:", err);
      setAlertModal({
        isOpen: true,
        message:
          lang === "ta"
            ? "சேவையகத்துடன் இணைக்க முடியவில்லை."
            : "Could not connect to server.",
        status: "error",
      });
    }
  };

  return (
    <PortalLayout
      title={lang === 'ta' ? "மாணவர் நல்வாழ்வு மையம்" : "Student Wellness Hub"}
      subtitle={lang === 'ta' ? "ஆழமாக மூச்சு விடுங்கள். உங்கள் மதிப்பெண்களைப் போலவே உங்கள் மன மற்றும் உடல் நலமும் முக்கியமானது." : "Take a deep breath. Your mental and physical health matters just as much as your grades."}
      avatarLetter="A"
      avatarColor="#10b981"
      themeClass="theme-student"
      accentColor="#10b981"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {lang === 'en' ? 'Translate to Tamil / தமிழில் மாற்றுக' : 'Translate to English'}
        </button>
      </div>

      {/* Daily Check-in */}
      <div className="glass rounded-3xl p-4 sm:p-6 mb-6 fade-in border border-emerald-500/20 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent">
        <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-2">{lang === 'ta' ? "அர்ஜுன், இன்று நீங்கள் எப்படி உணருகிறீர்கள்?" : "How are you feeling today ?"}</h2>
        <p className="text-xs sm:text-sm text-black dark:text-slate-400 mb-5">{lang === 'ta' ? "உங்கள் தினசரி மனநிலை பதிவு உங்களுக்குத் தேவையான நல்வாழ்வுப் பரிந்துரைகளை வழங்க உதவுகிறது." : "Your daily mood check-in helps us personalize your wellness recommendations."}</p>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
          {data.moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex-1 min-w-[75px] max-w-[110px] sm:min-w-[80px]
                ${selectedMood === mood.id ? mood.active : `border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 ${mood.color}`}
              `}
            >
              <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{mood.emoji}</span>
              <span className={`text-[10px] sm:text-xs font-bold ${selectedMood === mood.id ? 'text-black dark:text-white' : 'text-black dark:text-slate-400'}`}>{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="mt-5 p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex items-start sm:items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="text-xl sm:text-2xl mt-0.5 sm:mt-0">🤖</div>
            <div>
              <p className="text-xs sm:text-sm text-black dark:text-slate-300">
                {(data.messages as any)[selectedMood]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 fade-in-2">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className="glass rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group bg-white dark:bg-transparent">
             <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${metric.color}`}></div>
             <div className="flex justify-between items-start mb-4">
                <span className="text-2xl sm:text-3xl bg-slate-100 dark:bg-slate-800 p-2 rounded-xl group-hover:scale-110 transition-transform">{metric.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold text-black dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg">{lang === 'ta' ? 'இலக்கு' : 'Goal'}: {metric.target}</span>
             </div>
             <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-1">{metric.value}</h3>
             <p className="text-[11px] sm:text-xs text-black dark:text-slate-400 font-medium">{metric.label}</p>
             <div className="mt-4 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${metric.color}`} style={{ width: `${metric.percent}%` }}></div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Container Layout rows columns layout blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Recommended Activities */}
        <div className="lg:col-span-2 glass rounded-3xl p-4 sm:p-6 fade-in-3 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🌿</span> {lang === 'ta' ? 'நல்வாழ்வுப் பயிற்சிகள்' : 'Wellness Activities'}
            </h2>
            <button className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-left sm:text-right">{lang === 'ta' ? 'நூலகத்தைப் பார்க்கவும் →' : 'View Library →'}</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.activities.map((act, idx) => (
              <Link href={act.href} key={idx} className={`block p-4 sm:p-5 rounded-2xl border ${act.border} ${act.bg} hover:brightness-105 dark:hover:brightness-110 transition-all cursor-pointer group`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="text-2xl sm:text-3xl bg-white dark:bg-slate-900/50 p-2 rounded-xl group-hover:scale-110 transition-transform">{act.icon}</div>
                   <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900/50 ${act.color}`}>{act.category}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mb-2">{act.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[11px] sm:text-xs text-black dark:text-slate-300 flex items-center gap-1"><span>⏱️</span> {act.time}</span>
                  <button className={`text-xs sm:text-sm font-bold ${act.color}`}>{lang === 'ta' ? 'தொடங்கு →' : 'Start →'}</button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Panels - Active Interactive AI Companion & Journal */}
        <div className="space-y-6 fade-in-4">

          {/* AI Companion Card with Active Interactive Chat Flow States */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent min-h-[340px] flex flex-col justify-between">
            {!isChatting ? (
              <div className="flex flex-col items-center text-center my-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-lg shadow-purple-500/20">
                  🫂
                </div>
                <h3 className="text-base sm:text-lg font-bold text-black dark:text-white mb-2">{lang === 'ta' ? 'யாரிடமாவது பேச வேண்டுமா?' : 'Need someone to talk to?'}</h3>
                <p className="text-xs sm:text-sm text-black dark:text-slate-400 mb-6">{lang === 'ta' ? 'எங்கள் AI நல்வாழ்வுத் தோழன் உங்களுக்கு உதவக் காத்திருக்கிறான், இது முற்றிலும் ரகசியமானது மற்றும் தப்பெண்ணமற்றது.' : 'Our AI Wellness Companion is here to listen, completely anonymous and judgment-free.'}</p>
                <button
                  onClick={startChat}
                  className="w-full py-2.5 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors text-sm"
                >
                  {lang === 'ta' ? 'AI தோழனிடம் பேசுங்கள்' : 'Chat with AI Companion'}
                </button>
                <p className="text-[9px] sm:text-[10px] text-black dark:text-slate-500 mt-4 text-center leading-relaxed">
                  {lang === 'ta' ? 'நீங்கள் மனவேதனையில் இருந்தால், தயவுசெய்து பள்ளி ஆலோசகரை Ext: 204 என்ற எண்ணிலோ அல்லது தேசிய மாணவர் உதவி எண்ணான 14446 என்ற எண்ணிலோ தொடர்பு கொள்ளவும்.' : 'If you are in distress, please contact the School Counselor at Ext: 204 or the National Student Helpline: 14446.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-[320px] justify-between w-full">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <span className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isSending ? "animate-ping" : "animate-pulse"}`}></span>
                    {data.chat.title}
                  </span>
                  <button
                    onClick={() => setIsChatting(false)}
                    className="text-xs font-medium text-slate-500 hover:text-black dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
                  >
                    {data.chat.back}
                  </button>
                </div>

                {/* Message Log Thread Stream */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs mb-2 max-h-[220px]">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] break-words ${
                        msg.sender === "user"
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-none"
                          : "bg-slate-100 text-black dark:bg-slate-800 dark:text-slate-200 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-black dark:bg-slate-800 dark:text-slate-200 rounded-tl-none">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Text Form Input Field */}
                <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={data.chat.placeholder}
                    disabled={isSending}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 text-xs text-black dark:text-white rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !chatInput.trim()}
                    className="bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {data.chat.send}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Gratitude Journal */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mb-3 flex items-center gap-2">
              <span className="text-lg sm:text-xl">✍️</span> {lang === 'ta' ? 'நன்றியுணர்வு இதழ்' : 'Gratitude Journal'}
            </h3>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={lang === 'ta' ? 'இன்று நீங்கள் எதற்கு நன்றியுடன் இருக்கிறீர்கள்?' : 'What are you thankful for today?'}
              className="w-full h-24 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-black dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none mb-3"
            />
          <button
  onClick={saveJournal}
  disabled={!journalText.trim()}
  className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
    !journalText.trim()
      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
      : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
  }`}
>
  {lang === 'ta' ? 'பதிவைச் சேமிக்கவும்' : 'Save Entry'}
</button>
          </div>

        </div>

      </div>

      {/* Modal Notification Alerts */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl scale-in animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl mb-4 ${
                alertModal.status === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              }`}>
                {alertModal.status === "success" ? "🎉" : "⚠️"}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-black dark:text-white mb-2">
                {alertModal.status === "success"
                  ? (lang === 'ta' ? 'வெற்றி!' : 'Success!')
                  : (lang === 'ta' ? 'பிழை!' : 'Notice!')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 px-1">
                {alertModal.message}
              </p>
              <button
                onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
                className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-colors shadow-lg ${
                  alertModal.status === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10"
                    : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                }`}
              >
                {lang === 'ta' ? 'சரி' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
