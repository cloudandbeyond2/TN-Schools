"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import { Activity, Eye, Stethoscope, FileText, PlusCircle, HeartPulse, X, GraduationCap, User, Ruler, Weight, Droplet, Target, Ear, ShieldCheck, Download, Calendar, ClipboardList, Smile, Clock, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

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
  group?: string;
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
  studentStatus: string;
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
  "Group"?: string;
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
  section?: string;
  phone: string;
  parentName: string;
  district: string;
  state: string;
  city: string;
  pincode: string;
  admissionNumber?: string;
  studentStatus?: string;
  group?: string;
  gender?: string;
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
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const populateForm = (s: any) => {
    setNewName(s.name || "");
    setNewRollNumber(s.rollNumber || "");
    let parsedClass = s.class || "";
    if (parsedClass && !parsedClass.toLowerCase().startsWith("class")) {
      parsedClass = `Class ${parsedClass.trim()}`;
    }
    setNewClass(parsedClass);
    setNewSection(s.section || "A");
    setNewGroup(s.group || "");
    setNewPhone(s.phone || "");
    setNewParentName(s.parentName || "");
    setNewDistrict(s.district || "");
    setNewState(s.state || "");
    setNewCity(s.city || "");
    setNewPincode(s.pincode || "");
    setNewAdmissionNumber(s.admissionNumber || "");
    setNewEmisNumber(s.emisNumber || "");
    const formatToDateInput = (dateStr: any) => {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      } catch (e) {}
      return String(dateStr);
    };
    setNewDob(formatToDateInput(s.dob));
    setNewGender(s.gender || "");
    setNewBloodGroup(s.bloodGroup || "");
    setNewReligion(s.religion || "");
    setNewCommunity(s.community || "");
    setNewNationality(s.nationality || "Indian");
    setNewMediumOfInstruction(s.mediumOfInstruction || "English");
    setNewAcademicYear(s.academicYear || "");
    setNewFatherName(s.fatherName || "");
    setNewFatherOccupation(s.fatherOccupation || "");
    setNewMotherName(s.motherName || "");
    setNewMotherOccupation(s.motherOccupation || "");
    setNewParentEmail(s.parentEmail || "");
    setNewAddress(s.address || "");
    setNewStudentStatus(s.studentStatus || "Active");
  };

  const handleOpenEdit = (s: any) => {
    populateForm(s);
    setIsViewMode(false);
    setIsEditMode(true);
    setEditingStudentId(s.id?.toString() || null);
    setIsModalOpen(true);
  };

  const handleOpenView = (s: any) => {
    populateForm(s);
    setIsViewMode(true);
    setIsEditMode(false);
    setEditingStudentId(s.id?.toString() || null);
    setIsModalOpen(true);
  };

  const [newName, setNewName] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");
  const [newClass, setNewClass] = useState("Class 10A");
  const [newGroup, setNewGroup] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newState, setNewState] = useState("Tamil Nadu");
  const [newCity, setNewCity] = useState("");
  const [newPincode, setNewPincode] = useState("");
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
  const [studentToDelete, setStudentToDelete] = useState<WatchlistStudent | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination & Bulk Delete state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      "Medium of Instruction", "Class", "Section", "Group", "Academic Year",
      "Father Name", "Father Occupation", "Mother Name", "Mother Occupation",
      "Primary Contact Name", "Parent Email", "Phone Number",
      "Address", "City", "District", "State", "Pincode", "Student Status"
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
        "Class": "Class 11",
        "Section": "A",
        "Group": "Computer Science",
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
        "Student Status": "Active"
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
        "Group": "",
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
        "Student Status": "Active"
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
          const group = row["Group"]?.toString().trim() || "";
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
            group,
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
    setImportProgress(0);
    const chunkSize = 25;
    let totalCreated = 0;

    try {
      for (let i = 0; i < validStudents.length; i += chunkSize) {
        const chunk = validStudents.slice(i, i + chunkSize);
        const res = await fetch(`${API_BASE}/api/headmaster/students/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: chunk }),
        });
        const json = await res.json();
        
        if (!json.success) {
          throw new Error(json.error || "Import failed");
        }
        
        totalCreated += (json.created || 0);
        setImportProgress(Math.min(100, Math.round(((i + chunk.length) / validStudents.length) * 100)));
      }
      
      showToast(`🎉 Successfully saved ${totalCreated} students to database!`);
      setPreviewStudents([]);
      setIsModalOpen(false);
      fetchWatchlist();
      
    } catch (err: any) {
      showToast(`❌ Import failed: ${err.message || 'Server error'}`, "error");
    } finally {
      setIsSaving(false);
      setImportProgress(0);
    }
  };

  // ── Save single manual entry to PostgreSQL ──────────────────────
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRollNumber) return;
    setIsSaving(true);
    try {
      const url = isEditMode ? `${API_BASE}/api/headmaster/students/${editingStudentId}` : `${API_BASE}/api/headmaster/students`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          rollNumber: newRollNumber,
          class: newClass,
          group: (newClass.includes('11') || newClass.includes('12')) ? newGroup : undefined,
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
        setNewParentName(""); setNewDistrict(""); setNewState("Tamil Nadu");
        setNewCity(""); setNewPincode("");
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
      const res = await fetch(`${API_BASE}/api/headmaster/students/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setWatchlist((prev) => prev.filter((s) => s.id !== id));
        showToast("🗑️ Student deleted successfully.");
      } else {
        showToast(`❌ Could not delete: ${json.error || "Server error"}`, "error");
      }
    } catch {
      showToast("🔴 Could not delete — server error.", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedStudentIds.length} students. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e2e8f0',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: '<span style="color: #475569; font-weight: bold;">Cancel</span>',
      background: '#ffffff',
      color: '#1e293b',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-slate-100',
        confirmButton: 'rounded-xl font-bold px-6 py-2.5',
        cancelButton: 'rounded-xl font-bold px-6 py-2.5 ml-3'
      }
    });

    if (!result.isConfirmed) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/students/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });
      const json = await res.json();
      
      if (json.success) {
        setWatchlist((prev) => prev.filter((s) => !s.id || !selectedStudentIds.includes(s.id)));
        setSelectedStudentIds([]);
        showToast("🗑️ Selected students deleted successfully.");
        
        // Check if we need to adjust currentPage
        const remainingItems = watchlist.length - selectedStudentIds.length;
        const newTotalPages = Math.max(1, Math.ceil(remainingItems / itemsPerPage));
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      } else {
        showToast(`❌ Could not delete: ${json.error || "Server error"}`, "error");
      }
      
    } catch {
      showToast("🔴 Could not delete some students.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWatchlist = watchlist.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  const totalPages = Math.max(1, Math.ceil(filteredWatchlist.length / itemsPerPage));
  const currentWatchlist = filteredWatchlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredWatchlist.filter(s => s.id).map(s => s.id as string);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = filteredWatchlist.filter(s => s.id).map(s => s.id as string);
      setSelectedStudentIds(prev => prev.filter(id => !allIds.includes(id)));
    }
  };

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, id]);
    } else {
      setSelectedStudentIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const isAllCurrentPageSelected = filteredWatchlist.length > 0 && filteredWatchlist.every(s => s.id && selectedStudentIds.includes(s.id));

  const activeCount = watchlist.filter((s) => !s.studentStatus || s.studentStatus === "Active").length;
  const boysCount = watchlist.filter((s) => s.gender === "Male").length;
  const girlsCount = watchlist.filter((s) => s.gender === "Female").length;

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
          { label: "Total Students", value: isLoading ? "..." : watchlist.length.toString(), icon: "🎓", color: "text-blue-400", bg: "bg-blue-500/10", sub: "All registered students" },
          { label: "Active Students", value: isLoading ? "..." : activeCount.toString(), icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10", sub: "Currently attending" },
          { label: "Boys", value: isLoading ? "..." : boysCount.toString(), icon: "👦", color: "text-indigo-400", bg: "bg-indigo-500/10", sub: "Male students" },
          { label: "Girls", value: isLoading ? "..." : girlsCount.toString(), icon: "👧", color: "text-pink-400", bg: "bg-pink-500/10", sub: "Female students" },
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 pl-9 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
              </div>
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected ({selectedStudentIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  populateForm({});
                  setIsViewMode(false);
                  setIsEditMode(false);
                  setEditingStudentId(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                + Add Student / Roster
              </button>
            </div>
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
                    <th className="w-10">
                      <input 
                        type="checkbox" 
                        checked={isAllCurrentPageSelected}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
                      />
                    </th>
                    <th className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-left">Student Name</th>
                    <th className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-left">Roll No / Class</th>
                    <th className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-left">Section</th>
                    <th className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-left">Parent Name</th>
                    <th className="text-xs font-bold text-slate-500 uppercase tracking-wider py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWatchlist.map((s) => (
                    <tr key={s.id || s.rollNumber}>
                      <td>
                        {s.id && (
                          <input 
                            type="checkbox" 
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={(e) => handleSelectStudent(s.id as string, e.target.checked)}
                            className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
                          />
                        )}
                      </td>
                      <td className="font-medium text-white">{s.name}</td>
                      <td>
                        <div className="text-xs text-slate-300">{s.rollNumber}</div>
                        <div className="text-[10px] text-slate-500">{s.class}</div>
                      </td>
                      <td className="text-xs font-bold text-slate-300">
                        {s.section || "—"}
                      </td>
                      <td>
                        <div className="text-xs text-slate-300">{s.parentName}</div>
                        <div className="text-[10px] text-slate-500">{s.phone}</div>
                      </td>
                      <td>
                                                <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenView(s)}
                            className="p-1.5 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-md transition-colors"
                            title="Edit Student"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
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
                          {s.id && (
                            <button
                              onClick={() => {
                                setStudentToDelete(s);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-2">
                  <span className="text-xs text-slate-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWatchlist.length)} of {filteredWatchlist.length} entries
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
                    >
                      Prev
                    </button>
                    {getPaginationPages().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={page === '...'}
                        className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                          currentPage === page 
                            ? "bg-blue-600 text-white" 
                            : page === '...'
                            ? "bg-transparent text-slate-500 cursor-default"
                            : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white disabled:opacity-50 hover:bg-slate-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
                  className="p-3.5 rounded-xl border text-xs border-amber-500/20 bg-amber-500/5"
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

                      {s.id && (
                        <button
                          onClick={() => {
                            setStudentToDelete(s);
                            setIsDeleteConfirmOpen(true);
                          }}
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
                {previewStudents.length > 0 ? "📋 Preview Roster Import" : "🎓 Register New Student"}
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
                        <tr className="border-b border-slate-200 bg-slate-100 sticky top-0 whitespace-nowrap">
                          <th className="p-3 text-slate-700 font-semibold">Student Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Admission No</th>
                          <th className="p-3 text-slate-700 font-semibold">Roll Number</th>
                          <th className="p-3 text-slate-700 font-semibold">EMIS Number</th>
                          <th className="p-3 text-slate-700 font-semibold">DOB</th>
                          <th className="p-3 text-slate-700 font-semibold">Gender</th>
                          <th className="p-3 text-slate-700 font-semibold">Blood Group</th>
                          <th className="p-3 text-slate-700 font-semibold">Religion</th>
                          <th className="p-3 text-slate-700 font-semibold">Community</th>
                          <th className="p-3 text-slate-700 font-semibold">Nationality</th>
                          <th className="p-3 text-slate-700 font-semibold">Medium</th>
                          <th className="p-3 text-slate-700 font-semibold">Class</th>
                          <th className="p-3 text-slate-700 font-semibold">Section</th>
                          <th className="p-3 text-slate-700 font-semibold">Group</th>
                          <th className="p-3 text-slate-700 font-semibold">Academic Year</th>
                          <th className="p-3 text-slate-700 font-semibold">Father Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Father Occ.</th>
                          <th className="p-3 text-slate-700 font-semibold">Mother Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Mother Occ.</th>
                          <th className="p-3 text-slate-700 font-semibold">Parent Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Parent Email</th>
                          <th className="p-3 text-slate-700 font-semibold">Phone Number</th>
                          <th className="p-3 text-slate-700 font-semibold">Address</th>
                          <th className="p-3 text-slate-700 font-semibold">City</th>
                          <th className="p-3 text-slate-700 font-semibold">District</th>
                          <th className="p-3 text-slate-700 font-semibold">State</th>
                          <th className="p-3 text-slate-700 font-semibold">Pincode</th>
                          <th className="p-3 text-slate-700 font-semibold">Student Status</th>
                          <th className="p-3 text-slate-700 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewStudents.map((s) => (
                          <tr
                            key={s.id}
                            className={s.isValid ? "hover:bg-slate-100/80 text-slate-800 whitespace-nowrap" : "bg-red-50/70 hover:bg-red-100/70 text-slate-800 whitespace-nowrap"}
                          >
                            <td className="p-3 font-semibold text-slate-900">
                              {s.name || <span className="text-red-500 italic">Name Missing</span>}
                            </td>
                            <td className="p-3 text-slate-700">{s.admissionNumber}</td>
                            <td className="p-3 text-slate-700">{s.rollNumber || <span className="text-red-500 italic">Roll Missing</span>}</td>
                            <td className="p-3 text-slate-700">{s.emisNumber}</td>
                            <td className="p-3 text-slate-700">{s.dob}</td>
                            <td className="p-3 text-slate-700">{s.gender}</td>
                            <td className="p-3 text-slate-700">{s.bloodGroup}</td>
                            <td className="p-3 text-slate-700">{s.religion}</td>
                            <td className="p-3 text-slate-700">{s.community}</td>
                            <td className="p-3 text-slate-700">{s.nationality}</td>
                            <td className="p-3 text-slate-700">{s.mediumOfInstruction}</td>
                            <td className="p-3 text-slate-800">{s.class}</td>
                            <td className="p-3 text-slate-700">{s.section}</td>
                            <td className="p-3 text-slate-700">{s.group}</td>
                            <td className="p-3 text-slate-700">{s.academicYear}</td>
                            <td className="p-3 text-slate-700">{s.fatherName}</td>
                            <td className="p-3 text-slate-700">{s.fatherOccupation}</td>
                            <td className="p-3 text-slate-700">{s.motherName}</td>
                            <td className="p-3 text-slate-700">{s.motherOccupation}</td>
                            <td className="p-3 text-slate-700">{s.parentName}</td>
                            <td className="p-3 text-slate-700">{s.parentEmail}</td>
                            <td className="p-3 text-slate-700">{s.phone}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[150px]">{s.address}</td>
                            <td className="p-3 text-slate-700">{s.city}</td>
                            <td className="p-3 text-slate-700">{s.district}</td>
                            <td className="p-3 text-slate-700">{s.state}</td>
                            <td className="p-3 text-slate-700">{s.pincode}</td>
                            <td className="p-3 text-slate-700">{s.studentStatus}</td>
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
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {isSaving && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-300 ease-out" 
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSaving ? (
                        <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving to DB... {importProgress}%</>
                      ) : (
                        `💾 Save to Database (${previewStudents.filter((s) => s.isValid).length} Students)`
                      )}
                    </span>
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
              <div className="flex flex-col gap-8">
                {/* Manual Form */}
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <fieldset disabled={isViewMode}>
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
                        <option value="F">F</option>
                        <option value="G">G</option>
                        <option value="H">H</option>
                      </select>
                    </div>
                    {(newClass.includes("11") || newClass.includes("12")) && (
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Group</label>
                        <select value={newGroup} onChange={(e) => setNewGroup(e.target.value)} className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                          <option value="">Select Group</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Bio-Maths">Bio-Maths</option>
                          <option value="Biology">Biology</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Commerce with Computer Applications">Commerce with Computer Applications</option>
                          <option value="Computer Applications">Computer Applications</option>
                          <option value="Pure Science">Pure Science</option>
                          <option value="Humanities">Humanities</option>
                          <option value="History">History</option>
                          <option value="Vocational">Vocational</option>
                          <option value="Agriculture / Technical Vocational">Agriculture / Technical Vocational</option>
                        </select>
                      </div>
                    )}
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
                      <input type="text" value={newPincode} onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="e.g. 641001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  {!isViewMode && <button type="submit" disabled={isSaving}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-4 flex items-center justify-center gap-2">
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                    ) : isEditMode ? "💾 Update Student Record" : "💾 Save Student Record"}
                  </button>}
</fieldset>
                </form>

                {!isEditMode && !isViewMode && (
                  <>
                    {/* Excel Import */}
                    <div className="border-t border-slate-200 pt-6 flex flex-col justify-between">
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
                  </>
                )}
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
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-800">
                  Delete Student
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-700">{studentToDelete.name}</span>? This action cannot be undone and will delete all dependent health records, marks, and attendance records.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(studentToDelete.id!)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-95"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
