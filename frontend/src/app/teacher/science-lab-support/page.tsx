"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  Beaker,
  Settings,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  Package,
  PlusCircle,
  FileText,
  Search,
  Eye,
  Microscope,
  Zap,
  Flame,
  X
} from "lucide-react";

export default function ScienceLabSupportPage() {
  const [activeTab, setActiveTab] = useState("inventory");

  const [inventory, setInventory] = useState([
    { id: 1, item: "Super Magnify Microscope", status: "Good", count: 15, location: "Cabinet A", icon: <Microscope />, color: "emerald" },
    { id: 2, item: "Bunsen Burners", status: "Needs Maintenance", count: 24, location: "Cabinet B", icon: <Flame />, color: "rose" },
    { id: 3, item: "Magic Beaker Set", status: "Low Stock", count: 8, location: "Shelf 1", icon: <Beaker />, color: "amber" },
    { id: 4, item: "Safety Goggles", status: "Good", count: 40, location: "Entrance Rack", icon: <Eye />, color: "blue" },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const item = formData.get("item") as string;
    const location = formData.get("location") as string;
    const count = parseInt(formData.get("count") as string) || 0;
    const status = formData.get("status") as string;

    setInventory([...inventory, { id: Date.now(), item, location, count, status, icon: <Package />, color: "indigo" }]);
    setModalOpen(false);
    showToast("Awesome! New item added to the lab! 🧪");
  };

  return (
    <PortalLayout
      title="Mad Scientist Lab! 🧪"
      subtitle="Discover cool equipment, run safe experiments, and explore!"
    >
      <div className="flex flex-col gap-8">

        {/* Playful Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-emerald-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Lab Power Level</p>
              <h3 className="text-4xl font-black text-emerald-500 drop-shadow-sm">92%</h3>
              <p className="text-sm text-emerald-600 font-bold mt-2">Ready for Action! 🚀</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Broken Stuff</p>
              <h3 className="text-4xl font-black text-amber-500 drop-shadow-sm">4</h3>
              <p className="text-sm text-amber-600 font-bold mt-2">Needs Fixing 🛠️</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 text-amber-500 flex items-center justify-center shadow-inner">
              <Wrench className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-blue-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Next Inspection</p>
              <h3 className="text-4xl font-black text-blue-500 drop-shadow-sm">12 Oct</h3>
              <p className="text-sm text-blue-600 font-bold mt-2">Safety First! 🥽</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-100 text-blue-500 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-800 p-2 rounded-[2.5rem] shadow-xl border-4 border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Playful Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-2 mb-4 gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 min-w-[150px] px-6 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all ${activeTab === "inventory"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
            >
              <Package className="w-5 h-5" />
              Treasure Chest
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex-1 min-w-[150px] px-6 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all ${activeTab === "maintenance"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
            >
              <Settings className="w-5 h-5" />
              Fix-It Logs
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`flex-1 min-w-[150px] px-6 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all ${activeTab === "safety"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              Safety Rules
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "inventory" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 font-bold" />
                    <input
                      type="text"
                      placeholder="Search for cool lab stuff..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-emerald-100 dark:border-slate-700 text-emerald-900 dark:text-emerald-100 rounded-3xl py-3 pl-12 pr-4 text-base font-bold focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all shadow-inner placeholder:text-emerald-300 dark:placeholder:text-emerald-700"
                    />
                  </div>
                  <button onClick={() => setModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-sm font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30">
                    <PlusCircle className="w-5 h-5 text-black" /> Add New Gear!
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {inventory.map((item, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-4 border-${item.color}-100 dark:border-slate-700 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col relative overflow-hidden`}>
                      <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none scale-[3] -translate-y-1/4 translate-x-1/4 text-${item.color}-500`}>
                        {item.icon}
                      </div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                          {React.cloneElement(item.icon as React.ReactElement, { className: "w-7 h-7" })}
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-2 ${item.status === 'Good' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                          item.status === 'Low Stock' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                            'bg-rose-100 text-rose-600 border-rose-200'
                          }`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 relative z-10">{item.item}</h4>
                      <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2 relative z-10">
                        📍 {item.location}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-slate-100 dark:border-slate-700 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-slate-400">Quantity</span>
                          <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{item.count}</span>
                        </div>
                        <button onClick={() => showToast(`Opening settings for ${item.item}... ⚙️`)} className={`w-10 h-10 rounded-xl bg-${item.color}-50 hover:bg-${item.color}-100 flex items-center justify-center text-${item.color}-600 transition-colors active:scale-95`}>
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab !== "inventory" && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Building this section! 🚧</h3>
                <p className="text-base font-bold text-slate-500 mt-2">Check back soon for more cool stuff.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 border-4 border-emerald-500/30">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Add Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-emerald-100 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-emerald-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">Add New Lab Gear!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What is it? 📦</label>
                <input required name="item" type="text" placeholder="e.g., Giant Magnet" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Where does it live? 📍</label>
                <input required name="location" type="text" placeholder="e.g., The Secret Cupboard" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">How Many? 🔢</label>
                  <input required name="count" type="number" placeholder="5" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Status 🩺</label>
                  <select required name="status" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all">
                    <option value="Good">Good ✅</option>
                    <option value="Low Stock">Low Stock ⚠️</option>
                    <option value="Needs Maintenance">Broken ❌</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95">
                  Save It!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
