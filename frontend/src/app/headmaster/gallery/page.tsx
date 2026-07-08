"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";

interface GalleryItem {
  id: number;
  title: string;
  category: "Sports" | "Infrastructure" | "Culturals" | "Academic";
  date: string;
  description: string;
  gradient: string; // Dynamic visual simulation
  imageUrl?: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([
    { id: 1, title: "Science Lab Upgrade", category: "Infrastructure", date: "June 02, 2026", description: "New chemistry equipment and modern sinks installed in the combined science labs.", gradient: "from-cyan-500 via-blue-600 to-indigo-750" },
    { id: 2, title: "Annual Sports Hurdles", category: "Sports", date: "May 18, 2026", description: "High school girls competing in the 100m hurdles final on sports day.", gradient: "from-amber-400 via-orange-550 to-rose-600" },
    { id: 3, title: "Pongal Traditional Dances", category: "Culturals", date: "Jan 14, 2026", description: "Students perform traditional Bharatanatyam and Karakattam on stage.", gradient: "from-fuchsia-500 via-purple-650 to-violet-800" },
    { id: 4, title: "Smart Screen Alignments", category: "Infrastructure", date: "May 10, 2026", description: "First batch of smart boards setup and calibrated in Section 10A classrooms.", gradient: "from-emerald-400 via-teal-650 to-cyan-700" },
    { id: 5, title: "SSLC Board Prep Seminars", category: "Academic", date: "April 05, 2026", description: "Special science coaching sessions held for Class 10 candidates.", gradient: "from-rose-400 via-red-550 to-indigo-700" },
    { id: 6, title: "Outsourced Guest Welcome", category: "Academic", date: "June 10, 2026", description: "Staff welcoming guest lecturers during the academic orientation event.", gradient: "from-blue-400 via-indigo-650 to-purple-800" },
  ]);

  const [filterCategory, setFilterCategory] = useState<"All" | "Sports" | "Infrastructure" | "Culturals" | "Academic">("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Photo Uploader Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<"Sports" | "Infrastructure" | "Culturals" | "Academic">("Academic");
  const [uploadDesc, setUploadDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const startEditing = (item: GalleryItem) => {
    setEditingItem(item);
    setUploadTitle(item.title);
    setUploadCategory(item.category);
    setUploadDesc(item.description);
    setImagePreview(item.imageUrl || null);
    setImageFile(null);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    let finalImageUrl = imagePreview || undefined;
    if (imageFile) {
      finalImageUrl = URL.createObjectURL(imageFile);
    }

    if (editingItem) {
      setItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: uploadTitle,
            category: uploadCategory,
            description: uploadDesc || "No details provided.",
            imageUrl: finalImageUrl
          };
        }
        return item;
      }));
      setUploadToast(`✓ Photo '${uploadTitle}' updated successfully!`);
      setEditingItem(null);
    } else {
      // Pick a random gradient for the uploaded card
      const gradients = [
        "from-teal-400 to-emerald-650",
        "from-pink-500 to-rose-700",
        "from-yellow-400 to-orange-600",
        "from-indigo-500 to-blue-700"
      ];
      const pickedGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const newItem: GalleryItem = {
        id: Date.now(),
        title: uploadTitle,
        category: uploadCategory,
        date: "Today",
        description: uploadDesc || "No details provided.",
        gradient: pickedGradient,
        imageUrl: finalImageUrl
      };

      setItems(prev => [newItem, ...prev]);
      setUploadToast(`✓ Photo '${uploadTitle}' uploaded! Added to school gallery.`);
    }
    
    // Reset Form
    setUploadTitle("");
    setUploadDesc("");
    setImageFile(null);
    setImagePreview(null);

    setTimeout(() => setUploadToast(null), 4000);
  };

  const filteredItems = items.filter(
    (item) => filterCategory === "All" || item.category === filterCategory
  );

  return (
    <PortalLayout
      title="School Media Gallery"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gallery Visual Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <h2 className="text-base font-semibold text-white">📸 School Events & Infrastructure Media</h2>
                <p className="text-xs text-slate-500 leading-relaxed">Visual chronicle of sports championships, upgrades, and cultural celebrations.</p>
              </div>

              {/* Category tabs */}
              <div className="flex overflow-x-auto scrollbar-none whitespace-nowrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-full">
                {(["All", "Academic", "Sports", "Infrastructure", "Culturals"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      filterCategory === cat
                        ? "bg-blue-600 text-white font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-slate-700 group transition-all"
              >
                {/* Visual block simulating photo or showing uploaded image */}
                <div className="w-full h-40 relative flex items-center justify-center overflow-hidden bg-slate-900">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
                      <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform z-10">
                        {item.category === "Infrastructure" ? "🏗️" : item.category === "Sports" ? "🏆" : item.category === "Culturals" ? "🎭" : "📖"}
                      </span>
                    </>
                  )}
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase px-2 py-0.5 bg-black/45 text-white backdrop-blur-md rounded-md border border-white/10 z-10">
                    {item.category}
                  </span>

                  {/* Edit overlay button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(item);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-blue-600 text-white rounded-lg border border-slate-700 transition-colors z-20"
                    title="Edit Details"
                  >
                    ✏️
                  </button>
                </div>

                <div className="p-4 space-y-1 bg-slate-950/80">
                  <span className="text-[9px] text-slate-500 font-bold">{item.date}</span>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="glass rounded-2xl p-12 border border-slate-800 text-center text-slate-550 italic text-xs">
              No photos found matching this filter category.
            </div>
          )}
        </div>

        {/* Upload Panel */}
        <div className="glass rounded-2xl p-6 border border-slate-800 h-fit">
          <h2 className="text-base font-semibold text-white mb-2">
            {editingItem ? "✏️ Edit Media Asset" : "📤 Upload Media Assets"}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
            {editingItem
              ? "Modify the title, category, description, or image for this gallery entry."
              : "Publish pictures of recent campus highlights or physical lab updates directly to the school public gallery portal."}
          </p>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Photo Title</label>
              <input
                type="text"
                placeholder="E.g., New Chemistry lab sinks"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Gallery Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Culturals">Culturals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Short Caption / Description</label>
              <textarea
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Brief summary of the event shown in photo..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Photo File</label>
              {imagePreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="px-3 py-1.5 bg-rose-650 hover:bg-rose-750 text-white text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-900 hover:bg-slate-900/50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex flex-col items-center justify-center py-5 text-center px-4">
                    <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🖼️</span>
                    <p className="text-[11px] text-slate-450 font-medium leading-normal">
                      <span className="text-blue-400 font-bold hover:underline">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">Supports PNG, JPG, JPEG (Max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {editingItem ? "Update Media Asset" : "Post Media Asset"}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setUploadTitle("");
                    setUploadCategory("Academic");
                    setUploadDesc("");
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold rounded-xl text-xs transition-colors border border-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {uploadToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl leading-relaxed">
              {uploadToast}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl glass border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header / Close */}
            <div className="flex justify-between items-center p-4 border-b border-slate-850">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-800 text-slate-350 border border-slate-700 rounded-md">
                {selectedItem.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    startEditing(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="text-xs text-blue-400 hover:text-white font-bold px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white hover:text-slate-300 font-bold text-sm w-7 h-7 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Simulated or Uploaded Photo Panel */}
            <div className="w-full h-80 md:h-[420px] relative flex items-center justify-center bg-slate-950 overflow-hidden border-b border-slate-850">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedItem.gradient}`} />
                  <span className="text-5xl z-10">🖼️</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="p-6 bg-slate-950 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold">Captured: {selectedItem.date}</span>
              <h2 className="text-base font-bold text-white leading-tight">{selectedItem.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
