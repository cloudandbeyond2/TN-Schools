"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";

export default function StudentInfographicsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [savedLessons, setSavedLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const user = session?.user as any;
        const className = user?.class || "10";
        const section = user?.section || "";

        const query = new URLSearchParams();
        query.append("className", className);
        if (section) query.append("section", section);
        query.append("_t", Date.now().toString());

        const token = user?.backendToken;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/ai/visualdesign/published?${query.toString()}`, {
          headers
        });
        const json = await res.json();
        console.log("Infographics API response:", json);
        
        if (json.success) {
          setSavedLessons(json.data);
        } else {
          setErrorMsg(json.error || "Failed to fetch from API.");
          throw new Error(json.error || "Failed to fetch");
        }
      } catch (err: any) {
        console.error("Error fetching infographics:", err);
        if (!errorMsg) setErrorMsg(err.message || "Failed to fetch");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchLessons();
    }
  }, [session, API_URL]);

  return (
    <PortalLayout themeClass="theme-student">
      <div className="w-full px-4 md:px-8 pb-24">
        <header className="mb-8 flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">AI Infographics</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">View visual lessons published by your teacher.</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="w-full flex justify-center py-24">
            <i className="fi fi-rr-spinner animate-spin text-4xl text-indigo-500"></i>
          </div>
        ) : errorMsg ? (
          <div className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <i className="fi fi-rr-cross-circle text-5xl text-red-400 mb-6"></i>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Error Loading Infographics</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">{errorMsg}</p>
            <p className="text-xs text-slate-400 mt-4">(If authentication required, please Sign Out and Sign Back In)</p>
          </div>
        ) : savedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {savedLessons.map((lesson) => {
               const data = lesson.infographicData;
               return (
                 <div key={lesson.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{data?.title || lesson.topic}</h3>
                       <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Class {lesson.class} • Focus: {lesson.focus}</p>
                     </div>
                     {data?.centralImageUrl && (
                       <img 
                         src={`https://image.pollinations.ai/prompt/${encodeURIComponent(data.centralImageUrl)}?width=200&height=200&nologo=true`} 
                         className="w-16 h-16 rounded-xl object-cover shadow"
                       />
                     )}
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{data?.introduction}</p>
                   
                   <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end items-center">
                     <button
                       onClick={() => router.push(`/student/infographics/${lesson.id}`)}
                       className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center gap-2"
                     >
                       <i className="fi fi-rr-eye"></i> View Infographic
                     </button>
                   </div>
                 </div>
               );
            })}
          </div>
        ) : (
          <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
            <i className="fi fi-rr-folder-open text-5xl text-slate-300 dark:text-slate-600 block mb-4 mx-auto w-fit" />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No infographics published yet.</p>
            <p className="text-xs text-slate-500 mt-2">Your teacher hasn't published any infographics for your section yet.</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
