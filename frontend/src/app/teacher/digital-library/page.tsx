"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Upload, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
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

export default function TeacherDigitalLibraryPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: "", type: "E-books", subject: "", class: "10", description: "", fileUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "TEACHER",
          userId: session?.user?.id,
          schoolId: session?.user?.schoolId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Resource submitted! It is now pending Headmaster approval." });
        setFormData({ ...formData, title: "", description: "", fileUrl: "", subject: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit resource." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "An error occurred during submission." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout title="Contribute to Library" subtitle="Share valuable resources with your students" accentColor="#10b981">
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Submit New Resource</h2>
              <p className="text-slate-500 dark:text-slate-400">Your materials will be available to students once approved by the headmaster.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Level *</label>
                <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700">
                  {CLASSES.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700" placeholder="e.g., Biology" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">File URL</label>
                <input type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700" placeholder="Explain what students will learn..." />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                {loading ? "Submitting..." : "Submit for Approval"} <Upload className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalLayout>
  );
}
