"use client";

import Swal from "sweetalert2";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { Bug, Dna, Leaf, Microscope, Info, Search, Grid3X3, X, Fish, Bird, PawPrint, Tractor, Globe, Package, Smile, Activity } from "lucide-react";

type Specimen = {
  id: string;
  name: string;
  category: string;
  type?: string;
  slide?: string;
  icon: React.ReactNode;
  color: string;
};

export default function ZoologyCentrePage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const { lang } = usePortalLanguage();
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // For editing and inspecting
  const [isEdit, setIsEdit] = useState(false);
  const [currentSpec, setCurrentSpec] = useState<Specimen | null>(null);
  const [inspectSpec, setInspectSpec] = useState<Specimen | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecimens = specimens.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.type && s.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.slide && s.slide.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getIconForCategory = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("genetics")) return <Dna />;
    if (c.includes("anatomy")) return <PawPrint />;
    if (c.includes("marine")) return <Fish />;
    if (c.includes("ecology")) return <Bird />;
    if (c.includes("botany")) return <Leaf />;
    return <Bug />;
  };

  const getColorForCategory = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("genetics")) return "purple";
    if (c.includes("anatomy")) return "amber";
    if (c.includes("marine")) return "sky";
    if (c.includes("ecology")) return "orange";
    if (c.includes("botany")) return "emerald";
    return "emerald";
  };

  const fetchSpecimens = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const specList: Specimen[] = [];
        data.data.forEach((item: any) => {
          if (item.status === "zoology-specimen") {
            specList.push({
              id: item.id,
              name: item.name,
              category: item.classRoomId || "Microbiology",
              type: item.classSection || "Live Prep",
              slide: item.classSection === "Permanent" ? "Permanent" : "",
              icon: getIconForCategory(item.classRoomId || "Microbiology"),
              color: getColorForCategory(item.classRoomId || "Microbiology")
            });
          }
        });
        setSpecimens(specList);
      }
    } catch (err) {
      console.error("Error fetching specimens:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchSpecimens();
  }, [fetchSpecimens]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentSpec(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (spec: Specimen) => {
    setIsEdit(true);
    setCurrentSpec(spec);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Release Creature?",
      text: `Are you sure you want to release ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, release it! "
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/labs/${id}?schoolId=${schoolId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Swal.fire({
          title: "Released!",
          text: `Released ${name} back to nature! `,
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        fetchSpecimens();
      }
    } catch (err) {
      console.error("Failed to delete specimen", err);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const category = type === "Live Prep" ? "Genetics" : type === "3D Model" ? "Anatomy" : "Microbiology";

    const payload = {
      name,
      classSection: type,
      classRoomId: category,
      status: "zoology-specimen",
      schoolId,
      safetyCheck: true
    };

    try {
      let url = `${API_URL}/api/teacher/labs`;
      let method = "POST";

      if (isEdit && currentSpec) {
        url = `${API_URL}/api/teacher/labs/${currentSpec.id}`;
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
          text: isEdit ? "Specimen updated! " : "Yay! New specimen requested! ",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        fetchSpecimens();
      }
    } catch (err) {
      console.error("Failed to save specimen", err);
    }
  };

  const handleShowEverything = async () => {
    setSearchQuery("");
    if (specimens.length > 0) return;

    if (!schoolId) {
      Swal.fire({
        title: "Error",
        text: "School context not loaded yet.",
        icon: "error",
        confirmButtonColor: "#10b981"
      });
      return;
    }

    const defaultSpecimens = [
      { name: "Giant Stag Beetle", type: "Permanent", category: "Microbiology" },
      { name: "Indian Bullfrog", type: "Live Prep", category: "Genetics" },
      { name: "DNA Double Helix", type: "3D Model", category: "Anatomy" },
      { name: "Starfish Specimen", type: "Live Prep", category: "Marine Biology" },
      { name: "Amoeba Proteus", type: "Permanent", category: "Microbiology" },
      { name: "Fern Leaf Section", type: "Permanent", category: "Botany" }
    ];

    Swal.fire({
      title: lang === "தமிழ்" ? "மாதிரி தரவை ஏற்றவா?" : "Load Demo Specimens?",
      text: lang === "தமிழ்" ? "உங்கள் உயிரியல் மையத்தை நிரப்ப மாதிரி உயிரினங்களை உருவாக்கவா?" : "Create standard biology specimens to populate your Bio Zone?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: lang === "தமிழ்" ? "ஆம், உருவாக்கு" : "Yes, Create",
      cancelButtonText: lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          for (const item of defaultSpecimens) {
            await fetch(`${API_URL}/api/teacher/labs`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: item.name,
                classSection: item.type,
                classRoomId: item.category,
                status: "zoology-specimen",
                schoolId,
                safetyCheck: true
              })
            });
          }
          Swal.fire({
            title: lang === "தமிழ்" ? "வெற்றி!" : "Success!",
            text: lang === "தமிழ்" ? "மாதிரி உயிரினங்கள் வெற்றிகரமாக உருவாக்கப்பட்டன!" : "Demo specimens created successfully!",
            icon: "success",
            confirmButtonColor: "#10b981"
          });
          fetchSpecimens();
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error",
            text: "Failed to create demo specimens.",
            icon: "error",
            confirmButtonColor: "#10b981"
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "விலங்கு & இயற்கை மையம்!" : "Animal & Nature Centre!"}
      subtitle={lang === "தமிழ்" ? "புழுக்கள், DNA, தவளை மற்றும் குளிர் அறிவியல் கண்டுபிடியுங்கள்!" : "Explore bugs, DNA, frogs, and cool biology stuff!"}
    >
      <div className="flex flex-col gap-8">

        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-800 text-slate-855 dark:text-slate-100 p-5 sm:py-6 sm:px-8 shadow-md border-4 border-slate-100 dark:border-slate-700">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-100/30 dark:bg-yellow-950/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50px] right-[10%] w-48 h-48 bg-emerald-100/20 dark:bg-emerald-950/10 rounded-full blur-2xl"></div>
          
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 transform scale-[1.5] pointer-events-none">
             <PawPrint className="w-40 h-40 text-emerald-500/10 dark:text-emerald-400/5" />
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 px-2.5 py-1 rounded-xl font-bold tracking-wider text-[10px] uppercase mb-2 border-2 border-emerald-100 dark:border-emerald-900/50">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> {lang === "தமிழ்" ? "இயற்கை ஆய்வாளர்கள்" : "Nature Explorers"}
              </div>
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight mb-1.5 text-slate-900 dark:text-white">{lang === "தமிழ்" ? "உயிர் மண்டலம்!" : "The Bio Zone!"}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-xs sm:text-sm leading-relaxed">
                {lang === "தமிழ்" ? "காட்டிற்கு வருக! புழுக்கள், மாதிரிகள் மற்றும் DNA கருவிகளின் தொகுப்பைப் பாருங்கள். சில காட்டு அறிவியலுக்குத் தயாராகுங்கள்!" : "Welcome to the jungle! Check out our collection of bugs, models, and DNA kits. Get ready for some wild science!"}
              </p>
            </div>

            <div className="shrink-0 flex gap-3">
              <button onClick={handleOpenCreate} className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-yellow-500/30 hover:scale-105 active:scale-95 flex items-center gap-2 border-4 border-yellow-250">
                <Microscope className="w-5 h-5" /> {lang === "தமிழ்" ? "ஒரு புதிய உயிரினம் வேண்டும்!" : "I want a new specimen!"}
              </button>
            </div>
          </div>
        </div>

        {/* Playful Specimen Catalog */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-emerald-100 dark:border-slate-700 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl rotate-12">
                 <Bug className="w-6 h-6" />
              </div>
              {lang === "தமிழ்" ? "உயிரின சேகரிப்பு" : "Creature Collection"}
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              {/* Examples Dropdown */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val === "All" ? "" : val);
                }}
                value={searchQuery === "" ? "All" : searchQuery}
                className="bg-white dark:bg-slate-900 border-4 border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all cursor-pointer shadow-sm min-h-[46px]"
              >
                <option value="All">{lang === "தமிழ்" ? "அனைத்து மாதிரி உதாரணம்" : "Show All Examples"}</option>
                <option value="Genetics">{lang === "தமிழ்" ? "மரபியல் (Genetics)" : "Genetics (e.g. Indian Bullfrog)"}</option>
                <option value="Anatomy">{lang === "தமிழ்" ? "உடற்கூறியல் (Anatomy)" : "Anatomy (e.g. DNA Double Helix)"}</option>
                <option value="Marine Biology">{lang === "தமிழ்" ? "கடல் உயிரியல் (Marine)" : "Marine Biology (e.g. Starfish)"}</option>
                <option value="Microbiology">{lang === "தமிழ்" ? "நுண்ணுயிரியல் (Microbiology)" : "Microbiology (e.g. Stag Beetle)"}</option>
                <option value="Botany">{lang === "தமிழ்" ? "தாவரவியல் (Botany)" : "Botany (e.g. Fern Leaf)"}</option>
                <option value="Permanent">{lang === "தமிழ்" ? "ஸ்லைடு (Permanent)" : "Microscope Slides (Permanent)"}</option>
                <option value="Live Prep">{lang === "தமிழ்" ? "உயிருள்ள (Live Prep)" : "Live Preparations"}</option>
                <option value="3D Model">{lang === "தமிழ்" ? "3D மாதிரிகள்" : "3D/Plastic Models"}</option>
              </select>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 font-bold" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "தமிழ்" ? "உயிரினங்கள் தேடு..." : "Search for frogs, bugs..."}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
              <span>{lang === "தமிழ்" ? "சிறப்பு உயிரினங்களை கண்டுபிடிக்கிறது..." : "Finding creatures in the database..."}</span>
            </div>
          ) : filteredSpecimens.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {filteredSpecimens.map((specimen, idx) => {
                
                const styleMaps = {
                  emerald: { border: "border-emerald-100", hoverBorder: "hover:border-emerald-300", bg: "bg-emerald-50/30 hover:bg-emerald-50", text: "text-emerald-500", textDark: "text-emerald-700", badgeBg: "bg-emerald-200", btnBg: "bg-emerald-500 hover:bg-emerald-600" },
                  purple: { border: "border-purple-100", hoverBorder: "hover:border-purple-300", bg: "bg-purple-50/30 hover:bg-purple-50", text: "text-purple-500", textDark: "text-purple-700", badgeBg: "bg-purple-200", btnBg: "bg-purple-500 hover:bg-purple-600" },
                  amber: { border: "border-amber-100", hoverBorder: "hover:border-amber-300", bg: "bg-amber-50/30 hover:bg-amber-50", text: "text-amber-500", textDark: "text-amber-700", badgeBg: "bg-amber-200", btnBg: "bg-amber-500 hover:bg-amber-600" },
                  sky: { border: "border-sky-100", hoverBorder: "hover:border-sky-300", bg: "bg-sky-50/30 hover:bg-sky-50", text: "text-sky-500", textDark: "text-sky-700", badgeBg: "bg-sky-200", btnBg: "bg-sky-500 hover:bg-sky-600" },
                  orange: { border: "border-orange-100", hoverBorder: "hover:border-orange-300", bg: "bg-orange-50/30 hover:bg-orange-50", text: "text-orange-500", textDark: "text-orange-700", badgeBg: "bg-amber-200", btnBg: "bg-orange-500 hover:bg-orange-600" }
                } as Record<string, any>;
                
                const s = styleMaps[specimen.color] || styleMaps.emerald;

                return (
                  <div key={specimen.id} className={`group p-6 rounded-[2rem] border-4 ${s.border} dark:border-slate-700 ${s.hoverBorder} ${s.bg} dark:bg-slate-900/50 hover:-translate-y-2 hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full`}>

                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500 ${s.text} pointer-events-none -rotate-12`}>
                      {React.cloneElement(specimen.icon as React.ReactElement, { className: "w-24 h-24" })}
                    </div>

                    <div className="flex justify-between items-start mb-6 z-10">
                      <span className={`text-[10px] font-bold ${s.textDark} ${s.badgeBg} px-3 py-1.5 rounded-xl border-2 border-white/20 shadow-sm rotate-[-3deg]`}>
                        ID: {specimen.id.substring(0,8)}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(specimen)} className={`w-8 h-8 rounded-full ${s.badgeBg} ${s.textDark} flex items-center justify-center hover:scale-110 transition-transform active:scale-95`} title="Edit">
                          <Leaf className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(specimen.id, specimen.name)} className={`w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:scale-110 transition-transform active:scale-95`} title="Delete">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 z-10 leading-tight">{specimen.name}</h4>
                    <p className="text-sm font-bold text-slate-500 mb-6 z-10">{specimen.category}</p>

                    <div className="mt-auto pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center z-10">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${s.textDark} bg-white dark:bg-slate-800 border-2 ${s.border} px-3 py-1.5 rounded-xl`}>
                        {specimen.slide || specimen.type}
                      </span>
                      <button onClick={() => setInspectSpec(specimen)} className={`px-4 py-2 ${s.btnBg} text-white text-xs font-bold rounded-xl transition-colors shadow-md active:scale-95`}>
                        {lang === "தமிழ்" ? "ஆய்வு" : "Inspect"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
              {searchQuery ? (
                lang === "தமிழ்" ? "பொருந்தக்கூடிய உயிரினங்கள் எதுவும் இல்லை." : "No matching creatures found."
              ) : (
                lang === "தமிழ்" ? "இன்று உயிரினங்கள் இல்லை! பிடிக்க எடுத்துச் செல்லுங்கள்." : "No creatures found yet! Go catch some."
              )} <Bug className="w-4 h-4 inline-block mr-1 text-inherit" />
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button onClick={handleShowEverything} className="text-sm font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 px-8 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm">
              {lang === "தமிழ்" ? "அனைத்தையும் காட்டு!" : "Show Everything!"} <Globe className="w-4 h-4 inline-block mr-1 text-inherit" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#f0fdf4] dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 p-8 relative">
            
            <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 transition-all shadow-sm">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 pr-12">
              {isEdit ? (lang === "தமிழ்" ? "உயிரினத்தை புதுப்பிக்கவும்!" : "Update Creature!") : (lang === "தமிழ்" ? "உயிரினம் கோருங்கள்!" : "Ask for a Creature!")}
            </h3>

            <form onSubmit={handleRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "பெயர் என்ன?" : "What is it called?"} <Bug className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                <input required name="name" type="text" defaultValue={currentSpec?.name || ""} placeholder="e.g., Giant Beetle" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-emerald-400 transition-all shadow-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "அது என்ன வகை?" : "What kind is it?"} <Package className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                <select required name="type" defaultValue={currentSpec?.type || "Permanent"} className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-5 text-base font-bold focus:outline-none focus:border-emerald-400 transition-all shadow-sm">
                  <option value="Permanent">{lang === "தமிழ்" ? "நுண்ணோக்கி ஸ்லைடு" : "Microscope Slide"}</option>
                  <option value="Live Prep">{lang === "தமிழ்" ? "உயிருள்ள உயிரினம்!" : "Live Creature!"}</option>
                  <option value="3D Model">{lang === "தமிழ்" ? "பிளாஸ்டிக் மாதிரி" : "Plastic Model"}</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl text-base font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                  திரும்பிச் செல்லும்
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl text-base font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/30 active:scale-95">
                  பெறுங்கள்! <Activity className="w-4 h-4 inline-block mr-1 text-inherit" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Specimen Modal */}
      {inspectSpec && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 p-8 relative overflow-hidden">
            
            <button onClick={() => setInspectSpec(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all shadow-sm z-20">
              <X className="w-5 h-5" />
            </button>
            
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              inspectSpec.color === 'emerald' ? 'bg-emerald-500' :
              inspectSpec.color === 'purple' ? 'bg-purple-500' :
              inspectSpec.color === 'amber' ? 'bg-amber-500' :
              inspectSpec.color === 'sky' ? 'bg-sky-500' :
              'bg-orange-500'
            }`}></div>
            
            <div className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              inspectSpec.color === 'emerald' ? 'bg-emerald-500' :
              inspectSpec.color === 'purple' ? 'bg-purple-500' :
              inspectSpec.color === 'amber' ? 'bg-amber-500' :
              inspectSpec.color === 'sky' ? 'bg-sky-500' :
              'bg-orange-500'
            }`}></div>

            <div className="flex flex-col items-center text-center mt-4 relative z-10">
              <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner rotate-3 ${
                inspectSpec.color === 'emerald' ? 'bg-emerald-100 text-emerald-500' :
                inspectSpec.color === 'purple' ? 'bg-purple-100 text-purple-500' :
                inspectSpec.color === 'amber' ? 'bg-amber-100 text-amber-500' :
                inspectSpec.color === 'sky' ? 'bg-sky-100 text-sky-500' :
                'bg-orange-100 text-orange-500'
              }`}>
                {React.cloneElement(inspectSpec.icon as React.ReactElement, { className: "w-16 h-16" })}
              </div>
              
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {inspectSpec.name}
              </h3>
              
              <div className="flex gap-2 mb-8">
                <span className={`px-4 py-1.5 rounded-xl text-sm font-bold ${
                  inspectSpec.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  inspectSpec.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  inspectSpec.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  inspectSpec.color === 'sky' ? 'bg-sky-100 text-sky-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {inspectSpec.category}
                </span>
                <span className="px-4 py-1.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {inspectSpec.type || inspectSpec.slide}
                </span>
              </div>
              
              <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 text-left border-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Bio Facts</h4>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-base">
                  இந்த <strong>{inspectSpec.name}</strong> தற்போது {inspectSpec.category} பாகத்தில் நிர்வாகமாக உள்ளது. இது {inspectSpec.type || inspectSpec.slide} ஆகும், மற்றும் மாணவர்கள் உங்களின் உயிரியல் ஆய்வுகளில் அருகில் தேர்வு செய்யும்.
                </p>
                
                <div className="mt-6 pt-5 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div> Healthy & Safe
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specimen ID</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-1 block">
                      {inspectSpec.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
