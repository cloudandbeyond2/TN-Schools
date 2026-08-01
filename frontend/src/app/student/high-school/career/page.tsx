// "use client";

// import React, { useState, useEffect } from "react";
// import PortalLayout from "@/components/PortalLayout";
// import { useSession } from "next-auth/react";
// import {
//   Compass,
//   Sparkles,
//   BookOpen,
//   HelpCircle,
//   ArrowRight,
//   CheckCircle2,
//   ChevronRight,
//   TrendingUp,
//   Bookmark,
//   Award,
//   AlertCircle
// } from "lucide-react";

// const getApiBase = () => {
//   let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
//   if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
//     url = `https://${url}`;
//   }
//   return url;
// };

// const API_BASE = getApiBase();

// interface QuizQuestion {
//   question: string;
//   options: {
//     text: string;
//     points: {
//       scienceMath: number;
//       scienceBio: number;
//       commerce: number;
//       arts: number;
//       vocational: number;
//     };
//   }[];
// }

// const quizQuestions: QuizQuestion[] = [
//   {
//     question: "Which academic area or problem-solving activity excites you the most?",
//     options: [
//       {
//         text: "Solving mathematical equations, debugging computer logic, or fixing mechanics.",
//         points: { scienceMath: 4, scienceBio: 1, commerce: 2, arts: 0, vocational: 3 }
//       },
//       {
//         text: "Understanding human biology, dissecting plants, or investigating chemical reactions.",
//         points: { scienceMath: 1, scienceBio: 4, commerce: 0, arts: 1, vocational: 1 }
//       },
//       {
//         text: "Managing money, tracking expenses, or understanding trade and company business models.",
//         points: { scienceMath: 2, scienceBio: 0, commerce: 4, arts: 1, vocational: 2 }
//       },
//       {
//         text: "Reading literature, debating public policy, writing articles, or studying history.",
//         points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
//       }
//     ]
//   },
//   {
//     question: "What is your favorite way to spend your free time or work on a school project?",
//     options: [
//       {
//         text: "Coding a small web tool, playing logical puzzle games, or taking apart gadgets.",
//         points: { scienceMath: 4, scienceBio: 0, commerce: 1, arts: 0, vocational: 3 }
//       },
//       {
//         text: "Gardening, researching local wildlife, or learning about nutrition and human health.",
//         points: { scienceMath: 0, scienceBio: 4, commerce: 0, arts: 2, vocational: 1 }
//       },
//       {
//         text: "Playing simulated stock market/business games, budgeting for events, or organizing sales.",
//         points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 1, vocational: 2 }
//       },
//       {
//         text: "Writing stories/blogs, painting, filming videos, or participating in debates and public forums.",
//         points: { scienceMath: 0, scienceBio: 1, commerce: 0, arts: 4, vocational: 1 }
//       }
//     ]
//   },
//   {
//     question: "Which subjects in Class 9 & 10 do you score highest in or enjoy studying the most?",
//     options: [
//       {
//         text: "Mathematics and Physics chapters in Science.",
//         points: { scienceMath: 4, scienceBio: 1, commerce: 2, arts: 0, vocational: 2 }
//       },
//       {
//         text: "Biology and Chemistry chapters in Science.",
//         points: { scienceMath: 1, scienceBio: 4, commerce: 0, arts: 1, vocational: 1 }
//       },
//       {
//         text: "English grammar, writing, and Social Science (Civics & Economics).",
//         points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 2, vocational: 0 }
//       },
//       {
//         text: "Languages (Tamil/English), History, and Geography.",
//         points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
//       }
//     ]
//   },
//   {
//     question: "What is your long-term goal after finishing Higher Secondary education?",
//     options: [
//       {
//         text: "Pursuing Engineering (B.E/B.Tech), Architecture, or advanced Computer Science degrees.",
//         points: { scienceMath: 4, scienceBio: 0, commerce: 1, arts: 0, vocational: 2 }
//       },
//       {
//         text: "Pursuing Medicine (MBBS), Dentistry, Nursing, Agriculture, or Biotechnology fields.",
//         points: { scienceMath: 0, scienceBio: 4, commerce: 0, arts: 0, vocational: 1 }
//       },
//       {
//         text: "Becoming a Chartered Accountant (CA), Banker, or Corporate Manager.",
//         points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 1, vocational: 1 }
//       },
//       {
//         text: "Preparing for UPSC Civil Services, practicing Law, working in Journalism, or Creative Arts.",
//         points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
//       }
//     ]
//   }
// ];

// const boardStreams = [
//   {
//     id: "g1",
//     title: "Group I (Biology-Mathematics)",
//     subjects: "Mathematics, Physics, Chemistry, Biology",
//     color: "from-emerald-500 to-teal-600",
//     textCol: "text-emerald-400",
//     bgCol: "border-emerald-500/20 bg-emerald-950/10",
//     careers: ["Doctor / Healthcare", "Engineering (CS, Mech, EEE, etc.)", "Biotech / Agri Research", "Pharmacy"],
//     description: "The most versatile science stream. Keeps doors open for both medical/agricultural courses and engineering/technical paths."
//   },
//   {
//     id: "g2",
//     title: "Group II (Computer Science-Mathematics)",
//     subjects: "Mathematics, Physics, Chemistry, Computer Science",
//     color: "from-blue-500 to-indigo-600",
//     textCol: "text-blue-400",
//     bgCol: "border-blue-500/20 bg-blue-950/10",
//     careers: ["Software Engineer", "AI/ML Developer", "Data Scientist", "Research in Physics/Maths"],
//     description: "Highly focused on computer technology and mathematical reasoning. Excellent for students aiming strictly for tech and engineering."
//   },
//   {
//     id: "g3",
//     title: "Group III (Pure Science)",
//     subjects: "Physics, Chemistry, Botany, Zoology",
//     color: "from-pink-500 to-rose-600",
//     textCol: "text-pink-400",
//     bgCol: "border-pink-500/20 bg-pink-950/10",
//     careers: ["Medicine / MBBS", "Dentistry (BDS)", "Veterinary Science", "Botany / Zoology Research"],
//     description: "Substitutes Mathematics with detailed biological disciplines (Botany & Zoology). Perfect for students fully committed to medical & life sciences."
//   },
//   {
//     id: "g4",
//     title: "Group IV (Commerce & Accountancy)",
//     subjects: "Commerce, Accountancy, Economics, Business Maths / Computer Applications",
//     color: "from-amber-500 to-orange-600",
//     textCol: "text-amber-400",
//     bgCol: "border-amber-500/20 bg-amber-950/10",
//     careers: ["Chartered Accountant (CA)", "Financial Analyst / Stock Broker", "MBA / Business Manager", "Corporate Law"],
//     description: "Introduces foundational business, accounting, and economic systems. Essential for careers in corporate management, finance, and banking."
//   },
//   {
//     id: "g5",
//     title: "Group V (Humanities & Arts)",
//     subjects: "History, Geography, Economics, Political Science / Advanced Tamil",
//     color: "from-violet-500 to-purple-600",
//     textCol: "text-violet-400",
//     bgCol: "border-violet-500/20 bg-violet-950/10",
//     careers: ["UPSC Civil Services (IAS/IPS)", "Law / Judiciary", "Journalism & Media", "Archaeology & Teaching"],
//     description: "Focuses on human society, history, politics, and language. Superb preparation for civil services, media, and legal sectors."
//   }
// ];

// const alternativePaths = [
//   {
//     title: "Diploma in Engineering (Polytechnic)",
//     duration: "3 Years",
//     admission: "Based on Class 10 Marks",
//     details: "Practical engineering training in Mechanical, Civil, Electrical, or Computer Engineering. Allows direct lateral entry into the 2nd year of B.E/B.Tech engineering programs afterwards.",
//     icon: <i className="fi fi-sr-settings" />
//   },
//   {
//     title: "ITI (Industrial Training Institutes)",
//     duration: "1 to 2 Years",
//     admission: "Class 10 Pass / Direct Entry",
//     details: "Skill-based technical trade certificates (e.g., Electrician, Fitter, Welder, Machinist). Ideal for securing immediate technical employment in state departments, railways, or private industries.",
//     icon: <i className="fi fi-sr-wrench" />
//   },
//   {
//     title: "Vocational Board Streams (11th & 12th)",
//     duration: "2 Years",
//     admission: "Offered in select Govt Higher Sec Schools",
//     details: "Combines fundamental academics with direct occupational subjects (e.g., Agricultural Practices, Office Management, Electrical Equipment Maintenance). Gives extra weightage in select vocational college quotas.",
//     icon: <i className="fi fi-sr-leaf" />
//   }
// ];

// const govtSchemes = [
//   {
//     title: "Pudhumai Penn Scheme",
//     benefit: "₹1,000 per month financial assistance",
//     eligibility: "For girl students who studied from Class 6 to 12 in Government Schools, upon enrolling in higher education (degrees/diplomas).",
//     icon: <i className="fi fi-sr-graduation-cap" />
//   },
//   {
//     title: "Tamil Puthalvan Scheme",
//     benefit: "₹1,000 per month financial assistance",
//     eligibility: "For boy students who studied from Class 6 to 12 in Government Schools, upon enrolling in higher education courses.",
//     icon: <i className="fi fi-sr-graduation-cap" />
//   },
//   {
//     title: "Naan Mudhalvan Career Guidance",
//     benefit: "Free career counseling & skill training",
//     eligibility: "All government school students. Provides access to dynamic career courses, coding academies, and interview training portals.",
//     icon: <i className="fi fi-sr-sparkles" />
//   },
//   {
//     title: "7.5% Govt School Reservation",
//     benefit: "Free professional college seats (Medical/Engineering)",
//     eligibility: "7.5% preferential quota for government school students in professional college admissions (TNEA/TNEB/NEET counseling). Covers tuition & hostel fees.",
//     icon: <i className="fi fi-sr-building" />
//   }
// ];

// const polytechnics = [
//   { name: "Central Polytechnic College (CPT)", location: "Taramani, Chennai", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Civil, Mechanical, EEE, ECE, Computer" },
//   { name: "Government Polytechnic College", location: "Coimbatore", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Automobile, Mechanical, Civil, IT" },
//   { name: "Government Polytechnic College", location: "Trichy", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Production, EEE, Mechanical, Chemical" },
//   { name: "Government Polytechnic College", location: "Madurai", rating: "⭐️⭐️⭐️⭐️", trades: "Civil, Mechanical, EEE, ECE" }
// ];

// export default function HighSchoolCareerPage() {
//   const { data: session } = useSession();
//   const [student, setStudent] = useState<any>(null);
  
//   // Quiz State
//   const [quizStarted, setQuizStarted] = useState(false);
//   const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
//   const [quizScores, setQuizScores] = useState({
//     scienceMath: 0,
//     scienceBio: 0,
//     commerce: 0,
//     arts: 0,
//     vocational: 0
//   });
//   const [quizFinished, setQuizFinished] = useState(false);
//   const [recommendedStream, setRecommendedStream] = useState<string>("");
//   const [quizBreakdown, setQuizBreakdown] = useState<any[]>([]);

//   // Roadmap State (loaded from local storage if available)
//   const [roadmapTasks, setRoadmapTasks] = useState([
//     { id: 1, text: "Discuss interests and stream options with parents and teachers", completed: true },
//     { id: 2, text: "Complete the Career Aptitude Quiz to understand matches", completed: false },
//     { id: 3, text: "Focus on Mathematics and Science to meet Class 11 stream cutoffs", completed: false },
//     { id: 4, text: "Review school options and availability of desired streams in near-by schools", completed: false },
//     { id: 5, text: "Prepare and submit the preliminary stream preference form (if requested by school)", completed: false }
//   ]);

//   // Load student data from local API
//   useEffect(() => {
//     fetch(`${API_BASE}/api/students`)
//       .then((res) => res.json())
//       .then((json) => {
//         if (json.success && json.data.length > 0) {
//           const myStudent = (session?.user as any)?.id 
//             ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
//             : null;
//           setStudent(myStudent || json.data[0]);
//         }
//       })
//       .catch((err) => console.error(err));
//   }, [session]);

//   const userName = session?.user?.name || student?.user?.name || "Student";
//   const subtitle = student 
//     ? `Welcome, ${userName} · Class ${student.class}${student.section} · Transition Hub: High School to Higher Secondary`
//     : "Loading student data...";

//   const handleAnswerSelect = (points: { scienceMath: number; scienceBio: number; commerce: number; arts: number; vocational: number }) => {
//     const nextScores = {
//       scienceMath: quizScores.scienceMath + points.scienceMath,
//       scienceBio: quizScores.scienceBio + points.scienceBio,
//       commerce: quizScores.commerce + points.commerce,
//       arts: quizScores.arts + points.arts,
//       vocational: quizScores.vocational + points.vocational
//     };
//     setQuizScores(nextScores);

//     if (currentQuestionIdx + 1 < quizQuestions.length) {
//       setCurrentQuestionIdx(prev => prev + 1);
//     } else {
//       // Quiz finished
//       calculateResults(nextScores);
//     }
//   };

//   const calculateResults = (finalScores: { scienceMath: number; scienceBio: number; commerce: number; arts: number; vocational: number }) => {
//     // Determine the highest score
//     const entries = Object.entries(finalScores);
//     entries.sort((a, b) => b[1] - a[1]);
    
//     const highestKey = entries[0][0];
//     let recommended = "";
    
//     if (highestKey === "scienceMath") recommended = "Science Stream (Group II: CS-Maths or Group I: Bio-Maths)";
//     else if (highestKey === "scienceBio") recommended = "Science Stream (Group I: Bio-Maths or Group III: Pure Science)";
//     else if (highestKey === "commerce") recommended = "Commerce Stream (Group IV: Commerce & Accountancy)";
//     else if (highestKey === "arts") recommended = "Humanities & Arts Stream (Group V)";
//     else recommended = "Vocational Stream / Technical Diploma";

//     // Set matching calculations
//     const totalPoints = entries.reduce((acc, curr) => acc + curr[1], 0);
//     const breakdown = entries.map(([key, val]) => {
//       let label = "";
//       if (key === "scienceMath") label = "Engineering & CS (Science)";
//       else if (key === "scienceBio") label = "Medical & Bio Sciences (Science)";
//       else if (key === "commerce") label = "Commerce & Finance";
//       else if (key === "arts") label = "Arts & Humanities";
//       else label = "Vocational & Applied Trades";
      
//       const pct = totalPoints > 0 ? Math.round((val / totalPoints) * 100) : 0;
//       return { label, pct };
//     });

//     setRecommendedStream(recommended);
//     setQuizBreakdown(breakdown);
//     setQuizFinished(true);

//     // Auto check the quiz task on the roadmap
//     setRoadmapTasks(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));
//   };

//   const resetQuiz = () => {
//     setQuizStarted(false);
//     setCurrentQuestionIdx(0);
//     setQuizScores({
//       scienceMath: 0,
//       scienceBio: 0,
//       commerce: 0,
//       arts: 0,
//       vocational: 0
//     });
//     setQuizFinished(false);
//     setRecommendedStream("");
//     setQuizBreakdown([]);
//   };

//   const toggleTask = (id: number) => {
//     setRoadmapTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
//   };

//   return (
//     <PortalLayout 
//       title="Career Aptitude & Stream Planner"
//       subtitle={subtitle}
//       avatarLetter="A"
//       avatarColor="#ef4444"
//       themeClass="theme-student"
//       accentColor="#ef4444"
//     >
//       <div className="w-full space-y-8 mt-6 px-4 sm:px-6">
        
//         {/* Dynamic Hero Section */}
//         <div className="relative bg-gradient-to-r from-red-600 to-rose-500 rounded-[2rem] p-6 md:p-12 overflow-hidden text-white shadow-xl shadow-red-500/20">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          
//           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
//             <div className="max-w-2xl">
//               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md mb-4 border border-white/30">
//                 <i className="fi fi-sr-compass w-3.5 h-3.5 text-yellow-300" /> Class 10 Transition Center
//               </div>
//               <h1 className="text-2xl md:text-5xl font-black mb-4 leading-tight">
//                 Decide Your Next Steps <br /> With Confidence
//               </h1>
//               <p className="text-red-100 text-xs md:text-sm md:text-xs md:text-sm md:text-base md:text-lg font-medium leading-relaxed">
//                 Explore Class 11 State Board streams, calculate your vocational interest matches, and plan your transition after the SSLC Board Exams.
//               </p>
//             </div>
//             <div className="shrink-0 hidden md:block">
//               <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
//                 <i className="fi fi-sr-compass w-14 h-14 md:w-20 md:h-20 text-white" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* AI Analysis and Quiz Split Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Left/Middle Column: Career Match Quiz */}
//           <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border flex flex-col justify-between shadow-theme-card">
//             <div>
//               <div className="flex items-center justify-between mb-5">
//                 <h2 className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading flex items-center gap-2">
//                   <i className="fi fi-sr-interrogation w-5 h-5 text-red-500" /> Class 11 Stream Suggester
//                 </h2>
//                 {!quizFinished && quizStarted && (
//                   <span className="text-xs text-text-main bg-secondary border border-border rounded-lg px-2.5 py-1">
//                     Question {currentQuestionIdx + 1} of {quizQuestions.length}
//                   </span>
//                 )}
//               </div>

//               {!quizStarted && !quizFinished ? (
//                 <div className="text-center py-10 px-4 space-y-6">
//                   <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
//                     <i className="fi fi-sr-sparkles w-8 h-8 text-red-400" />
//                   </div>
//                   <div className="max-w-md mx-auto">
//                     <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-2">Unsure which stream to pick in 11th Standard?</h3>
//                     <p className="text-xs md:text-sm text-muted">
//                       Answer 4 simple, school-focused questions about your strengths, favorite subjects, and long-term career goals. Our engine will match your interests to the state board stream groups.
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setQuizStarted(true)}
//                     className="px-6 py-2.5 bg-red-50 hover:bg-red-600 text-white font-bold rounded-xl text-xs md:text-sm transition-colors shadow-md shadow-red-500/20 inline-flex items-center gap-2"
//                   >
//                     Start Stream Finder <i className="fi fi-sr-arrow-right w-4 h-4" />
//                   </button>
//                 </div>
//               ) : quizStarted && !quizFinished ? (
//                 <div className="space-y-6">
//                   {/* Progress bar */}
//                   <div className="progress-bar bg-secondary h-2 rounded-full overflow-hidden">
//                     <div 
//                       className="progress-fill h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
//                       style={{ width: `${((currentQuestionIdx) / quizQuestions.length) * 100}%` }}
//                     />
//                   </div>
                  
//                   <div className="bg-secondary/40 border border-border rounded-xl p-5">
//                     <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-4">
//                       {quizQuestions[currentQuestionIdx].question}
//                     </h3>
                    
//                     <div className="space-y-3">
//                       {quizQuestions[currentQuestionIdx].options.map((option, idx) => (
//                         <button
//                           key={idx}
//                           onClick={() => handleAnswerSelect(option.points)}
//                           className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-secondary dark:hover:bg-slate-800 hover:border-red-500/40 text-xs md:text-sm text-text-main hover:text-text-heading transition-all group flex items-start gap-3"
//                         >
//                           <span className="w-6 h-6 rounded-full bg-secondary dark:bg-slate-900 border border-border flex items-center justify-center text-xs text-text-main group-hover:border-red-500/50 group-hover:text-red-500 font-bold shrink-0">
//                             {String.fromCharCode(65 + idx)}
//                           </span>
//                           <span>{option.text}</span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
//                     <div className="flex items-center gap-3 mb-2">
//                       <span className="text-xl"><i className="fi fi-sr-trophy" /></span>
//                       <h3 className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400">Quiz Completed! Your Recommendation:</h3>
//                     </div>
//                     <div className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading mb-2">{recommendedStream}</div>
//                     <p className="text-xs text-muted leading-relaxed">
//                       This calculation represents your dynamic interest fit. Discuss this result with your teachers and high school counselor to finalize stream selections in the school EMIS form.
//                     </p>
//                   </div>

//                   <div>
//                     <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Interest Match Breakdown</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       {quizBreakdown.map((item, idx) => (
//                         <div key={idx} className="bg-secondary/30 border border-border p-4 rounded-xl">
//                           <div className="flex justify-between items-center text-xs mb-1.5 font-semibold text-text-main">
//                             <span>{item.label}</span>
//                             <span className="text-red-500 font-bold">{item.pct}%</span>
//                           </div>
//                           <div className="progress-bar bg-secondary h-2 rounded-full overflow-hidden">
//                             <div 
//                               className="progress-fill h-full bg-red-500" 
//                               style={{ width: `${item.pct}%` }}
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {quizFinished && (
//               <button
//                 onClick={resetQuiz}
//                 className="mt-6 w-full py-2 bg-secondary border border-border hover:bg-secondary/80 text-text-main rounded-xl text-xs font-semibold transition-colors"
//               >
//                 Retake Aptitude Quiz
//               </button>
//             )}
//           </div>

//           {/* Right Column: AI Academic Scan */}
//           <div className="space-y-6">
            
//             {/* AI Summary Card */}
//             <div className="bg-card rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-rose-500/5 flex flex-col justify-between shadow-theme-card">
//               <div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="text-red-500 text-xl"><i className="fi fi-sr-robot" /></span>
//                   <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading">AI Stream Prediction</h3>
//                 </div>
//                 <p className="text-xs md:text-sm text-text-main leading-relaxed mb-4">
//                   Based on your Class 10 mock test performance, showing strong analytical capacity in <strong className="text-red-500">Mathematics (78%)</strong> and consistent scores in <strong className="text-red-500">Science (65%)</strong>.
//                 </p>
//                 <div className="border-t border-border pt-4 mb-4">
//                   <div className="text-xs text-muted uppercase tracking-wider mb-2">Highest Strengths</div>
//                   <div className="flex flex-wrap gap-2">
//                     <span className="px-2.5 py-1 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-lg font-medium">Algebra & Arithmetic</span>
//                     <span className="px-2.5 py-1 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-lg font-medium">Applied Chemistry</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-secondary/60 dark:bg-slate-900/60 rounded-xl p-3.5 border border-border flex justify-between items-center">
//                 <div>
//                   <div className="text-[10px] text-muted uppercase font-bold">Top Stream Match</div>
//                   <div className="text-xs md:text-sm text-text-heading font-bold">Group II CS-Maths</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-lg md:text-xl font-black text-red-500">82%</div>
//                   <div className="text-[9px] text-muted">Confidence</div>
//                 </div>
//               </div>
//             </div>

//             {/* Counsel Note */}
//             <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card bg-secondary/10">
//               <div className="flex gap-3">
//                 <i className="fi fi-sr-exclamation w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
//                 <div className="space-y-1">
//                   <h4 className="text-xs font-semibold text-text-heading">Did You Know?</h4>
//                   <p className="text-xs text-muted leading-relaxed">
//                     Under the Tamil Nadu Department of Education guidelines, selection of streams for Class 11 is primary-care based. Students can switch selections within the first 15 days of Class 11 if subject seats are available.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tamil Nadu State Board Stream Directory */}
//         <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
//                 <i className="fi fi-sr-book-alt w-5 h-5 text-red-500" /> Class 11 Stream Directory (HSC)
//               </h2>
//               <p className="text-xs text-muted mt-1">Official Tamil Nadu State Board high school groups and career pipelines</p>
//             </div>
//             <span className="text-xs bg-secondary border border-border text-text-main px-3 py-1 rounded-lg font-medium self-start sm:self-center">
//               Total 5 Standard Groups
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {boardStreams.map((stream) => (
//               <div 
//                 key={stream.id} 
//                 className="rounded-2xl border border-border p-5 bg-secondary/20 hover:bg-secondary/40 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
//               >
//                 <div>
//                   <div className={`bg-gradient-to-r ${stream.color} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md inline-block uppercase mb-3`}>
//                     HSC Group
//                   </div>
//                   <h3 className="font-bold text-text-heading text-xs md:text-sm md:text-base mb-1.5 leading-tight">{stream.title}</h3>
//                   <div className="text-xs text-text-main mb-3">
//                     <strong className="text-text-heading">Core Subjects:</strong> {stream.subjects}
//                   </div>
//                   <p className="text-xs text-muted leading-relaxed mb-4">
//                     {stream.description}
//                   </p>
//                 </div>
//                 <div>
//                   <div className="border-t border-border pt-3">
//                     <div className="text-[10px] text-muted uppercase font-bold mb-2">Prime Career Pipelines</div>
//                     <div className="flex flex-wrap gap-1.5">
//                       {stream.careers.map((career, cIdx) => (
//                         <span key={cIdx} className="text-[10px] px-2 py-0.5 bg-secondary dark:bg-slate-900/60 border border-border text-text-main rounded-md">
//                           {career}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Alternative Post-10th Pathways */}
//         <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
//           <div className="mb-6">
//             <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
//               <i className="fi fi-sr-stats w-5 h-5 text-red-500" /> Alternative Pathways After Class 10
//             </h2>
//             <p className="text-xs text-muted mt-1">If you wish to pursue technical skills or join immediate employment instead of standard 11th & 12th academics</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {alternativePaths.map((path, idx) => (
//               <div key={idx} className="bg-secondary/20 dark:bg-slate-900/30 border border-border p-5 rounded-2xl hover:border-border-hover hover:bg-secondary/40 dark:hover:bg-slate-800 transition-all">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-xl">
//                     {path.icon}
//                   </div>
//                   <div>
//                     <h3 className="text-xs md:text-sm font-semibold text-text-heading">{path.title}</h3>
//                     <span className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block">
//                       Duration: {path.duration}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="text-xs text-text-main">
//                     <strong className="text-text-heading">Admission Process:</strong> {path.admission}
//                   </div>
//                   <p className="text-xs text-muted leading-relaxed">
//                     {path.details}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Tamil Nadu Govt Schemes & 7.5% Reservation */}
//         <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
//           <div className="mb-6">
//             <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
//               <i className="fi fi-sr-medal w-5 h-5 text-red-500" /> Government Support Schemes & Reservations
//             </h2>
//             <p className="text-xs text-muted mt-1">Special financial packages and admission quotas designed by the Government of Tamil Nadu for government school students</p>
//           </div>
 
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {govtSchemes.map((scheme, idx) => (
//               <div key={idx} className="bg-secondary/20 dark:bg-slate-900/40 border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-red-500/20 hover:bg-secondary/40 dark:hover:bg-slate-900 transition-all">
//                 <div>
//                   <div className="text-2xl mb-3">{scheme.icon}</div>
//                   <h3 className="text-xs md:text-sm font-semibold text-text-heading mb-1">{scheme.title}</h3>
//                   <div className="text-xs font-bold text-red-500 mb-3">{scheme.benefit}</div>
//                   <p className="text-xs text-muted leading-relaxed">
//                     {scheme.eligibility}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
 
//         {/* Polytechnic Colleges & Cutoff Guidelines */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Top Polytechnics */}
//           <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-theme-card">
//             <h2 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-4 flex items-center gap-2">
//               <i className="fi fi-sr-building" /> Top Government Polytechnic Colleges in TN
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-xs text-text-main">
//                 <thead>
//                   <tr className="border-b border-border text-muted font-semibold">
//                     <th className="py-2.5">College Name</th>
//                     <th className="py-2.5">Location</th>
//                     <th className="py-2.5">Key Branches</th>
//                     <th className="py-2.5 text-right">Rating</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border/50">
//                   {polytechnics.map((poly, idx) => (
//                     <tr key={idx} className="hover:bg-secondary/40 dark:hover:bg-slate-800/20">
//                       <td className="py-3 font-medium text-text-heading">{poly.name}</td>
//                       <td className="py-3 text-muted">{poly.location}</td>
//                       <td className="py-3 text-muted">{poly.trades}</td>
//                       <td className="py-3 text-right text-yellow-500 font-bold">{poly.rating}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-4 p-3 bg-secondary/40 dark:bg-slate-900/50 rounded-xl border border-border text-center">
//               <p className="text-[11px] text-muted">
//                 <i className="fi fi-sr-bulb" /> Admissions are processed through the <strong>Directorate of Technical Education (DoTE)</strong> online portal after Class 10 results.
//               </p>
//             </div>
//           </div>
 
//           {/* Allocation & Cutoff Guidelines */}
//           <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card flex flex-col justify-between">
//             <div>
//               <h2 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
//                 <i className="fi fi-sr-clipboard-list" /> Class 11 Stream Cutoff Guidelines
//               </h2>
//               <p className="text-xs text-text-main leading-relaxed mb-4">
//                 Since seat availability is limited in certain school groups, stream allocation in Government Higher Secondary Schools follows these norms:
//               </p>
//               <div className="space-y-3">
//                 <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
//                   <div className="text-[10px] font-bold text-red-500 uppercase">Science Groups (I & II)</div>
//                   <p className="text-[11px] text-muted mt-1">Requires standard score of <strong>70%+ in Maths & Science</strong> in Class 10 Board exams.</p>
//                 </div>
//                 <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
//                   <div className="text-[10px] font-bold text-amber-500 uppercase">Commerce Group (IV)</div>
//                   <p className="text-[11px] text-muted mt-1">Requires overall pass percentage of <strong>50%+</strong>, with focus on English and Math.</p>
//                 </div>
//                 <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
//                   <div className="text-[10px] font-bold text-violet-500 uppercase">Arts & Humanities (V)</div>
//                   <p className="text-[11px] text-muted mt-1">Open seat allocation for all passed candidates. High preference for UPSC aspirants.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* High School Milestone Checklist */}
//         <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
//           <div className="flex items-center justify-between mb-5 border-b border-border pb-4">
//             <div>
//               <h2 className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading flex items-center gap-2">
//                 <i className="fi fi-sr-check-circle w-5 h-5 text-red-500" /> Your Class 10 Transition Checklist
//               </h2>
//               <p className="text-xs text-muted mt-0.5">Stay on track before the high-school session finishes</p>
//             </div>
//             <div className="text-xs text-muted">
//               {roadmapTasks.filter(t => t.completed).length} of {roadmapTasks.length} Completed
//             </div>
//           </div>

//           <div className="space-y-3">
//             {roadmapTasks.map((task) => (
//               <button
//                 key={task.id}
//                 onClick={() => toggleTask(task.id)}
//                 className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
//                   task.completed 
//                     ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/5 text-muted" 
//                     : "border-border bg-secondary/10 text-text-main hover:border-slate-400 dark:hover:border-slate-700"
//                 }`}
//               >
//                 <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
//                   task.completed 
//                     ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" 
//                     : "border-slate-400 dark:border-slate-650"
//                 }`}>
//                   {task.completed && <i className="fi fi-sr-check-circle w-3.5 h-3.5 fill-current" />}
//                 </div>
//                 <div className="flex-1">
//                   <p className={`text-xs font-semibold ${task.completed ? "line-through text-muted" : "text-text-main"}`}>
//                     {task.text}
//                   </p>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>
//     </PortalLayout>
//   );
// }


"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import {
  Compass,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Award,
  AlertCircle,
  Share2,
  Loader2,
  RefreshCw
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

// ---------- Persistence keys ----------
const STORAGE_KEY_QUIZ = "careerHub.quizResult.v1";
const STORAGE_KEY_ROADMAP = "careerHub.roadmapTasks.v1";

interface QuizQuestion {
  question: string;
  options: {
    text: string;
    points: {
      scienceMath: number;
      scienceBio: number;
      commerce: number;
      arts: number;
      vocational: number;
    };
  }[];
}

interface Student {
  class?: string | number;
  section?: string;
  user?: { name?: string };
  userId?: string;
  marks?: {
    mathematics?: number;
    science?: number;
  };
}

type ScoreKey = "scienceMath" | "scienceBio" | "commerce" | "arts" | "vocational";

interface QuizScores {
  scienceMath: number;
  scienceBio: number;
  commerce: number;
  arts: number;
  vocational: number;
}

interface RoadmapTask {
  id: number;
  text: string;
  completed: boolean;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "Which academic area or problem-solving activity excites you the most?",
    options: [
      {
        text: "Solving mathematical equations, debugging computer logic, or fixing mechanics.",
        points: { scienceMath: 4, scienceBio: 1, commerce: 2, arts: 0, vocational: 3 }
      },
      {
        text: "Understanding human biology, dissecting plants, or investigating chemical reactions.",
        points: { scienceMath: 1, scienceBio: 4, commerce: 0, arts: 1, vocational: 1 }
      },
      {
        text: "Managing money, tracking expenses, or understanding trade and company business models.",
        points: { scienceMath: 2, scienceBio: 0, commerce: 4, arts: 1, vocational: 2 }
      },
      {
        text: "Reading literature, debating public policy, writing articles, or studying history.",
        points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
      }
    ]
  },
  {
    question: "What is your favorite way to spend your free time or work on a school project?",
    options: [
      {
        text: "Coding a small web tool, playing logical puzzle games, or taking apart gadgets.",
        points: { scienceMath: 4, scienceBio: 0, commerce: 1, arts: 0, vocational: 3 }
      },
      {
        text: "Gardening, researching local wildlife, or learning about nutrition and human health.",
        points: { scienceMath: 0, scienceBio: 4, commerce: 0, arts: 2, vocational: 1 }
      },
      {
        text: "Playing simulated stock market/business games, budgeting for events, or organizing sales.",
        points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 1, vocational: 2 }
      },
      {
        text: "Writing stories/blogs, painting, filming videos, or participating in debates and public forums.",
        points: { scienceMath: 0, scienceBio: 1, commerce: 0, arts: 4, vocational: 1 }
      }
    ]
  },
  {
    question: "Which subjects in Class 9 & 10 do you score highest in or enjoy studying the most?",
    options: [
      {
        text: "Mathematics and Physics chapters in Science.",
        points: { scienceMath: 4, scienceBio: 1, commerce: 2, arts: 0, vocational: 2 }
      },
      {
        text: "Biology and Chemistry chapters in Science.",
        points: { scienceMath: 1, scienceBio: 4, commerce: 0, arts: 1, vocational: 1 }
      },
      {
        text: "English grammar, writing, and Social Science (Civics & Economics).",
        points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 2, vocational: 0 }
      },
      {
        text: "Languages (Tamil/English), History, and Geography.",
        points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
      }
    ]
  },
  {
    question: "What is your long-term goal after finishing Higher Secondary education?",
    options: [
      {
        text: "Pursuing Engineering (B.E/B.Tech), Architecture, or advanced Computer Science degrees.",
        points: { scienceMath: 4, scienceBio: 0, commerce: 1, arts: 0, vocational: 2 }
      },
      {
        text: "Pursuing Medicine (MBBS), Dentistry, Nursing, Agriculture, or Biotechnology fields.",
        points: { scienceMath: 0, scienceBio: 4, commerce: 0, arts: 0, vocational: 1 }
      },
      {
        text: "Becoming a Chartered Accountant (CA), Banker, or Corporate Manager.",
        points: { scienceMath: 1, scienceBio: 0, commerce: 4, arts: 1, vocational: 1 }
      },
      {
        text: "Preparing for UPSC Civil Services, practicing Law, working in Journalism, or Creative Arts.",
        points: { scienceMath: 0, scienceBio: 1, commerce: 1, arts: 4, vocational: 0 }
      }
    ]
  }
];

const boardStreams = [
  {
    id: "g1",
    title: "Group I (Biology-Mathematics)",
    subjects: "Mathematics, Physics, Chemistry, Biology",
    color: "from-emerald-500 to-teal-600",
    textCol: "text-emerald-400",
    bgCol: "border-emerald-500/20 bg-emerald-950/10",
    careers: ["Doctor / Healthcare", "Engineering (CS, Mech, EEE, etc.)", "Biotech / Agri Research", "Pharmacy"],
    description: "The most versatile science stream. Keeps doors open for both medical/agricultural courses and engineering/technical paths."
  },
  {
    id: "g2",
    title: "Group II (Computer Science-Mathematics)",
    subjects: "Mathematics, Physics, Chemistry, Computer Science",
    color: "from-blue-500 to-indigo-600",
    textCol: "text-blue-400",
    bgCol: "border-blue-500/20 bg-blue-950/10",
    careers: ["Software Engineer", "AI/ML Developer", "Data Scientist", "Research in Physics/Maths"],
    description: "Highly focused on computer technology and mathematical reasoning. Excellent for students aiming strictly for tech and engineering."
  },
  {
    id: "g3",
    title: "Group III (Pure Science)",
    subjects: "Physics, Chemistry, Botany, Zoology",
    color: "from-pink-500 to-rose-600",
    textCol: "text-pink-400",
    bgCol: "border-pink-500/20 bg-pink-950/10",
    careers: ["Medicine / MBBS", "Dentistry (BDS)", "Veterinary Science", "Botany / Zoology Research"],
    description: "Substitutes Mathematics with detailed biological disciplines (Botany & Zoology). Perfect for students fully committed to medical & life sciences."
  },
  {
    id: "g4",
    title: "Group IV (Commerce & Accountancy)",
    subjects: "Commerce, Accountancy, Economics, Business Maths / Computer Applications",
    color: "from-amber-500 to-orange-600",
    textCol: "text-amber-400",
    bgCol: "border-amber-500/20 bg-amber-950/10",
    careers: ["Chartered Accountant (CA)", "Financial Analyst / Stock Broker", "MBA / Business Manager", "Corporate Law"],
    description: "Introduces foundational business, accounting, and economic systems. Essential for careers in corporate management, finance, and banking."
  },
  {
    id: "g5",
    title: "Group V (Humanities & Arts)",
    subjects: "History, Geography, Economics, Political Science / Advanced Tamil",
    color: "from-violet-500 to-purple-600",
    textCol: "text-violet-400",
    bgCol: "border-violet-500/20 bg-violet-950/10",
    careers: ["UPSC Civil Services (IAS/IPS)", "Law / Judiciary", "Journalism & Media", "Archaeology & Teaching"],
    description: "Focuses on human society, history, politics, and language. Superb preparation for civil services, media, and legal sectors."
  }
];

const alternativePaths = [
  {
    title: "Diploma in Engineering (Polytechnic)",
    duration: "3 Years",
    admission: "Based on Class 10 Marks",
    details: "Practical engineering training in Mechanical, Civil, Electrical, or Computer Engineering. Allows direct lateral entry into the 2nd year of B.E/B.Tech engineering programs afterwards.",
    icon: <i className="fi fi-sr-settings" />
  },
  {
    title: "ITI (Industrial Training Institutes)",
    duration: "1 to 2 Years",
    admission: "Class 10 Pass / Direct Entry",
    details: "Skill-based technical trade certificates (e.g., Electrician, Fitter, Welder, Machinist). Ideal for securing immediate technical employment in state departments, railways.",
    icon: <i className="fi fi-sr-wrench" />
  },
  {
    title: "Vocational Board Streams (11th & 12th)",
    duration: "2 Years",
    admission: "Offered in select Govt Higher Sec Schools",
    details: "Combines fundamental academics with direct occupational subjects (e.g., Agricultural Practices, Office Management, Electrical Equipment Maintenance). Gives extra weightage in select vocational college quotas.",
    icon: <i className="fi fi-sr-leaf" />
  }
];

const govtSchemes = [
  {
    title: "Pudhumai Penn Scheme",
    benefit: "₹1,000 per month financial assistance",
    eligibility: "For girl students who studied from Class 6 to 12 in Government Schools, upon enrolling in higher education (degrees/diplomas).",
    icon: <i className="fi fi-sr-graduation-cap" />
  },
  {
    title: "Tamil Puthalvan Scheme",
    benefit: "₹1,000 per month financial assistance",
    eligibility: "For boy students who studied from Class 6 to 12 in Government Schools, upon enrolling in higher education courses.",
    icon: <i className="fi fi-sr-graduation-cap" />
  },
  {
    title: "Naan Mudhalvan Career Guidance",
    benefit: "Free career counseling & skill training",
    eligibility: "All government school students. Provides access to dynamic career courses, coding academies, and interview training portals.",
    icon: <i className="fi fi-sr-sparkles" />
  },
  {
    title: "7.5% Govt School Reservation",
    benefit: "Free professional college seats (Medical/Engineering)",
    eligibility: "7.5% preferential quota for government school students in professional college admissions (TNEA/TNEB/NEET counseling). Covers tuition & hostel fees.",
    icon: <i className="fi fi-sr-building" />
  }
];

const polytechnics = [
  { name: "Central Polytechnic College (CPT)", location: "Taramani, Chennai", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Civil, Mechanical, EEE, ECE, Computer" },
  { name: "Government Polytechnic College", location: "Coimbatore", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Automobile, Mechanical, Civil, IT" },
  { name: "Government Polytechnic College", location: "Trichy", rating: "⭐️⭐️⭐️⭐️⭐️", trades: "Production, EEE, Mechanical, Chemical" },
  { name: "Government Polytechnic College", location: "Madurai", rating: "⭐️⭐️⭐️⭐️", trades: "Civil, Mechanical, EEE, ECE" }
];

const emptyScores: QuizScores = {
  scienceMath: 0,
  scienceBio: 0,
  commerce: 0,
  arts: 0,
  vocational: 0
};

const defaultRoadmapTasks: RoadmapTask[] = [
  { id: 1, text: "Discuss interests and stream options with parents and teachers", completed: true },
  { id: 2, text: "Complete the Career Aptitude Quiz to understand matches", completed: false },
  { id: 3, text: "Focus on Mathematics and Science to meet Class 11 stream cutoffs", completed: false },
  { id: 4, text: "Review school options and availability of desired streams in near-by schools", completed: false },
  { id: 5, text: "Prepare and submit the preliminary stream preference form (if requested by school)", completed: false }
];

export default function HighSchoolCareerPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState(false);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerHistory, setAnswerHistory] = useState<QuizScores[]>([]); // score deltas per answered question, for back navigation
  const [quizScores, setQuizScores] = useState<QuizScores>(emptyScores);
  const [quizFinished, setQuizFinished] = useState(false);
  const [recommendedStream, setRecommendedStream] = useState<string>("");
  const [quizBreakdown, setQuizBreakdown] = useState<{ label: string; pct: number }[]>([]);
  const [isCloseMatch, setIsCloseMatch] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Roadmap State (persisted to localStorage)
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>(defaultRoadmapTasks);
  const [hydrated, setHydrated] = useState(false);

  // ---------- Hydrate persisted state on mount ----------
  useEffect(() => {
    try {
      const savedRoadmap = localStorage.getItem(STORAGE_KEY_ROADMAP);
      if (savedRoadmap) {
        setRoadmapTasks(JSON.parse(savedRoadmap));
      }
      const savedQuiz = localStorage.getItem(STORAGE_KEY_QUIZ);
      if (savedQuiz) {
        const parsed = JSON.parse(savedQuiz);
        if (parsed?.quizFinished) {
          setQuizFinished(true);
          setQuizStarted(true);
          setRecommendedStream(parsed.recommendedStream || "");
          setQuizBreakdown(parsed.quizBreakdown || []);
          setQuizScores(parsed.quizScores || emptyScores);
          setIsCloseMatch(!!parsed.isCloseMatch);
        }
      }
    } catch (err) {
      console.error("Failed to load saved career hub state", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ---------- Persist roadmap whenever it changes ----------
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(roadmapTasks));
    } catch (err) {
      console.error("Failed to save roadmap tasks", err);
    }
  }, [roadmapTasks, hydrated]);

  // ---------- Load student data from API ----------
  useEffect(() => {
    setStudentLoading(true);
    setStudentError(false);
    fetch(`${API_BASE}/api/students`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          setStudent(myStudent || json.data[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setStudentError(true);
      })
      .finally(() => setStudentLoading(false));
  }, [session]);

  const userName = session?.user?.name || student?.user?.name || "Student";
  const subtitle = studentLoading
    ? "Loading student data..."
    : student
    ? `Welcome, ${userName} · Class ${student.class}${student.section} · Transition Hub: High School to Higher Secondary`
    : studentError
    ? "Welcome · Transition Hub: High School to Higher Secondary (profile data unavailable)"
    : "Welcome · Transition Hub: High School to Higher Secondary";

  const handleAnswerSelect = (points: QuizScores) => {
    const nextScores: QuizScores = {
      scienceMath: quizScores.scienceMath + points.scienceMath,
      scienceBio: quizScores.scienceBio + points.scienceBio,
      commerce: quizScores.commerce + points.commerce,
      arts: quizScores.arts + points.arts,
      vocational: quizScores.vocational + points.vocational
    };
    setQuizScores(nextScores);
    setAnswerHistory((prev) => [...prev, points]);

    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      calculateResults(nextScores);
    }
  };

  const handleGoBack = () => {
    if (answerHistory.length === 0) return;
    const lastAnswer = answerHistory[answerHistory.length - 1];
    setQuizScores((prev) => ({
      scienceMath: prev.scienceMath - lastAnswer.scienceMath,
      scienceBio: prev.scienceBio - lastAnswer.scienceBio,
      commerce: prev.commerce - lastAnswer.commerce,
      arts: prev.arts - lastAnswer.arts,
      vocational: prev.vocational - lastAnswer.vocational
    }));
    setAnswerHistory((prev) => prev.slice(0, -1));
    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
  };

  const calculateResults = (finalScores: QuizScores) => {
    const entries = Object.entries(finalScores) as [ScoreKey, number][];
    entries.sort((a, b) => b[1] - a[1]);

    const highestKey = entries[0][0];
    const secondScore = entries[1]?.[1] ?? 0;
    const topScore = entries[0][1];
    // Flag a close match when the top two categories are within 1 point of each other
    const closeMatch = topScore > 0 && topScore - secondScore <= 1;

    let recommended = "";
    if (highestKey === "scienceMath") recommended = "Science Stream (Group II: CS-Maths or Group I: Bio-Maths)";
    else if (highestKey === "scienceBio") recommended = "Science Stream (Group I: Bio-Maths or Group III: Pure Science)";
    else if (highestKey === "commerce") recommended = "Commerce Stream (Group IV: Commerce & Accountancy)";
    else if (highestKey === "arts") recommended = "Humanities & Arts Stream (Group V)";
    else recommended = "Vocational Stream / Technical Diploma";

    const totalPoints = entries.reduce((acc, curr) => acc + curr[1], 0);
    const breakdown = entries.map(([key, val]) => {
      let label = "";
      if (key === "scienceMath") label = "Engineering & CS (Science)";
      else if (key === "scienceBio") label = "Medical & Bio Sciences (Science)";
      else if (key === "commerce") label = "Commerce & Finance";
      else if (key === "arts") label = "Arts & Humanities";
      else label = "Vocational & Applied Trades";

      const pct = totalPoints > 0 ? Math.round((val / totalPoints) * 100) : 0;
      return { label, pct };
    });

    setRecommendedStream(recommended);
    setQuizBreakdown(breakdown);
    setIsCloseMatch(closeMatch);
    setQuizFinished(true);

    setRoadmapTasks((prev) => prev.map((t) => (t.id === 2 ? { ...t, completed: true } : t)));

    try {
      localStorage.setItem(
        STORAGE_KEY_QUIZ,
        JSON.stringify({
          quizFinished: true,
          recommendedStream: recommended,
          quizBreakdown: breakdown,
          quizScores: finalScores,
          isCloseMatch: closeMatch
        })
      );
    } catch (err) {
      console.error("Failed to save quiz result", err);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIdx(0);
    setAnswerHistory([]);
    setQuizScores(emptyScores);
    setQuizFinished(false);
    setRecommendedStream("");
    setQuizBreakdown([]);
    setIsCloseMatch(false);
    setShareCopied(false);
    try {
      localStorage.removeItem(STORAGE_KEY_QUIZ);
    } catch (err) {
      console.error("Failed to clear saved quiz result", err);
    }
  };

  const toggleTask = (id: number) => {
    setRoadmapTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const shareResult = async () => {
    const message = `My Class 11 Stream Recommendation: ${recommendedStream}\n\nFind your own match on the Career Aptitude & Stream Planner.`;
    const canShare = typeof navigator !== "undefined" && !!navigator.share;
    try {
      if (canShare) {
        await navigator.share({ title: "My Stream Recommendation", text: message });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch (err) {
      // Share was cancelled or failed silently — no need to surface an error
      console.error("Share failed", err);
    }
  };

  const progressPct = quizStarted && !quizFinished
    ? Math.round((currentQuestionIdx / quizQuestions.length) * 100)
    : quizFinished
    ? 100
    : 0;

  return (
    <PortalLayout
      title="Career Aptitude & Stream Planner"
      subtitle={subtitle}
      avatarLetter="A"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <i className="fi fi-sr-compass text-2xl text-indigo-600 dark:text-indigo-400 flex items-center" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Career Aptitude & Stream Planner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore Higher Secondary Class 11-12 streams (Biology, Computer Science, Commerce, Arts) and vocational pathways.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            <i className="fi fi-sr-graduation-cap flex items-center text-sm" />
            Class 10th Standard
          </span>
        </div>
      </div>
      <div className="w-full space-y-8 mt-6 px-4 sm:px-6">

        {/* Dynamic Hero Section */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-500 rounded-[2rem] p-6 md:p-12 overflow-hidden text-white shadow-xl shadow-red-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md mb-4 border border-white/30">
                <i className="fi fi-sr-compass w-3.5 h-3.5 text-yellow-300" /> Class 10 Transition Center
              </div>
              <h1 className="text-2xl md:text-5xl font-black mb-4 leading-tight">
                Decide Your Next Steps <br /> With Confidence
              </h1>
              <p className="text-red-100 text-xs md:text-sm md:text-xs md:text-sm md:text-base md:text-lg font-medium leading-relaxed">
                Explore Class 11 State Board streams, calculate your vocational interest matches, and plan your transition after the SSLC Board Exams.
              </p>
            </div>
            <div className="shrink-0 hidden md:block">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                <i className="fi fi-sr-compass w-14 h-14 md:w-20 md:h-20 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis and Quiz Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left/Middle Column: Career Match Quiz */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border flex flex-col justify-between shadow-theme-card">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading flex items-center gap-2">
                  <i className="fi fi-sr-interrogation w-5 h-5 text-red-500" /> Class 11 Stream Suggester
                </h2>
                {!quizFinished && quizStarted && (
                  <span className="text-xs text-text-main bg-secondary border border-border rounded-lg px-2.5 py-1">
                    Question {currentQuestionIdx + 1} of {quizQuestions.length}
                  </span>
                )}
              </div>

              {!quizStarted && !quizFinished ? (
                <div className="text-center py-10 px-4 space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <i className="fi fi-sr-sparkles w-8 h-8 text-red-400" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-2">Unsure which stream to pick in 11th Standard?</h3>
                    <p className="text-xs md:text-sm text-muted">
                      Answer 4 simple, school-focused questions about your strengths, favorite subjects, and long-term career goals. Our engine will match your interests to the state board stream groups.
                    </p>
                  </div>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs md:text-sm transition-colors shadow-md shadow-red-500/20 inline-flex items-center gap-2"
                  >
                    Start Stream Finder <i className="fi fi-sr-arrow-right w-4 h-4" />
                  </button>
                </div>
              ) : quizStarted && !quizFinished ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div
                    className="progress-bar bg-secondary h-2 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Quiz progress"
                  >
                    <div
                      className="progress-fill h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="bg-secondary/40 border border-border rounded-xl p-5">
                    <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-4">
                      {quizQuestions[currentQuestionIdx].question}
                    </h3>

                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIdx].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(option.points)}
                          className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-secondary dark:hover:bg-slate-800 hover:border-red-500/40 text-xs md:text-sm text-text-main hover:text-text-heading transition-all group flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-secondary dark:bg-slate-900 border border-border flex items-center justify-center text-xs text-text-main group-hover:border-red-500/50 group-hover:text-red-500 font-bold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {answerHistory.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text-heading transition-colors"
                    >
                      <i className="fi fi-sr-arrow-left w-3.5 h-3.5" /> Back to previous question
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl"><i className="fi fi-sr-trophy" /></span>
                      <h3 className="text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400">Quiz Completed! Your Recommendation:</h3>
                    </div>
                    <div className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading mb-2">{recommendedStream}</div>
                    {isCloseMatch && (
                      <div className="flex items-start gap-2 mb-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        <i className="fi fi-sr-exclamation w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Your top two interest areas are closely matched — it's worth exploring both options below before deciding.</span>
                      </div>
                    )}
                    <p className="text-xs text-muted leading-relaxed">
                      This calculation represents your dynamic interest fit. Discuss this result with your teachers and high school counselor to finalize stream selections in the school EMIS form.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Interest Match Breakdown</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quizBreakdown.map((item, idx) => (
                        <div key={idx} className="bg-secondary/30 border border-border p-4 rounded-xl">
                          <div className="flex justify-between items-center text-xs mb-1.5 font-semibold text-text-main">
                            <span>{item.label}</span>
                            <span className="text-red-500 font-bold">{item.pct}%</span>
                          </div>
                          <div className="progress-bar bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                              className="progress-fill h-full bg-red-500"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={shareResult}
                    className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <i className="fi fi-sr-share w-3.5 h-3.5" />
                    {shareCopied ? "Copied to clipboard!" : "Share My Result"}
                  </button>
                </div>
              )}
            </div>

            {quizFinished && (
              <button
                onClick={resetQuiz}
                className="mt-6 w-full py-2 bg-secondary border border-border hover:bg-secondary/80 text-text-main rounded-xl text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <i className="fi fi-sr-refresh w-3.5 h-3.5" /> Retake Aptitude Quiz
              </button>
            )}
          </div>

          {/* Right Column: AI Academic Scan */}
          <div className="space-y-6">

            {/* AI Summary Card */}
            <div className="bg-card rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-rose-500/5 flex flex-col justify-between shadow-theme-card">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-500 text-xl"><i className="fi fi-sr-robot" /></span>
                  <h3 className="text-xs md:text-sm md:text-base font-semibold text-text-heading">AI Stream Prediction</h3>
                </div>
                {studentLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted py-2">
                    <i className="fi fi-rr-spinner w-3.5 h-3.5 animate-spin" /> Loading your academic profile...
                  </div>
                ) : student?.marks ? (
                  <p className="text-xs md:text-sm text-text-main leading-relaxed mb-4">
                    Based on your Class 10 mock test performance, showing strong analytical capacity in{" "}
                    <strong className="text-red-500">Mathematics ({student.marks.mathematics}%)</strong> and consistent scores in{" "}
                    <strong className="text-red-500">Science ({student.marks.science}%)</strong>.
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-text-main leading-relaxed mb-4">
                    Sample insight — connect your Class 10 mock test scores to see a personalized prediction here.{" "}
                    <span className="text-[10px] uppercase tracking-wide text-muted font-bold">(Demo data below)</span>
                  </p>
                )}
                <div className="border-t border-border pt-4 mb-4">
                  <div className="text-xs text-muted uppercase tracking-wider mb-2">Highest Strengths</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-lg font-medium">Algebra & Arithmetic</span>
                    <span className="px-2.5 py-1 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-lg font-medium">Applied Chemistry</span>
                  </div>
                </div>
              </div>
              <div className="bg-secondary/60 dark:bg-slate-900/60 rounded-xl p-3.5 border border-border flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold">Top Stream Match</div>
                  <div className="text-xs md:text-sm text-text-heading font-bold">Group II CS-Maths</div>
                </div>
                <div className="text-right">
                  <div className="text-lg md:text-xl font-black text-red-500">82%</div>
                  <div className="text-[9px] text-muted">Confidence</div>
                </div>
              </div>
            </div>

            {/* Counsel Note */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card bg-secondary/10">
              <div className="flex gap-3">
                <i className="fi fi-sr-exclamation w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-text-heading">Did You Know?</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Under the Tamil Nadu Department of Education guidelines, selection of streams for Class 11 is primary-care based. Students can switch selections within the first 15 days of Class 11 if subject seats are available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tamil Nadu State Board Stream Directory */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
                <i className="fi fi-sr-book-alt w-5 h-5 text-red-500" /> Class 11 Stream Directory (HSC)
              </h2>
              <p className="text-xs text-muted mt-1">Official Tamil Nadu State Board high school groups and career pipelines</p>
            </div>
            <span className="text-xs bg-secondary border border-border text-text-main px-3 py-1 rounded-lg font-medium self-start sm:self-center">
              Total 5 Standard Groups
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardStreams.map((stream) => (
              <div
                key={stream.id}
                className="rounded-2xl border border-border p-5 bg-secondary/20 hover:bg-secondary/40 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className={`bg-gradient-to-r ${stream.color} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md inline-block uppercase mb-3`}>
                    HSC Group
                  </div>
                  <h3 className="font-bold text-text-heading text-xs md:text-sm md:text-base mb-1.5 leading-tight">{stream.title}</h3>
                  <div className="text-xs text-text-main mb-3">
                    <strong className="text-text-heading">Core Subjects:</strong> {stream.subjects}
                  </div>
                  <p className="text-xs text-muted leading-relaxed mb-4">
                    {stream.description}
                  </p>
                </div>
                <div>
                  <div className="border-t border-border pt-3">
                    <div className="text-[10px] text-muted uppercase font-bold mb-2">Prime Career Pipelines</div>
                    <div className="flex flex-wrap gap-1.5">
                      {stream.careers.map((career, cIdx) => (
                        <span key={cIdx} className="text-[10px] px-2 py-0.5 bg-secondary dark:bg-slate-900/60 border border-border text-text-main rounded-md">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Post-10th Pathways */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
              <i className="fi fi-sr-stats w-5 h-5 text-red-500" /> Alternative Pathways After Class 10
            </h2>
            <p className="text-xs text-muted mt-1">If you wish to pursue technical skills or join immediate employment instead of standard 11th & 12th academics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alternativePaths.map((path, idx) => (
              <div key={idx} className="bg-secondary/20 dark:bg-slate-900/30 border border-border p-5 rounded-2xl hover:border-border-hover hover:bg-secondary/40 dark:hover:bg-slate-800 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-xl">
                    {path.icon}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-semibold text-text-heading">{path.title}</h3>
                    <span className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block">
                      Duration: {path.duration}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-text-main">
                    <strong className="text-text-heading">Admission Process:</strong> {path.admission}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {path.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tamil Nadu Govt Schemes & 7.5% Reservation */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold text-text-heading flex items-center gap-2">
              <i className="fi fi-sr-medal w-5 h-5 text-red-500" /> Government Support Schemes & Reservations
            </h2>
            <p className="text-xs text-muted mt-1">Special financial packages and admission quotas designed by the Government of Tamil Nadu for government school students</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {govtSchemes.map((scheme, idx) => (
              <div key={idx} className="bg-secondary/20 dark:bg-slate-900/40 border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-red-500/20 hover:bg-secondary/40 dark:hover:bg-slate-900 transition-all">
                <div>
                  <div className="text-2xl mb-3">{scheme.icon}</div>
                  <h3 className="text-xs md:text-sm font-semibold text-text-heading mb-1">{scheme.title}</h3>
                  <div className="text-xs font-bold text-red-500 mb-3">{scheme.benefit}</div>
                  <p className="text-xs text-muted leading-relaxed">
                    {scheme.eligibility}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Polytechnic Colleges & Cutoff Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Polytechnics */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-theme-card">
            <h2 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-4 flex items-center gap-2">
              <i className="fi fi-sr-building" /> Top Government Polytechnic Colleges in TN
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-main">
                <thead>
                  <tr className="border-b border-border text-muted font-semibold">
                    <th className="py-2.5">College Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Key Branches</th>
                    <th className="py-2.5 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {polytechnics.map((poly, idx) => (
                    <tr key={idx} className="hover:bg-secondary/40 dark:hover:bg-slate-800/20">
                      <td className="py-3 font-medium text-text-heading">{poly.name}</td>
                      <td className="py-3 text-muted">{poly.location}</td>
                      <td className="py-3 text-muted">{poly.trades}</td>
                      <td className="py-3 text-right text-yellow-500 font-bold">{poly.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-secondary/40 dark:bg-slate-900/50 rounded-xl border border-border text-center">
              <p className="text-[11px] text-muted">
                <i className="fi fi-sr-bulb" /> Admissions are processed through the <strong>Directorate of Technical Education (DoTE)</strong> online portal after Class 10 results.
              </p>
            </div>
          </div>

          {/* Allocation & Cutoff Guidelines */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card flex flex-col justify-between">
            <div>
              <h2 className="text-xs md:text-sm md:text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
                <i className="fi fi-sr-clipboard-list" /> Class 11 Stream Cutoff Guidelines
              </h2>
              <p className="text-xs text-text-main leading-relaxed mb-4">
                Since seat availability is limited in certain school groups, stream allocation in Government Higher Secondary Schools follows these norms:
              </p>
              <div className="space-y-3">
                <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
                  <div className="text-[10px] font-bold text-red-500 uppercase">Science Groups (I & II)</div>
                  <p className="text-[11px] text-muted mt-1">Requires standard score of <strong>70%+ in Maths & Science</strong> in Class 10 Board exams.</p>
                </div>
                <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
                  <div className="text-[10px] font-bold text-amber-500 uppercase">Commerce Group (IV)</div>
                  <p className="text-[11px] text-muted mt-1">Requires overall pass percentage of <strong>50%+</strong>, with focus on English and Math.</p>
                </div>
                <div className="bg-secondary/40 dark:bg-slate-900/40 p-3 rounded-lg border border-border">
                  <div className="text-[10px] font-bold text-violet-500 uppercase">Arts & Humanities (V)</div>
                  <p className="text-[11px] text-muted mt-1">Open seat allocation for all passed candidates. High preference for UPSC aspirants.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High School Milestone Checklist */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-theme-card">
          <div className="flex items-center justify-between mb-5 border-b border-border pb-4">
            <div>
              <h2 className="text-xs md:text-sm md:text-base md:text-lg font-bold text-text-heading flex items-center gap-2">
                <i className="fi fi-sr-check-circle w-5 h-5 text-red-500" /> Your Class 10 Transition Checklist
              </h2>
              <p className="text-xs text-muted mt-0.5">Stay on track before the high-school session finishes</p>
            </div>
            <div className="text-xs text-muted">
              {roadmapTasks.filter((t) => t.completed).length} of {roadmapTasks.length} Completed
            </div>
          </div>

          <div className="space-y-3">
            {roadmapTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  task.completed
                    ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/5 text-muted"
                    : "border-border bg-secondary/10 text-text-main hover:border-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  task.completed
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                    : "border-slate-400 dark:border-slate-650"
                }`}>
                  {task.completed && <i className="fi fi-sr-check-circle w-3.5 h-3.5 fill-current" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${task.completed ? "line-through text-muted" : "text-text-main"}`}>
                    {task.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}