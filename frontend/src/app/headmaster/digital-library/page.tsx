"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Upload, CheckCircle2, AlertCircle, Check, X, FileText, Clock, Library } from "lucide-react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'upload' | 'approvals'>('approvals');
  
  // Upload State
  const [formData, setFormData] = useState({
    title: "", type: "E-books", subject: "", class: "10", description: "", fileUrl: ""
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Approvals State
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);

  const fetchPending = async () => {
    if (!session?.user?.schoolId) return;
    try {
      setApprovalsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload/pending?schoolId=${session.user.schoolId}`);
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

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPending();
    }
  }, [activeTab, session?.user?.schoolId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMessage(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "HEADMASTER",
          userId: session?.user?.id,
          schoolId: session?.user?.schoolId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setUploadMessage({ type: "success", text: "Resource directly uploaded and approved for your school!" });
        setFormData({ ...formData, title: "", description: "", fileUrl: "", subject: "" });
      } else {
        setUploadMessage({ type: "error", text: data.error || "Failed to upload resource." });
      }
    } catch (err) {
      console.error(err);
      setUploadMessage({ type: "error", text: "An error occurred during upload." });
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
    <PortalLayout title="Library Management" subtitle="Manage and approve digital resources for your school" accentColor="#0284c7">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'approvals' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Clock className="w-4 h-4" /> Pending Approvals
            {pendingItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">{pendingItems.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'upload' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Upload className="w-4 h-4" /> Direct Upload
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
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">File URL</label>
                  <input type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={uploadLoading} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
                  {uploadLoading ? "Publishing..." : "Publish Resource"} <Upload className="w-4 h-4" />
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
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">All caught up!</h3>
                <p className="text-slate-500 mt-2">There are no pending resources requiring your approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-700 rounded-lg">{item.type}</span>
                        <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">Class {item.class}</span>
                        <span className="text-xs text-slate-500 font-medium">Uploaded by: {item.uploadedByRole}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Subject: {item.subject}</div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
                      >
                        <Check className="w-5 h-5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-600 font-bold rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
