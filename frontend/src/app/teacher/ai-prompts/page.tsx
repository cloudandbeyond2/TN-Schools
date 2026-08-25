"use client";

import { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { InfographicRenderer } from "@/components/InfographicRenderer";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const aiPrompts = [
  { id: 1, command: "/lesson", desc: "Create a complete lesson plan for this topic.", color: "bg-blue-600" },
  { id: 2, command: "/explain", desc: "Explain this topic in a way students can easily understand.", color: "bg-green-600" },
  { id: 3, command: "/activity", desc: "Create a fun classroom activity for this topic.", color: "bg-orange-600" },
  { id: 4, command: "/worksheet", desc: "Create a printable worksheet with answers.", color: "bg-purple-600" },
  { id: 5, command: "/quiz", desc: "Create a quiz with different difficulty levels.", color: "bg-cyan-600" },
  { id: 6, command: "/mcq", desc: "Create 20 multiple-choice questions with answers.", color: "bg-emerald-600" },
  { id: 7, command: "/questions", desc: "Create important questions from this chapter.", color: "bg-amber-600" },
  { id: 8, command: "/assessment", desc: "Create an assessment based on learning objectives.", color: "bg-fuchsia-600" },
  { id: 9, command: "/rubric", desc: "Create a simple grading rubric for this assignment.", color: "bg-indigo-600" },
  { id: 10, command: "/homework", desc: "Create meaningful homework for students.", color: "bg-rose-600" },
  { id: 11, command: "/revision", desc: "Create quick revision material for this topic.", color: "bg-yellow-600" },
  { id: 12, command: "/examples", desc: "Give real-life examples to explain this concept.", color: "bg-teal-600" },
  { id: 13, command: "/differentiate", desc: "Adapt this lesson for different learning levels.", color: "bg-sky-600" },
  { id: 14, command: "/discussion", desc: "Create classroom discussion questions.", color: "bg-lime-600" },
  { id: 15, command: "/project", desc: "Create a student project with clear instructions.", color: "bg-pink-600" },
  { id: 16, command: "/feedback", desc: "Give constructive feedback on this student's answer.", color: "bg-violet-600" },
  { id: 17, command: "/simplify", desc: "Simplify this topic for younger students.", color: "bg-cyan-500" },
  { id: 18, command: "/presentation", desc: "Create a classroom presentation outline.", color: "bg-emerald-500" },
  { id: 19, command: "/engage", desc: "Give creative ways to make this lesson more engaging.", color: "bg-orange-500" },
  { id: 20, command: "/answerkey", desc: "Create an answer key for these questions.", color: "bg-purple-500" },
];

export default function AIPromptsPage() {
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
  const learningFocus = "Custom Prompt";

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

  // Fetch subjects for class
  useEffect(() => {
    const fetchSubjects = async () => {
      const classStr = selectedClass.replace(/^(Grade|Class)\s+/i, "").split(" ")[0].split("-")[0].trim();
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${classStr}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSubjectOptions(data.data);
          if (data.data.length > 0) setSelectedSubject(data.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    };
    if (selectedClass) fetchSubjects();
  }, [selectedClass, API_URL]);

  // Fetch units for subject
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects/${selectedSubject}/units`);
        const data = await res.json();
        if (data.success && data.data) {
          setUnitOptions(data.data);
          if (data.data.length > 0) setSelectedUnit(data.data[0].name);
        }
      } catch (err) {
        console.error("Failed to fetch units:", err);
      }
    };
    if (selectedSubject) fetchUnits();
  }, [selectedSubject, API_URL]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Swal.fire("Error", "Please enter a topic", "error");
      return;
    }
    
    setIsGenerating(true);
    setInfographicData(null);

    try {
      const res = await fetch(`${API_URL}/api/ai/visualdesign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class: selectedClass,
          subjectId: selectedSubject,
          command: `${selectedUnit} - ${topic}`,
          focus: learningFocus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInfographicData(data.data);
      } else {
        throw new Error(data.message || "Failed to generate");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!infographicData) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`${API_URL}/api/ai/visualdesign/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: selectedClass.replace(/^(Class|Grade)\s+/i, "").trim(),
          subjectId: selectedSubject,
          topic: `${selectedUnit} - ${topic}`,
          focus: learningFocus,
          infographicData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Infographic saved successfully",
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          router.push("/teacher/ai-lesson-creator/list");
        }, 1500);
      } else {
        throw new Error(data.message || "Failed to save");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout>
      <div className="w-full px-4 md:px-8 pb-24">
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Sidebar for Prompts */}
          <div className="w-full xl:w-[350px] shrink-0">
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-700 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <i className="fi fi-rr-bulb text-2xl text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">AI Prompts</h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">For Teachers</p>
                  </div>
                </div>
                <div className="text-4xl font-black text-slate-800/50 italic">
                  20
                </div>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
                {aiPrompts.map(prompt => (
                  <div 
                    key={prompt.id} 
                    onClick={() => setTopic((prev) => prev ? `${prev} ${prompt.command}` : prompt.command)}
                    className="group cursor-pointer flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
                  >
                    <div className={`w-8 h-8 rounded-xl ${prompt.color} flex items-center justify-center shrink-0 shadow-lg text-white font-black text-sm`}>
                      {prompt.id}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-indigo-300 mb-0.5">{prompt.command}</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{prompt.desc}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity self-center">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                         <i className="fi fi-rr-arrow-small-right text-indigo-300 text-xs"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <i className="fi fi-rr-magic-wand text-3xl text-indigo-500"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">AI Prompts Generator</h1>
                  <p className="text-slate-500 dark:text-slate-400">Generate beautiful educational visuals instantly with structured prompts.</p>
                </div>
              </div>
              <button 
                onClick={() => router.push("/teacher/ai-lesson-creator/list")}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center gap-3 self-start md:self-stretch border border-slate-200 dark:border-slate-700"
              >
                <i className="fi fi-rr-list"></i>
                View Saved Lessons
              </button>
            </div>

            {/* Input Form */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
              <div className="flex flex-wrap gap-6 items-end">
                
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Class</label>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {gradeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjectOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Unit</label>
                  <select 
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {unitOptions.map(opt => (
                        <option key={opt.id} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Topic / Command</label>
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic or prompt..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="w-full md:w-auto">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full md:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <i className="fi fi-rr-spinner animate-spin"></i>
                    ) : (
                      <i className="fi fi-rr-sparkles"></i>
                    )}
                    {isGenerating ? "Generating..." : "Generate Lesson"}
                  </button>
                </div>

              </div>
            </div>

            {/* Generated Infographic Display */}
            {infographicData && !isGenerating && (
              <div className="mt-12 animate-fade-in-up">
                <InfographicRenderer data={infographicData} focus={learningFocus} />

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <i className="fi fi-rr-spinner animate-spin"></i>
                    ) : (
                      <i className="fi fi-rr-disk"></i>
                    )}
                    {isSaving ? "Saving..." : "Save Infographic"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
