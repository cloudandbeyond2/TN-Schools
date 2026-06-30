"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  Beaker,
  Settings,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  Package,
  FileText,
  Search,
  Eye,
  Microscope,
  Zap,
  Flame
} from "lucide-react";

interface InventoryItem {
  id: string;
  item: string;
  status: string;
  count: number;
  location: string;
  icon: React.ReactNode;
  color: string;
  raw: any;
}

export default function ScienceLabSupportPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map backend LabEquipment to UI InventoryItem
  const mapApiItemToInventoryItem = (apiItem: any): InventoryItem => {
    let icon = <Package />;
    let color = "indigo";
    const nameLower = apiItem.name.toLowerCase();
    
    if (nameLower.includes("microscope")) {
      icon = <Microscope />;
      color = "emerald";
    } else if (nameLower.includes("burner") || nameLower.includes("flame") || nameLower.includes("fire")) {
      icon = <Flame />;
      color = "rose";
    } else if (nameLower.includes("beaker") || nameLower.includes("flask") || nameLower.includes("tube") || nameLower.includes("glass")) {
      icon = <Beaker />;
      color = "amber";
    } else if (nameLower.includes("goggles") || nameLower.includes("eye") || nameLower.includes("safety")) {
      icon = <Eye />;
      color = "blue";
    }

    return {
      id: apiItem.id,
      item: apiItem.name,
      status: apiItem.status || "Good",
      count: apiItem.count || 1,
      location: apiItem.location || "Cabinet A",
      icon,
      color,
      raw: apiItem
    };
  };

  // Fetch Inventory from DB
  const fetchInventory = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInventory(data.data.map(mapApiItemToInventoryItem));
      }
    } catch (err) {
      console.error("Error fetching lab inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stat counts
  const brokenCount = inventory
    .filter((i) => i.status === "Needs Maintenance")
    .reduce((sum, item) => sum + item.count, 0);

  const lowStockCount = inventory
    .filter((i) => i.status === "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const totalCount = inventory.reduce((sum, item) => sum + item.count, 0);

  const goodCount = inventory
    .filter((i) => i.status !== "Needs Maintenance" && i.status !== "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const powerLevel = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100;

  return (
    <PortalLayout
      title="Science Lab Support 🧪"
      subtitle="Discover cool equipment, manage inventory logs, and track safety checklist."
    >
      <div className="flex flex-col gap-8 text-left">

        {/* Playful Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-lg border-4 border-emerald-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Lab Power Level</p>
              <h3 className="text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-sm">{powerLevel}%</h3>
              <p className="text-sm text-emerald-600 font-bold mt-2">Ready for Action! 🚀</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <Zap className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Broken Stuff</p>
              <h3 className="text-4xl font-black text-rose-500 dark:text-rose-400 drop-shadow-sm">{brokenCount}</h3>
              <p className="text-sm text-rose-600 font-bold mt-2">Needs Fixing 🛠️</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/20">
              <Wrench className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Low Stock Gear</p>
              <h3 className="text-4xl font-black text-amber-500 dark:text-amber-400 drop-shadow-sm">{lowStockCount}</h3>
              <p className="text-sm text-amber-600 font-bold mt-2">Refill Needed 🧪</p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-100 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-800 p-2 rounded-[2.5rem] shadow-xl border-4 border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Playful Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 mb-4 gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 min-w-[115px] sm:min-w-[150px] px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                activeTab === "inventory"
                  ? "bg-blue-600 text-white shadow-md sm:shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Package className="w-4 h-4 sm:w-5 h-5" />
              Treasure Chest (Inventory)
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex-1 min-w-[115px] sm:min-w-[150px] px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                activeTab === "maintenance"
                  ? "bg-blue-600 text-white shadow-md sm:shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 h-5" />
              Fix-It Logs
            </button>
            <button
              onClick={() => setActiveTab("safety")}
              className={`flex-1 min-w-[115px] sm:min-w-[150px] px-3 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                activeTab === "safety"
                  ? "bg-blue-600 text-white shadow-md sm:shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 sm:w-5 h-5" />
              Safety Rules
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "inventory" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 font-bold" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for cool lab stuff..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-3xl py-3 pl-12 pr-4 text-base font-semibold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4" />
                    <span>Loading lab gear...</span>
                  </div>
                ) : filteredInventory.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredInventory.map((item) => {
                      const colorStyles = {
                        indigo: {
                          wrapper: "border-indigo-100",
                          iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
                          iconText: "text-indigo-500 dark:text-indigo-400",
                          iconBorder: "border-indigo-100 dark:border-indigo-500/20"
                        },
                        emerald: {
                          wrapper: "border-emerald-100",
                          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
                          iconText: "text-emerald-500 dark:text-emerald-400",
                          iconBorder: "border-emerald-100 dark:border-emerald-500/20"
                        },
                        rose: {
                          wrapper: "border-rose-100",
                          iconBg: "bg-rose-50 dark:bg-rose-500/10",
                          iconText: "text-rose-500 dark:text-rose-400",
                          iconBorder: "border-rose-100 dark:border-rose-500/20"
                        },
                        amber: {
                          wrapper: "border-amber-100",
                          iconBg: "bg-amber-50 dark:bg-amber-500/10",
                          iconText: "text-amber-500 dark:text-amber-400",
                          iconBorder: "border-amber-100 dark:border-amber-500/20"
                        },
                        blue: {
                          wrapper: "border-blue-100",
                          iconBg: "bg-blue-50 dark:bg-blue-500/10",
                          iconText: "text-blue-500 dark:text-blue-400",
                          iconBorder: "border-blue-100 dark:border-blue-500/20"
                        }
                      } as Record<string, any>;
                      
                      const c = colorStyles[item.color] || colorStyles.indigo;

                      return (
                      <div key={item.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-4 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all group flex flex-col relative overflow-hidden ${c.wrapper}`}>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform ${c.iconBg} ${c.iconText} ${c.iconBorder}`}>
                            {React.cloneElement(item.icon as React.ReactElement, { className: "w-7 h-7" })}
                          </div>
                          
                          <span className={`text-[10px] font-black px-3 py-1 rounded-xl border-2 ${
                            item.status === 'Good' 
                              ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                            item.status === 'Low Stock' 
                              ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                              'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <h4 className="text-xl font-black text-slate-805 dark:text-slate-100 mb-2 relative z-10 text-left">{item.item}</h4>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 relative z-10 text-left">
                          📍 {item.location}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Quantity</span>
                            <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{item.count}</span>
                          </div>
                        </div>

                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs italic">
                    No lab gear matches your search query.
                  </div>
                )}
              </div>
            )}

            {activeTab !== "inventory" && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Building this section! 🚧</h3>
                <p className="text-base font-bold text-slate-500 mt-2">Check back soon for more cool stuff.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
