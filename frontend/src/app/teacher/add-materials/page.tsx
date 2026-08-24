"use client";
import { BookOpen, Folder, Archive, Star, X } from "lucide-react";


import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";

interface Material {
  id: string;
  title: string;
  category: "Notes" | "Worksheet" | "Video Reference" | "Exam Prep";
  classSection: string;
  format: string;
  size: string;
  date: string;
}

export default function AddMaterialsPage() {
  const { t } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Material["category"]>("Notes");
  const [targetClass, setTargetClass] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string>("");
  const [selectedFileFormat, setSelectedFileFormat] = useState<string>("PDF");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Notes" | "Worksheet" | "Video Reference" | "Exam Prep">("All");

  // Fetch teacher classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTeacherClasses(data.data);
          if (data.data.length > 0) {
            setTargetClass(`Class ${data.data[0].className}${data.data[0].section}`);
          }
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, session, API_URL]);

  const fetchMaterials = async () => {
    if (!schoolId || teacherClasses.length === 0) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/materials?schoolId=${schoolId || ""}`);
      const result = await res.json();
      if (result.success && result.data) {
        const filtered = result.data.filter((m: any) =>
          teacherClasses.some(tc => `Class ${tc.className}${tc.section}` === m.classSection)
        );
        setMaterials(filtered);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [schoolId, teacherClasses]);

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedFileName(file.name);
      
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFileSize(`${sizeInMB} MB`);

      const extension = file.name.split('.').pop()?.toUpperCase() || "PDF";
      setSelectedFileFormat(extension);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFileName || !selectedFile) return;

    try {
      Swal.fire({
        title: "Uploading...",
        text: "Please wait while we upload the study resource.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const fileData = await fileToBase64(selectedFile);

      const res = await fetch(`${API_URL}/api/teacher/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          classSection: targetClass,
          format: selectedFileFormat,
          size: selectedFileSize,
          schoolId: schoolId || null,
          userId: (session?.user as any)?.id,
          fileData,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setMaterials([result.data, ...materials]);
        setTitle("");
        setSelectedFile(null);
        setSelectedFileName(null);
        setSelectedFileSize("");
        setSelectedFileFormat("PDF");
        if (fileInputRef.current) fileInputRef.current.value = "";
        Swal.fire({
          icon: "success",
          title: "Uploaded!",
          text: "Resource has been uploaded and distributed to students.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: result.error || "Failed to upload resource.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error uploading material:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while uploading.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      Swal.fire({
        title: "Downloading...",
        text: `Downloading "${material.title}" from the server...`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });

      const response = await fetch(`${API_URL}/api/teacher/materials/download/${material.id}`);
      if (!response.ok) {
        throw new Error("File download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${material.title}.${material.format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Could not download file. The file might be missing on the server.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Resource?",
      text: "Are you sure you want to permanently delete this study material?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      background: "#ffffff",
      color: "#1a1a2e",
      confirmButtonColor: "#E84400",
      cancelButtonColor: "#3D3580",
      buttonsStyling: true,
      customClass: {
        popup: "rounded-2xl border border-[#e5e7eb]",
        title: "text-lg font-bold text-[#111827] font-sans",
        htmlContainer: "text-sm text-[#475569] font-sans",
        confirmButton: "rounded-xl px-4 py-2 text-xs font-bold text-white",
        cancelButton: "rounded-xl px-4 py-2 text-xs font-bold text-white",
      }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/materials/${id}`, {
        method: "DELETE",
      });
      const resultData = await res.json();
      if (resultData.success) {
        setMaterials(materials.filter((m) => m.id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "The resource has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#ffffff",
          color: "#1a1a2e",
          customClass: {
            popup: "rounded-2xl border border-[#e5e7eb]",
            title: "text-base font-bold text-[#111827] font-sans",
            htmlContainer: "text-xs text-[#475569] font-sans"
          }
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: resultData.error || "Failed to delete the resource.",
          icon: "error",
          background: "#ffffff",
          color: "#1a1a2e",
          confirmButtonColor: "#3D3580",
          customClass: {
            popup: "rounded-2xl border border-[#e5e7eb]"
          }
        });
      }
    } catch (err) {
      console.error("Error deleting material:", err);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred while deleting.",
        icon: "error",
        background: "#ffffff",
        color: "#1a1a2e",
        confirmButtonColor: "#3D3580",
        customClass: {
          popup: "rounded-2xl border border-[#e5e7eb]"
        }
      });
    }
  };

  const filteredMaterials = materials.filter(
    (m) => activeTab === "All" || m.category === activeTab
  );

  return (
    <PortalLayout title="Study Materials & Resources" subtitle="Upload study documents, links, and worksheets.">
      <div className="space-y-6 text-left">
        {/* Top Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                <BookOpen className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Study Materials &amp; Resources Hub
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                  Upload, organize, and share study documents, worksheets, video references, and exam prep guides with your classes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upload form */}
        <div className="theme-card p-6 border border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4"><BookOpen className="w-4 h-4 inline-block mr-1 text-inherit" /> {t("upload_new_resource")}</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{t("resource_title")}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Periodic Table Reference Guide"
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{t("category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Material["category"])}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="Notes">{t("notes_category")}</option>
                  <option value="Worksheet">{t("worksheet_category")}</option>
                  <option value="Video Reference">{t("video_ref_category")}</option>
                  <option value="Exam Prep">{t("exam_prep_category")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{t("class_section")}</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  {teacherClasses.length > 0 ? (
                    teacherClasses.map((cls) => (
                      <option key={cls.id} value={`Class ${cls.className}${cls.section}`}>
                        Class {cls.className}{cls.section}
                      </option>
                    ))
                  ) : (
                    <option value="">{t("no_classes_assigned")}</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{t("file_attachment")}</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
              <div
                onClick={handleFileSelectClick}
                className="border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <span className="text-3xl block mb-2"><Folder className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
                <span className="text-xs text-[var(--text-muted)] font-medium block">
                  {selectedFileName ? `${selectedFileName} (${selectedFileSize})` : t("click_to_select")}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">{t("supports_formats")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!title || !selectedFileName}
              className="w-full py-2.5 bg-[var(--primary)] hover:bg-amber-600 disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {t("upload_and_distribute")}
            </button>
          </form>
        </div>

        {/* Directory details */}
        <div className="lg:col-span-2 theme-card p-6 border border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-semibold text-[var(--text-heading)]"><Archive className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> {t("study_materials_directory")}</h2>
            
            <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl">
              {(["All", "Notes", "Worksheet", "Video Reference", "Exam Prep"] as const).map((tab) => {
                const tabTranslated = 
                  tab === "All" ? t("all_tab") :
                  tab === "Notes" ? t("notes_category") :
                  tab === "Worksheet" ? t("worksheet_category") :
                  tab === "Video Reference" ? t("video_ref_category") :
                  tab === "Exam Prep" ? t("exam_prep_category") : tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-[var(--primary)] text-white shadow-sm font-bold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card)]"
                    }`}
                  >
                    {tabTranslated}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-[var(--text-muted)] text-xs">
                {t("loading_classes")}
              </div>
            ) : filteredMaterials.length > 0 ? (
              filteredMaterials.map((m) => {
                const categoryTranslated = 
                  m.category === "Notes" ? t("notes_category") :
                  m.category === "Worksheet" ? t("worksheet_category") :
                  m.category === "Video Reference" ? t("video_ref_category") :
                  m.category === "Exam Prep" ? t("exam_prep_category") : m.category;
                return (
                  <div
                    key={m.id}
                    className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 bg-[var(--primary)]/10 text-amber-400 border border-[var(--primary)]/20 rounded-md">
                          {categoryTranslated}
                        </span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">{m.classSection}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-heading)] mb-0.5">{m.title}</h3>
                      <div className="text-[10px] text-[var(--text-muted)] font-semibold">
                        {t("all_tab") === "All" ? "Format" : "வடிவம்"}: <span className="text-[var(--text-muted)]">{m.format}</span> · {t("all_tab") === "All" ? "Size" : "அளவு"}: <span className="text-[var(--text-muted)]">{m.size}</span> · {t("all_tab") === "All" ? "Uploaded" : "பதிவேற்றப்பட்டது"}: <span className="text-[var(--text-muted)]">{m.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDownload(m)}
                        className="p-2 bg-[var(--bg-card)] hover:bg-slate-700 text-[var(--text-heading)] rounded-lg text-xs transition-colors border border-[var(--border)]"
                      >
                        {t("all_tab") === "All" ? "⬇ Download" : "⬇ பதிவிறக்கு"}
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
                      >
                        <X className="w-4 h-4 inline-block mr-1 text-inherit" /> {t("all_tab") === "All" ? "Delete" : "நீக்கு"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-[var(--text-muted)] text-xs italic">
                {t("all_tab") === "All" ? "No materials uploaded in this category." : "இந்த பிரிவில் எந்த பொருட்களும் பதிவேற்றப்படவில்லை."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </PortalLayout>
  );
}
