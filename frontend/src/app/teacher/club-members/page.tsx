"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TeacherClubMembersPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const { lang } = usePortalLanguage();
  
  const [membersData, setMembersData] = useState<Record<string, Record<string, { id: string; name: string }[]>>>({});
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const fetchMembers = async () => {
      if (!schoolId) return;
      try {
        const res = await fetch(`${API_BASE}/api/activities/all-members?schoolId=${schoolId}`);
        const json = await res.json();
        if (json.success) {
          const grouped: Record<string, Record<string, { id: string; name: string }[]>> = {};
          json.data.forEach((m: any) => {
            const cName = m.clubName;
            const grade = m.class || "Unknown";
            if (!grouped[cName]) grouped[cName] = {};
            if (!grouped[cName][grade]) grouped[cName][grade] = [];
            grouped[cName][grade].push({ id: m.id, name: m.name });
          });
          setMembersData(grouped);
          
          if (Object.keys(grouped).length > 0) {
            setActiveTab(Object.keys(grouped)[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [schoolId]);

  // Flatten the active club's members for the table
  const getFlattenedMembers = () => {
    if (!activeTab || !membersData[activeTab]) return [];
    const flattened: { id: string; name: string; grade: string }[] = [];
    Object.entries(membersData[activeTab]).forEach(([grade, students]) => {
      students.forEach(student => {
        flattened.push({ id: student.id, name: student.name, grade });
      });
    });
    // Optional: Sort by grade then name
    return flattened.sort((a, b) => a.grade.localeCompare(b.grade) || a.name.localeCompare(b.name));
  };

  const handleRemoveMember = async (memberId: string, studentName: string) => {
    const result = await Swal.fire({
      title: lang === "தமிழ்" ? "உறுதியாக உள்ளீர்களா?" : "Are you sure?",
      text: lang === "தமிழ்" ? `${studentName}-ஐ இந்த மன்றத்தில் இருந்து நீக்க விரும்புகிறீர்களா?` : `Do you want to remove ${studentName} from ${activeTab}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#64748b",
      confirmButtonText: lang === "தமிழ்" ? "ஆம், நீக்கு!" : "Yes, remove!",
      cancelButtonText: lang === "தமிழ்" ? "ரத்து செய்" : "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/api/activities/members/${memberId}`, {
          method: "DELETE"
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire("Removed!", "The member has been removed from the club.", "success");
          
          // Optimistically update UI
          setMembersData(prev => {
            const newData = { ...prev };
            const clubData = { ...newData[activeTab] };
            let found = false;
            
            for (const grade in clubData) {
              const originalLength = clubData[grade].length;
              clubData[grade] = clubData[grade].filter(s => s.id !== memberId);
              if (clubData[grade].length < originalLength) {
                found = true;
              }
              if (clubData[grade].length === 0) {
                delete clubData[grade]; // Clean up empty grade arrays
              }
            }
            
            if (found) {
              newData[activeTab] = clubData;
            }
            return newData;
          });
        } else {
          Swal.fire("Error!", "Failed to remove member.", "error");
        }
      } catch (error) {
        Swal.fire("Error!", "An error occurred.", "error");
      }
    }
  };

  const currentMembers = getFlattenedMembers();

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "மன்ற உறுப்பினர்கள்" : "Club Members"} 
      subtitle={lang === "தமிழ்" ? "பள்ளி மன்ற உறுப்பினர்களின் மேலோட்டம்" : "Overview of all school club members"} 
      themeClass="theme-teacher"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i className="fi fi-rr-users text-amber-500"></i>
            {lang === "தமிழ்" ? "உறுப்பினர்கள் பட்டியல்" : "Members Directory"}
          </h2>
          <Link href="/teacher/events" className="text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors flex items-center gap-1">
            <i className="fi fi-rr-arrow-left"></i> Back to Events
          </Link>
        </div>

        {loadingMembers ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(membersData).length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">📭</div>
            <p>{lang === "தமிழ்" ? "உறுப்பினர்கள் யாரும் இல்லை." : "No club members found."}</p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
              {Object.keys(membersData).map(clubName => (
                <button
                  key={clubName}
                  onClick={() => setActiveTab(clubName)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                    activeTab === clubName 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:text-amber-600'
                  }`}
                >
                  {clubName}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fi fi-rr-users-alt text-slate-400"></i>
                  {activeTab} Members
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                  Total: {currentMembers.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 w-20">S.No</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4 w-40">Class / Grade</th>
                      <th className="px-6 py-4 w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentMembers.length > 0 ? (
                      currentMembers.map((member, idx) => (
                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{idx + 1}</td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            {member.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700">
                              {member.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shadow-sm"
                              title="Remove Member"
                            >
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                          No members found for this club.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
