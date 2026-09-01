"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

interface OfficialUser { id: string; name: string; block?: string | null; district?: string | null; }

interface School {
  id: string | number;
  name: string;
  dise: string;
  district: string;
  block: string;
  type: string;
  medium: string;
  hm: string;
  students: number;
  teachers: number;
  status: "active" | "inactive";
  beoId?: string | null;
  deoId?: string | null;
}

type SortField = "name" | "dise" | "type" | "district" | "medium" | "hm" | "students" | "status";
type SortOrder = "asc" | "desc";

const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
  "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam",
  "Kanyakumari", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram",
  "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur",
  "Theni", "Thiruvallur", "Thiruvarur", "Thoothukudi", "Tiruchirappalli",
  "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvannamalai", "The Nilgiris",
  "Vellore", "Viluppuram", "Virudhunagar"
];
const TYPES = ["Government", "Aided","GHS", "GHSS", "Middle", "Primary"] as const;
const MEDIUMS = ["Tamil", "English", "Both"] as const;

const typeColors: Record<string, string> = {
  GHSS: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  GHS: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Middle: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Primary: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Government: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  Aided: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const emptyForm = { name: "", dise: "", district: "Coimbatore", block: "", type: "Government" as string, medium: "Tamil" as string, hm: "", students: 0, teachers: 0, beoId: "", deoId: "" };

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDist, setFilterDist] = useState("All");
  const [filterType, setFilterType] = useState("All");

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [beoUsers, setBeoUsers] = useState<OfficialUser[]>([]);
  const [deoUsers, setDeoUsers] = useState<OfficialUser[]>([]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/schools`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          dise: s.dise,
          district: s.district,
          block: s.block,
          type: s.schoolType,
          medium: s.mediumOfInstruction,
          hm: s.headmasterName || "—",
          students: s._count?.students || 0,
          teachers: s._count?.teachers || 0,
          status: "active",
          beoId: s.beoId || null,
          deoId: s.deoId || null,
        }));
        setSchools(mapped);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const [beoRes, deoRes] = await Promise.all([
        apiFetch(`/api/hierarchy/users?role=BEO`),
        apiFetch(`/api/hierarchy/users?role=DEO`),
      ]);
      const [beoData, deoData] = await Promise.all([beoRes.json(), deoRes.json()]);
      if (beoData.success) setBeoUsers(beoData.data);
      if (deoData.success) setDeoUsers(deoData.data);
    } catch (err) {
      console.error("Error fetching officials:", err);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchOfficials();
  }, []);

  // Reset pagination on filter or item count change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDist, filterType, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.dise.includes(search) || s.hm.toLowerCase().includes(search.toLowerCase());
    const matchDist = filterDist === "All" || s.district === filterDist;
    const matchType = filterType === "All" || s.type === filterType;
    return matchSearch && matchDist && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA: any = a[sortField] || "";
    let valB: any = b[sortField] || "";

    if (typeof valA === "number") {
      valA = valA;
      valB = valB;
    } else if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sorted.length);
  const paginatedSchools = sorted.slice(startIndex, endIndex);

  const openAdd = () => { setEditSchool(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: School) => {
    setEditSchool(s);
    setForm({ name: s.name, dise: s.dise, district: s.district, block: s.block, type: s.type, medium: s.medium, hm: s.hm, students: s.students, teachers: s.teachers, beoId: s.beoId || "", deoId: s.deoId || "" });
    setShowModal(true);
  };

  const saveSchool = async () => {
    if (!form.name || !form.dise) return;
    try {
      const payload: any = {
        dise: form.dise,
        name: form.name,
        district: form.district,
        block: form.block,
        schoolType: form.type,
        mediumOfInstruction: form.medium,
        headmasterName: form.hm || "N/A",
        beoId: form.beoId || null,
        deoId: form.deoId || null,
      };
      const endpoint = editSchool ? `/api/schools/${editSchool.id}` : `/api/schools`;
      const method = editSchool ? "PUT" : "POST";
      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchSchools();
        setShowModal(false);
      } else {
        alert(`Error saving school: ${data.error}`);
      }
    } catch (err) {
      console.error("Error saving school:", err);
      alert("Network error saving school");
    }
  };

  const deleteSchool = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this school?")) return;
    try {
      const res = await apiFetch(`/api/schools/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchSchools();
        if (viewSchool?.id === id) setViewSchool(null);
      } else {
        alert(`Error deleting school: ${data.error}`);
      }
    } catch (err) {
      console.error("Error deleting school:", err);
      alert("Network error deleting school");
    }
  };

  const toggleStatus = (id: string | number) => setSchools((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));

  const totalStudents = schools.reduce((a, s) => a + s.students, 0);
  const totalTeachers = schools.reduce((a, s) => a + s.teachers, 0);
  const active = schools.filter((s) => s.status === "active").length;

  const renderSortHeader = (field: SortField, label: string) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <i
            className={`fi text-xs text-slate-400 ${
              isSorted
                ? sortOrder === "asc"
                  ? "fi-rr-arrow-small-up text-emerald-400 font-bold"
                  : "fi-rr-arrow-small-down text-emerald-400 font-bold"
                : "fi-rr-sort-alt opacity-40 hover:opacity-100"
            }`}
          ></i>
        </div>
      </th>
    );
  };

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fi fi-rr-building text-emerald-400"></i> School Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Add, edit, and manage all government schools. Assign headmasters and track school status.</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition border border-slate-600 flex items-center gap-1.5">
            <i className="fi fi-rr-file-import"></i> Bulk Import
          </button>
          <button onClick={openAdd} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5">
            <i className="fi fi-rr-add"></i> + Add School
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Schools", value: schools.length.toLocaleString(), iconClass: "fi-rr-building", color: "text-blue-400" },
          { label: "Active Schools", value: active.toLocaleString(), iconClass: "fi-rr-check-circle", color: "text-emerald-400" },
          { label: "Total Students", value: totalStudents.toLocaleString(), iconClass: "fi-rr-graduation-cap", color: "text-violet-400" },
          { label: "Total Teachers", value: totalTeachers.toLocaleString(), iconClass: "fi-rr-book-alt", color: "text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <i className={`fi ${k.iconClass} text-xl ${k.color}`}></i>
              <span className="text-xs text-slate-500">{k.label}</span>
            </div>
            <div className={`text-2xl font-extrabold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative w-64">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search school, DISE code, HM..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select value={filterDist} onChange={(e) => setFilterDist(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="All">All Districts</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="All">All Types</option>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="text-[10px] text-slate-500 ml-auto">{filtered.length} schools</span>
      </div>

      {/* Schools Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3" />
              <span className="text-xs text-slate-400">Loading schools from database...</span>
            </div>
          ) : paginatedSchools.length === 0 ? (
            <div className="text-center py-16">
              <i className="fi fi-rr-folder-open text-4xl text-slate-400 mb-2 block"></i>
              <span className="text-xs text-slate-500">No schools found in selection.</span>
            </div>
          ) : (
            <table className="data-table min-w-[800px]">
              <thead>
                <tr>
                  {renderSortHeader("name", "School")}
                  {renderSortHeader("dise", "DISE Code")}
                  {renderSortHeader("type", "Type")}
                  {renderSortHeader("district", "District / Block")}
                  {renderSortHeader("medium", "Medium")}
                  {renderSortHeader("hm", "Headmaster")}
                  {renderSortHeader("students", "Students")}
                  {renderSortHeader("status", "Status")}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((s) => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => setViewSchool(s)}>
                    <td>
                      <div className="text-xs font-semibold text-white">{s.name}</div>
                    </td>
                    <td className="font-mono">{s.dise}</td>
                    <td>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${typeColors[s.type] || typeColors["Government"]}`}>{s.type}</span>
                    </td>
                    <td>
                      <div>{s.district}</div>
                      <div className="text-slate-600">{s.block}</div>
                    </td>
                    <td>{s.medium}</td>
                    <td>{s.hm || "—"}</td>
                    <td className="font-bold text-white">{s.students.toLocaleString()}</td>
                    <td>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleStatus(s.id); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          s.status === "active"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600"
                        }`}
                        title={s.status === "active" ? "School Active (Click to deactivate)" : "School Inactive (Click to activate)"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            s.status === "active" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(s)} className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                          <i className="fi fi-rr-edit text-xs"></i> Edit
                        </button>
                        <button onClick={() => deleteSchool(s.id)} className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                          <i className="fi fi-rr-trash text-xs"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && sorted.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-white">{sorted.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
                <strong className="text-white">{endIndex}</strong> of <strong className="text-white">{sorted.length}</strong> schools
              </span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 focus:outline-none text-xs font-medium"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition flex items-center gap-1"
              >
                <i className="fi fi-rr-angle-left text-xs"></i> Previous
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && <span className="px-1 text-slate-500">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            currentPage === page
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition flex items-center gap-1"
              >
                Next <i className="fi fi-rr-angle-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* School Detail Drawer */}
      {viewSchool && (
        <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-700 p-6 z-40 overflow-y-auto shadow-2xl">
          <button onClick={() => setViewSchool(null)} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 font-semibold">
            <i className="fi fi-rr-cross-small"></i> Close
          </button>
          <h3 className="text-base font-bold text-white mb-1">{viewSchool.name}</h3>
          <p className="text-[10px] text-slate-500 font-mono mb-4">DISE: {viewSchool.dise}</p>
          <div className="space-y-3 text-xs">
            {[
              ["Type", viewSchool.type], ["Medium", viewSchool.medium],
              ["District", viewSchool.district], ["Block", viewSchool.block],
              ["Headmaster", viewSchool.hm || "Not Assigned"],
              ["Students", viewSchool.students.toLocaleString()],
              ["Teachers", viewSchool.teachers.toLocaleString()],
              ["Status", viewSchool.status.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{k}</span>
                <span className="text-white font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => { openEdit(viewSchool); setViewSchool(null); }}
              className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition flex items-center justify-center gap-1">
              <i className="fi fi-rr-edit"></i> Edit
            </button>
            <button onClick={() => deleteSchool(viewSchool.id)}
              className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-2 rounded-lg transition flex items-center justify-center gap-1">
              <i className="fi fi-rr-trash"></i> Delete
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className={`fi ${editSchool ? "fi-rr-edit" : "fi-rr-add"} text-emerald-400`}></i>
              {editSchool ? "Edit School" : "Add New School"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"School Name", key:"name", placeholder:"Full school name", span:true },
                { label:"DISE Code", key:"dise", placeholder:"e.g. 33012345" },
                { label:"Block", key:"block", placeholder:"Block name" },
                { label:"Headmaster Name", key:"hm", placeholder:"HM full name" },
              ].map(({ label, key, placeholder, span }) => (
                <div key={key} className={span ? "col-span-2" : ""}>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">District</label>
                <select value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Medium</label>
                <select value={form.medium} onChange={(e) => setForm((f) => ({ ...f, medium: e.target.value as any }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
                  {MEDIUMS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Students</label>
                <input type="number" value={form.students} onChange={(e) => setForm((f) => ({ ...f, students: +e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500" />
              </div>

              {/* ── BEO Assignment ── */}
              <div className="col-span-2 border-t border-slate-700 pt-3">
                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <i className="fi fi-rr-user-gear"></i> Official Assignments
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Assign BEO</label>
                <select value={form.beoId} onChange={(e) => setForm((f) => ({ ...f, beoId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
                  <option value="">— None —</option>
                  {beoUsers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}{b.block ? ` (${b.block})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Assign DEO</label>
                <select value={form.deoId} onChange={(e) => setForm((f) => ({ ...f, deoId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500">
                  <option value="">— None —</option>
                  {deoUsers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}{d.district ? ` (${d.district})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg transition border border-slate-700 flex items-center justify-center gap-1">
                <i className="fi fi-rr-cross-small"></i> Cancel
              </button>
              <button onClick={saveSchool} className="flex-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg transition flex items-center justify-center gap-1.5">
                <i className="fi fi-rr-check"></i> {editSchool ? "Save Changes" : "Add School"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
