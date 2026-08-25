"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

type Role = "STUDENT" | "TEACHER" | "PARENT" | "HEADMASTER" | "BEO" | "DEO" | "COMMISSIONER" | "MINISTER" | "SUPERADMIN";

interface User {
  id: number;
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

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleCounts, setRoleCounts] = useState<Record<string, string>>({
    STUDENT: "0", TEACHER: "0", PARENT: "0",
    HEADMASTER: "0", BEO: "0", DEO: "0",
    COMMISSIONER: "0", MINISTER: "0", SUPERADMIN: "0"
  });

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | Role>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "inactive">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"TEACHER" as Role, district:"", block:"", school:"" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/users");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((u: any) => ({
          id: u.id,
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
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchUsers();
    fetchCounts();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = async (id: number, currentStatus: string) => {
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

  const openAdd = () => { setEditUser(null); setForm({ name:"", email:"", password:"123456", role:"TEACHER", district:"", block:"", school:"" }); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ name:u.name, email:u.email, password: "", role:u.role, district:u.district, block:u.block, school:u.school }); setShowModal(true); };

  const saveUser = async () => {
    if (!form.name || !form.email) return;
    try {
      if (editUser) {
        const res = await apiFetch(`/api/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            district: form.district,
            block: form.block,
            schoolId: form.school === "—" ? null : form.school,
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
            role: form.role,
            district: form.district,
            block: form.block,
            schoolId: form.school === "—" ? null : form.school,
            password: form.password || "123456",
          }),
        });
        const data = await res.json();
        if (data.success) {
          const mappedNewUser = {
            id: data.data.id,
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

  const deleteUser = async (id: number) => {
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
            <div className="text-[8px] text-slate-500">{roleCounts[r] || "0"}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name or email..."
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-violet-500"
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
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
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
                      {u.school !== "—" && <div className="text-slate-600 text-[10px]">{u.school}</div>}
                    </td>
                    <td>{u.joined}</td>
                    <td>
                      <button onClick={() => toggleStatus(u.id, u.status)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${u.status === "active" ? "bg-emerald-500" : "bg-slate-700"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${u.status === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
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
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5">{editUser ? "✏️ Edit User" : "➕ Add New User"}</h3>
            <div className="space-y-3">
              {[
                { label:"Full Name", key:"name", placeholder:"Enter full name", type:"text" },
                { label:"Email", key:"email", placeholder:"email@tn.gov.in", type:"email" },
                { label:"Password", key:"password", placeholder: editUser ? "Leave blank to keep unchanged" : "Set account password", type:"text" },
                { label:"District", key:"district", placeholder:"e.g. Coimbatore", type:"text" },
                { label:"Block", key:"block", placeholder:"e.g. Coimbatore South", type:"text" },
                { label:"School / Office ID", key:"school", placeholder:"School ID or —", type:"text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500">
                  {ROLES.map((r) => <option key={r} value={r}>{roleIcons[r]} {r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
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
