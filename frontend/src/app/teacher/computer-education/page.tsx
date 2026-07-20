"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import { Monitor, Terminal, Code2, Cpu, BookMarked, Trophy, X, Keyboard, Gamepad2, Rocket, Zap, Sparkles, Plus, Pencil, Trash2, Building2, Hourglass, FileText, Wrench, Edit, Laptop } from "lucide-react";

type ComputerModule = {
  id: string;
  title: string;
  moduleType: string;
  description: string;
  gradeLevel: string;
  schoolId: string;
};

export default function ComputerEducationPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [modules, setModules] = useState<ComputerModule[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentModule, setCurrentModule] = useState<ComputerModule | null>(null);

  const fetchModules = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/computer-education?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentModule(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (mod: ComputerModule) => {
    setIsEdit(true);
    setCurrentModule(mod);
    setModalOpen(true);
  };

  const handleDeleteModule = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Delete Module?",
      text: `Are you sure you want to remove "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it! "
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/computer-education/${id}?schoolId=${schoolId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Swal.fire({
          title: "Deleted!",
          text: `"${title}" has been removed.`,
          icon: "success",
          confirmButtonColor: "#6366f1"
        });
        fetchModules();
      }
    } catch (err) {
      console.error("Failed to delete module", err);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      title: formData.get("title"),
      moduleType: formData.get("moduleType"),
      gradeLevel: formData.get("gradeLevel"),
      description: formData.get("description") || "A fun computer module!",
      schoolId
    };

    try {
      let url = `${API_URL}/api/teacher/computer-education`;
      let method = "POST";

      if (isEdit && currentModule) {
        url = `${API_URL}/api/teacher/computer-education/${currentModule.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalOpen(false);
        Swal.fire({
          title: "Success!",
          text: isEdit ? "Module updated! " : "New module added! ",
          icon: "success",
          confirmButtonColor: "#6366f1"
        });
        fetchModules();
      }
    } catch (err) {
      console.error("Failed to save module", err);
    }
  };

  const getModuleStyle = (title: string, index: number) => {
    const t = title.toLowerCase();
    let icon = <Monitor />;
    let color = "blue";
    
    if (t.includes("scratch") || t.includes("game")) { icon = <Gamepad2 />; color = "emerald"; }
    else if (t.includes("safe") || t.includes("web")) { icon = <Terminal />; color = "purple"; }
    else if (t.includes("machine") || t.includes("hardware")) { icon = <Cpu />; color = "amber"; }
    else if (t.includes("code") || t.includes("program")) { icon = <Code2 />; color = "indigo"; }
    else if (t.includes("type") || t.includes("keyboard")) { icon = <Keyboard />; color = "rose"; }
    else { icon = <Rocket />; color = ["blue", "emerald", "purple", "amber", "indigo", "rose"][index % 6]; }

    // Mock progress and students for UI
    const progress = Math.floor(Math.random() * 101); // 0-100
    const students = Math.floor(Math.random() * 30) + 15; // 15-45

    return { icon, color, progress, students };
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "கணினி ஆய்வகம்! " : "Computer Lab! "}
      subtitle={lang === "தமிழ்" ? "குறியீடு, விளையாடு, மற்றும் தொழில்நுட்பத்தை கற்றுக்கொள்!" : "Code, Play, and Learn Technology!"}
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Hero */}
        <div className="relative rounded-[3rem] overflow-hidden shadow-xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 min-h-[300px] flex flex-col justify-end p-8 sm:p-12">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-50 dark:bg-sky-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

          <div className="absolute top-10 right-10 rotate-12 opacity-80 z-10">
            <Zap className="w-32 h-32 text-slate-100 dark:text-slate-700/50" />
          </div>
          
          <div className="relative z-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-sm rotate-[-2deg] border-2 border-indigo-200 dark:border-indigo-700/50">
               <Code2 className="w-4 h-4" /> {lang === "தமிழ்" ? "குறியீட்டு முறை ஒரு மாயாஜாலம்!" : "Coding is Magic!"}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm font-mono">{lang === "தமிழ்" ? "எதிர்கால கண்டுபிடிப்பாளர்கள்" : "Future Innovators"}</h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 text-sm md:text-lg leading-relaxed">
               {lang === "தமிழ்" ? "கணினி ஆய்வகத்திற்கு வரவேற்கிறோம்! இங்கே நாம் விளையாட்டுகளை உருவாக்குகிறோம், குறியீடு எழுதுகிறோம், மேலும் கணினிகள் எவ்வாறு செயல்படுகின்றன என்பதைக் கண்டறிகிறோம். இன்று அற்புதமான ஒன்றை உருவாக்குவோம்!" : "Welcome to the computer lab! Here we build games, write code, and discover how machines work. Let's make something amazing today!"}
            </p>
            
            <div className="flex flex-wrap gap-4">
               <button onClick={handleOpenCreate} className="px-8 py-4 bg-indigo-500 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-indigo-500/30 hover:bg-indigo-600 hover:scale-105 active:scale-95 border-b-4 border-indigo-700 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> {lang === "தமிழ்" ? "புதிய நிலையைச் சேர்!" : "Add New Level!"}
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl rotate-[-5deg]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  {lang === "தமிழ்" ? "கற்றல் பாதைகள்" : "Learning Paths"}
                </h3>
              </div>
              
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-10 font-bold text-slate-500">{lang === "தமிழ்" ? "பாடத்தொகுதிகள் ஏற்றப்படுகின்றன... " : "Loading modules... "} <Hourglass className="w-4 h-4 inline-block mr-1 text-inherit" /></div>
                ) : modules.length === 0 ? (
                  <div className="text-center py-10 font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700">{lang === "தமிழ்" ? "பாடத்தொகுதிகள் இன்னும் இல்லை! சில குறியீட்டு பாதைகளைச் சேர்க்கவும்! " : "No modules yet! Add some code paths! "} <Rocket className="w-4 h-4 inline-block mr-1 text-inherit" /></div>
                ) : modules.map((mod, i) => {
                  const { icon, color, progress, students } = getModuleStyle(mod.title, i);
                  return (
                  <div key={mod.id} className="p-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all group relative">
                    
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => handleOpenEdit(mod)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteModule(mod.id, mod.title)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-6 mb-6 pr-20">
                      <div className={`w-14 h-14 rounded-2xl bg-${color}-100 text-${color}-600 flex items-center justify-center shadow-inner`}>
                        {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">{mod.title}</h4>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{mod.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className={`px-2 py-0.5 rounded-md bg-${color}-100 text-${color}-700 text-xs font-bold`}>{lang === "தமிழ்" ? `${students} குழந்தைகள்` : `${students} Kids`}</span>
                           <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase`}>
                             {mod.gradeLevel === "All Grades" ? (lang === "தமிழ்" ? "அனைத்து வகுப்புகள்" : "All Grades") :
                               mod.gradeLevel === "Primary" ? (lang === "தமிழ்" ? "தொடக்கப்பள்ளி" : "Primary") :
                               mod.gradeLevel === "Middle" ? (lang === "தமிழ்" ? "நடுநிலைப்பள்ளி" : "Middle") :
                               mod.gradeLevel === "High" ? (lang === "தமிழ்" ? "உயர்நிலைப்பள்ளி" : "High") : mod.gradeLevel}
                           </span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3 sm:block">
                        <span className={`text-2xl font-black text-${color}-600 drop-shadow-sm`}>{progress}%</span>
                        {progress === 100 && <Trophy className="w-6 h-6 text-yellow-400 sm:hidden" />}
                      </div>
                    </div>
                    
                    {/* Playful Progress Bar */}
                    <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner border-2 border-slate-300 dark:border-slate-600 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full bg-${color}-500 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${progress}%` }}
                      >
                         {/* Stripe effect */}
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
  
          </div>
  
          {/* Quick Resources & Badges */}
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-amber-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none"></div>
              
              <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner rotate-12">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-2">{lang === "தமிழ்" ? "பரிசுகள் & பேட்ஜ்கள்!" : "Rewards & Badges!"}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">{lang === "தமிழ்" ? "வேகமாக தட்டச்சு செய்ய அல்லது குறியீட்டை முடிக்க குழந்தைகளுக்கு டிஜிட்டல் ஸ்டிக்கர்களை வழங்குங்கள்!" : "Give kids cool digital stickers for typing fast or finishing code!"}</p>
              
              <button onClick={() => Swal.fire({title: lang === "தமிழ்" ? 'ஸ்டிக்கர்கள்!' : 'Stickers!', text: lang === "தமிழ்" ? 'ஸ்டிக்கர் புத்தகத்தைத் திறக்கிறது! ' : 'Opening sticker book! ', icon: 'success'})} className="w-full py-3 rounded-2xl bg-amber-400 text-amber-900 font-black text-sm shadow-lg shadow-amber-500/30 hover:bg-amber-300 active:scale-95 transition-all border-b-4 border-amber-500">
                {lang === "தமிழ்" ? "ஸ்டிக்கர்களை கொடுங்கள்!" : "Give out Stickers!"}
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl rotate-[-5deg]">
                   <BookMarked className="w-6 h-6" />
                </div>
                {lang === "தமிழ்" ? "உதவிக் கருவிகள்" : "Helper Tools"}
              </h3>
              
              <div className="space-y-4">
                <button onClick={() => Swal.fire({title: lang === "தமிழ்" ? 'திட்டங்கள்' : 'Plans', text: lang === "தமிழ்" ? 'பாடத் திட்டங்களைத் திறக்கிறது... ' : 'Opening Lesson Plans... ', icon: 'info'})} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors"><FileText className="w-4 h-4 inline-block mr-1 text-inherit" /></div>
                  {lang === "தமிழ்" ? "பாடத் திட்டங்கள்" : "Lesson Plans"}
                </button>
                <button onClick={() => Swal.fire({title: lang === "தமிழ்" ? 'பழுது நீக்கு' : 'Fix It', text: lang === "தமிழ்" ? 'கணினி பிழைகளை சரிசெய்தல்! ' : 'Fixing computer bugs! ', icon: 'info'})} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors"><Wrench className="w-4 h-4 inline-block mr-1 text-inherit" /></div>
                  {lang === "தமிழ்" ? "பழுதுபார்க்கும் வழிகாட்டி" : "Fix It Guide"}
                </button>
              </div>
            </div>
  
          </div>
        </div>
  
        {/* Create/Edit Module Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-indigo-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
              <div className="flex justify-between items-center p-6 bg-indigo-50 dark:bg-slate-900 rounded-[2.5rem] mb-6">
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {isEdit 
                    ? (lang === "தமிழ்" ? "நிலையைத் திருத்து! " : "Edit Level! ") 
                    : (lang === "தமிழ்" ? "புதிய நிலையைச் சேர்! " : "Add a New Level! ")
                  }
                </h3>
                <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveModule} className="p-4 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">{lang === "தமிழ்" ? "நிலையின் பெயர்" : "Level Name"} <Gamepad2 className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <input required name="title" defaultValue={currentModule?.title} type="text" placeholder={lang === "தமிழ்" ? "எ.கா., ரோபோவை உருவாக்குதல்!" : "e.g., Making a Robot!"} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">{lang === "தமிழ்" ? "விளக்கம்" : "Description"} <Edit className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <input required name="description" defaultValue={currentModule?.description} type="text" placeholder={lang === "தமிழ்" ? "அவர்கள் என்ன கற்றுக்கொள்வார்கள்?" : "What will they learn?"} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">{lang === "தமிழ்" ? "வகை" : "Type"} <Laptop className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                    <select required name="moduleType" defaultValue={currentModule?.moduleType || "Coding"} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
                      <option value="Coding">{lang === "தமிழ்" ? "குறியீட்டு முறை" : "Coding"}</option>
                      <option value="Hardware">{lang === "தமிழ்" ? "வன்பொருள்" : "Hardware"}</option>
                      <option value="Safety">{lang === "தமிழ்" ? "பாதுகாப்பு" : "Safety"}</option>
                      <option value="Basics">{lang === "தமிழ்" ? "அடிப்படைகள்" : "Basics"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">{lang === "தமிழ்" ? "வகுப்பு" : "Grade"} <Building2 className="w-4 h-4 inline" /></label>
                    <select required name="gradeLevel" defaultValue={currentModule?.gradeLevel || "All Grades"} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
                      <option value="All Grades">{lang === "தமிழ்" ? "அனைத்து வகுப்புகள்" : "All Grades"}</option>
                      <option value="Primary">{lang === "தமிழ்" ? "தொடக்கப்பள்ளி" : "Primary"}</option>
                      <option value="Middle">{lang === "தமிழ்" ? "நடுநிலைப்பள்ளி" : "Middle"}</option>
                      <option value="High">{lang === "தமிழ்" ? "உயர்நிலைப்பள்ளி" : "High"}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-600">
                    {lang === "தமிழ்" ? "வேண்டாம்" : "Nevermind"}
                  </button>
                  <button type="submit" className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 border-b-4 border-indigo-700">
                    {isEdit ? (lang === "தமிழ்" ? "இதைப் புதுப்பி! " : "Update It! ") : (lang === "தமிழ்" ? "இதைச் சேர்! " : "Add It! ")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
