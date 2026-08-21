"use client";

import React from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";

export default function SavedConceptMapsPage() {
  // Mock data for saved concept maps
  const savedMaps = [
    { id: 1, title: "Solar System", date: "2026-08-15" },
    { id: 2, title: "Water Cycle", date: "2026-08-16" },
    { id: 3, title: "Photosynthesis", date: "2026-08-18" },
  ];

  return (
    <PortalLayout
      title="Saved Concept Maps"
      subtitle="View and manage your previously generated concept maps"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Saved Maps</h2>
          <Link
            href="/teacher/concept-explanation"
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <i className="fi fi-rr-add" /> Create New Map
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedMaps.map((map) => (
            <div key={map.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-md transition-shadow">
              <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center">
                <i className="fi fi-rr-mind-share text-4xl text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{map.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Saved on: {map.date}</p>
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  View
                </button>
                <button className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                  <i className="fi fi-rr-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
