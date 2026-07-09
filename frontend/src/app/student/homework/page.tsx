
// // "use client";

// // import PortalLayout from "@/components/PortalLayout";
// // import { useState, useRef, useEffect } from "react";
// // import {
// //   FileText,
// //   Upload,
// //   Sparkles,
// //   Send,
// //   ChevronLeft,
// //   Clock,
// //   CheckCircle2,
// //   Image as ImageIcon,
// //   X,
// //   Paperclip,
// //   Loader2,
// //   Lightbulb,
// //   MessageCircleQuestion,
// //   type LucideIcon,
// // } from "lucide-react";

// // type OpenIntent = "view" | "ai" | "submit";

// // /* ------------------------------------------------------------------ */
// // /*  Data                                                              */
// // /* ------------------------------------------------------------------ */

// // type Status = "not_submitted" | "submitted";

// // interface Assignment {
// //   id: string;
// //   subject: string;
// //   subjectColor: string;
// //   title: string;
// //   description: string;
// //   fullBrief: string;
// //   classLabel: string;
// //   status: Status;
// //   dueLabel: string;
// //   postedLabel: string;
// //   teacher: string;
// // }

// // const ASSIGNMENTS: Assignment[] = [
// //   {
// //     id: "algebra-1",
// //     subject: "Mathematics",
// //     subjectColor: "#2dd4bf",
// //     title: "Algebra Practice — Linear Equations",
// //     description: "Solve questions 1–12 from Chapter 3.",
// //     fullBrief:
// //       "Solve questions 1–12 from Chapter 3, covering single-variable and two-variable linear equations. Show every step — don't skip the working. Question 9 requires a word-problem setup before solving.",
// //     classLabel: "Class 9",
// //     status: "not_submitted",
// //     dueLabel: "22 Jun · 3 days left",
// //     postedLabel: "19 Jun",
// //     teacher: "Mrs. Lakshmi",
// //   },
// //   {
// //     id: "essay-1",
// //     subject: "English",
// //     subjectColor: "#fb923c",
// //     title: "Essay — A Place I'd Like to Visit",
// //     description: "Write a 300-word descriptive essay.",
// //     fullBrief:
// //       "Write a 300-word descriptive essay about a place you'd like to visit. Focus on sensory detail — what you'd see, hear, and feel — rather than just listing facts about the place.",
// //     classLabel: "Class 9",
// //     status: "submitted",
// //     dueLabel: "20 Jun · Turned in",
// //     postedLabel: "17 Jun",
// //     teacher: "Mr. Joseph",
// //   },
// // ];

// // /* Mocked AI guidance per assignment — in production this comes from your AI endpoint */
// // const AI_GUIDANCE: Record<string, string[]> = {
// //   "algebra-1": [
// //     "Start by isolating the variable on one side — move constants to the other side first, then divide out the coefficient.",
// //     "For question 9, write the word problem as an equation before touching the algebra. Define what 'x' stands for in one sentence.",
// //     "Check every answer by substituting it back into the original equation — it should make both sides equal.",
// //     "Keep your steps vertical and labelled. Your teacher is grading the working, not just the final number.",
// //   ],
// //   "essay-1": [
// //     "Pick one specific place, not a generic category — 'the lighthouse at Dhanushkodi' beats 'the beach.'",
// //     "Open with a sensory image rather than 'I want to visit...' — drop the reader into the scene first.",
// //     "Use one paragraph per sense: sight, sound, and feeling, so the description doesn't read like a list.",
// //     "End by tying the place back to why it matters to you — that's what turns description into a real essay.",
// //   ],
// // };

// // /* ------------------------------------------------------------------ */
// // /*  Small UI atoms                                                    */
// // /* ------------------------------------------------------------------ */

// // function StatusPill({ status }: { status: Status }) {
// //   if (status === "submitted") {
// //     return (
// //       <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-400">
// //         <CheckCircle2 className="h-3.5 w-3.5" />
// //         Submitted
// //       </span>
// //     );
// //   }
// //   return (
// //     <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
// //       <Clock className="h-3.5 w-3.5" />
// //       Not submitted
// //     </span>
// //   );
// // }

// // function IconBadge({
// //   icon: Icon,
// //   color,
// // }: {
// //   icon: LucideIcon;
// //   color: string;
// // }) {
// //   return (
// //     <div
// //       className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
// //       style={{ backgroundColor: `${color}1f`, color }}
// //     >
// //       <Icon className="h-[18px] w-[18px]" />
// //     </div>
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /*  Assignment list card                                              */
// // /* ------------------------------------------------------------------ */

// // function AssignmentCard({
// //   a,
// //   onOpen,
// // }: {
// //   a: Assignment;
// //   onOpen: (id: string, intent: OpenIntent) => void;
// // }) {
// //   return (
// //     <div className="group relative w-full rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5 transition-colors hover:border-white/[0.12] hover:bg-[#141f35]">
// //       <span
// //         className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
// //         style={{ backgroundColor: a.subjectColor }}
// //       />
// //       <button
// //         onClick={() => onOpen(a.id, "view")}
// //         className="flex w-full items-start justify-between pl-3 text-left"
// //       >
// //         <div className="flex items-start gap-3">
// //           <IconBadge icon={FileText} color={a.subjectColor} />
// //           <div>
// //             <div className="flex items-center gap-2">
// //               <span
// //                 className="text-[12px] font-semibold tracking-wide"
// //                 style={{ color: a.subjectColor }}
// //               >
// //                 {a.subject}
// //               </span>
// //               <span className="text-[12px] text-slate-500">
// //                 {a.classLabel}
// //               </span>
// //             </div>
// //             <h3 className="mt-1 text-[15px] font-semibold leading-snug text-slate-100">
// //               {a.title}
// //             </h3>
// //             <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
// //               {a.description}
// //             </p>
// //           </div>
// //         </div>
// //       </button>

// //       <div className="mt-4 flex items-center justify-between pl-3">
// //         <StatusPill status={a.status} />
// //         <span className="text-[12px] text-slate-500">{a.dueLabel}</span>
// //       </div>

// //       <div className="mt-4 flex items-center gap-2 pl-3">
// //         <button
// //           onClick={() => onOpen(a.id, "view")}
// //           className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-slate-300 transition-colors hover:bg-white/[0.07]"
// //         >
// //           View
// //         </button>
// //         <button
// //           onClick={() => onOpen(a.id, "ai")}
// //           className="flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-[12.5px] font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
// //         >
// //           <MessageCircleQuestion className="h-3.5 w-3.5" />
// //           Ask AI
// //         </button>
// //         {a.status === "not_submitted" && (
// //           <button
// //             onClick={() => onOpen(a.id, "submit")}
// //             className="ml-auto rounded-lg bg-teal-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400"
// //           >
// //             Submit
// //           </button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /*  AI guidance panel                                                 */
// // /* ------------------------------------------------------------------ */

// // function AiGuidancePanel({
// //   assignment,
// //   tips,
// //   loading,
// //   onAsk,
// //   doubt,
// //   setDoubt,
// //   doubtAnswer,
// //   doubtLoading,
// //   onAskDoubt,
// // }: {
// //   assignment: Assignment;
// //   tips: string[] | null;
// //   loading: boolean;
// //   onAsk: () => void;
// //   doubt: string;
// //   setDoubt: (v: string) => void;
// //   doubtAnswer: string | null;
// //   doubtLoading: boolean;
// //   onAskDoubt: () => void;
// // }) {
// //   return (
// //     <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-5">
// //       <div className="flex items-center gap-3">
// //         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
// //           <Sparkles className="h-[18px] w-[18px]" />
// //         </div>
// //         <div>
// //           <h3 className="text-[14px] font-semibold text-slate-100">
// //             AI Study Companion
// //           </h3>
// //           <p className="text-[12px] text-slate-400">
// //             Get a nudge in the right direction — not the answers.
// //           </p>
// //         </div>
// //       </div>

// //       {!tips && !loading && (
// //         <button
// //           onClick={onAsk}
// //           className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-violet-400"
// //         >
// //           <Lightbulb className="h-4 w-4" />
// //           Get ideas for this homework
// //         </button>
// //       )}

// //       {loading && (
// //         <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d1626] px-4 py-3 text-[13px] text-slate-400">
// //           <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
// //           Reading the {assignment.subject.toLowerCase()} brief and putting
// //           together some ideas…
// //         </div>
// //       )}

// //       {tips && (
// //         <div className="mt-4 space-y-2.5">
// //           {tips.map((tip, i) => (
// //             <div
// //               key={i}
// //               className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#0d1626] p-3"
// //             >
// //               <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-300">
// //                 {i + 1}
// //               </span>
// //               <p className="text-[13px] leading-relaxed text-slate-300">
// //                 {tip}
// //               </p>
// //             </div>
// //           ))}
// //           <p className="pt-1 text-[11.5px] text-slate-500">
// //             These are pointers to help you work it out yourself — your
// //             teacher will still grade your own steps and words.
// //           </p>
// //         </div>
// //       )}

// //       {/* Free-form doubt box */}
// //       <div className="mt-5 border-t border-white/[0.08] pt-4">
// //         <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-300">
// //           <MessageCircleQuestion className="h-3.5 w-3.5 text-violet-300" />
// //           Stuck on something specific? Ask here.
// //         </p>
// //         <div className="mt-2.5 flex gap-2">
// //           <input
// //             value={doubt}
// //             onChange={(e) => setDoubt(e.target.value)}
// //             onKeyDown={(e) => {
// //               if (e.key === "Enter" && doubt.trim()) onAskDoubt();
// //             }}
// //             placeholder="e.g. I don't get how to set up question 9…"
// //             className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0d1626] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-violet-400/40 focus:outline-none focus:ring-1 focus:ring-violet-400/30"
// //           />
// //           <button
// //             onClick={onAskDoubt}
// //             disabled={!doubt.trim() || doubtLoading}
// //             className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-500 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
// //           >
// //             {doubtLoading ? (
// //               <Loader2 className="h-4 w-4 animate-spin" />
// //             ) : (
// //               <Send className="h-4 w-4" />
// //             )}
// //             Ask
// //           </button>
// //         </div>

// //         {doubtAnswer && (
// //           <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#0d1626] p-3 text-[13px] leading-relaxed text-slate-300">
// //             {doubtAnswer}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /*  Submission panel: text / image / pdf                              */
// // /* ------------------------------------------------------------------ */

// // type UploadKind = "pdf" | "image";
// // interface UploadedFile {
// //   id: string;
// //   name: string;
// //   kind: UploadKind;
// //   sizeLabel: string;
// // }

// // function SubmissionPanel({
// //   answerText,
// //   setAnswerText,
// //   files,
// //   onAddFiles,
// //   onRemoveFile,
// //   onSubmit,
// //   submitted,
// //   onEdit,
// // }: {
// //   answerText: string;
// //   setAnswerText: (v: string) => void;
// //   files: UploadedFile[];
// //   onAddFiles: (list: FileList | null) => void;
// //   onRemoveFile: (id: string) => void;
// //   onSubmit: () => void;
// //   submitted: boolean;
// //   onEdit: () => void;
// // }) {
// //   const fileInputRef = useRef<HTMLInputElement>(null);
// //   const [dragOver, setDragOver] = useState(false);

// //   const canSubmit = answerText.trim().length > 0 || files.length > 0;

// //   if (submitted) {
// //     return (
// //       <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.06] to-transparent p-5">
// //         <div className="flex items-center justify-between">
// //           <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400">
// //             <CheckCircle2 className="h-4 w-4" />
// //             Submitted to teacher
// //           </span>
// //           <button
// //             onClick={onEdit}
// //             className="text-[12px] font-medium text-slate-400 hover:text-slate-200"
// //           >
// //             Edit submission
// //           </button>
// //         </div>

// //         <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
// //           Your notes
// //         </p>
// //         {answerText.trim() ? (
// //           <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-[#0d1626] p-3 text-[13px] leading-relaxed text-slate-300">
// //             {answerText}
// //           </p>
// //         ) : (
// //           <p className="mt-1.5 text-[12.5px] text-slate-500">
// //             No typed notes — submitted as file(s) only.
// //           </p>
// //         )}

// //         {files.length > 0 && (
// //           <>
// //             <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
// //               Attachments
// //             </p>
// //             <ul className="mt-1.5 space-y-2">
// //               {files.map((f) => (
// //                 <li
// //                   key={f.id}
// //                   className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-[#0d1626] px-3 py-2"
// //                 >
// //                   {f.kind === "pdf" ? (
// //                     <FileText className="h-4 w-4 shrink-0 text-rose-400" />
// //                   ) : (
// //                     <ImageIcon className="h-4 w-4 shrink-0 text-sky-400" />
// //                   )}
// //                   <div className="min-w-0">
// //                     <p className="truncate text-[12.5px] text-slate-200">
// //                       {f.name}
// //                     </p>
// //                     <p className="text-[11px] text-slate-500">
// //                       {f.sizeLabel}
// //                     </p>
// //                   </div>
// //                 </li>
// //               ))}
// //             </ul>
// //           </>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5">
// //       <h3 className="text-[14px] font-semibold text-slate-100">
// //         Your answer
// //       </h3>
// //       <p className="mt-0.5 text-[12px] text-slate-400">
// //         Type your working, or attach a photo / scanned PDF of your notebook
// //         page.
// //       </p>

// //       <textarea
// //         value={answerText}
// //         onChange={(e) => setAnswerText(e.target.value)}
// //         placeholder="Write or paste your answer here…"
// //         rows={5}
// //         className="mt-4 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0d1626] p-3 text-[13.5px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
// //       />

// //       <div
// //         onDragOver={(e) => {
// //           e.preventDefault();
// //           setDragOver(true);
// //         }}
// //         onDragLeave={() => setDragOver(false)}
// //         onDrop={(e) => {
// //           e.preventDefault();
// //           setDragOver(false);
// //           onAddFiles(e.dataTransfer.files);
// //         }}
// //         className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
// //           dragOver
// //             ? "border-teal-400/60 bg-teal-400/[0.06]"
// //             : "border-white/[0.1] bg-[#0d1626]"
// //         }`}
// //       >
// //         <Upload className="h-5 w-5 text-slate-500" />
// //         <p className="text-[12.5px] text-slate-400">
// //           Drag a PDF or photo here, or{" "}
// //           <button
// //             onClick={() => fileInputRef.current?.click()}
// //             className="font-semibold text-teal-400 hover:text-teal-300"
// //           >
// //             browse files
// //           </button>
// //         </p>
// //         <p className="text-[11px] text-slate-600">PDF, JPG or PNG · up to 20MB</p>
// //         <input
// //           ref={fileInputRef}
// //           type="file"
// //           multiple
// //           accept=".pdf,image/*"
// //           className="hidden"
// //           onChange={(e) => onAddFiles(e.target.files)}
// //         />
// //       </div>

// //       {files.length > 0 && (
// //         <ul className="mt-3 space-y-2">
// //           {files.map((f) => (
// //             <li
// //               key={f.id}
// //               className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#0d1626] px-3 py-2"
// //             >
// //               <div className="flex min-w-0 items-center gap-2.5">
// //                 {f.kind === "pdf" ? (
// //                   <FileText className="h-4 w-4 shrink-0 text-rose-400" />
// //                 ) : (
// //                   <ImageIcon className="h-4 w-4 shrink-0 text-sky-400" />
// //                 )}
// //                 <div className="min-w-0">
// //                   <p className="truncate text-[12.5px] text-slate-200">
// //                     {f.name}
// //                   </p>
// //                   <p className="text-[11px] text-slate-500">{f.sizeLabel}</p>
// //                 </div>
// //               </div>
// //               <button
// //                 onClick={() => onRemoveFile(f.id)}
// //                 className="shrink-0 text-slate-500 hover:text-slate-300"
// //               >
// //                 <X className="h-4 w-4" />
// //               </button>
// //             </li>
// //           ))}
// //         </ul>
// //       )}

// //       <button
// //         onClick={onSubmit}
// //         disabled={!canSubmit}
// //         className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-[13.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
// //       >
// //         <Send className="h-4 w-4" />
// //         Submit homework
// //       </button>
// //     </div>
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /*  Detail view                                                       */
// // /* ------------------------------------------------------------------ */

// // function AssignmentDetail({
// //   assignment,
// //   intent,
// //   onBack,
// // }: {
// //   assignment: Assignment;
// //   intent: OpenIntent;
// //   onBack: () => void;
// // }) {
// //   const [tips, setTips] = useState<string[] | null>(null);
// //   const [loadingTips, setLoadingTips] = useState(false);
// //   const [answerText, setAnswerText] = useState("");
// //   const [files, setFiles] = useState<UploadedFile[]>([]);
// //   const [submitted, setSubmitted] = useState(assignment.status === "submitted");
// //   const [doubt, setDoubt] = useState("");
// //   const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
// //   const [doubtLoading, setDoubtLoading] = useState(false);

// //   const aiRef = useRef<HTMLDivElement>(null);
// //   const submissionRef = useRef<HTMLDivElement>(null);

// //   const handleAsk = () => {
// //     setLoadingTips(true);
// //     window.setTimeout(() => {
// //       setTips(AI_GUIDANCE[assignment.id] ?? []);
// //       setLoadingTips(false);
// //     }, 1100);
// //   };

// //   const handleAskDoubt = () => {
// //     if (!doubt.trim()) return;
// //     setDoubtLoading(true);
// //     setDoubtAnswer(null);
// //     window.setTimeout(() => {
// //       setDoubtAnswer(
// //         `Good question. Try breaking "${doubt.trim()}" into smaller steps — identify what you already know, write that down first, then work out what's missing before applying the formula. If you're still stuck after that, flag it to ${assignment.teacher} when you submit.`
// //       );
// //       setDoubtLoading(false);
// //     }, 1000);
// //   };

// //   useEffect(() => {
// //     if (intent === "ai") {
// //       aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
// //       if (!tips && !loadingTips) handleAsk();
// //     } else if (intent === "submit") {
// //       submissionRef.current?.scrollIntoView({
// //         behavior: "smooth",
// //         block: "start",
// //       });
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [intent]);

// //   const handleAddFiles = (list: FileList | null) => {
// //     if (!list) return;
// //     const next: UploadedFile[] = Array.from(list).map((f) => ({
// //       id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
// //       name: f.name,
// //       kind: f.type === "application/pdf" ? "pdf" : "image",
// //       sizeLabel: `${(f.size / 1024).toFixed(0)} KB`,
// //     }));
// //     setFiles((prev) => [...prev, ...next]);
// //   };

// //   const handleSubmit = () => {
// //     setSubmitted(true);
// //   };

// //   return (
// //     <div>
// //       <button
// //         onClick={onBack}
// //         className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-200"
// //       >
// //         <ChevronLeft className="h-4 w-4" />
// //         Back to homework
// //       </button>

// //       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_1fr]">
// //         <div className="space-y-4">
// //           <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5">
// //             <div className="flex items-start gap-3">
// //               <IconBadge icon={FileText} color={assignment.subjectColor} />
// //               <div className="min-w-0 flex-1">
// //                 <div className="flex flex-wrap items-center gap-2">
// //                   <span
// //                     className="text-[12px] font-semibold tracking-wide"
// //                     style={{ color: assignment.subjectColor }}
// //                   >
// //                     {assignment.subject}
// //                   </span>
// //                   <span className="text-[12px] text-slate-500">
// //                     {assignment.classLabel}
// //                   </span>
// //                   <span className="text-[12px] text-slate-600">·</span>
// //                   <span className="text-[12px] text-slate-500">
// //                     Set by {assignment.teacher}
// //                   </span>
// //                 </div>
// //                 <h2 className="mt-1 text-[18px] font-semibold text-slate-100">
// //                   {assignment.title}
// //                 </h2>
// //               </div>
// //               <StatusPill status={submitted ? "submitted" : "not_submitted"} />
// //             </div>

// //             <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">
// //               {assignment.fullBrief}
// //             </p>

// //             <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-[12px] text-slate-500">
// //               <span>Posted {assignment.postedLabel}</span>
// //               <span>·</span>
// //               <span>{assignment.dueLabel}</span>
// //             </div>
// //           </div>

// //           <div ref={aiRef} className="scroll-mt-6">
// //             <AiGuidancePanel
// //               assignment={assignment}
// //               tips={tips}
// //               loading={loadingTips}
// //               onAsk={handleAsk}
// //               doubt={doubt}
// //               setDoubt={setDoubt}
// //               doubtAnswer={doubtAnswer}
// //               doubtLoading={doubtLoading}
// //               onAskDoubt={handleAskDoubt}
// //             />
// //           </div>
// //         </div>

// //         <div ref={submissionRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
// //           <SubmissionPanel
// //             answerText={answerText}
// //             setAnswerText={setAnswerText}
// //             files={files}
// //             onAddFiles={handleAddFiles}
// //             onRemoveFile={(id) =>
// //               setFiles((prev) => prev.filter((f) => f.id !== id))
// //             }
// //             onSubmit={handleSubmit}
// //             submitted={submitted}
// //             onEdit={() => setSubmitted(false)}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /*  Page                                                               */
// // /* ------------------------------------------------------------------ */

// // type Filter = "all" | "pending" | "submitted";

// // export default function HomeworkPage() {
// //   const [selectedId, setSelectedId] = useState<string | null>(null);
// //   const [intent, setIntent] = useState<OpenIntent>("view");
// //   const [filter, setFilter] = useState<Filter>("all");

// //   const completed = ASSIGNMENTS.filter((a) => a.status === "submitted").length;
// //   const total = ASSIGNMENTS.length;
// //   const pct = Math.round((completed / total) * 100);

// //   const filtered = ASSIGNMENTS.filter((a) => {
// //     if (filter === "pending") return a.status === "not_submitted";
// //     if (filter === "submitted") return a.status === "submitted";
// //     return true;
// //   });

// //   const selected = ASSIGNMENTS.find((a) => a.id === selectedId) ?? null;

// //   const handleOpen = (id: string, openIntent: OpenIntent) => {
// //     setSelectedId(id);
// //     setIntent(openIntent);
// //   };

// //   return (
// //     <PortalLayout
// //       title="Homework"
// //       subtitle="Assignments from your teachers, updated automatically."
// //       avatarLetter="A"
// //       avatarColor="#2dd4bf"
// //       themeClass="theme-student"
// //       accentColor="#2dd4bf"
// //     >
// //       {selected ? (
// //         <AssignmentDetail
// //           assignment={selected}
// //           intent={intent}
// //           onBack={() => setSelectedId(null)}
// //         />
// //       ) : (
// //         <div>
// //           <div className="glass mt-1 rounded-2xl border border-white/[0.06] p-5">
// //             <div className="flex items-center justify-between text-[13px]">
// //               <span className="text-slate-400">Completed</span>
// //               <span className="font-semibold text-slate-200">
// //                 {completed} / {total}
// //               </span>
// //             </div>
// //             <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
// //               <div
// //                 className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all"
// //                 style={{ width: `${pct}%` }}
// //               />
// //             </div>
// //           </div>

// //           {/* filters */}
// //           <div className="mt-5 flex gap-2">
// //             {(
// //               [
// //                 ["all", `All (${total})`],
// //                 ["pending", `Pending (${ASSIGNMENTS.filter((a) => a.status === "not_submitted").length})`],
// //                 ["submitted", `Submitted (${completed})`],
// //               ] as [Filter, string][]
// //             ).map(([key, label]) => (
// //               <button
// //                 key={key}
// //                 onClick={() => setFilter(key)}
// //                 className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
// //                   filter === key
// //                     ? "bg-teal-400/15 text-teal-300 ring-1 ring-inset ring-teal-400/30"
// //                     : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-300"
// //                 }`}
// //               >
// //                 {label}
// //               </button>
// //             ))}
// //           </div>

// //           {/* list */}
// //           <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
// //             {filtered.map((a) => (
// //               <AssignmentCard key={a.id} a={a} onOpen={handleOpen} />
// //             ))}
// //             {filtered.length === 0 && (
// //               <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-8 text-center lg:col-span-2">
// //                 <p className="text-[13.5px] text-slate-400">
// //                   Nothing here right now.
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </PortalLayout>
// //   );
// // }

// "use client";

// import PortalLayout from "@/components/PortalLayout";
// import { useState, useRef, useEffect } from "react";
// import {
//   FileText,
//   Upload,
//   Sparkles,
//   Send,
//   ChevronLeft,
//   Clock,
//   CheckCircle2,
//   Image as ImageIcon,
//   X,
//   Paperclip,
//   Loader2,
//   Lightbulb,
//   MessageCircleQuestion,
//   type LucideIcon,
// } from "lucide-react";

// type OpenIntent = "view" | "ai" | "submit";

// /* ------------------------------------------------------------------ */
// /*  Data                                                              */
// /* ------------------------------------------------------------------ */

// type Status = "not_submitted" | "submitted";

// interface Assignment {
//   id: string;
//   subject: string;
//   subjectColor: string;
//   title: string;
//   description: string;
//   fullBrief: string;
//   classLabel: string;
//   status: Status;
//   dueLabel: string;
//   postedLabel: string;
//   teacher: string;
// }

// const ASSIGNMENTS: Assignment[] = [
//   {
//     id: "algebra-1",
//     subject: "Mathematics",
//     subjectColor: "#2dd4bf",
//     title: "Algebra Practice — Linear Equations",
//     description: "Solve questions 1–12 from Chapter 3.",
//     fullBrief:
//       "Solve questions 1–12 from Chapter 3, covering single-variable and two-variable linear equations. Show every step — don't skip the working. Question 9 requires a word-problem setup before solving.",
//     classLabel: "Class 9",
//     status: "not_submitted",
//     dueLabel: "22 Jun · 3 days left",
//     postedLabel: "19 Jun",
//     teacher: "Mrs. Lakshmi",
//   },
//   {
//     id: "essay-1",
//     subject: "English",
//     subjectColor: "#fb923c",
//     title: "Essay — A Place I'd Like to Visit",
//     description: "Write a 300-word descriptive essay.",
//     fullBrief:
//       "Write a 300-word descriptive essay about a place you'd like to visit. Focus on sensory detail — what you'd see, hear, and feel — rather than just listing facts about the place.",
//     classLabel: "Class 9",
//     status: "submitted",
//     dueLabel: "20 Jun · Turned in",
//     postedLabel: "17 Jun",
//     teacher: "Mr. Joseph",
//   },
// ];

// /* Mocked AI guidance per assignment — in production this comes from your AI endpoint */
// const AI_GUIDANCE: Record<string, string[]> = {
//   "algebra-1": [
//     "Start by isolating the variable on one side — move constants to the other side first, then divide out the coefficient.",
//     "For question 9, write the word problem as an equation before touching the algebra. Define what 'x' stands for in one sentence.",
//     "Check every answer by substituting it back into the original equation — it should make both sides equal.",
//     "Keep your steps vertical and labelled. Your teacher is grading the working, not just the final number.",
//   ],
//   "essay-1": [
//     "Pick one specific place, not a generic category — 'the lighthouse at Dhanushkodi' beats 'the beach.'",
//     "Open with a sensory image rather than 'I want to visit...' — drop the reader into the scene first.",
//     "Use one paragraph per sense: sight, sound, and feeling, so the description doesn't read like a list.",
//     "End by tying the place back to why it matters to you — that's what turns description into a real essay.",
//   ],
// };

// /* ------------------------------------------------------------------ */
// /*  Small UI atoms                                                    */
// /* ------------------------------------------------------------------ */

// function StatusPill({ status }: { status: Status }) {
//   if (status === "submitted") {
//     return (
//       <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-400">
//         <CheckCircle2 className="h-3.5 w-3.5" />
//         Submitted
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
//       <Clock className="h-3.5 w-3.5" />
//       Not submitted
//     </span>
//   );
// }

// function IconBadge({
//   icon: Icon,
//   color,
// }: {
//   icon: LucideIcon;
//   color: string;
// }) {
//   return (
//     <div
//       className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
//       style={{ backgroundColor: `${color}1f`, color }}
//     >
//       <Icon className="h-[18px] w-[18px]" />
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Assignment list card                                              */
// /* ------------------------------------------------------------------ */

// function AssignmentCard({
//   a,
//   onOpen,
// }: {
//   a: Assignment;
//   onOpen: (id: string, intent: OpenIntent) => void;
// }) {
//   return (
//     <div className="group relative w-full rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5 transition-colors hover:border-white/[0.12] hover:bg-[#141f35]">
//       <span
//         className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
//         style={{ backgroundColor: a.subjectColor }}
//       />
//       <button
//         onClick={() => onOpen(a.id, "view")}
//         className="flex w-full items-start justify-between pl-3 text-left"
//       >
//         <div className="flex items-start gap-3">
//           <IconBadge icon={FileText} color={a.subjectColor} />
//           <div>
//             <div className="flex items-center gap-2">
//               <span
//                 className="text-[12px] font-semibold tracking-wide"
//                 style={{ color: a.subjectColor }}
//               >
//                 {a.subject}
//               </span>
//               <span className="text-[12px] text-slate-500">
//                 {a.classLabel}
//               </span>
//             </div>
//             <h3 className="mt-1 text-[15px] font-semibold leading-snug text-slate-100">
//               {a.title}
//             </h3>
//             <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
//               {a.description}
//             </p>
//           </div>
//         </div>
//       </button>

//       <div className="mt-4 flex items-center justify-between pl-3">
//         <StatusPill status={a.status} />
//         <span className="text-[12px] text-slate-500">{a.dueLabel}</span>
//       </div>

//       <div className="mt-4 flex items-center gap-2 pl-3">
//         <button
//           onClick={() => onOpen(a.id, "view")}
//           className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-slate-300 transition-colors hover:bg-white/[0.07]"
//         >
//           View
//         </button>
//         <button
//           onClick={() => onOpen(a.id, "ai")}
//           className="flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-[12.5px] font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
//         >
//           <MessageCircleQuestion className="h-3.5 w-3.5" />
//           Ask AI
//         </button>
//         {a.status === "not_submitted" && (
//           <button
//             onClick={() => onOpen(a.id, "submit")}
//             className="ml-auto rounded-lg bg-teal-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400"
//           >
//             Submit
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  AI guidance panel                                                 */
// /* ------------------------------------------------------------------ */

// function AiGuidancePanel({
//   assignment,
//   tips,
//   loading,
//   onAsk,
//   doubt,
//   setDoubt,
//   doubtAnswer,
//   doubtLoading,
//   onAskDoubt,
// }: {
//   assignment: Assignment;
//   tips: string[] | null;
//   loading: boolean;
//   onAsk: () => void;
//   doubt: string;
//   setDoubt: (v: string) => void;
//   doubtAnswer: string | null;
//   doubtLoading: boolean;
//   onAskDoubt: () => void;
// }) {
//   return (
//     <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-5">
//       <div className="flex items-center gap-3">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
//           <Sparkles className="h-[18px] w-[18px]" />
//         </div>
//         <div>
//           <h3 className="text-[14px] font-semibold text-slate-100">
//             AI Study Companion
//           </h3>
//           <p className="text-[12px] text-slate-400">
//             Get a nudge in the right direction — not the answers.
//           </p>
//         </div>
//       </div>

//       {!tips && !loading && (
//         <button
//           onClick={onAsk}
//           className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-violet-400"
//         >
//           <Lightbulb className="h-4 w-4" />
//           Get ideas for this homework
//         </button>
//       )}

//       {loading && (
//         <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d1626] px-4 py-3 text-[13px] text-slate-400">
//           <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
//           Reading the {assignment.subject.toLowerCase()} brief and putting
//           together some ideas…
//         </div>
//       )}

//       {tips && (
//         <div className="mt-4 space-y-2.5">
//           {tips.map((tip, i) => (
//             <div
//               key={i}
//               className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#0d1626] p-3"
//             >
//               <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-300">
//                 {i + 1}
//               </span>
//               <p className="text-[13px] leading-relaxed text-slate-300">
//                 {tip}
//               </p>
//             </div>
//           ))}
//           <p className="pt-1 text-[11.5px] text-slate-500">
//             These are pointers to help you work it out yourself — your
//             teacher will still grade your own steps and words.
//           </p>
//         </div>
//       )}

//       {/* Free-form doubt box */}
//       <div className="mt-5 border-t border-white/[0.08] pt-4">
//         <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-300">
//           <MessageCircleQuestion className="h-3.5 w-3.5 text-violet-300" />
//           Stuck on something specific? Ask here.
//         </p>
//         <div className="mt-2.5 flex gap-2">
//           <input
//             value={doubt}
//             onChange={(e) => setDoubt(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && doubt.trim()) onAskDoubt();
//             }}
//             placeholder="e.g. I don't get how to set up question 9…"
//             className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0d1626] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-violet-400/40 focus:outline-none focus:ring-1 focus:ring-violet-400/30"
//           />
//           <button
//             onClick={onAskDoubt}
//             disabled={!doubt.trim() || doubtLoading}
//             className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-500 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
//           >
//             {doubtLoading ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Send className="h-4 w-4" />
//             )}
//             Ask
//           </button>
//         </div>

//         {doubtAnswer && (
//           <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#0d1626] p-3 text-[13px] leading-relaxed text-slate-300">
//             {doubtAnswer}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Submission panel: text / image / pdf                              */
// /* ------------------------------------------------------------------ */

// type UploadKind = "pdf" | "image";
// interface UploadedFile {
//   id: string;
//   name: string;
//   kind: UploadKind;
//   sizeLabel: string;
// }

// function SubmissionPanel({
//   answerText,
//   setAnswerText,
//   files,
//   onAddFiles,
//   onRemoveFile,
//   onSubmit,
//   submitted,
//   onEdit,
// }: {
//   answerText: string;
//   setAnswerText: (v: string) => void;
//   files: UploadedFile[];
//   onAddFiles: (list: FileList | null) => void;
//   onRemoveFile: (id: string) => void;
//   onSubmit: () => void;
//   submitted: boolean;
//   onEdit: () => void;
// }) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [dragOver, setDragOver] = useState(false);

//   const canSubmit = answerText.trim().length > 0 || files.length > 0;

//   if (submitted) {
//     return (
//       <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.06] to-transparent p-5">
//         <div className="flex items-center justify-between">
//           <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400">
//             <CheckCircle2 className="h-4 w-4" />
//             Submitted to teacher
//           </span>
//           <button
//             onClick={onEdit}
//             className="text-[12px] font-medium text-slate-400 hover:text-slate-200"
//           >
//             Edit submission
//           </button>
//         </div>

//         <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
//           Your notes
//         </p>
//         {answerText.trim() ? (
//           <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-[#0d1626] p-3 text-[13px] leading-relaxed text-slate-300">
//             {answerText}
//           </p>
//         ) : (
//           <p className="mt-1.5 text-[12.5px] text-slate-500">
//             No typed notes — submitted as file(s) only.
//           </p>
//         )}

//         {files.length > 0 && (
//           <>
//             <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
//               Attachments
//             </p>
//             <ul className="mt-1.5 space-y-2">
//               {files.map((f) => (
//                 <li
//                   key={f.id}
//                   className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-[#0d1626] px-3 py-2"
//                 >
//                   {f.kind === "pdf" ? (
//                     <FileText className="h-4 w-4 shrink-0 text-rose-400" />
//                   ) : (
//                     <ImageIcon className="h-4 w-4 shrink-0 text-sky-400" />
//                   )}
//                   <div className="min-w-0">
//                     <p className="truncate text-[12.5px] text-slate-200">
//                       {f.name}
//                     </p>
//                     <p className="text-[11px] text-slate-500">
//                       {f.sizeLabel}
//                     </p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5">
//       <h3 className="text-[14px] font-semibold text-slate-100">
//         Your answer
//       </h3>
//       <p className="mt-0.5 text-[12px] text-slate-400">
//         Type your working, or attach a photo / scanned PDF of your notebook
//         page.
//       </p>

//       <textarea
//         value={answerText}
//         onChange={(e) => setAnswerText(e.target.value)}
//         placeholder="Write or paste your answer here…"
//         rows={5}
//         className="mt-4 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0d1626] p-3 text-[13.5px] leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
//       />

//       <div
//         onDragOver={(e) => {
//           e.preventDefault();
//           setDragOver(true);
//         }}
//         onDragLeave={() => setDragOver(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setDragOver(false);
//           onAddFiles(e.dataTransfer.files);
//         }}
//         className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
//           dragOver
//             ? "border-teal-400/60 bg-teal-400/[0.06]"
//             : "border-white/[0.1] bg-[#0d1626]"
//         }`}
//       >
//         <Upload className="h-5 w-5 text-slate-500" />
//         <p className="text-[12.5px] text-slate-400">
//           Drag a PDF or photo here, or{" "}
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="font-semibold text-teal-400 hover:text-teal-300"
//           >
//             browse files
//           </button>
//         </p>
//         <p className="text-[11px] text-slate-600">PDF, JPG or PNG · up to 20MB</p>
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           accept=".pdf,image/*"
//           className="hidden"
//           onChange={(e) => onAddFiles(e.target.files)}
//         />
//       </div>

//       {files.length > 0 && (
//         <ul className="mt-3 space-y-2">
//           {files.map((f) => (
//             <li
//               key={f.id}
//               className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#0d1626] px-3 py-2"
//             >
//               <div className="flex min-w-0 items-center gap-2.5">
//                 {f.kind === "pdf" ? (
//                   <FileText className="h-4 w-4 shrink-0 text-rose-400" />
//                 ) : (
//                   <ImageIcon className="h-4 w-4 shrink-0 text-sky-400" />
//                 )}
//                 <div className="min-w-0">
//                   <p className="truncate text-[12.5px] text-slate-200">
//                     {f.name}
//                   </p>
//                   <p className="text-[11px] text-slate-500">{f.sizeLabel}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => onRemoveFile(f.id)}
//                 className="shrink-0 text-slate-500 hover:text-slate-300"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       <button
//         onClick={onSubmit}
//         disabled={!canSubmit}
//         className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-[13.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-500"
//       >
//         <Send className="h-4 w-4" />
//         Submit homework
//       </button>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Detail view                                                       */
// /* ------------------------------------------------------------------ */

// function AssignmentDetail({
//   assignment,
//   intent,
//   onBack,
// }: {
//   assignment: Assignment;
//   intent: OpenIntent;
//   onBack: () => void;
// }) {
//   const [tips, setTips] = useState<string[] | null>(null);
//   const [loadingTips, setLoadingTips] = useState(false);
//   const [answerText, setAnswerText] = useState("");
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [submitted, setSubmitted] = useState(assignment.status === "submitted");
//   const [doubt, setDoubt] = useState("");
//   const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
//   const [doubtLoading, setDoubtLoading] = useState(false);

//   const aiRef = useRef<HTMLDivElement>(null);
//   const submissionRef = useRef<HTMLDivElement>(null);

//   const handleAsk = () => {
//     setLoadingTips(true);
//     window.setTimeout(() => {
//       setTips(AI_GUIDANCE[assignment.id] ?? []);
//       setLoadingTips(false);
//     }, 1100);
//   };

//   const handleAskDoubt = () => {
//     if (!doubt.trim()) return;
//     setDoubtLoading(true);
//     setDoubtAnswer(null);
//     window.setTimeout(() => {
//       setDoubtAnswer(
//         `Good question. Try breaking "${doubt.trim()}" into smaller steps — identify what you already know, write that down first, then work out what's missing before applying the formula. If you're still stuck after that, flag it to ${assignment.teacher} when you submit.`
//       );
//       setDoubtLoading(false);
//     }, 1000);
//   };

//   useEffect(() => {
//     if (intent === "ai") {
//       aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//       if (!tips && !loadingTips) handleAsk();
//     } else if (intent === "submit") {
//       submissionRef.current?.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [intent]);

//   const handleAddFiles = (list: FileList | null) => {
//     if (!list) return;
//     const next: UploadedFile[] = Array.from(list).map((f) => ({
//       id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
//       name: f.name,
//       kind: f.type === "application/pdf" ? "pdf" : "image",
//       sizeLabel: `${(f.size / 1024).toFixed(0)} KB`,
//     }));
//     setFiles((prev) => [...prev, ...next]);
//   };

//   const handleSubmit = () => {
//     setSubmitted(true);
//   };

//   return (
//     <div>
//       <button
//         onClick={onBack}
//         className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-200"
//       >
//         <ChevronLeft className="h-4 w-4" />
//         Back to homework
//       </button>

//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_1fr]">
//         <div className="space-y-4">
//           <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-5">
//             <div className="flex items-start gap-3">
//               <IconBadge icon={FileText} color={assignment.subjectColor} />
//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <span
//                     className="text-[12px] font-semibold tracking-wide"
//                     style={{ color: assignment.subjectColor }}
//                   >
//                     {assignment.subject}
//                   </span>
//                   <span className="text-[12px] text-slate-500">
//                     {assignment.classLabel}
//                   </span>
//                   <span className="text-[12px] text-slate-600">·</span>
//                   <span className="text-[12px] text-slate-500">
//                     Set by {assignment.teacher}
//                   </span>
//                 </div>
//                 <h2 className="mt-1 text-[18px] font-semibold text-slate-100">
//                   {assignment.title}
//                 </h2>
//               </div>
//               <StatusPill status={submitted ? "submitted" : "not_submitted"} />
//             </div>

//             <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">
//               {assignment.fullBrief}
//             </p>

//             <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-[12px] text-slate-500">
//               <span>Posted {assignment.postedLabel}</span>
//               <span>·</span>
//               <span>{assignment.dueLabel}</span>
//             </div>
//           </div>

//           <div ref={aiRef} className="scroll-mt-6">
//             <AiGuidancePanel
//               assignment={assignment}
//               tips={tips}
//               loading={loadingTips}
//               onAsk={handleAsk}
//               doubt={doubt}
//               setDoubt={setDoubt}
//               doubtAnswer={doubtAnswer}
//               doubtLoading={doubtLoading}
//               onAskDoubt={handleAskDoubt}
//             />
//           </div>
//         </div>

//         <div ref={submissionRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
//           <SubmissionPanel
//             answerText={answerText}
//             setAnswerText={setAnswerText}
//             files={files}
//             onAddFiles={handleAddFiles}
//             onRemoveFile={(id) =>
//               setFiles((prev) => prev.filter((f) => f.id !== id))
//             }
//             onSubmit={handleSubmit}
//             submitted={submitted}
//             onEdit={() => setSubmitted(false)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /*  Page                                                               */
// /* ------------------------------------------------------------------ */

// type Filter = "all" | "pending" | "submitted";

// export default function HomeworkPage() {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [intent, setIntent] = useState<OpenIntent>("view");
//   const [filter, setFilter] = useState<Filter>("all");

//   const completed = ASSIGNMENTS.filter((a) => a.status === "submitted").length;
//   const total = ASSIGNMENTS.length;
//   const pct = Math.round((completed / total) * 100);

//   const filtered = ASSIGNMENTS.filter((a) => {
//     if (filter === "pending") return a.status === "not_submitted";
//     if (filter === "submitted") return a.status === "submitted";
//     return true;
//   });

//   const selected = ASSIGNMENTS.find((a) => a.id === selectedId) ?? null;

//   const handleOpen = (id: string, openIntent: OpenIntent) => {
//     setSelectedId(id);
//     setIntent(openIntent);
//   };

//   return (
//     <PortalLayout
//       title="Homework"
//       subtitle="Assignments from your teachers, updated automatically."
//       avatarLetter="A"
//       avatarColor="#2dd4bf"
//       themeClass="theme-student"
//       accentColor="#2dd4bf"
//     >
//       {selected ? (
//         <AssignmentDetail
//           assignment={selected}
//           intent={intent}
//           onBack={() => setSelectedId(null)}
//         />
//       ) : (
//         <div>
//           <div className="flex justify-end">
//             <div className="glass mt-1 w-56 rounded-2xl border border-white/[0.06] p-3">
//               <div className="flex items-center justify-between text-[11.5px]">
//                 <span className="text-slate-400">Completed</span>
//                 <span className="font-semibold text-slate-200">
//                   {completed} / {total}
//                 </span>
//               </div>
//               <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
//                 <div
//                   className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all"
//                   style={{ width: `${pct}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* filters */}
//           <div className="mt-5 flex gap-2">
//             {(
//               [
//                 ["all", `All (${total})`],
//                 ["pending", `Pending (${ASSIGNMENTS.filter((a) => a.status === "not_submitted").length})`],
//                 ["submitted", `Submitted (${completed})`],
//               ] as [Filter, string][]
//             ).map(([key, label]) => (
//               <button
//                 key={key}
//                 onClick={() => setFilter(key)}
//                 className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
//                   filter === key
//                     ? "bg-teal-400/15 text-teal-300 ring-1 ring-inset ring-teal-400/30"
//                     : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-300"
//                 }`}
//               >
//                 {label}
//               </button>
//             ))}
//           </div>

//           {/* list */}
//           <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
//             {filtered.map((a) => (
//               <AssignmentCard key={a.id} a={a} onOpen={handleOpen} />
//             ))}
//             {filtered.length === 0 && (
//               <div className="rounded-2xl border border-white/[0.06] bg-[#111a2c] p-8 text-center lg:col-span-2">
//                 <p className="text-[13.5px] text-slate-400">
//                   Nothing here right now.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </PortalLayout>
//   );
// }

"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Upload,
  Sparkles,
  Send,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Paperclip,
  Loader2,
  Lightbulb,
  MessageCircleQuestion,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

type OpenIntent = "view" | "ai" | "submit";

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

type Status = "not_submitted" | "submitted" | "late_submission";

interface Assignment {
  id: string;
  subject: string;
  subjectColor: string;
  title: string;
  description: string;
  fullBrief: string;
  classLabel: string;
  status: Status;
  dueLabel: string;
  postedLabel: string;
  teacher: string;
  score?: string;
  feedback?: string | null;
  submittedAnswer?: string | null;
  submittedDate?: string | null;
  submittedFiles?: any[];
}

const ASSIGNMENTS: Assignment[] = []; // Removed hardcoded assignments

/* Mocked AI guidance per assignment — in production this comes from your AI endpoint */
const AI_GUIDANCE: Record<string, string[]> = {
  "algebra-1": [
    "Start by isolating the variable on one side — move constants to the other side first, then divide out the coefficient.",
    "For question 9, write the word problem as an equation before touching the algebra. Define what 'x' stands for in one sentence.",
    "Check every answer by substituting it back into the original equation — it should make both sides equal.",
    "Keep your steps vertical and labelled. Your teacher is grading the working, not just the final number.",
  ],
  "essay-1": [
    "Pick one specific place, not a generic category — 'the lighthouse at Dhanushkodi' beats 'the beach.'",
    "Open with a sensory image rather than 'I want to visit...' — drop the reader into the scene first.",
    "Use one paragraph per sense: sight, sound, and feeling, so the description doesn't read like a list.",
    "End by tying the place back to why it matters to you — that's what turns description into a real essay.",
  ],
};

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                    */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: Status }) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Submitted
      </span>
    );
  }
  if (status === "late_submission") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3.5 w-3.5" />
        Late Submission
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-black dark:text-white">
      <Clock className="h-3.5 w-3.5" />
      Not submitted
    </span>
  );
}

function IconBadge({
  icon: Icon,
  color,
}: {
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assignment list card                                              */
/* ------------------------------------------------------------------ */

function AssignmentCard({
  a,
  onOpen,
}: {
  a: Assignment;
  onOpen: (id: string, intent: OpenIntent) => void;
}) {
  return (
    <div className="group relative w-full rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] p-5 transition-colors hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-[#141f35]">
      <span
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
        style={{ backgroundColor: a.subjectColor }}
      />
      <button
        onClick={() => onOpen(a.id, "view")}
        className="flex w-full items-start justify-between pl-3 text-left"
      >
        <div className="flex items-start gap-3">
          <IconBadge icon={FileText} color={a.subjectColor} />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold tracking-wide"
                style={{ color: a.subjectColor }}
              >
                {a.subject}
              </span>
              <span className="text-[12px] text-black dark:text-white">
                {a.classLabel}
              </span>
            </div>
            <h3 className="mt-1 text-[15px] font-semibold leading-snug text-black dark:text-slate-100">
              {a.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-black dark:text-slate-400">
              {a.description}
            </p>
          </div>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between pl-3">
        <StatusPill status={a.status} />
        <span className="text-[12px] text-black dark:text-white">{a.dueLabel}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 pl-3">
        <button
          onClick={() => onOpen(a.id, "view")}
          className="rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.03] px-3 py-1.5 text-[12.5px] font-medium text-black dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.07]"
        >
          View Details
        </button>
        {a.status === "not_submitted" && (
          <button
            onClick={() => onOpen(a.id, "submit")}
            className="ml-auto rounded-lg bg-teal-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400"
          >
            Submit Homework
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI guidance panel                                                 */
/* ------------------------------------------------------------------ */

function AiGuidancePanel({
  assignment,
  tips,
  loading,
  onAsk,
  doubt,
  setDoubt,
  doubtAnswer,
  doubtLoading,
  onAskDoubt,
}: {
  assignment: Assignment;
  tips: string[] | null;
  loading: boolean;
  onAsk: () => void;
  doubt: string;
  setDoubt: (v: string) => void;
  doubtAnswer: string | null;
  doubtLoading: boolean;
  onAskDoubt: () => void;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-50 dark:from-violet-500/[0.08] to-white dark:to-transparent p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-300">
          <Sparkles className="h-[18px] w-[18px]" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-black dark:text-slate-100">
            AI Study Companion
          </h3>
          <p className="text-[12px] text-black dark:text-slate-400">
            Get a nudge in the right direction — not the answers.
          </p>
        </div>
      </div>

      {!tips && !loading && (
        <button
          onClick={onAsk}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-violet-400"
        >
          <Lightbulb className="h-4 w-4" />
          Get ideas for this homework
        </button>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] px-4 py-3 text-[13px] text-black dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-violet-600 dark:text-violet-300" />
          Reading the {assignment.subject.toLowerCase()} brief and putting
          together some ideas…
        </div>
      )}

      {tips && (
        <div className="mt-4 space-y-2.5">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] p-3"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-600 dark:text-violet-300">
                {i + 1}
              </span>
              <p className="text-[13px] leading-relaxed text-black dark:text-slate-300">
                {tip}
              </p>
            </div>
          ))}
          <p className="pt-1 text-[11.5px] text-black dark:text-slate-500">
            These are pointers to help you work it out yourself — your
            teacher will still grade your own steps and words.
          </p>
        </div>
      )}

      {/* Free-form doubt box */}
      <div className="mt-5 border-t border-slate-200 dark:border-white/[0.08] pt-4">
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-black dark:text-slate-300">
          <MessageCircleQuestion className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
          Stuck on something specific? Ask here.
        </p>
        <div className="mt-2.5 flex gap-2">
          <input
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && doubt.trim()) onAskDoubt();
            }}
            placeholder="e.g. I don't get how to set up question 9…"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d1626] px-3 py-2 text-[13px] text-black dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-violet-400/40 focus:outline-none focus:ring-1 focus:ring-violet-400/30"
          />
          <button
            onClick={onAskDoubt}
            disabled={!doubt.trim() || doubtLoading}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-500 px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-white/[0.06] disabled:text-black dark:disabled:text-slate-500"
          >
            {doubtLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Ask
          </button>
        </div>

        {doubtAnswer && (
          <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] p-3 text-[13px] leading-relaxed text-black dark:text-slate-300">
            {doubtAnswer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Submission panel: text / image / pdf                              */
/* ------------------------------------------------------------------ */

type UploadKind = "pdf" | "image";
interface UploadedFile {
  id: string;
  name: string;
  kind: UploadKind;
  sizeLabel: string;
  url?: string;
  rawFile?: File;
}

function SubmissionPanel({
  answerText,
  setAnswerText,
  files,
  onAddFiles,
  onRemoveFile,
  onSubmit,
  submitted,
  onEdit,
}: {
  answerText: string;
  setAnswerText: (v: string) => void;
  files: UploadedFile[];
  onAddFiles: (list: FileList | null) => void;
  onRemoveFile: (id: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  onEdit: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const canSubmit = answerText.trim().length > 0 || files.length > 0;

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-50 dark:from-emerald-500/[0.06] to-white dark:to-transparent p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Submitted to teacher
          </span>
          <button
            onClick={onEdit}
            className="text-[12px] font-medium text-black dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-200"
          >
            Edit submission
          </button>
        </div>

        <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-black dark:text-slate-500">
          Your notes
        </p>
        {answerText.trim() ? (
          <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] p-3 text-[13px] leading-relaxed text-black dark:text-slate-300">
            {answerText}
          </p>
        ) : (
          <p className="mt-1.5 text-[12.5px] text-black dark:text-slate-500">
            No typed notes — submitted as file(s) only.
          </p>
        )}

        {files.length > 0 && (
          <>
            <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-black dark:text-slate-500">
              Attachments
            </p>
            <ul className="mt-1.5 space-y-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] px-3 py-2"
                >
                  {f.kind === "pdf" ? (
                    <FileText className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                  ) : (
                    <ImageIcon className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
                  )}
                  <div className="min-w-0">
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[12.5px] text-teal-600 dark:text-teal-400 hover:underline font-semibold block"
                      >
                        {f.name}
                      </a>
                    ) : (
                      <p className="truncate text-[12.5px] text-black dark:text-slate-200">
                        {f.name}
                      </p>
                    )}
                    <p className="text-[11px] text-black dark:text-slate-500">
                      {f.sizeLabel}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] p-5">
      <h3 className="text-[14px] font-semibold text-black dark:text-slate-100">
        Your answer
      </h3>
      <p className="mt-0.5 text-[12px] text-black dark:text-slate-400">
        Type your working, or attach a photo / scanned PDF of your notebook
        page.
      </p>

      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        placeholder="Write or paste your answer here…"
        rows={5}
        className="mt-4 w-full resize-none rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d1626] p-3 text-[13.5px] leading-relaxed text-black dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/30"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onAddFiles(e.dataTransfer.files);
        }}
        className={`mt-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-teal-400/60 bg-teal-400/[0.06]"
            : "border-slate-300 dark:border-white/[0.1] bg-slate-50 dark:bg-[#0d1626]"
        }`}
      >
        <Upload className="h-5 w-5 text-black dark:text-slate-500" />
        <p className="text-[12.5px] text-black dark:text-slate-400">
          Drag a PDF or photo here, or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            browse files
          </button>
        </p>
        <p className="text-[11px] text-black dark:text-slate-600">PDF, JPG or PNG · up to 20MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => onAddFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1626] px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {f.kind === "pdf" ? (
                  <FileText className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                ) : (
                  <ImageIcon className="h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] text-black dark:text-slate-200">
                    {f.name}
                  </p>
                  <p className="text-[11px] text-black dark:text-slate-500">{f.sizeLabel}</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(f.id)}
                className="shrink-0 text-black dark:text-slate-500 hover:text-rose-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-[13.5px] font-semibold text-[#06291f] transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-white/[0.06] disabled:text-black dark:disabled:text-slate-500"
      >
        <Send className="h-4 w-4" />
        Submit homework
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail view                                                       */
/* ------------------------------------------------------------------ */

function AssignmentDetail({
  assignment,
  intent,
  studentId,
  apiUrl,
  onBack,
  onSubmitSuccess,
}: {
  assignment: Assignment;
  intent: OpenIntent;
  studentId: string | undefined;
  apiUrl: string;
  onBack: () => void;
  onSubmitSuccess: () => void;
}) {
  const [tips, setTips] = useState<string[] | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(assignment.status === "submitted" || assignment.status === "late_submission");
  const [doubt, setDoubt] = useState("");
  const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
  const [doubtLoading, setDoubtLoading] = useState(false);

  // Sync / initialize answer and files when assignment changes or loads
  useEffect(() => {
    if (assignment.submittedAnswer) {
      setAnswerText(assignment.submittedAnswer);
    } else {
      setAnswerText("");
    }
    if (assignment.submittedFiles) {
      setFiles(assignment.submittedFiles);
    } else {
      setFiles([]);
    }
    setSubmitted(assignment.status === "submitted" || assignment.status === "late_submission");
  }, [assignment]);

  const aiRef = useRef<HTMLDivElement>(null);
  const submissionRef = useRef<HTMLDivElement>(null);

  const handleAsk = async () => {
    setLoadingTips(true);
    try {
      const res = await fetch(`${apiUrl}/api/ai/homework-ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignment.title,
          description: assignment.description,
          fullBrief: assignment.fullBrief,
          subject: assignment.subject
        })
      });
      const data = await res.json();
      if (data.success && data.tips) {
        setTips(data.tips);
      } else {
        setTips(AI_GUIDANCE[assignment.id] ?? ["Could not load ideas at this moment."]);
      }
    } catch (err) {
      console.error("Error fetching AI homework ideas:", err);
      setTips(AI_GUIDANCE[assignment.id] ?? ["Could not load ideas at this moment."]);
    } finally {
      setLoadingTips(false);
    }
  };

  const handleAskDoubt = async () => {
    if (!doubt.trim()) return;
    setDoubtLoading(true);
    setDoubtAnswer(null);
    try {
      const res = await fetch(`${apiUrl}/api/ai/homework-doubt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignment.title,
          description: assignment.description,
          fullBrief: assignment.fullBrief,
          subject: assignment.subject,
          doubt: doubt.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setDoubtAnswer(data.text);
      } else {
        setDoubtAnswer("Sorry, I could not help with your doubt right now. Please try again.");
      }
    } catch (err) {
      console.error("Error calling homework doubt solver:", err);
      setDoubtAnswer("Sorry, I could not help with your doubt right now. Please try again.");
    } finally {
      setDoubtLoading(false);
    }
  };

  useEffect(() => {
    if (intent === "ai") {
      aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!tips && !loadingTips) handleAsk();
    } else if (intent === "submit") {
      submissionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent]);

  const handleAddFiles = (list: FileList | null) => {
    if (!list) return;
    const next: UploadedFile[] = Array.from(list).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      kind: f.type === "application/pdf" ? "pdf" : "image",
      sizeLabel: `${(f.size / 1024).toFixed(0)} KB`,
      rawFile: f,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const handleSubmit = async () => {
    if (!studentId) return;
    try {
      const formData = new FormData();
      formData.append("answerText", answerText);

      // Append files to FormData
      files.forEach((f) => {
        if (f.rawFile) {
          formData.append("files", f.rawFile);
        }
      });

      // Keep record of previously uploaded files that are not modified
      const existingFiles = files.filter(f => !f.rawFile).map(f => ({
        id: f.id,
        name: f.name,
        kind: f.kind,
        sizeLabel: f.sizeLabel,
        url: f.url
      }));
      formData.append("existingFiles", JSON.stringify(existingFiles));

      const res = await fetch(`${apiUrl}/api/students/${studentId}/homework/${assignment.id}/submit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        onSubmitSuccess();
      }
    } catch (err) {
      console.error("Error submitting homework:", err);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-black dark:text-slate-400 hover:text-teal-600 dark:hover:text-slate-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to homework
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] p-5">
            <div className="flex items-start gap-3">
              <IconBadge icon={FileText} color={assignment.subjectColor} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[12px] font-semibold tracking-wide"
                    style={{ color: assignment.subjectColor }}
                  >
                    {assignment.subject}
                  </span>
                  <span className="text-[12px] text-black dark:text-white">
                    {assignment.classLabel}
                  </span>
                  <span className="text-[12px] text-black dark:text-white">·</span>
                  <span className="text-[12px] text-black dark:text-white">
                    Set by {assignment.teacher}
                  </span>
                </div>
                <h2 className="mt-1 text-[18px] font-semibold text-black dark:text-slate-100">
                  {assignment.title}
                </h2>
              </div>
              <StatusPill status={submitted ? "submitted" : "not_submitted"} />
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-black dark:text-slate-300">
              {assignment.fullBrief}
            </p>

            <div className="mt-4 flex items-center gap-4 border-t border-slate-200 dark:border-white/[0.06] pt-4 text-[12px] text-black dark:text-white">
              <span>Posted {assignment.postedLabel}</span>
              <span>·</span>
              <span>{assignment.dueLabel}</span>
            </div>
          </div>

          {/* Teacher Feedback Section */}
          <div className="rounded-2xl border border-teal-500/10 bg-white dark:bg-[#111a2c] p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-black dark:text-slate-100 flex items-center gap-2">
              <span className="text-lg">🍎</span> Teacher Evaluation & Feedback
            </h3>
            
            {assignment.status !== "not_submitted" ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
                  <div>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Score Assigned</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {assignment.score || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Grading Status</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      assignment.score && assignment.score !== "—" 
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}>
                      {assignment.score && assignment.score !== "—" ? "Graded" : "Pending Review"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-300">Teacher's Remarks</p>
                  {assignment.feedback ? (
                    <div className="mt-2 p-3.5 rounded-xl bg-teal-500/5 dark:bg-teal-500/[0.02] border border-teal-500/10 text-[13.5px] leading-relaxed text-black dark:text-slate-300 italic whitespace-pre-wrap">
                      "{assignment.feedback}"
                    </div>
                  ) : (
                    <p className="mt-2 text-[13px] text-slate-400 italic">
                      No remarks provided yet by the teacher.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]">
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Submit your response first to receive remarks and evaluation from your teacher.
                </p>
              </div>
            )}
          </div>
        </div>

        <div ref={submissionRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
          <SubmissionPanel
            answerText={answerText}
            setAnswerText={setAnswerText}
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={(id) =>
              setFiles((prev) => prev.filter((f) => f.id !== id))
            }
            onSubmit={handleSubmit}
            submitted={submitted}
            onEdit={() => setSubmitted(false)}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Filter = "all" | "pending" | "submitted" | "history";

export default function HomeworkPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [intent, setIntent] = useState<OpenIntent>("view");
  const [filter, setFilter] = useState<Filter>("all");

  const fetchHomework = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`${API_URL}/api/students/${studentId}/homework`);
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.error("Error fetching homework:", err);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [studentId]);

  const completed = assignments.filter((a) => a.status === "submitted").length;
  const total = assignments.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = assignments.filter((a) => {
    if (filter === "pending") return a.status === "not_submitted";
    if (filter === "submitted") return a.status === "submitted";
    return true;
  });

  const selected = assignments.find((a) => a.id === selectedId) ?? null;

  const handleOpen = (id: string, openIntent: OpenIntent) => {
    setSelectedId(id);
    setIntent(openIntent);
  };

  return (
    <PortalLayout
      title="Homework"
      subtitle="Assignments from your teachers, updated automatically."
      avatarLetter="A"
      avatarColor="#2dd4bf"
      themeClass="theme-student"
      accentColor="#2dd4bf"
    >
      {selected ? (
        <AssignmentDetail
          assignment={selected}
          intent={intent}
          studentId={studentId}
          apiUrl={API_URL}
          onBack={() => setSelectedId(null)}
          onSubmitSuccess={fetchHomework}
        />
      ) : (
        <div>
          <div className="flex justify-end">
            <div className="glass mt-1 w-56 rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-transparent p-3">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-black dark:text-white">Completed</span>
                <span className="font-semibold text-black dark:text-slate-200">
                  {completed} / {total}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* filters */}
          <div className="mt-5 flex gap-2">
            {(
              [
                ["all", `All (${total})`],
                ["pending", `Pending (${assignments.filter((a) => a.status === "not_submitted").length})`],
                ["submitted", `Submitted (${completed})`],
                ["history", `Performance History`],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  filter === key
                    ? "bg-teal-400/15 text-teal-600 dark:text-teal-300 ring-1 ring-inset ring-teal-400/30"
                    : "bg-slate-100 dark:bg-white/[0.04] text-black dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.07] hover:text-teal-600 dark:hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filter === "history" ? (
            <div className="mt-6 space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c]">
                  <span className="text-2xl">📈</span>
                  <h4 className="mt-2 text-[12px] uppercase font-bold tracking-wide text-slate-400">Average Performance</h4>
                  <p className="text-3xl font-extrabold text-teal-500 mt-1">
                    {(() => {
                      const scores = assignments
                        .map(a => {
                          if (!a.score || a.score === "—") return null;
                          const match = a.score.match(/(\d+)\s*\/\s*(\d+)/);
                          if (match) {
                            const obtained = parseFloat(match[1]);
                            const total = parseFloat(match[2]);
                            if (total > 0) return (obtained / total) * 100;
                          }
                          return null;
                        })
                        .filter((s): s is number => s !== null);
                      return scores.length > 0 
                        ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` 
                        : "—";
                    })()}
                  </p>
                  <p className="text-[11px] text-slate-505 mt-1">Based on graded assignments</p>
                </div>

                <div className="glass rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c]">
                  <span className="text-2xl">✅</span>
                  <h4 className="mt-2 text-[12px] uppercase font-bold tracking-wide text-slate-400">Submission Rate</h4>
                  <p className="text-3xl font-extrabold text-emerald-500 mt-1">{pct}%</p>
                  <p className="text-[11px] text-slate-550 mt-1">{completed} of {total} completed</p>
                </div>

                <div className="glass rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c]">
                  <span className="text-2xl">⏳</span>
                  <h4 className="mt-2 text-[12px] uppercase font-bold tracking-wide text-slate-400">Pending Assignments</h4>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1">
                    {assignments.filter(a => a.status === "not_submitted").length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Require your attention</p>
                </div>
              </div>

              {/* Submission Timeline / Log */}
              <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c]">
                <h3 className="text-base font-bold text-black dark:text-slate-100 mb-4">📜 Homework Submission Log</h3>
                
                <div className="space-y-4">
                  {assignments.filter(a => a.status !== "not_submitted").length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      You haven't submitted any homework yet.
                    </div>
                  ) : (
                    assignments
                      .filter(a => a.status !== "not_submitted")
                      .map(a => (
                        <div key={a.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.01] hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-teal-500">{a.subject}</span>
                            <h4 className="text-sm font-semibold text-black dark:text-slate-200">{a.title}</h4>
                            <p className="text-xs text-slate-500">Submitted: {a.submittedDate || a.postedLabel}</p>
                            {a.feedback && (
                              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 italic">
                                "Feedback: {a.feedback}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 self-end md:self-center">
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block">Grade</span>
                              <span className="text-sm font-bold text-black dark:text-white bg-slate-200/50 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
                                {a.score || "Pending"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpen(a.id, "view")}
                              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-teal-500/10 transition-colors"
                            >
                              View Work
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* list */
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((a) => (
                <AssignmentCard key={a.id} a={a} onOpen={handleOpen} />
              ))}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] p-8 text-center lg:col-span-2">
                  <p className="text-[13.5px] text-black dark:text-slate-400">
                    Nothing here right now.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}