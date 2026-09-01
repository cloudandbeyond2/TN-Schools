"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

type Role = "STUDENT" | "TEACHER" | "PARENT" | "HEADMASTER" | "BEO" | "DEO" | "COMMISSIONER" | "MINISTER" | "SUPERADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  district: string;
  block: string;
  school: string;
  status: "active" | "inactive";
  joined: string;
}

const ROLES: Role[] = ["STUDENT","TEACHER","PARENT","HEADMASTER","BEO","DEO","COMMISSIONER","MINISTER","SUPERADMIN"];

const roleColors: Record<Role, string> = {
  STUDENT: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  TEACHER: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  PARENT: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  HEADMASTER: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  BEO: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  DEO: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  COMMISSIONER: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  MINISTER: "text-red-400 bg-red-500/10 border-red-500/30",
  SUPERADMIN: "text-slate-300 bg-slate-500/10 border-slate-500/30",
};

const roleIcons: Record<Role, string> = {
  STUDENT:"🎓", TEACHER:"📚", PARENT:"👨‍👩‍👧", HEADMASTER:"🏫", BEO:"🏢",
  DEO:"🗺️", COMMISSIONER:"⚖️", MINISTER:"🏛️", SUPERADMIN:"🛠️",
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

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, string>>({
    STUDENT: "0", TEACHER: "0", PARENT: "0",
    HEADMASTER: "0", BEO: "0", DEO: "0",
    COMMISSIONER: "0", MINISTER: "0", SUPERADMIN: "0"
  });

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | Role>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "inactive">("ALL");
  const [filterDistrict, setFilterDistrict] = useState<string>("ALL");
  const [filterSchool, setFilterSchool] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole, filterStatus, filterDistrict, filterSchool]);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name:"", email:"", mobile:"", emisId:"", password:"", role:"TEACHER" as Role, district:"", block:"", school:"", assignedRegion:"" });

  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/api/users");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          district: u.district || "—",
          block: u.block || "—",
          school: u.schoolId || "—",
          status: u.isActive ? "active" : "inactive",
          joined: new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await apiFetch("/api/users/count");
      const json = await res.json();
      if (json.success) {
        setRoleCounts({
          STUDENT: json.rolesFormatted.students,
          TEACHER: json.rolesFormatted.teachers,
          PARENT: json.rolesFormatted.parents,
          HEADMASTER: json.rolesFormatted.headmasters,
          BEO: json.rolesFormatted.beos,
          DEO: json.rolesFormatted.deos,
          COMMISSIONER: json.rolesFormatted.commissioners,
          MINISTER: json.rolesFormatted.ministers,
          SUPERADMIN: json.rolesFormatted.superAdmins
        });
      }
    } catch (err) {
      console.error("Error fetching role counts:", err);
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
      console.error("Error fetching schools list:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCounts(), fetchSchools()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchDistrict = filterDistrict === "ALL" || u.district === filterDistrict;
    const matchSchool = filterSchool === "ALL" || u.school === filterSchool;
    return matchSearch && matchRole && matchStatus && matchDistrict && matchSchool;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newIsActive = currentStatus !== "active";
      const res = await apiFetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newIsActive }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: newIsActive ? "active" : "inactive" } : u));
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  const openAdd = () => { 
    setEditUser(null); 
    setForm({ name:"", email:"", mobile:"", emisId:"", password:"123456", role:"TEACHER", district:"", block:"", school:"", assignedRegion:"" }); 
    setShowModal(true); 
  };

  const openEdit = (u: User) => { 
    setEditUser(u); 
    setForm({ 
      name: u.name, 
      email: u.email, 
      mobile: "",
      emisId: "",
      password: "", 
      role: u.role, 
      district: u.district === "—" ? "" : u.district, 
      block: u.block === "—" ? "" : u.block, 
      school: u.school === "—" ? "" : u.school,
      assignedRegion: "",
    }); 
    setShowModal(true); 
  };

  const handleRoleChange = (newRole: Role) => {
    setForm(f => {
      const updated = { ...f, role: newRole };
      if (["SUPERADMIN"].includes(newRole)) {
        updated.school = "";
        updated.district = "";
        updated.block = "";
        updated.assignedRegion = "";
      } else if (["COMMISSIONER", "MINISTER"].includes(newRole)) {
        updated.school = "";
        updated.district = "";
        updated.block = "";
      } else if (newRole === "DEO") {
        updated.school = "";
        updated.block = "";
        updated.assignedRegion = "";
      } else if (newRole === "BEO") {
        updated.school = "";
        updated.assignedRegion = "";
      } else {
        updated.assignedRegion = "";
      }
      return updated;
    });
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schoolsList.find(s => s.id === schoolId);
    setForm(f => ({
      ...f,
      school: schoolId,
      district: school ? school.district : "",
      block: school ? school.block : "",
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    setForm(f => ({
      ...f,
      district: districtName,
      block: "", 
      school: "", 
    }));
  };

  const handleBlockChange = (blockName: string) => {
    setForm(f => ({
      ...f,
      block: blockName,
      school: "", 
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.email) {
      alert("Name and Email are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address.");
      return false;
    }
    if (!editUser && !form.password) {
      alert("Password is required for new users.");
      return false;
    }
    if (["TEACHER", "STUDENT", "HEADMASTER", "PARENT"].includes(form.role)) {
      if (!form.school) {
        alert(`Please select a school for ${form.role}.`);
        return false;
      }
    } else if (form.role === "BEO") {
      if (!form.district) {
        alert("Please select a district for BEO.");
        return false;
      }
      if (!form.block) {
        alert("Please enter a block for BEO.");
        return false;
      }
    } else if (form.role === "DEO") {
      if (!form.district) {
        alert("Please select a district for DEO.");
        return false;
      }
    }
    return true;
  };

  const saveUser = async () => {
    if (!validateForm()) return;
    try {
      if (editUser) {
        const res = await apiFetch(`/api/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            mobile: form.mobile || undefined,
            role: form.role,
            district: form.district || null,
            block: form.block || null,
            schoolId: form.school || null,
            assignedRegion: form.assignedRegion || null,
            password: form.password || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) => prev.map((u) => u.id === editUser.id ? {
            ...u,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            district: data.data.district || "—",
            block: data.data.block || "—",
            school: data.data.schoolId || "—",
          } : u));
          setShowModal(false);
          fetchCounts();
        } else {
          alert(data.error || "Failed to update user");
        }
      } else {
        const res = await apiFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            mobile: form.mobile || undefined,
            emisId: form.emisId || undefined,
            role: form.role,
            district: form.district || null,
            block: form.block || null,
            schoolId: form.school || null,
            assignedRegion: form.assignedRegion || null,
            password: form.password || "123456",
          }),
        });
        const data = await res.json();
        if (data.success) {
          const mappedNewUser = {
            id: String(data.data.id),
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            district: data.data.district || "—",
            block: data.data.block || "—",
            school: data.data.schoolId || "—",
            status: "active" as const,
            joined: new Date(data.data.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          };
          setUsers((prev) => [mappedNewUser, ...prev]);
          setShowModal(false);
          fetchCounts();
        } else {
          alert(data.error || "Failed to create user");
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await apiFetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        fetchCounts();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const getSchoolName = (schoolId: string) => {
    if (!schoolId || schoolId === "—") return "—";
    const school = schoolsList.find(s => s.id === schoolId);
    return school ? school.name : schoolId;
  };

  // Get dynamic unique list of districts or fallback to static DISTRICTS array
  const uniqueDistricts = Array.from(new Set(schoolsList.map(s => s.district))).filter(Boolean).sort();
  const displayDistricts = uniqueDistricts.length > 0 ? uniqueDistricts : DISTRICTS;

  // Filter blocks list dynamically for form
  const availableBlocks = form.district
    ? Array.from(new Set(schoolsList.filter(s => s.district === form.district).map(s => s.block))).filter(Boolean).sort()
    : [];

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">👥 User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Create, edit, activate or deactivate users across all portal roles</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition border border-slate-600">
            ⬆️ Import CSV
          </button>
          <button onClick={openAdd} className="text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition">
            + Add User
          </button>
        </div>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
        {ROLES.map((r) => (
          <button key={r} onClick={() => setFilterRole(filterRole === r ? "ALL" : r)}
            className={`rounded-xl p-2 text-center border transition-all ${
              filterRole === r ? roleColors[r] + " ring-1 ring-offset-0" : "bg-slate-900/60 border-slate-800 hover:border-slate-600"
            }`}>
            <div className="text-lg">{roleIcons[r]}</div>
            <div className="text-[8px] font-bold text-white leading-tight mt-0.5">{r.replace("SUPERADMIN","S.ADMIN")}</div>
            <div className="text-[8px] text-slate-500">{loading ? "..." : (roleCounts[r] || "0")}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name or email..."
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 w-56 focus:outline-none focus:border-violet-500"
        />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
          <option value="ALL">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
          <option value="ALL">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* District Filter */}
        <select value={filterDistrict} onChange={(e) => { setFilterDistrict(e.target.value); setFilterSchool("ALL"); }}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
          <option value="ALL">All Districts</option>
          {displayDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* School Filter */}
        <select value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 max-w-xs">
          <option value="ALL">All Schools</option>
          {schoolsList.filter(s => filterDistrict === "ALL" || s.district === filterDistrict).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <span className="text-[10px] text-slate-500 ml-auto">{filtered.length} users shown</span>
      </div>

      {/* Loading & Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 glass rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-2"></div>
          <span className="text-xs text-slate-400">Loading user database...</span>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <style>{`
            :root:not(.dark) div.glass td div.user-avatar-initial,
            html:not(.dark) div.glass td div.user-avatar-initial,
            .user-avatar-initial {
              color: #ffffff !important;
            }
          `}</style>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="user-avatar-initial w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name ? u.name[0].toUpperCase() : "?"}
                        </div>
                        <span className="text-xs font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="font-mono">{u.email}</td>
                    <td>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleColors[u.role]}`}>{u.role}</span>
                    </td>
                    <td>
                      <div>{u.district}</div>
                      {u.school !== "—" && <div className="text-slate-600 text-[10px]">{getSchoolName(u.school)}</div>}
                    </td>
                    <td>{u.joined}</td>
                    <td>
                      <button 
                        type="button"
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          u.status === "active"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600"
                        }`}
                        title={u.status === "active" ? "User Active (Click to deactivate)" : "User Inactive (Click to activate)"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            u.status === "active" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(u)} className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold">Edit</button>
                        <button onClick={() => deleteUser(u.id)} className="text-[10px] text-red-400 hover:text-red-300 font-semibold">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span>
                  Showing <strong className="text-white">{filtered.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
                  <strong className="text-white">{endIndex}</strong> of <strong className="text-white">{filtered.length}</strong> users
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
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  Previous
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
                                ? "bg-violet-600 text-white shadow-md"
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
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-5">{editUser ? "✏️ Edit User" : "➕ Add New User"}</h3>
            <div className="space-y-3">

              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@tn.gov.in"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Mobile <span className="normal-case text-slate-600">(optional)</span></label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* EMIS ID — shown only for STUDENT */}
              {form.role === "STUDENT" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">EMIS ID <span className="normal-case text-slate-600">(optional)</span></label>
                  <input
                    type="text"
                    value={form.emisId}
                    onChange={(e) => setForm((f) => ({ ...f, emisId: e.target.value }))}
                    placeholder="Student EMIS ID"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Password {!editUser && "*"}</label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editUser ? "Leave blank to keep unchanged" : "Set account password"}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
                  {ROLES.map((r) => <option key={r} value={r}>{roleIcons[r]} {r}</option>)}
                </select>
              </div>

              {/* School selector — TEACHER, STUDENT, HEADMASTER, PARENT */}
              {["TEACHER", "STUDENT", "HEADMASTER", "PARENT"].includes(form.role) && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">School *</label>
                    <select
                      value={form.school}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                    >
                      <option value="">— Select School —</option>
                      {schoolsList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.block})</option>
                      ))}
                    </select>
                    {schoolsList.length === 0 && (
                      <p className="text-[10px] text-amber-500 mt-1">⚠ No schools found. Add schools first via the Schools page.</p>
                    )}
                  </div>
                  {form.school && (
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                      <div>
                        <span className="font-bold block uppercase text-[8px] text-slate-500">District</span>
                        {form.district || "—"}
                      </div>
                      <div>
                        <span className="font-bold block uppercase text-[8px] text-slate-500">Block</span>
                        {form.block || "—"}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* BEO — district + block */}
              {form.role === "BEO" && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">District *</label>
                    <select
                      value={form.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                    >
                      <option value="">— Select District —</option>
                      {displayDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Block *</label>
                    {availableBlocks.length > 0 ? (
                      <select
                        value={form.block}
                        onChange={(e) => handleBlockChange(e.target.value)}
                        disabled={!form.district}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      >
                        <option value="">— Select Block —</option>
                        {availableBlocks.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={form.block}
                        onChange={(e) => setForm((f) => ({ ...f, block: e.target.value }))}
                        placeholder={form.district ? `Type block name in ${form.district}` : "Select district first"}
                        disabled={!form.district}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 disabled:opacity-50 font-mono"
                      />
                    )}
                    {form.district && availableBlocks.length === 0 && (
                      <p className="text-[10px] text-sky-500 mt-1">ℹ No blocks from DB — type block name manually.</p>
                    )}
                  </div>
                </>
              )}

              {/* DEO — district only */}
              {form.role === "DEO" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">District *</label>
                  <select
                    value={form.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">— Select District —</option>
                    {displayDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* COMMISSIONER / MINISTER — assigned region */}
              {["COMMISSIONER", "MINISTER"].includes(form.role) && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Assigned Region <span className="normal-case text-slate-600">(optional)</span></label>
                  <input
                    type="text"
                    value={form.assignedRegion}
                    onChange={(e) => setForm((f) => ({ ...f, assignedRegion: e.target.value }))}
                    placeholder={form.role === "MINISTER" ? "e.g. Tamil Nadu" : "e.g. South Zone / Tamil Nadu"}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              )}

            </div>
            <div className="flex gap-3 mt-6 font-mono">
              <button onClick={() => setShowModal(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg transition border border-slate-700">Cancel</button>
              <button onClick={saveUser} className="flex-1 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 py-2 rounded-lg transition">
                {editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
