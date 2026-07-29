"use client";
import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";

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

const initialUsers: User[] = [
  { id:1, name:"Arjun Kumar", email:"student@gmail.com", role:"STUDENT", district:"Coimbatore", block:"Coimbatore South", school:"GHSS Coimbatore", status:"active", joined:"Jan 2026" },
  { id:2, name:"Mrs. Sumathi Devi", email:"teacher@gmail.com", role:"TEACHER", district:"Coimbatore", block:"Coimbatore South", school:"GHSS Coimbatore", status:"active", joined:"Aug 2025" },
  { id:3, name:"Rajesh Kumar", email:"parent@gmail.com", role:"PARENT", district:"Chennai", block:"T. Nagar", school:"GHS Anna Nagar", status:"active", joined:"Sep 2025" },
  { id:4, name:"Mr. Venkatesh R.", email:"headmaster@gmail.com", role:"HEADMASTER", district:"Coimbatore", block:"Coimbatore South", school:"GHSS Coimbatore", status:"active", joined:"Jun 2025" },
  { id:5, name:"Mr. Murugesan P.", email:"beo@gmail.com", role:"BEO", district:"Coimbatore", block:"Coimbatore South", school:"—", status:"active", joined:"Apr 2025" },
  { id:6, name:"DEO Officer", email:"deo@gmail.com", role:"DEO", district:"Coimbatore", block:"—", school:"—", status:"active", joined:"Mar 2025" },
  { id:7, name:"Commissioner", email:"commissioner@gmail.com", role:"COMMISSIONER", district:"State", block:"—", school:"—", status:"active", joined:"Jan 2025" },
  { id:8, name:"Minister", email:"minister@gmail.com", role:"MINISTER", district:"State", block:"—", school:"—", status:"active", joined:"Jan 2025" },
  { id:9, name:"Super Admin", email:"superadmin@gmail.com", role:"SUPERADMIN", district:"State", block:"—", school:"—", status:"active", joined:"Jan 2025" },
  { id:10, name:"Priya Lakshmi", email:"priya.l@tn.gov.in", role:"TEACHER", district:"Madurai", block:"Madurai East", school:"GHS Madurai", status:"active", joined:"Feb 2026" },
  { id:11, name:"Karthikeyan S.", email:"karthi.s@tn.gov.in", role:"BEO", district:"Salem", block:"Salem Block", school:"—", status:"inactive", joined:"Nov 2025" },
  { id:12, name:"Anitha R.", email:"anitha.r@tn.gov.in", role:"HEADMASTER", district:"Madurai", block:"Madurai East", school:"GHS Madurai", status:"active", joined:"Dec 2025" },
];

const roleCounts: Record<Role, string> = {
  STUDENT:"47,20,400", TEACHER:"2,10,000", PARENT:"38,00,000",
  HEADMASTER:"37,404", BEO:"385", DEO:"38",
  COMMISSIONER:"12", MINISTER:"1", SUPERADMIN:"3",
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | Role>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "inactive">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name:"", email:"", role:"TEACHER" as Role, district:"", block:"", school:"" });

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  };

  const openAdd = () => { setEditUser(null); setForm({ name:"", email:"", password:"123456", role:"TEACHER", district:"", block:"", school:"" }); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ name:u.name, email:u.email, password: u.role === "COMMISSIONER" ? "Commissioner@26" : "123456", role:u.role, district:u.district, block:u.block, school:u.school }); setShowModal(true); };

  const saveUser = () => {
    if (!form.name || !form.email) return;
    if (editUser) {
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, ...form } : u));
    } else {
      setUsers((prev) => [...prev, { id: Date.now(), ...form, status:"active", joined:"Jun 2026" }]);
    }
    setShowModal(false);
  };

  const deleteUser = (id: number) => setUsers((prev) => prev.filter((u) => u.id !== id));

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
            <div className="text-[8px] text-slate-500">{roleCounts[r]}</div>
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

      {/* Users Table */}
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
                        {u.name[0]}
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
                    {u.school !== "—" && <div className="text-slate-600">{u.school}</div>}
                  </td>
                  <td>{u.joined}</td>
                  <td>
                    <button onClick={() => toggleStatus(u.id)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5">{editUser ? "✏️ Edit User" : "➕ Add New User"}</h3>
            <div className="space-y-3">
              {[
                { label:"Full Name", key:"name", placeholder:"Enter full name", type:"text" },
                { label:"Email", key:"email", placeholder:"email@tn.gov.in", type:"email" },
                { label:"Password", key:"password", placeholder:"Set account password", type:"text" },
                { label:"District", key:"district", placeholder:"e.g. Coimbatore", type:"text" },
                { label:"Block", key:"block", placeholder:"e.g. Coimbatore South", type:"text" },
                { label:"School / Office", key:"school", placeholder:"School name or —", type:"text" },
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
