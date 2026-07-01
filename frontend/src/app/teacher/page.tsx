"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Megaphone,
  Plus,
  ChevronDown,
  Filter,
  User,
  Users,
  Briefcase,
  Coins,
  GraduationCap
} from "lucide-react";
import ClassesPage from "./classes/page";

interface Notice {
  id: string;
  title: string;
  body: string;
  target: string;
  date: string;
  sender: string;
  pinned: boolean;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [alumniCount, setAlumniCount] = useState<string>("2,840+");
  const [mentorsCount, setMentorsCount] = useState<string>("187 Staff");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendance, setAttendance] = useState({ present: 342, absent: 18, late: 24 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Alumni count
        const alumniRes = await fetch(`${API_URL}/api/headmaster/alumni${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const alumniData = await alumniRes.json();
        if (alumniData.success) {
          setAlumniCount(`${alumniData.count || alumniData.data?.length || 0} Alumni`);
        }

        // Fetch Mentors count
        const staffRes = await fetch(`${API_URL}/api/headmaster/staff${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const staffData = await staffRes.json();
        if (staffData.success) {
          setMentorsCount(`${staffData.count || staffData.data?.length || 0} Staff`);
        }

        // Fetch Pinned/Recent announcements
        const annRes = await fetch(`${API_URL}/api/teacher/announcements${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const annData = await annRes.json();
        if (annData.success && annData.data) {
          setNotices(annData.data.slice(0, 5)); // top 5 notices
        }

        // Fetch attendance stats today
        if (schoolId) {
          const attRes = await fetch(`${API_URL}/api/attendance/school/${schoolId}/today`);
          const attData = await attRes.json();
          if (attData.success && attData.data && attData.data.length > 0) {
            let p = 0, a = 0, l = 0;
            attData.data.forEach((r: any) => {
              if (r.status === "PRESENT") p = r._count.status;
              else if (r.status === "ABSENT") a = r._count.status;
              else if (r.status === "LATE") l = r._count.status;
            });
            if (p > 0 || a > 0 || l > 0) {
              setAttendance({ present: p, absent: a, late: l });
            }
          }
        }
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };


    fetchDashboardData();
  }, [schoolId, API_URL]);

  const totalAttendance = attendance.present + attendance.absent + attendance.late;
  const presentPct = totalAttendance > 0 ? Math.round((attendance.present / totalAttendance) * 100) : 89;
  const absentPct = totalAttendance > 0 ? Math.round((attendance.absent / totalAttendance) * 100) : 5;
  const latePct = totalAttendance > 0 ? Math.round((attendance.late / totalAttendance) * 100) : 6;

  const kpiData = [
    { title: "ACTIVE ALUMNI", value: alumniCount, subtitle: "↑ 14% this year", icon: Users, color: "blue", subColor: "text-blue-500", iconBg: "bg-blue-100 dark:bg-blue-500/15", iconColor: "text-blue-600 dark:text-blue-400", borderColor: "border-t-blue-500" },
    { title: "EMPLOYMENT RATE", value: "94.2%", subtitle: "Global top tier", icon: Briefcase, color: "green", subColor: "text-green-500", iconBg: "bg-green-100 dark:bg-green-500/15", iconColor: "text-green-600 dark:text-green-400", borderColor: "border-t-green-500" },
    { title: "FUNDS DONATED", value: "₹3.42 Lakhs", subtitle: "For library upgrade", icon: Coins, color: "orange", subColor: "text-orange-500", iconBg: "bg-orange-100 dark:bg-orange-500/15", iconColor: "text-orange-600 dark:text-orange-400", borderColor: "border-t-orange-500" },
    { title: "ACTIVE MENTORS", value: mentorsCount, subtitle: "Providing career prep", icon: GraduationCap, color: "pink", subColor: "text-pink-500", iconBg: "bg-pink-100 dark:bg-pink-500/15", iconColor: "text-pink-600 dark:text-pink-400", borderColor: "border-t-pink-500" },
  ];

  return (

    <ClassesPage />

  );
}
