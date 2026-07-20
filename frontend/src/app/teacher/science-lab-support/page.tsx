"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import { Beaker, Settings, AlertTriangle, Wrench, ClipboardCheck, Package, PlusCircle, FileText, Search, Eye, Microscope, Zap, Flame, X, Trash2, CheckCircle, Rocket, Star, FlaskConical, MapPin, Construction, Hash, Stethoscope } from "lucide-react";

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
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
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

  // Handle Add or Edit Save
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const item = formData.get("item") as string;
    const location = formData.get("location") as string;
    const count = parseInt(formData.get("count") as string) || 1;
    const status = formData.get("status") as string;

    const payload = {
      name: item,
      location,
      count,
      status,
      classSection: currentItem?.raw?.classSection || "Science Lab",
      date: currentItem?.raw?.date || new Date().toLocaleDateString("en-IN"),
      safetyCheck: true,
      schoolId
    };

    try {
      if (isEdit && currentItem) {
        // Edit mode (PUT)
        const res = await fetch(`${API_URL}/api/teacher/labs/${currentItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Gear Updated!",
            text: `Successfully updated ${item}.`,
            confirmButtonColor: "#10b981",
          });
          fetchInventory();
        }
      } else {
        // Add mode (POST)
        const res = await fetch(`${API_URL}/api/teacher/labs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Gear Added!",
            text: `Successfully added ${item} to lab inventory.`,
            confirmButtonColor: "#10b981",
          });
          fetchInventory();
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving lab equipment:", error);
      Swal.fire({
        icon: "error",
        title: "Database Connection Error",
        text: "Could not save the item. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Handle Delete
  const handleDeleteItem = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: `Remove ${name}?`,
      text: "This item will be permanently deleted from PostgreSQL database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/teacher/labs/${id}`, {
          method: "DELETE"
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${name} has been removed from inventory.`,
            confirmButtonColor: "#10b981",
          });
          fetchInventory();
        }
      } catch (err) {
        console.error("Error deleting lab equipment:", err);
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: "An error occurred while deleting the item.",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setIsEdit(true);
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentItem(null);
    setModalOpen(true);
  };

  // Filter inventory based on search query
  const filteredInventory = inventory.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stat counts by summing up the quantities (item.count)
  const brokenCount = inventory
    .filter((i) => i.status === "Needs Maintenance")
    .reduce((sum, item) => sum + item.count, 0);

  const lowStockCount = inventory
    .filter((i) => i.status === "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const totalCount = inventory.reduce((sum, item) => sum + item.count, 0);

  // Treat anything that isn't Broken or Low Stock as Good (completed, scheduled, Good, etc.)
  const goodCount = inventory
    .filter((i) => i.status !== "Needs Maintenance" && i.status !== "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const powerLevel = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100;

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "அறிவியல் ஆய்வக ஆதரவு" : "Science Lab Support"}
      subtitle={lang === "தமிழ்" ? "ஆய்வக உபகரணங்களை ஆராயுங்கள், சரக்கு பதிவுகளை நிர்வகியுங்கள் மற்றும் பாதுகாப்பு சரிபார்ப்பு பட்டியலைக் கண்காணியுங்கள்." : "Discover cool equipment, manage inventory logs, and track safety checklist."}
    >
      <div className="flex flex-col gap-8">

        {/* Playful Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-emerald-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "ஆய்வக ஆற்றல் நிலை" : "Lab Power Level"}</p>
              <h3 className="text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-sm">{powerLevel}%</h3>
              <p className="text-sm text-emerald-600 font-bold mt-2">{lang === "தமிழ்" ? "செயல்பட தயார்!" : "Ready for Action!"} <Rocket className="w-4 h-4 inline-block mr-1 text-inherit" /></p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
              <Zap className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "பழுதடைந்தவை" : "Broken Stuff"}</p>
              <h3 className="text-4xl font-black text-rose-500 dark:text-rose-400 drop-shadow-sm">{brokenCount}</h3>
              <p className="text-sm text-rose-600 font-bold mt-2">{lang === "தமிழ்" ? "சரிசெய்யப்பட வேண்டும்" : "Needs Fixing"} <Wrench className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /></p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/20">
              <Wrench className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 flex items-center justify-between hover:scale-105 transition-all">
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "குறைந்த கையிருப்பு" : "Low Stock Gear"}</p>
              <h3 className="text-4xl font-black text-amber-500 dark:text-amber-400 drop-shadow-sm">{lowStockCount}</h3>
              <p className="text-sm text-amber-600 font-bold mt-2">{lang === "தமிழ்" ? "நிரப்பப்பட வேண்டும்" : "Refill Needed"} <FlaskConical className="w-4 h-4 inline-block mr-1 text-inherit" /></p>
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
              {lang === "தமிழ்" ? "இருப்புப் பட்டியல்" : "Treasure Chest (Inventory)"}
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
              {lang === "தமிழ்" ? "பராமரிப்புப் பதிவுகள்" : "Fix-It Logs"}
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
              {lang === "தமிழ்" ? "பாதுகாப்பு விதிகள்" : "Safety Rules"}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "inventory" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 font-bold" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "தமிழ்" ? "ஆய்வக உபகரணங்களைத் தேடுங்கள்..." : "Search for cool lab stuff..."}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-3xl py-3 pl-12 pr-4 text-base font-semibold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button 
                    onClick={handleOpenCreate} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
                  >
                    <PlusCircle className="w-5 h-5 text-white" stroke="white" /> {lang === "தமிழ்" ? "புதிய உபகரணத்தைச் சேர்!" : "Add New Gear!"}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4" />
                    <span>{lang === "தமிழ்" ? "தரவுத்தள பதிவுகளை அணுகுகிறது..." : "Accessing PostgreSQL records..."}</span>
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

                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 relative z-10 text-left">{item.item}</h4>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 relative z-10 text-left">
                          <MapPin className="w-4 h-4 inline-block mr-1 text-inherit" /> {item.location}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">{lang === "தமிழ்" ? "அளவு" : "Quantity"}</span>
                            <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{item.count}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenEdit(item)} 
                              className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 flex items-center justify-center text-blue-500 dark:text-blue-400 transition-colors active:scale-95 animate-none"
                              title="Edit Gear"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id, item.item)} 
                              className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-100/30 dark:hover:bg-rose-950/20 flex items-center justify-center text-rose-500 dark:text-rose-400 transition-colors active:scale-95 animate-none"
                              title="Delete Gear"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs italic">
                    {lang === "தமிழ்" ? "உங்கள் தேடலுக்குப் பொருந்தும் உபகரணங்கள் எதுவும் இல்லை." : "No lab gear matches your search query."}
                  </div>
                )}
              </div>
            )}

            {activeTab !== "inventory" && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">{lang === "தமிழ்" ? "இப்பிரிவு உருவாக்கத்தில் உள்ளது!" : "Building this section!"} <Construction className="w-4 h-4 inline-block mr-1 text-inherit" /></h3>
                <p className="text-base font-bold text-slate-500 mt-2">{lang === "தமிழ்" ? "மேலும் பல தகவல்களுக்கு விரைவில் மீண்டும் வாருங்கள்." : "Check back soon for more cool stuff."}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">
                {isEdit 
                  ? (lang === "தமிழ்" ? " உபகரணத்தைத் திருத்து" : " Modify Lab Gear") 
                  : (lang === "தமிழ்" ? " புதிய உபகரணத்தைச் சேர்!" : " Add New Lab Gear!")
                }
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:scale-110 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-4 space-y-5">
              <div className="text-left">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "இது என்ன உபகரணம்?" : "What is it?"} <Package className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                <input 
                  required 
                  name="item" 
                  type="text" 
                  defaultValue={currentItem?.item || ""}
                  placeholder="e.g., Giant Magnet" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" 
                />
              </div>
              
              <div className="text-left">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "இது எங்கே வைக்கப்பட்டுள்ளது?" : "Where does it live?"} <MapPin className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                <input 
                  required 
                  name="location" 
                  type="text" 
                  defaultValue={currentItem?.location || ""}
                  placeholder="e.g., The Secret Cupboard" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "எத்தனை எண்ணிக்கை?" : "How Many?"} <Hash className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <input 
                    required 
                    name="count" 
                    type="number" 
                    defaultValue={currentItem?.count || 1}
                    placeholder="5" 
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "நிலை" : "Status"} <Stethoscope className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <select 
                    required 
                    name="status" 
                    defaultValue={currentItem?.status || "Good"}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="Good">{lang === "தமிழ்" ? "நல்ல நிலை" : "Good"} ✓</option>
                    <option value="Low Stock">{lang === "தமிழ்" ? "குறைந்த கையிருப்பு" : "Low Stock"} ⚠️</option>
                    <option value="Needs Maintenance">{lang === "தமிழ்" ? "பழுதடைந்துள்ளது" : "Broken"} ❌</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
                >
                  {lang === "தமிழ்" ? "ரத்து செய்" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                >
                  {lang === "தமிழ்" ? "சேமி" : "Save Gear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
