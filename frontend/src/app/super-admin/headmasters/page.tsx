"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

interface HM {
  id: string;
  name: string;
  empId: string;
  phone: string;
  email: string;
  district: string;
  block: string;
  school: string;
  dise: string;
  joinedSchool: string;
  experience: number;
  status: "assigned" | "unassigned" | "transferred";
}

const statusColors: Record<HM["status"], string> = {
  assigned: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  unassigned: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  transferred: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

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

const emptyForm = { name:"", empId:"", phone:"", email:"", password:"", district:"Coimbatore", block:"", school:"", dise:"", experience:5 };

export default function HeadmasterManagement() {
  const [hms, setHMs] = useState<HM[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | HM["status"]>("all");
  const [filterDist, setFilterDist] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editHM, setEditHM] = useState<HM | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTransfer, setShowTransfer] = useState<HM | null>(null);
  const [transferTarget, setTransferTarget] = useState("");

  const fetchHMs = async () => {
    try {
      const res = await apiFetch("/api/users?role=HEADMASTER");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((u: any) => {
          const schoolObj = schoolsList.find(s => s.id === u.schoolId);
          let status: HM["status"] = "unassigned";
          if (u.schoolId) status = "assigned";

          return {
            id: u.id,
            name: u.name,
            empId: u.emisId || "—",
            phone: u.mobile || "—",
            email: u.email || "—",
            district: u.district || schoolObj?.district || "—",
            block: u.block || schoolObj?.block || "—",
            school: u.schoolId || "—",
            dise: schoolObj?.dise || "—",
            joinedSchool: new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
            experience: 5, 
            status
          };
        });
        setHMs(mapped);
      }
    } catch (err) {
      console.error("Error fetching HMs:", err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await apiFetch("/api/schools");
      const data = await res.json();
      if (data.success) {
        setSchoolsList(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchSchools();
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (schoolsList.length > 0) {
      fetchHMs().then(() => setLoading(false));
    }
  }, [schoolsList]);

  const getSchoolName = (schoolId: string) => {
    if (!schoolId || schoolId === "—") return "Unassigned";
    const school = schoolsList.find((s) => s.id === schoolId);
    return school ? school.name : schoolId;
  };

  const filtered = hms.filter((h) => {
    const schoolName = (getSchoolName(h.school) || "").toLowerCase();
    const query = (search || "").toLowerCase().trim();
    const matchSearch =
      (h.name || "").toLowerCase().includes(query) ||
      (h.empId || "").toLowerCase().includes(query) ||
      schoolName.includes(query);
    const matchStatus = filterStatus === "all" || h.status === filterStatus;
    const matchDist = filterDist === "All" || h.district === filterDist;
    return matchSearch && matchStatus && matchDist;
  });

  const openAdd = () => { 
    setEditHM(null); 
    setForm(emptyForm); 
    setErrors({});
    setShowModal(true); 
  };

  const openEdit = (h: HM) => { 
    setEditHM(h); 
    setForm({ 
      name: h.name, 
      empId: h.empId === "—" ? "" : h.empId, 
      phone: h.phone === "—" ? "" : h.phone, 
      email: h.email === "—" ? "" : h.email, 
      password: "",
      district: h.district === "—" ? "" : h.district, 
      block: h.block === "—" ? "" : h.block, 
      school: h.school === "—" ? "" : h.school, 
      dise: h.dise === "—" ? "" : h.dise, 
      experience: h.experience 
    }); 
    setErrors({});
    setShowModal(true); 
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) {
      errs.name = "Full Name is required";
    } else if (form.name.trim().length < 2) {
      errs.name = "Full Name must be at least 2 characters";
    }

    if (!form.empId.trim()) {
      errs.empId = "Employee ID is required";
    }

    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      errs.phone = "Phone must be a valid 10-digit mobile number";
    }

    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address (e.g. hm@tn.gov.in)";
    }

    if (!editHM) {
      if (!form.password) {
        errs.password = "Password is required for new Headmaster";
      } else if (form.password.length < 6) {
        errs.password = "Password must be at least 6 characters";
      }
    } else {
      if (form.password && form.password.length < 6) {
        errs.password = "Password must be at least 6 characters if updating";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveHM = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.phone.trim() || null,
        role: "HEADMASTER",
        emisId: form.empId.trim(),
        schoolId: form.school || null,
        district: form.district || null,
        block: form.block || null,
        password: form.password ? form.password : (editHM ? undefined : "123456")
      };

      if (editHM) {
        const res = await apiFetch(`/api/users/${editHM.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchHMs();
        } else {
          alert(data.error || "Failed to update Headmaster");
        }
      } else {
        const res = await apiFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchHMs();
        } else {
          alert(data.error || "Failed to create Headmaster");
        }
      }
    } catch (err) {
      console.error("Error saving HM:", err);
    }
  };

  const doTransfer = async () => {
    if (!showTransfer || !transferTarget) return;
    try {
      const selectedSchool = schoolsList.find(s => s.id === transferTarget);
      const res = await apiFetch(`/api/users/${showTransfer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: transferTarget,
          district: selectedSchool ? selectedSchool.district : showTransfer.district,
          block: selectedSchool ? selectedSchool.block : showTransfer.block
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowTransfer(null);
        setTransferTarget("");
        fetchHMs();
      } else {
        alert(data.error || "Failed to transfer Headmaster");
      }
    } catch (err) {
      console.error("Error transferring HM:", err);
    }
  };

  const removeHM = async (id: string) => {
    if (!confirm("Are you sure you want to delete this headmaster?")) return;
    try {
      const res = await apiFetch(`/api/users/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchHMs();
      } else {
        alert(data.error || "Failed to delete headmaster");
      }
    } catch (err) {
      console.error("Error deleting HM:", err);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schoolsList.find(s => s.id === schoolId);
    setForm(f => ({
      ...f,
      school: schoolId,
      district: school ? school.district : "",
      block: school ? school.block : "",
      dise: school ? school.dise : "",
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    setForm(f => ({
      ...f,
      district: districtName,
      block: "",
      school: "",
      dise: "",
    }));
  };

  const handleBlockChange = (blockName: string) => {
    setForm(f => ({
      ...f,
      block: blockName,
      school: "",
      dise: "",
    }));
  };

  const uniqueDistricts = Array.from(new Set(schoolsList.map(s => s.district))).filter(Boolean).sort();
  const displayDistricts = uniqueDistricts.length > 0 ? uniqueDistricts : DISTRICTS;

  const availableBlocks = form.district
    ? Array.from(new Set(schoolsList.filter(s => s.district === form.district).map(s => s.block))).filter(Boolean).sort()
    : [];

  const districtsInHM = Array.from(new Set(hms.map(h => h.district).filter(d => d && d !== "—"))).sort();

  return (
    <PortalLayout>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fi fi-rr-user-gear text-blue-400"></i> Headmaster Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage headmaster assignments, transfers, and school allocations across Tamil Nadu</p>
        </div>
        <button onClick={openAdd} className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer">
          <i className="fi fi-rr-user-add"></i> Add HM
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label:"Total HMs", value:hms.length, icon:<i className="fi fi-rr-users text-blue-400 text-xl"></i>, color:"text-blue-400" },
          { label:"Assigned", value:hms.filter((h) => h.status==="assigned").length, icon:<i className="fi fi-rr-check-circle text-emerald-400 text-xl"></i>, color:"text-emerald-400" },
          { label:"Unassigned", value:hms.filter((h) => h.status==="unassigned").length, icon:<i className="fi fi-rr-triangle-warning text-amber-400 text-xl"></i>, color:"text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center shrink-0">{k.icon}</span>
              <div>
                <div className={`text-xl font-extrabold ${k.color}`}>{loading ? "..." : k.value}</div>
                <div className="text-[10px] text-slate-500">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, school..."
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 w-56 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all","assigned","unassigned","transferred"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition capitalize ${
                filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}>{s}</button>
          ))}
        </div>
        <select value={filterDist} onChange={(e) => setFilterDist(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="All">All Districts</option>
          {districtsInHM.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* HM Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400">Loading headmasters database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <i className="fi fi-rr-user-x text-3xl text-slate-500 block mb-2"></i>
          <span className="text-xs text-slate-500">No headmasters found matching selection.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <div key={h.id} className="glass rounded-2xl p-5 border border-slate-800 hover:border-slate-600 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {h.name ? h.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{h.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{h.empId}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[h.status]}`}>
                    {h.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] mb-4">
                  <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">School</span><span className="text-slate-350 font-semibold truncate">{getSchoolName(h.school)}</span></div>
                  {h.school !== "—" && <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">DISE</span><span className="text-slate-400 font-mono">{h.dise}</span></div>}
                  <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">District</span><span className="text-slate-400">{h.district}</span></div>
                  <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">Block</span><span className="text-slate-400">{h.block}</span></div>
                  <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">Email</span><span className="text-slate-400 truncate">{h.email}</span></div>
                  <div className="flex gap-2"><span className="text-slate-500 w-20 shrink-0">Phone</span><span className="text-slate-400 font-mono">{h.phone}</span></div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap border-t border-slate-800 pt-3 mt-1">
                <button onClick={() => openEdit(h)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <i className="fi fi-rr-edit text-xs"></i> Edit
                </button>
                <button onClick={() => setShowTransfer(h)} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <i className="fi fi-rr-arrows-repeat text-xs"></i> Transfer
                </button>
                <button onClick={() => removeHM(h.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <i className="fi fi-rr-trash text-xs"></i> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="text-base font-bold text-white mb-5 flex items-center gap-2">
              {editHM ? (
                <>
                  <i className="fi fi-rr-edit text-blue-400"></i> Edit Headmaster
                </>
              ) : (
                <>
                  <i className="fi fi-rr-user-add text-blue-400"></i> Add Headmaster
                </>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors((err) => ({ ...err, name: "" }));
                  }}
                  placeholder="HM full name"
                  className={`w-full bg-slate-800 border text-white text-xs rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                    errors.name ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {errors.name && <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">{errors.name}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Employee ID *</label>
                <input
                  value={form.empId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, empId: e.target.value }));
                    if (errors.empId) setErrors((err) => ({ ...err, empId: "" }));
                  }}
                  placeholder="e.g. TN-HM-1234"
                  className={`w-full bg-slate-800 border text-white text-xs rounded-lg px-3 py-2 focus:outline-none font-mono transition-colors ${
                    errors.empId ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {errors.empId && <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">{errors.empId}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Phone *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((f) => ({ ...f, phone: cleaned }));
                    if (errors.phone) setErrors((err) => ({ ...err, phone: "" }));
                  }}
                  placeholder="10-digit number"
                  className={`w-full bg-slate-800 border text-white text-xs rounded-lg px-3 py-2 focus:outline-none font-mono transition-colors ${
                    errors.phone ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {errors.phone && <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">{errors.phone}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (errors.email) setErrors((err) => ({ ...err, email: "" }));
                  }}
                  placeholder="hm@tn.gov.in"
                  className={`w-full bg-slate-800 border text-white text-xs rounded-lg px-3 py-2 focus:outline-none font-mono transition-colors ${
                    errors.email ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {errors.email && <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">{errors.email}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  {editHM ? "Password (Optional)" : "Password *"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    if (errors.password) setErrors((err) => ({ ...err, password: "" }));
                  }}
                  placeholder={editHM ? "Leave blank to keep current password" : "Min 6 characters (e.g. 123456)"}
                  className={`w-full bg-slate-800 border text-white text-xs rounded-lg px-3 py-2 focus:outline-none font-mono transition-colors ${
                    errors.password ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {errors.password && <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">{errors.password}</span>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Assigned School</label>
                <select value={form.school} onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                  <option value="">— Unassigned —</option>
                  {schoolsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.block})</option>
                  ))}
                </select>
              </div>

              {form.school ? (
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-850 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                  <div>
                    <span className="font-bold block uppercase text-[8px] text-slate-500">DISE</span>
                    {form.dise || "—"}
                  </div>
                  <div>
                    <span className="font-bold block uppercase text-[8px] text-slate-500">District</span>
                    {form.district || "—"}
                  </div>
                  <div>
                    <span className="font-bold block uppercase text-[8px] text-slate-500">Block</span>
                    {form.block || "—"}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">District</label>
                    <select value={form.district} onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                      <option value="">— Select District —</option>
                      {displayDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Block</label>
                    <select value={form.block} onChange={(e) => handleBlockChange(e.target.value)} disabled={!form.district}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50">
                      <option value="">— Select Block —</option>
                      {availableBlocks.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6 font-mono">
              <button onClick={() => setShowModal(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                <i className="fi fi-rr-cross-small"></i> Cancel
              </button>
              <button onClick={saveHM} className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer">
                <i className="fi fi-rr-check"></i> {editHM ? "Save Changes" : "Add HM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <i className="fi fi-rr-arrows-repeat text-amber-400"></i> Transfer Headmaster
            </div>
            <p className="text-xs text-slate-400 mb-4">Transferring: <strong className="text-white">{showTransfer.name}</strong></p>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Select New School</label>
              <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500">
                <option value="">— Select School —</option>
                {schoolsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.block})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 font-mono">
              <button onClick={() => setShowTransfer(null)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer">
                <i className="fi fi-rr-cross-small"></i> Cancel
              </button>
              <button onClick={doTransfer} className="flex-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer" disabled={!transferTarget}>
                <i className="fi fi-rr-check"></i> Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
