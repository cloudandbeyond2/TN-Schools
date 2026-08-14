"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

interface Subject {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  unitNumber: number;
  name: string;
}

export default function SavedLabsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [selectedClass, setSelectedClass] = useState<string>("10");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  
  const [savedLessons, setSavedLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch subjects
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${selectedClass}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSubjects(json.data);
          if (json.data.length > 0) setSelectedSubject(json.data[0].id);
          else {
            setSelectedSubject("");
            setUnits([]);
            setSelectedUnit("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    fetchSubjects();
  }, [selectedClass, API_URL]);

  // Fetch units
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects/${selectedSubject}/units`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const sorted = json.data.slice().sort((a: Unit, b: Unit) => a.unitNumber - b.unitNumber);
          setUnits(sorted);
          setSelectedUnit("");
        }
      } catch (err) {
        console.error("Failed to fetch units:", err);
      }
    };
    fetchUnits();
  }, [selectedSubject, API_URL]);

  // Fetch saved infographics
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSavedLessons([]);
    try {
      const query = new URLSearchParams();
      if (selectedClass) query.append("className", selectedClass);
      if (selectedSubject) query.append("subjectId", selectedSubject);
      if (selectedUnit) query.append("topic", selectedUnit);
      query.append("focus", "LAB");

      const res = await fetch(`${API_URL}/api/ai/visualdesign/list?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSavedLessons(json.data);
        if (json.data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "No Results",
            text: "No saved labs found for this selection."
          });
        }
      } else {
        throw new Error(json.error || "Failed to fetch");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not fetch saved labs."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePublishStatus = async (id: string, isPublished: boolean, publishedSections: string[]) => {
    try {
      const res = await fetch(`${API_URL}/api/ai/visualdesign/${id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished, publishedSections })
      });
      const json = await res.json();
      if (json.success) {
        setSavedLessons(prev => prev.map(l => l.id === id ? { ...l, isPublished, publishedSections } : l));
        Swal.fire('Success', isPublished ? 'Lab published successfully!' : 'Lab unpublished.', 'success');
      } else {
        throw new Error(json.error || "Failed to update publish status");
      }
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handlePublishToggle = async (lesson: any) => {
    if (lesson.isPublished) {
      const res = await Swal.fire({
        title: "Unpublish Lab?",
        text: "Students will no longer be able to see this lab infographic.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, unpublish"
      });
      if (res.isConfirmed) {
        await updatePublishStatus(lesson.id, false, []);
      }
    } else {
      const res = await Swal.fire({
        title: "Publish Lab",
        html: `
          <p class="mb-4">Enter the sections to publish to (comma separated, e.g. A, B, C):</p>
          <input id="swal-input-sections" class="swal2-input" placeholder="A, B, C" value="A">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Publish",
        preConfirm: () => {
          const input = document.getElementById('swal-input-sections') as HTMLInputElement;
          return input.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
        }
      });
      if (res.isConfirmed && res.value) {
        await updatePublishStatus(lesson.id, true, res.value);
      }
    }
  };

  return (
    <PortalLayout>
      <div className="w-full px-4 md:px-8 pb-24">
        <header className="mb-8 flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-6">
             <button
                onClick={() => router.push('/teacher/lab-creator')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <i className="fi fi-rr-arrow-left"></i>
             </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">Saved Labs</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Browse and view previously generated laboratory infographics.</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col w-full">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-end">
               <div className="flex flex-col md:col-span-3">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Class</label>
                 <select
                   value={selectedClass}
                   onChange={(e) => setSelectedClass(e.target.value)}
                   className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer"
                   disabled={isLoading}
                 >
                   {[...Array(12)].map((_, i) => (
                     <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                   ))}
                 </select>
               </div>

               <div className="flex flex-col md:col-span-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Subject</label>
                 <select
                   value={selectedSubject}
                   onChange={(e) => setSelectedSubject(e.target.value)}
                   className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer"
                   disabled={isLoading || subjects.length === 0}
                 >
                   {subjects.map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                   ))}
                   {subjects.length === 0 && <option value="">No Subjects</option>}
                 </select>
               </div>

               <div className="flex flex-col md:col-span-5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Topic</label>
                 <select
                   value={selectedUnit}
                   onChange={(e) => setSelectedUnit(e.target.value)}
                   className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer"
                   disabled={isLoading || units.length === 0}
                 >
                   <option value="">All Topics</option>
                   {units.map(u => (
                     <option key={u.id} value={u.name}>Unit {u.unitNumber}: {u.name}</option>
                   ))}
                   {units.length === 0 && <option value="">No Topics</option>}
                 </select>
               </div>
             </div>
             
             <div className="flex justify-end mt-6">
               <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {isLoading ? (
                    <i className="fi fi-rr-spinner animate-spin"></i>
                  ) : (
                    <i className="fi fi-rr-search"></i>
                  )}
                  {isLoading ? "Searching..." : "Find Labs"}
                </button>
             </div>
          </form>
        </header>

        {savedLessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {savedLessons.map((lesson) => {
               const data = lesson.infographicData;
               return (
                 <div key={lesson.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{data?.title || lesson.topic}</h3>
                       <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Class {lesson.class}</p>
                     </div>
                     {data?.centralImageUrl && (
                       <img 
                         src={`https://image.pollinations.ai/prompt/${encodeURIComponent(data.centralImageUrl)}?width=200&height=200&nologo=true`} 
                         className="w-16 h-16 rounded-xl object-cover shadow"
                       />
                     )}
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{data?.aim}</p>
                   
                   <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                     <p className="text-xs text-slate-400 font-medium">Saved on {new Date(lesson.createdAt).toLocaleDateString()}</p>
                     <div className="flex gap-2">
                       <button
                         onClick={() => handlePublishToggle(lesson)}
                         className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${lesson.isPublished ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                       >
                         {lesson.isPublished ? <><i className="fi fi-rr-check"></i> Published</> : <><i className="fi fi-rr-upload"></i> Publish</>}
                       </button>
                       <button
                         onClick={() => window.open(`/teacher/lab-creator/${lesson.id}`, '_blank')}
                         className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2"
                       >
                         <i className="fi fi-rr-eye"></i> View
                       </button>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
