"use client";

import { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { LabInfographicRenderer } from "@/components/LabInfographicRenderer";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LabCreatorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [schoolClasses, setSchoolClasses] = useState<string[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id: string; name: string }[]>([]);

  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [topic, setTopic] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [infographicData, setInfographicData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch classes
  useEffect(() => {
    if (!schoolId) return;
    const fetchTeacherClasses = async () => {
      try {
        let url = `${API_URL}/api/classes?schoolId=${schoolId}`;
        if (teacherId) url += `&teacherId=${teacherId}`;
        const res = await fetch(url);
        const data = await res.json();
        let classRooms: any[] = [];
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          classRooms = data.data;
        } else {
          const fallbackRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && Array.isArray(fallbackData.data) && fallbackData.data.length > 0) {
            classRooms = fallbackData.data;
          }
        }
        setTeacherClasses(classRooms);
        if (classRooms.length > 0) {
          const first = classRooms[0];
          const gName = first.className.startsWith("Class") ? first.className : `Class ${first.className}`;
          setSelectedClass(gName);
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, teacherId, API_URL]);

  // Fetch school details for classes
  useEffect(() => {
    if (!schoolId) return;
    const fetchSchoolDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/schools/${schoolId}`);
        const data = await res.json();
        if (data.success && data.data?.classes) {
          setSchoolClasses(data.data.classes);
        }
      } catch (err) {
        console.error("Error fetching school details:", err);
      }
    };
    fetchSchoolDetails();
  }, [schoolId, API_URL]);

  // Derive class options
  const gradeOptions = useMemo(() => {
    const list: string[] = [];
    if (teacherClasses.length > 0) {
      teacherClasses.forEach((c) => {
        const name = c.className.startsWith("Class") ? c.className : `Class ${c.className.replace(/^(Grade|Class)\s+/i, "").trim()}`;
        if (!list.includes(name)) list.push(name);
      });
    } else if (schoolClasses.length > 0) {
      schoolClasses.forEach((c) => {
        const name = c.startsWith("Class") ? c : `Class ${c}`;
        if (!list.includes(name)) list.push(name);
      });
    } else {
        return ["Class 10"];
    }
    list.sort((a, b) => (parseInt(a.replace(/\D/g, ""), 10) || 0) - (parseInt(b.replace(/\D/g, ""), 10) || 0));
    return list;
  }, [teacherClasses, schoolClasses]);

  // Fetch subjects
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      try {
        const classNum = selectedClass.replace(/\D/g, "");
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${classNum}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSubjectOptions(data.data);
          if (data.data.length > 0) setSelectedSubject(data.data[0].id);
          else {
            setSelectedSubject("");
            setUnitOptions([]);
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
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const sorted = data.data.slice().sort((a: any, b: any) => a.unitNumber - b.unitNumber);
          setUnitOptions(sorted);
          if (sorted.length > 0) setSelectedUnit(sorted[0].name);
          else setSelectedUnit("");
        }
      } catch (err) {
        console.error("Failed to fetch units:", err);
      }
    };
    fetchUnits();
  }, [selectedSubject, API_URL]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return Swal.fire("Error", "Please enter a lab topic", "error");

    setIsGenerating(true);
    setInfographicData(null);
    try {
      const commandText = `Class ${selectedClass.replace(/\D/g, "")} ${subjectOptions.find(s=>s.id===selectedSubject)?.name || ''} Unit ${selectedUnit}: ${topic}`;
      
      const res = await fetch(`${API_URL}/api/ai/labdesign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText })
      });
      const data = await res.json();
      
      if (data.success) {
        setInfographicData(data.data);
      } else {
        throw new Error(data.message || data.error || "Failed to generate lab");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Generation Failed", err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!infographicData) return;
    setIsSaving(true);
    try {
      const classNum = selectedClass.replace(/\D/g, "");
      const res = await fetch(`${API_URL}/api/ai/visualdesign/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: classNum,
          subjectId: selectedSubject,
          topic: `${selectedUnit} - ${topic}`,
          focus: "LAB",
          infographicData: infographicData
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'The lab infographic has been saved successfully.',
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          router.push('/teacher/lab-creator/list');
        }, 1500);
      } else {
        throw new Error(data.message || "Could not save");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Save Failed", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout>
      <div className="w-full px-4 md:px-8 pb-24">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-5 rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fi fi-rr-microscope text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">AI Lab Creator</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Generate stunning infographics for laboratory experiments.</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/teacher/lab-creator/list')}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm transition-all whitespace-nowrap relative z-10"
          >
            <i className="fi fi-rr-folder-open text-indigo-500"></i>
            Saved Labs
          </button>
        </header>

        {/* Form area */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 relative z-20">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Class Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2">
                  <i className="fi fi-rr-graduation-cap text-indigo-500"></i> Class
                </label>
                <div className="relative">
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer appearance-none"
                    disabled={isGenerating}
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <i className="fi fi-rr-angle-small-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
              </div>

              {/* Subject Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2">
                  <i className="fi fi-rr-book-alt text-indigo-500"></i> Subject
                </label>
                <div className="relative">
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer appearance-none"
                    disabled={isGenerating || subjectOptions.length === 0}
                  >
                    {subjectOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {subjectOptions.length === 0 && <option value="">No Subjects Found</option>}
                  </select>
                  <i className="fi fi-rr-angle-small-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
              </div>

              {/* Unit Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2">
                  <i className="fi fi-rr-layers text-indigo-500"></i> Unit / Chapter
                </label>
                <div className="relative">
                  <select 
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-semibold cursor-pointer appearance-none truncate pr-10"
                    disabled={isGenerating || unitOptions.length === 0}
                  >
                    {unitOptions.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    {unitOptions.length === 0 && <option value="">No Units Found</option>}
                  </select>
                  <i className="fi fi-rr-angle-small-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2">
                <i className="fi fi-rr-edit text-indigo-500"></i> Lab Topic / Experiment Name
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Titration of strong acid and strong base"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                disabled={isGenerating}
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group min-w-[240px] justify-center"
              >
                {isGenerating ? (
                  <>
                    <i className="fi fi-rr-spinner animate-spin text-xl"></i>
                    Designing Lab...
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-magic-wand text-xl group-hover:rotate-12 transition-transform"></i>
                    Generate Lab Info
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Output area */}
        {infographicData && !isGenerating && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-check-circle text-emerald-500"></i>
                Generated Lab Infographic
              </h2>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? <i className="fi fi-rr-spinner animate-spin"></i> : <i className="fi fi-rr-disk"></i>}
                {isSaving ? "Saving..." : "Save Lab"}
              </button>
            </div>

            <div className="w-full">
              <LabInfographicRenderer data={infographicData} />
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
