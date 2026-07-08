"use client";
import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";

type Board = "SSLC" | "HSC";
type Medium = "Tamil" | "English" | "Both";

interface Chapter {
  id: number;
  no: number;
  title: string;
  topics: number;
  enabled: boolean;
  aiMapped: boolean;
}

interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  classRange: string;
  chapters: Chapter[];
}

interface ClassConfig {
  class: string;
  board: Board;
  subjects: SubjectConfig[];
}

const buildChapters = (count: number): Chapter[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1, no: i + 1,
    title: ["Number Systems","Algebra Basics","Geometry","Trigonometry","Statistics","Probability","Calculus","Matrices","Sequences","Polynomials"][i % 10] + ` — Part ${Math.floor(i/10)+1}`,
    topics: Math.floor(Math.random() * 8) + 3,
    enabled: true,
    aiMapped: i % 3 !== 0,
  }));

const curriculum: ClassConfig[] = [
  { class:"Class 6", board:"SSLC", subjects:[
    { id:"c6-math", name:"Mathematics", icon:"<i class='fi fi-rr-ruler-triangle'></i>", classRange:"6", chapters: buildChapters(8) },
    { id:"c6-sci", name:"Science", icon:"<i class='fi fi-rr-microscope'></i>", classRange:"6", chapters: buildChapters(7) },
    { id:"c6-eng", name:"English", icon:"<i class='fi fi-rr-book-alt'></i>", classRange:"6", chapters: buildChapters(10) },
    { id:"c6-tam", name:"Tamil", icon:"<i class='fi fi-rr-flower'></i>", classRange:"6", chapters: buildChapters(12) },
    { id:"c6-ss", name:"Social Science", icon:"<i class='fi fi-rr-globe'></i>", classRange:"6", chapters: buildChapters(9) },
  ]},
  { class:"Class 7", board:"SSLC", subjects:[
    { id:"c7-math", name:"Mathematics", icon:"<i class='fi fi-rr-ruler-triangle'></i>", classRange:"7", chapters: buildChapters(9) },
    { id:"c7-sci", name:"Science", icon:"<i class='fi fi-rr-microscope'></i>", classRange:"7", chapters: buildChapters(8) },
    { id:"c7-eng", name:"English", icon:"<i class='fi fi-rr-book-alt'></i>", classRange:"7", chapters: buildChapters(10) },
    { id:"c7-tam", name:"Tamil", icon:"<i class='fi fi-rr-flower'></i>", classRange:"7", chapters: buildChapters(12) },
  ]},
  { class:"Class 10", board:"SSLC", subjects:[
    { id:"c10-math", name:"Mathematics", icon:"<i class='fi fi-rr-ruler-triangle'></i>", classRange:"10", chapters: buildChapters(10) },
    { id:"c10-sci", name:"Science", icon:"<i class='fi fi-rr-microscope'></i>", classRange:"10", chapters: buildChapters(10) },
    { id:"c10-eng", name:"English", icon:"<i class='fi fi-rr-book-alt'></i>", classRange:"10", chapters: buildChapters(10) },
    { id:"c10-tam", name:"Tamil", icon:"<i class='fi fi-rr-flower'></i>", classRange:"10", chapters: buildChapters(12) },
    { id:"c10-ss", name:"Social Science", icon:"<i class='fi fi-rr-globe'></i>", classRange:"10", chapters: buildChapters(8) },
  ]},
  { class:"Class 12", board:"HSC", subjects:[
    { id:"c12-math", name:"Mathematics", icon:"<i class='fi fi-rr-ruler-triangle'></i>", classRange:"12", chapters: buildChapters(12) },
    { id:"c12-phys", name:"Physics", icon:"<i class='fi fi-rr-bolt'></i>", classRange:"12", chapters: buildChapters(10) },
    { id:"c12-chem", name:"Chemistry", icon:"<i class='fi fi-rr-test-tube'></i>", classRange:"12", chapters: buildChapters(10) },
    { id:"c12-bio", name:"Biology", icon:"<i class='fi fi-rr-leaf'></i>", classRange:"12", chapters: buildChapters(9) },
    { id:"c12-cs", name:"Computer Science", icon:"<i class='fi fi-rr-computer'></i>", classRange:"12", chapters: buildChapters(8) },
  ]},
];

export default function SyllabusManagement() {
  const [data, setData] = useState<ClassConfig[]>(curriculum);
  const [selectedClass, setSelectedClass] = useState<string>("Class 10");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title:"", topics:5 });
  const [search, setSearch] = useState("");

  const classConfig = data.find((c) => c.class === selectedClass);
  const subject = classConfig?.subjects.find((s) => s.id === selectedSubject) || classConfig?.subjects[0];

  const toggleChapter = (subjectId: string, chapterId: number) => {
    setData((prev) => prev.map((cls) => cls.class === selectedClass ? {
      ...cls, subjects: cls.subjects.map((sub) => sub.id === subjectId ? {
        ...sub, chapters: sub.chapters.map((ch) => ch.id === chapterId ? { ...ch, enabled: !ch.enabled } : ch)
      } : sub)
    } : cls));
  };

  const toggleAI = (subjectId: string, chapterId: number) => {
    setData((prev) => prev.map((cls) => cls.class === selectedClass ? {
      ...cls, subjects: cls.subjects.map((sub) => sub.id === subjectId ? {
        ...sub, chapters: sub.chapters.map((ch) => ch.id === chapterId ? { ...ch, aiMapped: !ch.aiMapped } : ch)
      } : sub)
    } : cls));
  };

  const addChapter = () => {
    if (!newChapter.title || !subject) return;
    setData((prev) => prev.map((cls) => cls.class === selectedClass ? {
      ...cls, subjects: cls.subjects.map((sub) => sub.id === subject.id ? {
        ...sub, chapters: [...sub.chapters, {
          id: Date.now(), no: sub.chapters.length + 1,
          title: newChapter.title, topics: newChapter.topics, enabled: true, aiMapped: false,
        }]
      } : sub)
    } : cls));
    setShowAddChapter(false);
    setNewChapter({ title:"", topics:5 });
  };

  const filteredChapters = (subject?.chapters || []).filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><i className="fi fi-rr-book-alt text-amber-500"></i> Syllabus Management</h1>
        <p className="text-xs text-slate-400 mt-1">Manage state curriculum by class, subject, and chapter. Control AI mapping and chapter visibility.</p>
      </div>

      {/* Class Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {data.map((cls) => (
          <button key={cls.class} onClick={() => { setSelectedClass(cls.class); setSelectedSubject(""); }}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition border ${
              selectedClass === cls.class
                ? "bg-amber-500 text-slate-900 border-amber-500"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500"
            }`}>
            {cls.class}
            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded ${cls.board === "SSLC" ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/20 text-violet-400"}`}>
              {cls.board}
            </span>
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Subject Sidebar */}
        <div className="glass rounded-2xl p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Subjects</h3>
          <div className="space-y-2">
            {classConfig?.subjects.map((sub) => {
              const enabled = sub.chapters.filter((c) => c.enabled).length;
              const aiMapped = sub.chapters.filter((c) => c.aiMapped).length;
              const isSelected = sub.id === (subject?.id);
              return (
                <button key={sub.id} onClick={() => setSelectedSubject(sub.id)}
                  className={`w-full text-left rounded-xl p-3 transition border ${
                    isSelected ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900/50 border-slate-800 hover:border-slate-600"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base flex items-center justify-center" dangerouslySetInnerHTML={{ __html: sub.icon }} />
                    <span className="text-xs font-semibold text-white">{sub.name}</span>
                  </div>
                  <div className="flex gap-3 text-[9px] text-slate-500 items-center">
                    <span className="flex items-center gap-1"><i className="fi fi-rr-marker"></i> {enabled}/{sub.chapters.length} chapters</span>
                    <span className="flex items-center gap-1"><i className="fi fi-rr-robot"></i> {aiMapped} AI</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters Panel */}
        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span dangerouslySetInnerHTML={{ __html: subject?.icon || "" }} /> {subject?.name} — {selectedClass}
              </h3>
              <p className="text-[10px] text-slate-500">{subject?.chapters.length} chapters · {subject?.chapters.filter((c) => c.enabled).length} enabled · {subject?.chapters.filter((c) => c.aiMapped).length} AI-mapped</p>
            </div>
            <div className="flex gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapters..."
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 w-40" />
              <button onClick={() => setShowAddChapter(true)}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg transition flex items-center gap-1"><i className="fi fi-rr-plus"></i> Chapter</button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-16">No</th>
                  <th>Chapter Title</th>
                  <th>Topics</th>
                  <th>AI Mapping</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredChapters.map((ch) => (
                  <tr key={ch.id} className={ch.enabled ? "" : "opacity-60"}>
                    <td className="font-bold text-slate-500">{ch.no}</td>
                    <td>
                      <span className="text-xs font-semibold text-white">{ch.title}</span>
                    </td>
                    <td>{ch.topics} topics</td>
                    <td>
                      <button onClick={() => toggleAI(subject!.id, ch.id)} title="Toggle AI Mapping"
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 w-fit ${
                          ch.aiMapped ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" : "text-slate-600 bg-slate-800 border-slate-700"
                        }`}><i className="fi fi-rr-robot"></i> {ch.aiMapped ? "ON" : "OFF"}</button>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end">
                        <button onClick={() => toggleChapter(subject!.id, ch.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors ${ch.enabled ? "bg-emerald-500" : "bg-slate-700"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${ch.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Chapter Modal */}
      {showAddChapter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2"><i className="fi fi-rr-plus text-amber-500"></i> Add Chapter</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Chapter Title</label>
                <input value={newChapter.title} onChange={(e) => setNewChapter((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Number of Topics</label>
                <input type="number" value={newChapter.topics} onChange={(e) => setNewChapter((f) => ({ ...f, topics: +e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddChapter(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={addChapter} className="flex-1 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 py-2 rounded-lg transition">Add Chapter</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
