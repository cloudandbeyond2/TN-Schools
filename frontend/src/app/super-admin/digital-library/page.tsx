"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Upload, FileText, CheckCircle2, AlertCircle, Building, Book } from "lucide-react";
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

export default function SuperAdminDigitalLibraryPage() {
  const { data: session } = useSession();
  const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "E-books",
    subject: "",
    class: "10",
    description: "",
    fileUrl: "",
    schoolId: ""
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Fetch schools for the dropdown
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schools`);
        const data = await res.json();
        if (data.success) {
          setSchools(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch schools:", err);
      }
    };
    fetchSchools();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("subject", formData.subject);
      submitData.append("class", formData.class);
      submitData.append("description", formData.description);
      submitData.append("fileUrl", formData.fileUrl);
      submitData.append("schoolId", formData.schoolId);
      submitData.append("role", "SUPER_ADMIN");
      submitData.append("userId", (session?.user as any)?.id || "admin");
      
      if (selectedFile) {
        submitData.append("file", selectedFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload`, {
        method: "POST",
        body: submitData
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Resource uploaded successfully! It is now pending Headmaster approval." });
        setFormData({ ...formData, title: "", description: "", fileUrl: "", subject: "" });
        setSelectedFile(null);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload resource." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred during upload." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout title="Digital Library Management" subtitle="Upload and distribute resources to schools" accentColor="#8b5cf6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Resource</h2>
              <p className="text-slate-500 dark:text-slate-400">Push new materials to a specific school's digital library.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resource Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500" 
                  placeholder="e.g., Advanced Mathematics Guide"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target School *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <select 
                    required
                    value={formData.schoolId}
                    onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-violet-500 appearance-none"
                  >
                    <option value="" disabled>Select a school to distribute to</option>
                    <option value="global">🌐 Global (All Schools)</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Level *</label>
                <select 
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500"
                >
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500" 
                  placeholder="e.g., Physics"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">File Upload (PDF/Image/Video)</label>
                <input 
                  type="file"
                  accept="image/*,application/pdf,video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-violet-500" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">OR File URL</label>
                <input 
                  type="url" 
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500" 
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500" 
                placeholder="Add a brief description of the material..."
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button 
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload to School"} <Upload className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
