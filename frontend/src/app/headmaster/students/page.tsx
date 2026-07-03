"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import { Activity, Eye, Stethoscope, FileText, PlusCircle, HeartPulse, X, GraduationCap, User, Ruler, Weight, Droplet, Target, Ear, ShieldCheck, Download, Calendar, ClipboardList, Smile, Clock } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface ParsedPreviewStudent {
  id: number;
  name: string;
  rollNumber: string;
  admissionNumber?: string;
  emisNumber?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  religion?: string;
  community?: string;
  nationality?: string;
  mediumOfInstruction?: string;
  class: string;
  section?: string;
  academicYear?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  parentEmail?: string;
  phone: string;
  parentName: string;
  address?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  studentStatus?: string;
  risk: "High" | "Medium";
  isValid: boolean;
  validationError?: string;
}

interface ExcelStudentRow {
  "Full Name"?: string;
  "Admission Number"?: string;
  "Roll Number"?: string;
  "EMIS Number"?: string;
  "Date of Birth (YYYY-MM-DD)"?: string;
  "Gender"?: string;
  "Blood Group"?: string;
  "Religion"?: string;
  "Community"?: string;
  "Nationality"?: string;
  "Medium of Instruction"?: string;
  "Class"?: string;
  "Section"?: string;
  "Academic Year"?: string;
  "Father Name"?: string;
  "Father Occupation"?: string;
  "Mother Name"?: string;
  "Mother Occupation"?: string;
  "Primary Contact Name"?: string;
  "Parent Email"?: string;
  "Phone Number"?: string;
  "Address"?: string;
  "City"?: string;
  "District"?: string;
  "State"?: string;
  "Pincode"?: string;
  "Student Status"?: string;
  "Risk Level"?: string;
}

interface ClassStat {
  grade: string;
  enrolled: number;
  attendance: number;
  averageScore: number;
}

interface WatchlistStudent {
  id?: string;
  name: string;
  rollNumber: string;
  class: string;
  phone: string;
  parentName: string;
  district: string;
  state: string;
  city: string;
  pincode: string;
  risk: "High" | "Medium";
  createdAt?: string;
}

export default function StudentsMonitoringPage() {
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [classStats] = useState<ClassStat[]>([]);


  const [watchlist, setWatchlist] = useState<WatchlistStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch schools list (to display the school name)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/schools`);
        const json = await res.json();
        if (json.success) {
          setSchools(json.data);
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };
    fetchSchools();
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");
  const [newClass, setNewClass] = useState("Class 10A");
  const [newPhone, setNewPhone] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newDistrict, setNewDistrict] = useState("Coimbatore");
  const [newState, setNewState] = useState("Tamil Nadu");
  const [newCity, setNewCity] = useState("Coimbatore");
  const [newPincode, setNewPincode] = useState("");
  const [newRisk, setNewRisk] = useState<"High" | "Medium">("Medium");
  const [newAdmissionNumber, setNewAdmissionNumber] = useState("");
  const [newEmisNumber, setNewEmisNumber] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newBloodGroup, setNewBloodGroup] = useState("");
  const [newReligion, setNewReligion] = useState("");
  const [newCommunity, setNewCommunity] = useState("");
  const [newNationality, setNewNationality] = useState("Indian");
  const [newMediumOfInstruction, setNewMediumOfInstruction] = useState("English");
  const [newSection, setNewSection] = useState("A");
  const [newAcademicYear, setNewAcademicYear] = useState("2024-25");
  const [newFatherName, setNewFatherName] = useState("");
  const [newFatherOccupation, setNewFatherOccupation] = useState("");
  const [newMotherName, setNewMotherName] = useState("");
  const [newMotherOccupation, setNewMotherOccupation] = useState("");
  const [newParentEmail, setNewParentEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newStudentStatus, setNewStudentStatus] = useState("Active");


  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [previewStudents, setPreviewStudents] = useState<ParsedPreviewStudent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Health report state
  const [healthReports, setHealthReports] = useState<Record<string, any>>({});
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isViewHealthModalOpen, setIsViewHealthModalOpen] = useState(false);
  const [selectedStudentForHealth, setSelectedStudentForHealth] = useState<WatchlistStudent | null>(null);
  const [healthForm, setHealthForm] = useState({ height: "", weight: "", bloodGroup: "", vision: "", hearing: "", bmi: "", dental: "", lastCheckupDate: "", notes: "" });

  const fetchHealthReport = async (rollNumber: string, id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/health/${rollNumber}`);
      const json = await res.json();
      if (json.success && json.data) {
        setHealthReports(prev => ({ ...prev, [id]: json.data }));
        return json.data;
      }
    } catch (e) {
      console.error("Failed to fetch health report", e);
    }
    return null;
  };

  const handleOpenHealthModal = async (student: WatchlistStudent) => {
    setSelectedStudentForHealth(student);
    const id = student.id || student.rollNumber;
    setIsHealthModalOpen(true);
    setHealthForm({ height: "", weight: "", bloodGroup: "", vision: "", hearing: "", bmi: "", dental: "", lastCheckupDate: "", notes: "" });

    const existingData = await fetchHealthReport(student.rollNumber, id);
    if (existingData) {
      setHealthForm({
        height: existingData.height || "",
        weight: existingData.weight || "",
        bloodGroup: existingData.bloodGroup || "",
        vision: existingData.vision || "",
        hearing: existingData.hearing || "",
        bmi: existingData.bmi || "",
        dental: existingData.dental || "",
        lastCheckupDate: existingData.lastCheckupDate ? new Date(existingData.lastCheckupDate).toISOString().split('T')[0] : "",
        notes: existingData.notes || ""
      });
    }
  };

  const handleSaveHealthReport = async () => {
    if (!selectedStudentForHealth) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/health/${selectedStudentForHealth.rollNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthForm)
      });
      const json = await res.json();
      if (json.success) {
        const studentId = selectedStudentForHealth.id || selectedStudentForHealth.rollNumber;
        setHealthReports((prev) => ({
          ...prev,
          [studentId]: json.data,
        }));
        setIsHealthModalOpen(false);
        showToast("Health report saved permanently");
      } else {
        showToast(json.error || "Failed to save. Make sure student is enrolled.", "error");
      }
    } catch (e) {
      showToast("Failed to save health report", "error");
    }
  };

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('health-report-modal-content');
    if (!reportElement || !selectedStudentForHealth) return;

    try {
      showToast("Generating PDF...");
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // keeping it crisp
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${selectedStudentForHealth.name}_HealthReport.pdf`);
      showToast("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate PDF.", "error");
    }
  };

  const handleViewHealthReport = async (student: WatchlistStudent) => {
    setSelectedStudentForHealth(student);
    setIsViewHealthModalOpen(true);
    await fetchHealthReport(student.rollNumber, student.id || student.rollNumber);
  };

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch watchlist — always scoped to this headmaster's school ────
  const fetchWatchlist = useCallback(async () => {
    if (!mySchoolId) return; // wait until session has loaded
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/students?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setWatchlist(json.data);
      } else {
        showToast("⚠️ Could not load student watchlist from server.", "error");
      }
    } catch {
      showToast("🔴 Server offline — showing cached data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // ── Excel download template ─────────────────────────────────────
  const downloadExcelTemplate = () => {
    const headers = [
      "Full Name", "Admission Number", "Roll Number", "EMIS Number", "Date of Birth (YYYY-MM-DD)",
      "Gender", "Blood Group", "Religion", "Community", "Nationality",
      "Medium of Instruction", "Class", "Section", "Academic Year",
      "Father Name", "Father Occupation", "Mother Name", "Mother Occupation",
      "Primary Contact Name", "Parent Email", "Phone Number",
      "Address", "City", "District", "State", "Pincode", "Student Status", "Risk Level"
    ];
    const sampleData = [
      {
        "Full Name": "Arun Kumar",
        "Admission Number": "ADM1001",
        "Roll Number": "HM10101",
        "EMIS Number": "EMIS99123",
        "Date of Birth (YYYY-MM-DD)": "2008-05-12",
        "Gender": "Male",
        "Blood Group": "O+",
        "Religion": "Hindu",
        "Community": "BC",
        "Nationality": "Indian",
        "Medium of Instruction": "English",
        "Class": "Class 10",
        "Section": "A",
        "Academic Year": "2024-25",
        "Father Name": "Sinnasamy M.",
        "Father Occupation": "Farmer",
        "Mother Name": "Lakshmi M.",
        "Mother Occupation": "Homemaker",
        "Primary Contact Name": "Sinnasamy M.",
        "Parent Email": "arun.parent@example.com",
        "Phone Number": "9876543210",
        "Address": "123 Main St",
        "City": "Coimbatore",
        "District": "Coimbatore",
        "State": "Tamil Nadu",
        "Pincode": "641001",
        "Student Status": "Active",
        "Risk Level": "High",
      },
      {
        "Full Name": "Priya S.",
        "Admission Number": "ADM1002",
        "Roll Number": "HM09202",
        "EMIS Number": "EMIS99124",
        "Date of Birth (YYYY-MM-DD)": "2009-08-21",
        "Gender": "Female",
        "Blood Group": "A+",
        "Religion": "Hindu",
        "Community": "MBC",
        "Nationality": "Indian",
        "Medium of Instruction": "Tamil",
        "Class": "Class 9",
        "Section": "B",
        "Academic Year": "2024-25",
        "Father Name": "Ramasamy A.",
        "Father Occupation": "Teacher",
        "Mother Name": "Sita A.",
        "Mother Occupation": "Nurse",
        "Primary Contact Name": "Ramasamy A.",
        "Parent Email": "priya.parent@example.com",
        "Phone Number": "9876543212",
        "Address": "456 North St",
        "City": "Coimbatore",
        "District": "Coimbatore",
        "State": "Tamil Nadu",
        "Pincode": "641003",
        "Student Status": "Active",
        "Risk Level": "Medium",
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Template");
    XLSX.writeFile(workbook, "student_import_template.xlsx");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json<ExcelStudentRow>(sheet);

        const validated: ParsedPreviewStudent[] = parsedData.map((row, idx) => {
          const name = row["Full Name"]?.toString().trim() || "";
          const rollNumber = row["Roll Number"]?.toString().trim() || "";
          const admissionNumber = row["Admission Number"]?.toString().trim() || "";
          const emisNumber = row["EMIS Number"]?.toString().trim() || "";
          const dob = row["Date of Birth (YYYY-MM-DD)"]?.toString().trim() || "";
          const gender = row["Gender"]?.toString().trim() || "";
          const bloodGroup = row["Blood Group"]?.toString().trim() || "";
          const religion = row["Religion"]?.toString().trim() || "";
          const community = row["Community"]?.toString().trim() || "";
          const nationality = row["Nationality"]?.toString().trim() || "";
          const mediumOfInstruction = row["Medium of Instruction"]?.toString().trim() || "";
          const cls = row["Class"]?.toString().trim() || "Not Specified";
          const section = row["Section"]?.toString().trim() || "A";
          const academicYear = row["Academic Year"]?.toString().trim() || "";
          const fatherName = row["Father Name"]?.toString().trim() || "";
          const fatherOccupation = row["Father Occupation"]?.toString().trim() || "";
          const motherName = row["Mother Name"]?.toString().trim() || "";
          const motherOccupation = row["Mother Occupation"]?.toString().trim() || "";
          const parentName = row["Primary Contact Name"]?.toString().trim() || "Not Provided";
          const parentEmail = row["Parent Email"]?.toString().trim() || "";
          const phone = row["Phone Number"]?.toString().trim() || "Not Provided";
          const address = row["Address"]?.toString().trim() || "";
          const district = row["District"]?.toString().trim() || "Not Provided";
          const state = row["State"]?.toString().trim() || "Not Provided";
          const city = row["City"]?.toString().trim() || "Not Provided";
          const pincode = row["Pincode"]?.toString().trim() || "Not Provided";
          const studentStatus = row["Student Status"]?.toString().trim() || "Active";

          const rawRisk = row["Risk Level"]?.toString().trim() || "";
          let risk: "High" | "Medium" = "Medium";
          if (rawRisk && rawRisk.toLowerCase() === "high") risk = "High";
          
          const isValid = name !== "" && rollNumber !== "";
          return {
            id: idx,
            name,
            rollNumber,
            admissionNumber,
            emisNumber,
            dob,
            gender,
            bloodGroup,
            religion,
            community,
            nationality,
            mediumOfInstruction,
            class: cls,
            section,
            academicYear,
            fatherName,
            fatherOccupation,
            motherName,
            motherOccupation,
            parentEmail,
            phone,
            parentName,
            address,
            district,
            state,
            city,
            pincode,
            studentStatus,
            risk,
            isValid,
            validationError: !name ? "Name is missing" : !rollNumber ? "Roll Number is missing" : undefined,
          };
        });

        setPreviewStudents(validated);
        showToast(`📊 Loaded ${validated.length} students. Review preview in the modal.`);
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to parse file. Make sure it is a valid Excel or CSV sheet.", "error");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── Save bulk import to PostgreSQL ──────────────────────────────
  const handleConfirmImport = async () => {
    const validStudents = previewStudents.filter((s) => s.isValid).map((s) => ({
      ...s,
      schoolId: mySchoolId || null,
    }));
    if (validStudents.length === 0) {
      showToast("⚠️ No valid students to import.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/students/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: validStudents }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Successfully saved ${json.created} students to database!`);
        setPreviewStudents([]);
        setIsModalOpen(false);
        fetchWatchlist();
      } else {
        showToast(`❌ Import failed: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save to database.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save single manual entry to PostgreSQL ──────────────────────
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRollNumber) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          rollNumber: newRollNumber,
          class: newClass,
          phone: newPhone || "N/A",
          parentName: newParentName || "N/A",
          district: newDistrict || "N/A",
          state: newState || "N/A",
          city: newCity || "N/A",
          pincode: newPincode || "N/A",
          admissionNumber: newAdmissionNumber,
          emisNumber: newEmisNumber,
          dob: newDob || null,
          gender: newGender,
          bloodGroup: newBloodGroup,
          religion: newReligion,
          community: newCommunity,
          nationality: newNationality,
          mediumOfInstruction: newMediumOfInstruction,
          section: newSection,
          academicYear: newAcademicYear,
          fatherName: newFatherName,
          fatherOccupation: newFatherOccupation,
          motherName: newMotherName,
          motherOccupation: newMotherOccupation,
          parentEmail: newParentEmail,
          address: newAddress,
          studentStatus: newStudentStatus,

          risk: newRisk,
          schoolId: mySchoolId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 ${newName} saved to database successfully!`);
        // Immediately add to local state so user sees it without logout/login
        if (json.data) {
          setWatchlist((prev) => {
            const exists = prev.find((s) => s.id === json.data.id);
            return exists ? prev : [json.data, ...prev];
          });
        }
        setNewName(""); setNewRollNumber(""); setNewClass("Class 10A"); setNewPhone("");
        setNewParentName(""); setNewDistrict("Coimbatore"); setNewState("Tamil Nadu");
        setNewCity("Coimbatore"); setNewPincode("");
        setNewAdmissionNumber(""); setNewEmisNumber(""); setNewDob(""); setNewGender("");
        setNewBloodGroup(""); setNewReligion(""); setNewCommunity(""); setNewNationality("Indian");
        setNewMediumOfInstruction("English"); setNewSection("A"); setNewAcademicYear("2024-25");
        setNewFatherName(""); setNewFatherOccupation(""); setNewMotherName(""); setNewMotherOccupation("");
        setNewParentEmail(""); setNewAddress(""); setNewStudentStatus("Active");

        setIsModalOpen(false);
        fetchWatchlist();
      } else {
        showToast(`❌ Could not save: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save record.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete student ──────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/headmaster/students/${id}`, { method: "DELETE" });
      setWatchlist((prev) => prev.filter((s) => s.id !== id));
      showToast("🗑️ Student removed from watchlist.");
    } catch {
      showToast("🔴 Could not delete — server error.", "error");
    }
  };

  const highRiskCount = watchlist.filter((s) => s.risk === "High").length;
  const mediumRiskCount = watchlist.filter((s) => s.risk === "Medium").length;

  return (
    <PortalLayout
      title="Student Monitoring & Watchlist"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* School Badge — locked to this headmaster's school */}
      <div className="glass rounded-2xl p-4 border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 fade-in">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Managed Institution</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Student data is scoped to your assigned school only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-400 text-base">🏫</span>
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 fade-in">
        {[
          { label: "Total Students", value: isLoading ? "..." : watchlist.length.toString(), icon: "👨‍🎓", color: "text-blue-400", bg: "bg-blue-500/10", sub: "Watchlist entries" },
          { label: "High Risk Count", value: isLoading ? "..." : highRiskCount.toString(), icon: "⚠️", color: "text-red-400", bg: "bg-red-500/10", sub: "Needs urgent action" },
          { label: "Medium Risk Count", value: isLoading ? "..." : mediumRiskCount.toString(), icon: "📊", color: "text-amber-400", bg: "bg-amber-500/10", sub: "Under observation" },
          { label: "Safe / Cleared", value: isLoading ? "..." : (watchlist.length - highRiskCount - mediumRiskCount).toString(), icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10", sub: "Low risk students" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{kpi.label}</span>
              <span className={`text-sm sm:text-2xl font-black ${kpi.color} mt-1`}>{kpi.value}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{kpi.sub}</span>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm sm:text-lg ${kpi.bg} ${kpi.color} shrink-0 ml-2 shadow-sm`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-semibold text-white">🏫 Student Watchlist Overview</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              + Add Student / Roster
            </button>
          </div>
          {watchlist.length === 0 && !isLoading ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <div className="text-3xl mb-3">📋</div>
              <div className="font-semibold text-slate-400 mb-1">No student records yet</div>
              <div>Use the form or Excel import to add students to the database.</div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No / Class</th>
                    <th>Parent Name</th>
                    <th>Location</th>
                    <th>Risk Level</th>
                    <th>Added On</th>
                    <th>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((s) => (
                    <tr key={s.id || s.rollNumber}>
                      <td className="font-medium text-white">{s.name}</td>
                      <td>
                        <div className="text-xs text-slate-300">{s.rollNumber}</div>
                        <div className="text-[10px] text-slate-500">{s.class}</div>
                      </td>
                      <td>
                        <div className="text-xs text-slate-300">{s.parentName}</div>
                        <div className="text-[10px] text-slate-500">{s.phone}</div>
                      </td>
                      <td className="text-[10px] text-slate-400">{s.city}, {s.district}</td>
                      <td>
                        <span className={`badge ${s.risk === "High" ? "badge-red" : "badge-yellow"}`}>{s.risk} Risk</span>
                      </td>
                      <td className="text-[10px] text-slate-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {healthReports[s.id || s.rollNumber] ? (
                            <button
                              onClick={() => handleViewHealthReport(s)}
                              className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                              title="View Health Report"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenHealthModal(s)}
                              className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                              title="Add Health Report"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Watchlist */}
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">⚠️ Student Watchlist</h2>
            {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
          </div>
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {watchlist.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-slate-500 text-xs">No students in watchlist. Add one using the form.</div>
            ) : (
              watchlist.map((s) => (
                <div
                  key={s.id || s.rollNumber}
                  className={`p-3.5 rounded-xl border text-xs ${s.risk === "High" ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5"
                    }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-semibold mt-0.5">
                        <span>{s.class}</span>
                        <span>•</span>
                        <span>Roll: {s.rollNumber || "N/A"}</span>
                        <span>•</span>
                        <span>Ph: {s.phone || "N/A"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Parent: <span className="font-medium text-slate-300">{s.parentName || "N/A"}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                        Address: {s.city}, {s.district}, {s.state} - {s.pincode}
                      </div>
                      {s.createdAt && (
                        <div className="text-[9px] text-slate-600 mt-0.5">
                          Added: {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge ${s.risk === "High" ? "badge-red" : "badge-yellow"}`}>{s.risk} Risk</span>
                      {s.id && (
                        <button
                          onClick={() => handleDelete(s.id!)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {previewStudents.length > 0 ? "📋 Preview Roster Import" : "🎓 Register New Student & Flag Risks"}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setPreviewStudents([]); }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {previewStudents.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold text-emerald-600 uppercase tracking-wider">
                    Parsed {previewStudents.length} Students
                  </div>
                  <div className="text-slate-500 font-semibold">
                    {previewStudents.filter((s) => !s.isValid).length} invalid rows found
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 sticky top-0">
                          <th className="p-3 text-slate-700 font-semibold">Student Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Roll Number</th>
                          <th className="p-3 text-slate-700 font-semibold">Class</th>
                          <th className="p-3 text-slate-700 font-semibold">Phone Number</th>
                          <th className="p-3 text-slate-700 font-semibold">Parent Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Address</th>
                          <th className="p-3 text-slate-700 font-semibold">Risk Level</th>
                          <th className="p-3 text-slate-700 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewStudents.map((s) => (
                          <tr
                            key={s.id}
                            className={s.isValid ? "hover:bg-slate-100/80 text-slate-800" : "bg-red-50/70 hover:bg-red-100/70 text-slate-800"}
                          >
                            <td className="p-3 font-semibold text-slate-900">
                              {s.name || <span className="text-red-500 italic">Name Missing</span>}
                            </td>
                            <td className="p-3 text-slate-700">{s.rollNumber || <span className="text-red-500 italic">Roll Missing</span>}</td>
                            <td className="p-3 text-slate-800">{s.class}</td>
                            <td className="p-3 text-slate-700">{s.phone}</td>
                            <td className="p-3 text-slate-700">{s.parentName}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[150px]" title={`${s.city}, ${s.district}, ${s.state} - ${s.pincode}`}>
                              {s.city}, {s.district}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.risk === "High" ? "bg-red-50 text-red-600 border border-red-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                                }`}>
                                {s.risk}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {s.isValid ? (
                                <span className="text-emerald-600 font-medium">✓ Ready</span>
                              ) : (
                                <span className="text-red-500 font-semibold" title={s.validationError}>⚠️ Invalid</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleConfirmImport}
                    disabled={previewStudents.filter((s) => s.isValid).length === 0 || isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving to DB...</>
                    ) : (
                      `💾 Save to Database (${previewStudents.filter((s) => s.isValid).length} Students)`
                    )}
                  </button>
                  <button
                    onClick={() => setPreviewStudents([])}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Form */}
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Manual Entry</div>

                  {/* Personal Details */}
                  <div className="pt-1 pb-2 border-b border-slate-200">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Personal Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name</label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Senthil Kumar"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Date of Birth</label>
                      <input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Gender</label>
                      <select value={newGender} onChange={(e) => setNewGender(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Blood Group</label>
                      <select value={newBloodGroup} onChange={(e) => setNewBloodGroup(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Religion</label>
                      <select value={newReligion} onChange={(e) => setNewReligion(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Community</label>
                      <select value={newCommunity} onChange={(e) => setNewCommunity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="">Select Community</option>
                        <option value="BC">BC</option>
                        <option value="MBC">MBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OC">OC</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Nationality</label>
                      <select value={newNationality} onChange={(e) => setNewNationality(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="Indian">Indian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div className="pt-3 pb-2 border-b border-slate-200">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Academic Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Admission Number</label>
                      <input type="text" value={newAdmissionNumber} onChange={(e) => setNewAdmissionNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">EMIS Number</label>
                      <input type="text" value={newEmisNumber} onChange={(e) => setNewEmisNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Roll Number</label>
                      <input type="text" required value={newRollNumber} onChange={(e) => setNewRollNumber(e.target.value)}
                        placeholder="e.g. HM10101"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Academic Year</label>
                      <input type="text" value={newAcademicYear} onChange={(e) => setNewAcademicYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Class</label>
                      <select required value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="">Select Class</option>
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Section</label>
                      <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Medium of Instruction</label>
                      <select value={newMediumOfInstruction} onChange={(e) => setNewMediumOfInstruction(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Student Status</label>
                      <select value={newStudentStatus} onChange={(e) => setNewStudentStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Transferred">Transferred</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                  </div>

                  {/* Parent Details */}
                  <div className="pt-3 pb-2 border-b border-slate-200">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Parent / Guardian Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Father Name</label>
                      <input type="text" value={newFatherName} onChange={(e) => setNewFatherName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Father Occupation</label>
                      <input type="text" value={newFatherOccupation} onChange={(e) => setNewFatherOccupation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Mother Name</label>
                      <input type="text" value={newMotherName} onChange={(e) => setNewMotherName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Mother Occupation</label>
                      <input type="text" value={newMotherOccupation} onChange={(e) => setNewMotherOccupation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Primary Contact Name</label>
                      <input type="text" required value={newParentName} onChange={(e) => setNewParentName(e.target.value)}
                        placeholder="e.g. Ramasamy A."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Parent Email</label>
                      <input type="email" value={newParentEmail} onChange={(e) => setNewParentEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                      <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="pt-3 pb-2 border-b border-slate-200">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Address Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Address</label>
                      <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">City</label>
                      <input type="text" required value={newCity} onChange={(e) => setNewCity(e.target.value)}
                        placeholder="e.g. Coimbatore"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">District</label>
                      <input type="text" required value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)}
                        placeholder="e.g. Coimbatore"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">State</label>
                      <input type="text" required value={newState} onChange={(e) => setNewState(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Pincode</label>
                      <input type="text" required value={newPincode} onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="e.g. 641001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={isSaving}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 flex items-center justify-center gap-2">
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                    ) : "💾 Save Student Record"}
                  </button>
                </form>

                {/* Excel Import */}
                <div className="border-l border-slate-200 pl-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                      <span>Excel Import</span>
                      <button onClick={downloadExcelTemplate} type="button"
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer">
                        📥 Get Template
                      </button>
                    </div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[160px] border-2 border-dashed ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-500"
                        }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                          <span className="text-[10px] text-slate-500">Parsing spreadsheet...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl">📊</span>
                          <span className="text-xs font-bold text-slate-800">Import Student Roster</span>
                          <span className="text-[9px] text-slate-500 leading-normal">Drag & drop Excel or click to upload</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file); }}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 italic leading-relaxed pt-4">
                    * Data is stored in PostgreSQL — persists across sessions and refreshes.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Health Report Modal */}
      {isHealthModalOpen && selectedStudentForHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-emerald-500" /> Add Health Report
              </h3>
              <button onClick={() => setIsHealthModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                {selectedStudentForHealth.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Student Profile</p>
                <p className="text-sm font-bold text-slate-800">{selectedStudentForHealth.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Height (cm)</label>
                  <input type="number" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.height} onChange={(e) => setHealthForm({ ...healthForm, height: e.target.value })} placeholder="e.g. 145" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Weight (kg)</label>
                  <input type="number" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.weight} onChange={(e) => setHealthForm({ ...healthForm, weight: e.target.value })} placeholder="e.g. 40" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Blood Group</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.bloodGroup} onChange={(e) => setHealthForm({ ...healthForm, bloodGroup: e.target.value })} placeholder="e.g. O+" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">BMI</label>
                  <input type="number" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.bmi} onChange={(e) => setHealthForm({ ...healthForm, bmi: e.target.value })} placeholder="e.g. 19.5" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Vision</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.vision} onChange={(e) => setHealthForm({ ...healthForm, vision: e.target.value })} placeholder="e.g. 6/6" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Hearing</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.hearing} onChange={(e) => setHealthForm({ ...healthForm, hearing: e.target.value })} placeholder="e.g. Normal" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Dental</label>
                  <input type="text" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.dental} onChange={(e) => setHealthForm({ ...healthForm, dental: e.target.value })} placeholder="e.g. Healthy" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Last Checkup</label>
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm" value={healthForm.lastCheckupDate} onChange={(e) => setHealthForm({ ...healthForm, lastCheckupDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Medical Notes</label>
                <textarea className="w-full bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-sm h-20 resize-none" value={healthForm.notes} onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })} placeholder="Any allergies or medical conditions..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsHealthModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSaveHealthReport} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 text-white text-sm font-bold rounded-xl transition-all active:scale-95">Save Report</button>
            </div>
          </div>
        </div>
      )}

      {/* View Health Report Modal */}
      {isViewHealthModalOpen && selectedStudentForHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div id="health-report-modal-content" className="bg-white rounded-[24px] w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">Health Report</h3>
                  <p className="text-xs text-slate-400 font-medium">Student Health Overview</p>
                </div>
              </div>
              <button onClick={() => setIsViewHealthModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber] && (
              <div className="space-y-4">
                {/* Student Profile Card */}
                <div className="border border-indigo-50 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-4 z-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                      {selectedStudentForHealth.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-extrabold text-xl mb-1">{selectedStudentForHealth.name}</h4>
                      <div className="flex gap-2">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> {selectedStudentForHealth.class}
                        </span>
                        <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <User className="w-3 h-3" /> Roll: {selectedStudentForHealth.rollNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-2">
                    <ClipboardList className="w-32 h-32 text-blue-600" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Activity className="w-3 h-3" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">Health Summary</h4>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <Ruler className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Height</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].height || "—"} cm</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Weight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Weight</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].weight || "—"} kg</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5 fill-red-400" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Blood Group</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].bloodGroup || "—"}</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">BMI</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].bmi || "—"}</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vision</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].vision || "—"}</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-50 text-fuchsia-500 flex items-center justify-center shrink-0">
                      <Ear className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Hearing</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].hearing || "—"}</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow col-span-1">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
                      <Smile className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Dental</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].dental || "—"}</div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow col-span-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Checkup Date</div>
                      <div className="text-slate-800 font-extrabold text-sm">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].lastCheckupDate ? new Date(healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].lastCheckupDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex gap-4 mt-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-800/60 font-bold uppercase tracking-wider mb-1">Medical Notes</div>
                    <p className="text-sm text-emerald-900 font-medium whitespace-pre-wrap">{healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].notes || "OK"}</p>
                  </div>
                </div>

                {/* Overall Status */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden mt-2">
                  <div className="flex gap-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-800 mb-1">
                        Overall Status: <span className="text-emerald-600">Healthy</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Great! Keep maintaining a healthy lifestyle.</div>
                    </div>
                  </div>
                  <HeartPulse className="w-24 h-24 text-blue-200/50 absolute right-0 transform translate-x-2" />
                </div>

                <div className="flex justify-end items-center gap-1 mt-3">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-bold">
                    Last updated: {new Date(healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].updatedAt || healthReports[selectedStudentForHealth.id || selectedStudentForHealth.rollNumber].date || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-2" data-html2canvas-ignore>
              <button onClick={handleDownloadPdf} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button onClick={() => setIsViewHealthModalOpen(false)} className="w-full py-3 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
