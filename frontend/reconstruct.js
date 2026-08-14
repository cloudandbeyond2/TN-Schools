const fs = require('fs');
const path = 'd:/tnschools/TN-Schools/frontend/src/app/teacher/ai-lesson-creator/[id]/page.tsx';
const themes = fs.readFileSync('d:/tnschools/TN-Schools/frontend/themes.txt', 'utf8');

const newContent = `"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

export default function InfographicViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"neon" | "academic" | "bento" | "timeline">("neon");

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      try {
        const res = await fetch(\`\${API_URL}/api/ai/visualdesign/\${id}\`);
        const json = await res.json();
        if (json.success && json.data) {
          setLesson(json.data);
        } else {
          throw new Error("Lesson not found");
        }
      } catch (err) {
        console.error("Failed to fetch lesson", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not load the infographic."
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [id, API_URL]);

  if (isLoading) {
    return (
      <PortalLayout role="TEACHER">
        <div className="w-full flex items-center justify-center p-24">
          <i className="fi fi-rr-spinner animate-spin text-4xl text-indigo-500"></i>
        </div>
      </PortalLayout>
    );
  }

  if (!lesson) {
    return (
      <PortalLayout role="TEACHER">
        <div className="w-full flex flex-col items-center justify-center p-24">
          <i className="fi fi-rr-cross-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold">Infographic not found</h2>
          <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Go Back</button>
        </div>
      </PortalLayout>
    );
  }

  const infographicData = lesson.infographicData;

${themes}

  return (
    <PortalLayout role="TEACHER">
      <div className="w-full px-4 md:px-8 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.close()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <i className="fi fi-rr-cross"></i>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Infographic Viewer</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Viewing saved lesson for Class {lesson.class} • {lesson.topic}</p>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto">
            {/* View Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-1">
                {[
                  { id: "neon", label: "Neon Infographic", icon: "fi-rr-galaxy" },
                  { id: "academic", label: "Clean Academic", icon: "fi-rr-book-alt" },
                  { id: "bento", label: "Modern Cards", icon: "fi-rr-apps" },
                  { id: "timeline", label: "Timeline Flow", icon: "fi-rr-chart-tree" }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={\`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all \${
                      viewMode === mode.id 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                    }\`}
                  >
                    <i className={\`fi \${mode.icon}\`}></i>
                    <span className="hidden md:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Render the active theme */}
            <div className="w-full relative">
              {viewMode === "neon" && renderNeonTheme()}
              {viewMode === "academic" && renderAcademicTheme()}
              {viewMode === "bento" && renderBentoTheme()}
              {viewMode === "timeline" && renderTimelineTheme()}
            </div>
        </div>
      </div>
    </PortalLayout>
  );
}
`;

fs.writeFileSync(path, newContent, 'utf8');
console.log('Update successful!');
