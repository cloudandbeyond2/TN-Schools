"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Upload, CheckCircle2, AlertCircle, Check, X, FileText, Clock, Library, Trash2, Folder, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

const CATEGORIES = [
  "E-books",
  "Reference books",
  "Educational videos",
  "Government learning materials",
  "Research content",
  "Competitive examination resources"
];
const CLASSES = ["6", "7", "8", "9", "10", "11", "12"];

export default function HeadmasterDigitalLibraryPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'upload' | 'approvals' | 'allResources'>('approvals');
  
  // Upload State
  const [formData, setFormData] = useState({
    title: "", type: "E-books", subject: "", class: "10", description: "", fileUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Approvals State
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);

  // All Resources State
  const [allResources, setAllResources] = useState<any[]>([]);
  const [allResourcesLoading, setAllResourcesLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const fetchPending = async () => {
    if (!(session?.user as any)?.schoolId) return;
    try {
      setApprovalsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload/pending?schoolId=${(session?.user as any)?.schoolId}`);
      const data = await res.json();
      if (data.success) {
        setPendingItems(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const fetchAllResources = async () => {
    if (!(session?.user as any)?.schoolId) return;
    try {
      setAllResourcesLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload/school/${(session?.user as any)?.schoolId}`);
      const data = await res.json();
      if (data.success) {
        setAllResources(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAllResourcesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPending();
    } else if (activeTab === 'allResources') {
      fetchAllResources();
    }
  }, [activeTab, (session?.user as any)?.schoolId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllResources(prev => prev.filter(item => item.id !== id));
        setPendingItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMessage(null);
    
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("subject", formData.subject);
      submitData.append("class", formData.class);
      submitData.append("description", formData.description);
      submitData.append("fileUrl", formData.fileUrl);
      submitData.append("role", "HEADMASTER");
      submitData.append("userId", (session?.user as any)?.id || "");
      submitData.append("schoolId", (session?.user as any)?.schoolId || "");
      
      if (selectedFile) {
        if (selectedFile.size > 4.5 * 1024 * 1024) {
          setUploadMessage({
            type: "error",
            text: "File size exceeds the 4.5MB serverless upload limit. Please optimize the file size or provide a direct File URL instead.",
          });
          setUploadLoading(false);
          return;
        }
        submitData.append("file", selectedFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload`, {
        method: "POST",
        body: submitData
      });
      
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("File is too large for the upload gateway (limit 4.5MB). Please use a smaller file size.");
        }
        if (res.status === 404) {
          throw new Error("Upload service is currently unavailable. Please contact the administrator.");
        }
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setUploadMessage({ type: "success", text: "Resource directly uploaded and approved for your school!" });
        setFormData({ ...formData, title: "", description: "", fileUrl: "", subject: "" });
        setSelectedFile(null);
      } else {
        setUploadMessage({ type: "error", text: data.error || "Failed to upload resource." });
      }
    } catch (err: any) {
      console.error(err);
      setUploadMessage({ type: "error", text: err.message || "An error occurred during upload." });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendingItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "நூலக மேலாண்மை" : "Library Management"} 
      subtitle={lang === "தமிழ்" ? "உங்கள் பள்ளிக்கான டிஜிட்டல் வளங்களை நிர்வகிக்கவும் மற்றும் அங்கீகரிக்கவும்" : "Manage and approve digital resources for your school"} 
      accentColor="#0284c7"
    >
      <div className="w-full space-y-6">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 ${activeTab === 'approvals' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" alt="pending" /> {lang === "தமிழ்" ? "ஒப்புதல்கள்" : "Pending"}
            {pendingItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">{pendingItems.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 ${activeTab === 'upload' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <img src="https://cdn-icons-png.flaticon.com/128/109/109612.png" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" alt="upload" /> {lang === "தமிழ்" ? "பதிவேற்றம்" : "Direct Upload"}
          </button>
          <button 
            onClick={() => setActiveTab('allResources')}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1 sm:gap-2 ${activeTab === 'allResources' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <img src="https://cdn-icons-png.flaticon.com/128/2232/2232688.png" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" alt="library" /> {lang === "தமிழ்" ? "அனைத்து வளங்கள்" : "Resources"}
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Upload School Resource</h2>
            {uploadMessage && (
              <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {uploadMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-medium">{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class *</label>
                  <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700">
                    {CLASSES.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                  <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">File Upload (PDF/Image/Video)</label>
                  <input type="file" accept="image/*,application/pdf,video/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">OR File URL</label>
                  <input type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={uploadLoading} className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploadLoading ? "Publishing..." : "Publish Resource"} 
                  <img src="https://cdn-icons-png.flaticon.com/128/109/109612.png" className="w-4 h-4 invert" alt="upload" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            {approvalsLoading ? (
              <div className="text-center py-12 text-slate-500">Loading pending items...</div>
            ) : pendingItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <img src="https://cdn-icons-png.flaticon.com/128/190/190411.png" className="w-16 h-16 mx-auto mb-4 opacity-80" alt="all caught up" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">All caught up!</h3>
                <p className="text-slate-500 mt-2">There are no pending resources requiring your approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 overflow-hidden">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-sky-100 text-sky-700 rounded-lg">{item.type}</span>
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">Class {item.class}</span>
                        <span className="text-[10px] sm:text-xs text-slate-500 font-medium break-all">Uploaded by: {item.uploadedByRole}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                      <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Subject: {item.subject}</div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto flex-shrink-0">
                      <button 
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-all border border-emerald-200"
                      >
                        <img src="https://cdn-icons-png.flaticon.com/128/190/190411.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="approve" /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-600 text-sm font-bold rounded-xl transition-all"
                      >
                        <img src="https://cdn-icons-png.flaticon.com/128/463/463612.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="reject" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Resources Tab */}
        {activeTab === 'allResources' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            {allResourcesLoading ? (
              <div className="text-center py-12 text-slate-500">Loading resources...</div>
            ) : allResources.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <img src="https://cdn-icons-png.flaticon.com/128/2232/2232688.png" className="w-16 h-16 mx-auto mb-4 opacity-50 grayscale" alt="library empty" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No resources found</h3>
                <p className="text-slate-500 mt-2">Your school's library is empty.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <button onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }} className="hover:text-sky-600 transition-colors">Resources</button>
                  {selectedGrade && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <button onClick={() => setSelectedSubject(null)} className="hover:text-sky-600 transition-colors">Class {selectedGrade}</button>
                    </>
                  )}
                  {selectedGrade && selectedSubject && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800 dark:text-white">{selectedSubject}</span>
                    </>
                  )}
                </div>

                {!selectedGrade ? (
                  /* Grade Folders */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from(new Set(allResources.map(r => r.class))).sort((a, b) => Number(a) - Number(b)).map(grade => (
                      <button 
                        key={grade} 
                        onClick={() => setSelectedGrade(grade as string)}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-sky-500 hover:shadow-md transition-all group"
                      >
                        <Folder className="w-12 h-12 text-sky-500 group-hover:scale-110 transition-transform mb-3" />
                        <span className="font-bold text-slate-800 dark:text-white">Class {grade}</span>
                        <span className="text-xs text-slate-500 mt-1">{allResources.filter(r => r.class === grade).length} resources</span>
                      </button>
                    ))}
                  </div>
                ) : !selectedSubject ? (
                  /* Subject Folders */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from(new Set(allResources.filter(r => r.class === selectedGrade).map(r => r.subject))).sort().map(subject => (
                      <button 
                        key={subject as string} 
                        onClick={() => setSelectedSubject(subject as string)}
                        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all group"
                      >
                        <Folder className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform mb-3" />
                        <span className="font-bold text-slate-800 dark:text-white">{subject as string}</span>
                        <span className="text-xs text-slate-500 mt-1">{allResources.filter(r => r.class === selectedGrade && r.subject === subject).length} items</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Resources List */
                  <div className="grid grid-cols-1 gap-4">
                    {allResources.filter(item => item.class === selectedGrade && item.subject === selectedSubject).map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 overflow-hidden">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-sky-100 text-sky-700 rounded-lg">{item.type}</span>
                            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg ${item.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : item.approvalStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.approvalStatus}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-500 font-medium break-all">Uploaded by: {item.uploadedByRole}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto flex-shrink-0">
                          <button 
                            onClick={() => {
                              const url = item.fileUrl?.startsWith('/') 
                                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.fileUrl}` 
                                : item.fileUrl;
                              window.open(url, '_blank');
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-sky-50 text-sky-600 hover:bg-sky-100 text-sm font-bold rounded-xl transition-all"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/128/2983/2983155.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="view" /> View
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-600 text-sm font-bold rounded-xl transition-all"
                          >
                            <img src="https://cdn-icons-png.flaticon.com/128/3096/3096673.png" className="w-4 h-4 sm:w-5 sm:h-5" alt="delete" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
