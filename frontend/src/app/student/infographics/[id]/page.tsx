"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import { InfographicRenderer } from "@/components/InfographicRenderer";
import Swal from "sweetalert2";

export default function StudentInfographicViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ai/visualdesign/${id}`);
        const json = await res.json();
        if (json.success && json.data && json.data.isPublished) {
          setLesson(json.data);
        } else {
          throw new Error("Lesson not found or not published");
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

  return (
    <PortalLayout themeClass="theme-student">
      {isLoading ? (
        <div className="w-full flex items-center justify-center p-24">
          <i className="fi fi-rr-spinner animate-spin text-4xl text-indigo-500"></i>
        </div>
      ) : !lesson ? (
        <div className="w-full flex flex-col items-center justify-center p-24">
          <i className="fi fi-rr-cross-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold">Infographic not found</h2>
          <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Go Back</button>
        </div>
      ) : (
        <div className="w-full px-4 md:px-8 pb-24">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <i className="fi fi-rr-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white">Infographic Viewer</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Class {lesson.class} • {lesson.topic}</p>
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto">
              <InfographicRenderer data={lesson.infographicData} focus={lesson.focus || "Exam point of view"} />
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
