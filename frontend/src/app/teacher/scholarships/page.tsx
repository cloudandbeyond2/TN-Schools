"use client";
import { Users, CheckCircle, AlertTriangle, Coins, Clipboard, Check, Landmark, Star, Search } from "lucide-react";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

interface ScholarshipRecord {
  id: string;
  name: string;
  class: string;
  scheme: string;
  status: "Approved" | "Needs Verification" | "Rejected" | "Disbursed" | "Pending";
  amount: number;
}

export default function ScholarshipsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [records, setRecords] = useState<ScholarshipRecord[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Statistics KPI
  const [stats, setStats] = useState({
    eligible: 0,
    approved: 0,
    actionNeeded: 0,
    funds: 0
  });

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/scholarships${schoolId ? `?schoolId=${schoolId}` : ""}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Map the backend structure to frontend structure
        const mapped: ScholarshipRecord[] = data.data.map((item: any) => {
          let statusText: ScholarshipRecord["status"] = "Pending";
          if (item.status === "APPROVED") statusText = "Approved";
          else if (item.status === "PENDING") statusText = "Needs Verification";
          else if (item.status === "REJECTED") statusText = "Rejected";
          else if (item.status === "DISBURSED") statusText = "Disbursed";

          return {
            id: item.id,
            name: item.student?.user?.name || "Student Name",
            class: `${item.student?.class || "10"}${item.student?.section || "A"}`,
            scheme: item.scheme,
            amount: item.amount,
            status: statusText,
          };
        });

        setRecords(mapped);

        // Compute stats
        const eligibleCount = mapped.length;
        const approvedCount = mapped.filter((r) => r.status === "Approved" || r.status === "Disbursed").length;
        const pendingCount = mapped.filter((r) => r.status === "Needs Verification" || r.status === "Pending").length;
        const totalAmount = mapped
          .filter((r) => r.status === "Approved" || r.status === "Disbursed")
          .reduce((acc, curr) => acc + curr.amount, 0);

        setStats({
          eligible: eligibleCount,
          approved: approvedCount,
          actionNeeded: pendingCount,
          funds: totalAmount
        });
      }
    } catch (err) {
      console.error("Error loading scholarships", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [schoolId, API_URL]);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`${API_URL}/api/teacher/scholarships/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) {
        const studentName = records.find((rec) => rec.id === id)?.name;
        Swal.fire({
          icon: "success",
          title: "Verified!",
          text: `${studentName}'s EMIS profile and Bank Details successfully verified! Status updated to Approved.`,
          confirmButtonColor: "#10b981",
        });
        fetchScholarships(); // Reload list to recalculate everything
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: data.error || "Failed to verify EMIS profile.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error verifying scholarship", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected network error occurred.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <PortalLayout title="Scholarship & Govt Schemes" subtitle="Verify candidate records and monitor disbursal statuses.">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Eligible Students", value: String(stats.eligible), icon: <Users className="w-5 h-5 text-inherit" />, color: "text-amber-400", sub: "Across all classes" },
          { label: "Approved Grants", value: String(stats.approved), icon: <CheckCircle className="w-5 h-5 text-inherit" />, color: "text-emerald-400", sub: "Disbursals active" },
          { label: "Action Needed", value: String(stats.actionNeeded), icon: <AlertTriangle className="w-5 h-5 text-inherit" />, color: "text-red-400", sub: "Pending verifications" },
          { label: "Fund Value Rate", value: `₹${stats.funds.toLocaleString()}`, icon: <Coins className="w-5 h-5 text-inherit" />, color: "text-cyan-400", sub: "Estimated Monthly" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={`text-[10px] font-bold ${kpi.color}`}>{kpi.sub}</span>
            </div>
            <div className={`text-2xl font-extrabold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-[var(--text-muted)] font-semibold">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main content table */}
      <div className="theme-card p-6 border border-[var(--border)] mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-[var(--text-heading)]"><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> Scheme Applicants & Verifications</h2>
          <button className="px-3.5 py-1.5 bg-[var(--bg-card)] hover:bg-slate-700 text-[var(--text-heading)] rounded-lg text-xs font-semibold transition-colors">
            Export Roster Details
          </button>
        </div>

        {toastMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
            {toastMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">Loading scheme records...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">No scholarship candidates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Government Scheme</th>
                  <th>Disbursal Amount</th>
                  <th>EMIS Verification Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td className="font-medium text-[var(--text-heading)]">{rec.name}</td>
                    <td>{rec.class}</td>
                    <td>
                      <span className="text-[var(--text-main)] font-semibold text-xs">{rec.scheme}</span>
                    </td>
                    <td>
                      <span className="text-[var(--text-heading)] font-semibold text-xs">
                        {rec.amount > 0 ? `₹${rec.amount}/mo` : "Material Distribution"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rec.status === "Approved" || rec.status === "Disbursed"
                            ? "badge-green"
                            : rec.status === "Needs Verification"
                            ? "badge-red"
                            : rec.status === "Pending"
                            ? "badge-yellow"
                            : "badge-blue"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      {rec.status === "Needs Verification" || rec.status === "Pending" ? (
                        <button
                          onClick={() => handleVerify(rec.id)}
                          disabled={verifyingId === rec.id}
                          className="px-2.5 py-1 bg-[var(--primary)] hover:bg-amber-600 disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] text-slate-950 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          {verifyingId === rec.id ? "Checking EMIS..." : "Verify EMIS"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)] italic">Verified ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guidelines details */}
      <div className="theme-card p-6 border border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-3"><Landmark className="w-4 h-4 inline-block mr-1 text-inherit" /> Tamil Nadu Government Scheme Notes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs text-[var(--text-muted)]">
          <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border)]">
            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-1">Pudhumai Penn Scheme</h4>
            <p className="leading-relaxed font-normal">Eligible for all girl students who studied classes 6-12 in govt schools, providing ₹1,000/month upon entering higher education.</p>
          </div>
          <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border)]">
            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-1">Tamil Puthalvan Scheme</h4>
            <p className="leading-relaxed font-normal">Financial assistance of ₹1,000/month for boy students from government schools enrolling in higher education courses.</p>
          </div>
          <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border)]">
            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-1">NMMS Scholarship</h4>
            <p className="leading-relaxed font-normal font-normal">National Means-cum-Merit Scholarship providing financial help of ₹6,000/annum for selected students from Class 9.</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

