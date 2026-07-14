"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
interface IconProps {
  className?: string;
  size?: number;
}

const Activity = ({ className, size }: IconProps) => <i className={`fi fi-rr-pulse inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Eye = ({ className, size }: IconProps) => <i className={`fi fi-rr-eye inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Stethoscope = ({ className, size }: IconProps) => <i className={`fi fi-rr-stethoscope inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const FileText = ({ className, size }: IconProps) => <i className={`fi fi-rr-document-signed inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const PlusCircle = ({ className, size }: IconProps) => <i className={`fi fi-rr-add inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const HeartPulse = ({ className, size }: IconProps) => <i className={`fi fi-rr-heart-rate inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const X = ({ className, size }: IconProps) => <i className={`fi fi-rr-cross inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const GraduationCap = ({ className, size }: IconProps) => <i className={`fi fi-rr-graduation-cap inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const User = ({ className, size }: IconProps) => <i className={`fi fi-rr-user inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Ruler = ({ className, size }: IconProps) => <i className={`fi fi-rr-ruler inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Weight = ({ className, size }: IconProps) => <i className={`fi fi-rr-weight inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Droplet = ({ className, size }: IconProps) => <i className={`fi fi-rr-drop inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Target = ({ className, size }: IconProps) => <i className={`fi fi-rr-target inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Ear = ({ className, size }: IconProps) => <i className={`fi fi-rr-hearing inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const ShieldCheck = ({ className, size }: IconProps) => <i className={`fi fi-rr-shield-check inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Download = ({ className, size }: IconProps) => <i className={`fi fi-rr-download inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Calendar = ({ className, size }: IconProps) => <i className={`fi fi-rr-calendar inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const ClipboardList = ({ className, size }: IconProps) => <i className={`fi fi-rr-clipboard-list inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Smile = ({ className, size }: IconProps) => <i className={`fi fi-rr-smile inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Clock = ({ className, size }: IconProps) => <i className={`fi fi-rr-clock inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Trash2 = ({ className, size }: IconProps) => <i className={`fi fi-rr-trash inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Lock = ({ className, size }: IconProps) => <i className={`fi fi-rr-lock inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Unlock = ({ className, size }: IconProps) => <i className={`fi fi-rr-unlock inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const CreditCard = ({ className, size }: IconProps) => <i className={`fi fi-rr-credit-card inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
const Camera = ({ className, size }: IconProps) => <i className={`fi fi-rr-camera inline-flex items-center justify-center ${className || ""}`} style={size ? { fontSize: `${size}px` } : undefined} />;
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

interface StudentConfidentialData {
  streetAddress: string;
  photo?: string;
  aadharNumber?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  schemes?: string[];
  docAadhar?: string;
  docIncome?: string;
  docCommunity?: string;
  docRation?: string;
}

const parseStudentAddress = (addressStr: string): StudentConfidentialData => {
  try {
    const parsed = JSON.parse(addressStr);
    if (parsed && typeof parsed === "object") {
      return {
        streetAddress: parsed.streetAddress || "",
        photo: parsed.photo || "",
        aadharNumber: parsed.aadharNumber || "",
        bankName: parsed.bankName || "",
        bankAccount: parsed.bankAccount || "",
        bankIfsc: parsed.bankIfsc || "",
        schemes: Array.isArray(parsed.schemes) ? parsed.schemes : [],
        docAadhar: parsed.docAadhar || "",
        docIncome: parsed.docIncome || "",
        docCommunity: parsed.docCommunity || "",
        docRation: parsed.docRation || ""
      };
    }
  } catch (e) {
    // Fallback
  }
  return {
    streetAddress: addressStr || "",
    photo: "",
    aadharNumber: "",
    bankName: "",
    bankAccount: "",
    bankIfsc: "",
    schemes: [],
    docAadhar: "",
    docIncome: "",
    docCommunity: "",
    docRation: ""
  };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

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
  address?: string;
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
  // Official TN HSC group codes (DGE Annexure I) for the 11th/12th Group field
  const [hscGroups, setHscGroups] = useState<{ code: string; name: string; streamCategory: string }[]>([]);
  const [streamLabels, setStreamLabels] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch(`${API_BASE}/api/competitive-exams/groups`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setHscGroups(json.data);
          setStreamLabels(json.streamLabels || {});
        }
      })
      .catch(() => { });
  }, []);

  // Academic history modal (archived years written by promotion approvals)
  const [historyStudent, setHistoryStudent] = useState<WatchlistStudent | null>(null);
  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleViewHistory = async (s: WatchlistStudent) => {
    if (!s.id) return;
    setHistoryStudent(s);
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/history/student/${s.id}`);
      const json = await res.json();
      setHistoryRows(json.success ? json.data : []);
    } catch {
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };


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
      } catch (e) { }
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

    // Parse serialized confidential fields from address field
    const meta = parseStudentAddress(s.address || "");
    setNewStreetAddress(meta.streetAddress || s.address || "");
    setNewPhoto(meta.photo || "");
    setNewAadharNumber(meta.aadharNumber || "");
    setNewBankName(meta.bankName || "");
    setNewBankAccount(meta.bankAccount || "");
    setNewBankIfsc(meta.bankIfsc || "");
    setNewSchemes(meta.schemes || []);
    setNewDocAadhar(meta.docAadhar || "");
    setNewDocIncome(meta.docIncome || "");
    setNewDocCommunity(meta.docCommunity || "");
    setNewDocRation(meta.docRation || "");

    // Reset validation errors
    setRollError("");
    setPhoneError("");
    setPincodeError("");
    setEmisError("");
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
  const [newClass, setNewClass] = useState("Class 6");
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

  // Confidential Fields states
  const [newStreetAddress, setNewStreetAddress] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [newAadharNumber, setNewAadharNumber] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newBankAccount, setNewBankAccount] = useState("");
  const [newBankIfsc, setNewBankIfsc] = useState("");
  const [newSchemes, setNewSchemes] = useState<string[]>([]);
  const [newDocAadhar, setNewDocAadhar] = useState("");
  const [newDocIncome, setNewDocIncome] = useState("");
  const [newDocCommunity, setNewDocCommunity] = useState("");
  const [newDocRation, setNewDocRation] = useState("");

  // UI Control states
  const [showAadhar, setShowAadhar] = useState(false);
  const [showBankAccount, setShowBankAccount] = useState(false);
  const [viewModalTab, setViewModalTab] = useState<"academic" | "confidential">("academic");

  // Live input validations
  const [pincodeError, setPincodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [rollError, setRollError] = useState("");
  const [emisError, setEmisError] = useState("");

  const handleRollChange = (val: string) => {
    // Only allow alphanumeric characters, uppercase them for standard format
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setNewRollNumber(cleaned);
    if (cleaned.length < 3 && cleaned.length > 0) {
      setRollError("Roll number must be at least 3 alphanumeric characters");
    } else {
      setRollError("");
    }
  };

  const handlePhoneChange = (val: string) => {
    // Limit to numeric, max 10 chars
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setNewPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handlePincodeChange = (val: string) => {
    // Limit to numeric, max 6 chars
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setNewPincode(cleaned);
    if (cleaned.length > 0 && cleaned.length < 6) {
      setPincodeError("Pincode must be exactly 6 digits");
    } else {
      setPincodeError("");
    }
  };

  const handleEmisChange = (val: string) => {
    // Only allow digits, max 16 digits
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    setNewEmisNumber(cleaned);
    if (cleaned.length > 0 && cleaned.length < 16) {
      setEmisError("EMIS Number must be exactly 16 digits");
    } else {
      setEmisError("");
    }
  };


  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [previewStudents, setPreviewStudents] = useState<ParsedPreviewStudent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [modalTab, setModalTab] = useState<"manual" | "excel">("manual");
  const [studentToDelete, setStudentToDelete] = useState<WatchlistStudent | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
        "Group": "2502",
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

    const workbook = XLSX.utils.book_new();

    // ── Sheet 1: Student Template ────────────────────────────────
    const ws1 = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    // Column widths
    ws1["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));
    XLSX.utils.book_append_sheet(workbook, ws1, "Student Template");

    // ── Sheet 2: HSC Groups Reference ───────────────────────────
    const hscGroupsData = [
      { "Note": "For Class 11 & 12 only. Enter ONLY the Group Code (e.g. 2502) in the Group column.", "Code": "", "Group Name": "", "Stream": "" },
      { "Note": "", "Code": "CODE", "Group Name": "GROUP NAME (Subjects)", "Stream": "STREAM" },
      { "Note": "", "Code": "1001", "Group Name": "Tamil, English, History, Geography", "Stream": "Arts" },
      { "Note": "", "Code": "1002", "Group Name": "Tamil, English, Economics, Commerce", "Stream": "Arts" },
      { "Note": "", "Code": "1003", "Group Name": "Tamil, English, History, Economics", "Stream": "Arts" },
      { "Note": "", "Code": "1004", "Group Name": "Tamil, English, Accountancy, Commerce", "Stream": "Arts" },
      { "Note": "", "Code": "1005", "Group Name": "Tamil, English, Civics, Geography", "Stream": "Arts" },
      { "Note": "", "Code": "1101", "Group Name": "Tamil, English, Computer Applications, Accountancy", "Stream": "Vocational" },
      { "Note": "", "Code": "1102", "Group Name": "Tamil, English, Computer Science, Mathematics", "Stream": "Vocational" },
      { "Note": "", "Code": "2501", "Group Name": "Physics, Chemistry, Statistics, Mathematics", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2502", "Group Name": "Physics, Chemistry, Computer Science, Mathematics", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2503", "Group Name": "Physics, Chemistry, Biology, Mathematics", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2504", "Group Name": "Physics, Chemistry, Bio-Chemistry, Mathematics", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2505", "Group Name": "Physics, Chemistry, Communicative English, Mathematics", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2506", "Group Name": "Physics, Chemistry, Mathematics, Home Science", "Stream": "Science (with Mathematics)" },
      { "Note": "", "Code": "2601", "Group Name": "Physics, Chemistry, Biology, Computer Science", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2602", "Group Name": "Physics, Chemistry, Biology, Micro-Biology", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2603", "Group Name": "Physics, Chemistry, Biology, Bio-Chemistry", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2604", "Group Name": "Physics, Chemistry, Biology, General Nursing", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2605", "Group Name": "Physics, Chemistry, Biology, Nutrition and Dietetics", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2606", "Group Name": "Physics, Chemistry, Biology, Communicative English", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2607", "Group Name": "Physics, Chemistry, Biology, Home Science", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2608", "Group Name": "Physics, Chemistry, Botany, Zoology", "Stream": "Science (with Biology)" },
      { "Note": "", "Code": "2701", "Group Name": "Statistics, Economics, Commerce, Accountancy", "Stream": "Commerce" },
      { "Note": "", "Code": "2702", "Group Name": "Economics, Commerce, Accountancy, Computer Applications", "Stream": "Commerce" },
      { "Note": "", "Code": "2703", "Group Name": "Communicative English, Economics, Commerce, Accountancy", "Stream": "Commerce" },
      { "Note": "", "Code": "2704", "Group Name": "Economics, Commerce, Accountancy, Business Mathematics", "Stream": "Commerce" },
    ];
    const ws2 = XLSX.utils.json_to_sheet(hscGroupsData, {
      header: ["Note", "Code", "Group Name", "Stream"]
    });
    ws2["!cols"] = [{ wch: 60 }, { wch: 8 }, { wch: 60 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(workbook, ws2, "HSC Groups Reference");

    // ── Sheet 3: Field Guide ────────────────────────────────────
    const fieldGuideData = [
      { "Field": "Gender", "Accepted Values": "Male | Female | Other", "Notes": "Case sensitive" },
      { "Field": "Blood Group", "Accepted Values": "A+ | A- | B+ | B- | O+ | O- | AB+ | AB-", "Notes": "Use + and - symbols" },
      { "Field": "Religion", "Accepted Values": "Hindu | Muslim | Christian | Other", "Notes": "" },
      { "Field": "Community", "Accepted Values": "BC | MBC | SC | ST | OC | OBC | Other", "Notes": "Tamil Nadu reservation categories" },
      { "Field": "Nationality", "Accepted Values": "Indian", "Notes": "Default: Indian" },
      { "Field": "Medium of Instruction", "Accepted Values": "English | Tamil | Telugu | Urdu | Hindi", "Notes": "Default: English" },
      { "Field": "Class", "Accepted Values": "Class 1 … Class 12 (or just 1 … 12)", "Notes": "e.g. Class 10, Class 11" },
      { "Field": "Section", "Accepted Values": "A | B | C | D | ...", "Notes": "Single uppercase letter" },
      { "Field": "Group", "Accepted Values": "Group code from Sheet 2 (e.g. 2502)", "Notes": "Only for Class 11 & 12. Leave blank for Classes 1-10." },
      { "Field": "Academic Year", "Accepted Values": "2023-24 | 2024-25 | 2025-26", "Notes": "Format: YYYY-YY" },
      { "Field": "Student Status", "Accepted Values": "Active | Inactive | Transfer | Dropout | Passed Out", "Notes": "Default: Active" },
      { "Field": "Date of Birth", "Accepted Values": "YYYY-MM-DD format", "Notes": "e.g. 2008-05-12" },
      { "Field": "Phone Number", "Accepted Values": "10-digit mobile number", "Notes": "e.g. 9876543210" },
      { "Field": "Pincode", "Accepted Values": "6-digit pincode", "Notes": "e.g. 641001" },
      { "Field": "Roll Number", "Accepted Values": "Any unique string", "Notes": "REQUIRED. Must be unique per school." },
      { "Field": "Full Name", "Accepted Values": "Student full name", "Notes": "REQUIRED." },
    ];
    const ws3 = XLSX.utils.json_to_sheet(fieldGuideData, {
      header: ["Field", "Accepted Values", "Notes"]
    });
    ws3["!cols"] = [{ wch: 24 }, { wch: 50 }, { wch: 38 }];
    XLSX.utils.book_append_sheet(workbook, ws3, "Field Guide");

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
        const workbook = XLSX.read(data, { type: "binary", cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // raw:false + dateNF ensures Excel date cells come back as "YYYY-MM-DD" strings
        // instead of raw serial numbers (e.g. 41411) which JavaScript misparses as a year.
        const parsedData = XLSX.utils.sheet_to_json<ExcelStudentRow>(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        const MAX_LIMIT = 150;
        if (parsedData.length > MAX_LIMIT) {
          showToast(`❌ Limit Exceeded: File has ${parsedData.length} rows. Maximum allowed is ${MAX_LIMIT} rows per upload to ensure smooth processing.`, "error");
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const validated: ParsedPreviewStudent[] = parsedData.map((row, idx) => {
          const name = row["Full Name"]?.toString().trim() || "";
          const rollNumber = row["Roll Number"]?.toString().trim() || "";
          const admissionNumber = row["Admission Number"]?.toString().trim() || "";
          const emisNumber = row["EMIS Number"]?.toString().trim() || "";
          // Helper: if XLSX returned an Excel serial number despite dateNF, convert it
          const rawDob = row["Date of Birth (YYYY-MM-DD)"];
          const excelSerialToDateStr = (serial: number): string => {
            // Excel epoch is Dec 30 1899; convert serial days to JS Date
            const msPerDay = 86400000;
            const excelEpoch = new Date(1899, 11, 30).getTime();
            const d = new Date(excelEpoch + serial * msPerDay);
            return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
          };
          const dob = (rawDob !== undefined && rawDob !== null && rawDob !== '')
            ? (typeof rawDob === 'number'
                ? excelSerialToDateStr(rawDob)
                : rawDob.toString().trim())
            : "";
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
    let totalSkipped = 0;
    const allErrors: string[] = [];

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
        totalSkipped += (json.skipped || 0);
        if (json.errors && json.errors.length > 0) {
          allErrors.push(...json.errors);
        }
        setImportProgress(Math.min(100, Math.round(((i + chunk.length) / validStudents.length) * 100)));
      }

      if (totalCreated > 0) {
        const skipMsg = totalSkipped > 0 ? ` (${totalSkipped} skipped — duplicate roll numbers or missing data)` : ``;
        showToast(`🎉 Successfully saved ${totalCreated} students to database!${skipMsg}`);
      } else {
        showToast(`⚠️ No students were saved. ${totalSkipped} rows skipped. Check roll numbers are unique and all required fields are filled.`, "error");
      }

      if (allErrors.length > 0) {
        console.warn("Bulk import errors:", allErrors);
      }

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
    if (!newName.trim()) return;

    // Run dynamic submission validations
    let localRollError = "";
    let localPhoneError = "";
    let localPincodeError = "";
    let localEmisError = "";
    const invalidFields: string[] = [];

    // 1. Roll Number Validation
    if (!newRollNumber.trim()) {
      localRollError = "Roll Number is required";
      invalidFields.push("Roll Number");
    } else if (newRollNumber.replace(/[^a-zA-Z0-9]/g, "").length < 3) {
      localRollError = "Roll number must be at least 3 alphanumeric characters";
      invalidFields.push("Roll Number");
    }

    // 2. Phone Number Validation (Required by form schema)
    const cleanPhone = newPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      localPhoneError = "Phone number is required";
      invalidFields.push("Phone Number");
    } else if (cleanPhone.length !== 10) {
      localPhoneError = "Phone number must be exactly 10 digits";
      invalidFields.push("Phone Number");
    }

    // 3. Pincode Validation (Optional, but if set, must be 6 digits)
    const cleanPincode = newPincode.replace(/\D/g, "");
    if (newPincode && cleanPincode.length !== 6) {
      localPincodeError = "Pincode must be exactly 6 digits";
      invalidFields.push("Pincode");
    }

    // 4. EMIS Number Validation (Optional, but if set, must be 16 digits)
    const cleanEmis = newEmisNumber.replace(/\D/g, "");
    if (newEmisNumber && cleanEmis.length !== 16) {
      localEmisError = "EMIS Number must be exactly 16 digits";
      invalidFields.push("EMIS Number");
    }

    // Update states
    setRollError(localRollError);
    setPhoneError(localPhoneError);
    setPincodeError(localPincodeError);
    setEmisError(localEmisError);

    if (invalidFields.length > 0) {
      showToast(`❌ Please fix errors in: ${invalidFields.join(", ")}`, "error");

      // Auto-scroll first error element into view and focus it
      let elementId = "";
      const firstInvalid = invalidFields[0];
      if (firstInvalid === "Roll Number") elementId = "manual-roll-number";
      else if (firstInvalid === "Phone Number") elementId = "manual-phone-number";
      else if (firstInvalid === "Pincode") elementId = "manual-pincode";
      else if (firstInvalid === "EMIS Number") elementId = "manual-emis-number";

      if (elementId) {
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }, 100);
      }
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode ? `${API_BASE}/api/headmaster/students/${editingStudentId}` : `${API_BASE}/api/headmaster/students`;
      const method = isEditMode ? "PUT" : "POST";

      const serializedAddress = JSON.stringify({
        streetAddress: newStreetAddress,
        photo: newPhoto,
        aadharNumber: newAadharNumber,
        bankName: newBankName,
        bankAccount: newBankAccount,
        bankIfsc: newBankIfsc,
        schemes: newSchemes,
        docAadhar: newDocAadhar,
        docIncome: newDocIncome,
        docCommunity: newDocCommunity,
        docRation: newDocRation
      });

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
          address: serializedAddress,
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
        setNewFatherName(""); setNewFatherOccupation(""); setNewMotherName(""); setNewMotherOccupation("");
        setNewParentEmail(""); setNewAddress(""); setNewStudentStatus("Active");
        
        // Clear confidential fields states
        setNewStreetAddress("");
        setNewPhoto("");
        setNewAadharNumber("");
        setNewBankName("");
        setNewBankAccount("");
        setNewBankIfsc("");
        setNewSchemes([]);
        setNewDocAadhar("");
        setNewDocIncome("");
        setNewDocCommunity("");
        setNewDocRation("");

        // Clear error states
        setRollError("");
        setPhoneError("");
        setPincodeError("");
        setEmisError("");

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
    setDeleting(true);
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
      setDeleting(false);
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
          <i className="fi fi-rr-school text-blue-400 text-base" />
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 fade-in">
        {[
          { label: "Total Students", value: isLoading ? "..." : watchlist.length.toString(), icon: <i className="fi fi-rr-graduation-cap" />, color: "text-blue-400", bg: "bg-blue-500/10", sub: "All registered students" },
          { label: "Active Students", value: isLoading ? "..." : activeCount.toString(), icon: <i className="fi fi-rr-checkbox" />, color: "text-emerald-400", bg: "bg-emerald-500/10", sub: "Currently attending" },
          { label: "Boys", value: isLoading ? "..." : boysCount.toString(), icon: <i className="fi fi-rr-user" />, color: "text-indigo-400", bg: "bg-indigo-500/10", sub: "Male students" },
          { label: "Girls", value: isLoading ? "..." : girlsCount.toString(), icon: <i className="fi fi-rr-user" />, color: "text-pink-400", bg: "bg-pink-500/10", sub: "Female students" },
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
        <div className={`fixed top-5 right-5 z-[9999] max-w-sm p-4 border text-xs rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in ${toast.type === "error"
            ? "bg-red-950/95 border-red-500/40 text-red-200"
            : "bg-emerald-950/95 border-emerald-500/40 text-emerald-200"
          }`}>
          <div className="flex items-center gap-2">
            {toast.type === "error" ? (
              <i className="fi fi-rr-exclamation text-red-400 text-sm shrink-0" />
            ) : (
              <i className="fi fi-rr-check-circle text-emerald-400 text-sm shrink-0" />
            )}
            <span>{toast.msg.replace(/^[⚠️❌🔴🎉🗑️📊\s]+/, "")}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-[10px] font-bold text-slate-455 hover:text-white shrink-0 ml-2 flex items-center justify-center"
          >
            <i className="fi fi-rr-cross text-[9px]" />
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="w-full glass rounded-2xl p-3 sm:p-6 border border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <i className="fi fi-rr-school text-blue-400" /> Student Watchlist Overview
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 pl-9 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 md:w-64 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
                  <i className="fi fi-rr-search text-[13px]" />
                </div>
              </div>
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1 sm:gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Delete Selected</span> ({selectedStudentIds.length})
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
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md"
              >
                + Add Student<span className="hidden sm:inline"> / Roster</span>
              </button>
            </div>
          </div>
          {watchlist.length === 0 && !isLoading ? (
            <div className="text-center py-16 text-slate-500 text-[10px] sm:text-xs">
              <div className="text-3xl mb-3 text-slate-400">
                <i className="fi fi-rr-clipboard-list" />
              </div>
              <div className="font-semibold text-slate-400 mb-1">No student records yet</div>
              <div>Use the form or Excel import to add students to the database.</div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-10 px-2 sm:px-4 py-2 sm:py-4">
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
                      />
                    </th>
                    <th className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-4 text-left">Student Name</th>
                    <th className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-4 text-left">Roll No / Class</th>
                    <th className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-4 text-left">Section</th>
                    <th className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-4 text-left">Parent Name</th>
                    <th className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWatchlist.map((s) => (
                    <tr key={s.id || s.rollNumber}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {s.id && (
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={(e) => handleSelectStudent(s.id as string, e.target.checked)}
                            className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
                          />
                        )}
                      </td>
                      <td className="font-medium text-slate-800 dark:text-white px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {(() => {
                            const meta = parseStudentAddress(s.address || "");
                            if (meta.photo) {
                              return <img src={meta.photo} alt={s.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-700 shrink-0" />;
                            } else {
                              return (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 border border-slate-200 dark:border-slate-700">
                                  {s.name.charAt(0).toUpperCase()}
                                </div>
                              );
                            }
                          })()}
                          <span className="text-[11px] sm:text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="text-[10px] sm:text-xs text-slate-850 dark:text-slate-300">{s.rollNumber}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-500">{s.class}</div>
                      </td>
                      <td className="text-[10px] sm:text-xs font-bold text-slate-850 dark:text-slate-300 px-2 sm:px-4 py-2 sm:py-3">
                        {s.section || "—"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="text-[10px] sm:text-xs text-slate-300">{s.parentName}</div>
                        <div className="text-[9px] sm:text-[10px] text-slate-500">{s.phone}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleOpenView(s)}
                            className="p-1 sm:p-1.5 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 sm:p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-md transition-colors flex items-center justify-center"
                            title="Edit Student"
                          >
                            <i className="fi fi-rr-edit text-[11px] sm:text-xs" />
                          </button>
                          {healthReports[s.id || s.rollNumber] ? (
                            <button
                              onClick={() => handleViewHealthReport(s)}
                              className="p-1 sm:p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                              title="View Health Report"
                            >
                              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenHealthModal(s)}
                              className="p-1 sm:p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors"
                              title="Add Health Report"
                            >
                              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          {s.id && (
                            <button
                              onClick={() => handleViewHistory(s)}
                              className="p-1 sm:p-1.5 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 rounded-md transition-colors"
                              title="Academic History"
                            >
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          {s.id && (
                            <button
                              onClick={() => {
                                setStudentToDelete(s);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="p-1 sm:p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                        className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${currentPage === page
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
      </div>

      {/* ── Bulk Import Template Card ─────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xl shrink-0">
              <i className="fi fi-rr-file-spreadsheet text-lg" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Bulk Student Import</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Download the Excel template, fill student data, and upload to register hundreds of students at once.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={downloadExcelTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template (.xlsx)
            </button>
            <button
              onClick={() => {
                populateForm({});
                setIsViewMode(false);
                setIsEditMode(false);
                setEditingStudentId(null);
                setModalTab("excel");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-xl transition-all whitespace-nowrap"
            >
              <i className="fi fi-rr-upload" /> Upload Now
            </button>
          </div>
        </div>

        {/* Template columns reference */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3"><i className="fi fi-rr-clipboard-list mr-1" /> Template Columns Reference</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
            {[
              { col: "Full Name", req: true },
              { col: "Roll Number", req: true },
              { col: "Admission Number", req: false },
              { col: "EMIS Number", req: false },
              { col: "Date of Birth (YYYY-MM-DD)", req: false },
              { col: "Gender", req: false },
              { col: "Blood Group", req: false },
              { col: "Religion", req: false },
              { col: "Community", req: false },
              { col: "Nationality", req: false },
              { col: "Medium of Instruction", req: false },
              { col: "Class", req: false },
              { col: "Section", req: false },
              { col: "Group", req: false },
              { col: "Academic Year", req: false },
              { col: "Father Name", req: false },
              { col: "Mother Name", req: false },
              { col: "Primary Contact Name", req: false },
              { col: "Phone Number", req: false },
              { col: "Parent Email", req: false },
              { col: "Address", req: false },
              { col: "City", req: false },
              { col: "District", req: false },
              { col: "State", req: false },
              { col: "Pincode", req: false },
              { col: "Student Status", req: false },
            ].map(({ col, req }) => (
              <div key={col} className="flex items-center gap-1.5">
                {req ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                )}
                <span className={`text-[10px] font-medium truncate ${req ? "text-slate-200" : "text-slate-400"}`}>{col}</span>
                {req && <span className="text-[8px] text-red-400 font-bold shrink-0">*</span>}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-500 mt-3"><span className="text-red-400">*</span> Required columns. All other columns are optional but recommended.</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 relative transition-all duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Modal Header with Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2.5">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setModalTab("manual")}
                  disabled={previewStudents.length > 0}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${modalTab === "manual"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <span className="flex items-center gap-1.5"><i className="fi fi-rr-edit" /> Manual Entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("excel")}
                  disabled={previewStudents.length > 0}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${modalTab === "excel"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <span className="flex items-center gap-1.5"><i className="fi fi-rr-file-spreadsheet" /> Excel Import</span>
                </button>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setPreviewStudents([]); setModalTab("manual"); }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold self-end sm:self-auto flex items-center gap-1"
              >
                <i className="fi fi-rr-cross text-[9px]" /> Close
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
                                <span className="text-emerald-600 font-medium flex items-center justify-end gap-1">
                                  <i className="fi fi-rr-check-circle" /> Ready
                                </span>
                              ) : (
                                <span className="text-red-500 font-semibold flex items-center justify-end gap-1" title={s.validationError}>
                                  <i className="fi fi-rr-exclamation" /> Invalid
                                </span>
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
                        <span className="flex items-center gap-1.5 justify-center">
                          <i className="fi fi-rr-disk" /> Save to Database ({previewStudents.filter((s) => s.isValid).length} Students)
                        </span>
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
              <div className="flex flex-col gap-4">
                {/* ── MANUAL ENTRY TAB ── */}
                {modalTab === "manual" && (
                  isViewMode ? (
                    /* ── HIGH FIDELITY STUDENT PROFILE SHEET (VIEW MODE) ── */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-800 dark:text-slate-200">
                      
                      {/* Left Column: Profile Card */}
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-3xl p-5 flex flex-col items-center text-center space-y-4 self-start">
                        
                        {/* Profile Image */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden shadow border-4 border-white dark:border-slate-800">
                          {newPhoto ? (
                            <img src={newPhoto} alt={newName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-3xl font-black">
                              {newName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{newName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{newClass} · Section {newSection}</p>
                          {newGroup && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-[9px] font-black uppercase">
                              Group {newGroup}
                            </span>
                          )}
                        </div>

                        <div className="w-full space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-350">
                          <div className="flex justify-between">
                            <span className="text-slate-455">EMIS Number</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">{newEmisNumber || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Roll Number</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">{newRollNumber || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Admission No</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">{newAdmissionNumber || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Status</span>
                            <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                              newStudentStatus === "Active" ? "bg-emerald-500/10 text-emerald-605" : "bg-red-500/10 text-red-600"
                            }`}>{newStudentStatus}</span>
                          </div>
                        </div>

                        <div className="w-full space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-350">
                          <div className="flex justify-between">
                            <span className="text-slate-455">Gender</span>
                            <span className="font-bold text-slate-800 dark:text-white">{newGender || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Date of Birth</span>
                            <span className="font-bold text-slate-800 dark:text-white">{newDob || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Blood Group</span>
                            <span className="px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 rounded font-black text-[10px]">{newBloodGroup || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Religion/Caste</span>
                            <span className="font-bold text-slate-800 dark:text-white">{newReligion || "—"} · {newCommunity || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Medium</span>
                            <span className="font-bold text-slate-800 dark:text-white">{newMediumOfInstruction}</span>
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Tabbed Details */}
                      <div className="md:col-span-2 space-y-4">
                        
                        {/* View Tabs */}
                        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setViewModalTab("academic")}
                            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[10px] ${
                              viewModalTab === "academic" 
                                ? "border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold" 
                                : "border-transparent text-slate-400 hover:text-slate-650"
                            }`}
                          >
                            🏫 Academic & Contact Info
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewModalTab("confidential")}
                            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[10px] flex items-center gap-1.5 ${
                              viewModalTab === "confidential" 
                                ? "border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold" 
                                : "border-transparent text-slate-400 hover:text-slate-650"
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5 text-blue-500" />
                            <span>🔐 Confidential Records</span>
                          </button>
                        </div>

                        {/* Tab 1: Academic & Contact */}
                        {viewModalTab === "academic" && (
                          <div className="space-y-4 pt-2 fade-in">
                            
                            {/* Family Details */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Parent / Guardian Details</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Father Name</span>
                                  <span className="font-extrabold text-slate-800 dark:text-white">{newFatherName || "—"}</span>
                                  {newFatherOccupation && <span className="text-[10px] text-slate-500 block">({newFatherOccupation})</span>}
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Mother Name</span>
                                  <span className="font-extrabold text-slate-800 dark:text-white">{newMotherName || "—"}</span>
                                  {newMotherOccupation && <span className="text-[10px] text-slate-500 block">({newMotherOccupation})</span>}
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Primary Guardian</span>
                                  <span className="font-extrabold text-slate-800 dark:text-white">{newParentName || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Parent Email</span>
                                  <span className="font-extrabold text-slate-800 dark:text-white">{newParentEmail || "—"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Contact & Address</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Mobile Contact</span>
                                  <span className="font-black text-slate-800 dark:text-white">{newPhone || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">City & District</span>
                                  <span className="font-bold text-slate-800 dark:text-white">{newCity || "—"}, {newDistrict || "—"}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400 block mb-0.5">Permanent Address</span>
                                  <p className="font-bold text-slate-800 dark:text-white">{newStreetAddress || newAddress || "—"}</p>
                                  <p className="text-[10px] text-slate-500 mt-1">{newCity} · {newDistrict} · {newState} - {newPincode}</p>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* Tab 2: Confidential Records */}
                        {viewModalTab === "confidential" && (
                          <div className="space-y-4 pt-2 fade-in">
                            
                            {/* Privacy warning */}
                            <div className="bg-blue-50/50 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-2.5">
                              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                              <span className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold leading-relaxed">
                                Access Restricted: Financial and national identity card documents are encrypted and masked under school governance policy.
                              </span>
                            </div>

                            {/* Aadhaar Details */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Identity Details</h4>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Aadhaar Number</span>
                                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                                    {newAadharNumber 
                                      ? (showAadhar ? newAadharNumber.replace(/(\d{4})/g, '$1 ').trim() : "•••• •••• " + newAadharNumber.slice(-4)) 
                                      : "Not Registered"}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {newAadharNumber && (
                                    <button
                                      type="button"
                                      onClick={() => setShowAadhar(!showAadhar)}
                                      className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                                    >
                                      {showAadhar ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      <span>{showAadhar ? "Obscure" : "Reveal"}</span>
                                    </button>
                                  )}
                                  
                                  {newDocAadhar ? (
                                    <a
                                      href={newDocAadhar}
                                      download={`aadhar_${newRollNumber}.png`}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download Copy</span>
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic font-semibold self-center">No Aadhaar document uploaded.</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bank Account */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</h4>
                              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Bank Name</span>
                                  <span className="font-extrabold text-slate-800 dark:text-white">{newBankName || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Bank IFSC Code</span>
                                  <span className="font-mono font-bold text-slate-800 dark:text-white">{newBankIfsc || "—"}</span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                                <div>
                                  <span className="text-slate-400 block mb-0.5">Account Number</span>
                                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">
                                    {newBankAccount 
                                      ? (showBankAccount ? newBankAccount : "••••••••" + newBankAccount.slice(-4)) 
                                      : "Not Registered"}
                                  </span>
                                </div>
                                {newBankAccount && (
                                  <button
                                    type="button"
                                    onClick={() => setShowBankAccount(!showBankAccount)}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                                  >
                                    {showBankAccount ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    <span>{showBankAccount ? "Obscure" : "Reveal Account"}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Active Schemes */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Welfare & Government Schemes Held</h4>
                              {newSchemes.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No welfare schemes hold by student.</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {newSchemes.map((scheme) => (
                                    <span key={scheme} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs font-bold shadow-sm">
                                      ✓ {scheme}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Welfare Certificates Attachments */}
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Welfare Certificates & Attachments</h4>
                              <div className="grid grid-cols-3 gap-3">
                                
                                <div className="bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 p-3 rounded-xl flex flex-col justify-between items-center text-center space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 block">Income Certificate</span>
                                  {newDocIncome ? (
                                    <>
                                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-bold">Uploaded</span>
                                      <a href={newDocIncome} download={`income_${newRollNumber}.png`} className="text-[10px] text-blue-650 dark:text-blue-400 font-bold underline hover:text-blue-705">Download</a>
                                    </>
                                  ) : (
                                    <>
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-md text-[9px] font-bold">Pending</span>
                                      <span className="text-[9px] text-slate-400 italic">No document</span>
                                    </>
                                  )}
                                </div>

                                <div className="bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 p-3 rounded-xl flex flex-col justify-between items-center text-center space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 block">Community Certificate</span>
                                  {newDocCommunity ? (
                                    <>
                                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-bold">Uploaded</span>
                                      <a href={newDocCommunity} download={`community_${newRollNumber}.png`} className="text-[10px] text-blue-655 dark:text-blue-400 font-bold underline hover:text-blue-700">Download</a>
                                    </>
                                  ) : (
                                    <>
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-md text-[9px] font-bold">Pending</span>
                                      <span className="text-[9px] text-slate-400 italic">No document</span>
                                    </>
                                  )}
                                </div>

                                <div className="bg-white dark:bg-slate-950 border border-slate-255 dark:border-slate-850 p-3 rounded-xl flex flex-col justify-between items-center text-center space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 block">Ration / Smart Card</span>
                                  {newDocRation ? (
                                    <>
                                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md text-[9px] font-bold">Uploaded</span>
                                      <a href={newDocRation} download={`ration_${newRollNumber}.png`} className="text-[10px] text-blue-655 dark:text-blue-400 font-bold underline hover:text-blue-700">Download</a>
                                    </>
                                  ) : (
                                    <>
                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-md text-[9px] font-bold">Pending</span>
                                      <span className="text-[9px] text-slate-400 italic">No document</span>
                                    </>
                                  )}
                                </div>

                              </div>
                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    /* ── REGULAR ADD / EDIT STUDENT MANUAL FORM ── */
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                      <fieldset disabled={isViewMode}>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Manual Entry</div>

                        {/* Personal Details */}
                        <div className="pt-1 pb-2 border-b border-slate-200">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Personal Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Admission Number</label>
                            <input type="text" value={newAdmissionNumber} onChange={(e) => setNewAdmissionNumber(e.target.value)}
                              placeholder="e.g. ADM2026101"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">
                              EMIS Number
                              <span className="ml-1 text-slate-400 font-normal">(16 digits)</span>
                            </label>
                            <input type="text" id="manual-emis-number" value={newEmisNumber} onChange={(e) => handleEmisChange(e.target.value)}
                              placeholder="e.g. 3302100010101234"
                              maxLength={16}
                              className={`w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${emisError
                                  ? "border-red-400 focus:border-red-500 focus:bg-white"
                                  : newEmisNumber.length === 16
                                    ? "border-emerald-400 focus:border-emerald-500 focus:bg-white"
                                    : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                }`} />
                            {emisError && (
                              <p className="mt-0.5 text-[9px] text-red-500 font-semibold">{emisError}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">
                              Roll Number
                              <span className="ml-1 text-red-550 font-normal">*</span>
                            </label>
                            <input type="text" id="manual-roll-number" required value={newRollNumber} onChange={(e) => handleRollChange(e.target.value)}
                              placeholder="e.g. HM10101"
                              className={`w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none transition-colors ${rollError
                                  ? "border-red-400 focus:border-red-500 focus:bg-white"
                                  : newRollNumber.length >= 3
                                    ? "border-emerald-400 focus:border-emerald-500 focus:bg-white"
                                    : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                }`} />
                            {rollError && (
                              <p className="mt-0.5 text-[9px] text-red-500 font-semibold">{rollError}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Academic Year</label>
                            <input type="text" value={newAcademicYear} onChange={(e) => setNewAcademicYear(e.target.value)}
                              placeholder="e.g. 2024-25"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Class</label>
                            <select required value={newClass} onChange={(e) => setNewClass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                              <option value="">Select Class</option>
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
                              <label className="block text-[10px] text-slate-600 mb-1 font-semibold">HSC Group (DGE code)</label>
                              <select value={newGroup} onChange={(e) => setNewGroup(e.target.value)} className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                                <option value="">Select Group</option>
                                {Object.keys(streamLabels).map((stream) => (
                                  <optgroup key={stream} label={streamLabels[stream] || stream}>
                                    {hscGroups
                                      .filter((g) => g.streamCategory === stream)
                                      .map((g) => (
                                        <option key={g.code} value={g.code}>{g.name}</option>
                                      ))}
                                  </optgroup>
                                ))}
                              </select>
                              <p className="text-[9px] text-slate-400 mt-1">Official Annexure-I group codes — used for competitive exam recommendations on the student panel.</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Father Name</label>
                            <input type="text" value={newFatherName} onChange={(e) => setNewFatherName(e.target.value)}
                              placeholder="e.g. Ramasamy"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Father Occupation</label>
                            <input type="text" value={newFatherOccupation} onChange={(e) => setNewFatherOccupation(e.target.value)}
                              placeholder="e.g. Farmer"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Mother Name</label>
                            <input type="text" value={newMotherName} onChange={(e) => setNewMotherName(e.target.value)}
                              placeholder="e.g. Lakshmi"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Mother Occupation</label>
                            <input type="text" value={newMotherOccupation} onChange={(e) => setNewMotherOccupation(e.target.value)}
                              placeholder="e.g. Homemaker"
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
                              placeholder="e.g. parent@example.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">
                              Phone Number
                              <span className="ml-1 text-red-550 font-normal">*</span>
                            </label>
                            <input type="text" id="manual-phone-number" required value={newPhone} onChange={(e) => handlePhoneChange(e.target.value)}
                              placeholder="e.g. 9876543210"
                              maxLength={10}
                              className={`w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none transition-colors ${phoneError
                                  ? "border-red-400 focus:border-red-500 focus:bg-white"
                                  : newPhone.length === 10
                                    ? "border-emerald-400 focus:border-emerald-500 focus:bg-white"
                                    : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                }`} />
                            {phoneError && (
                              <p className="mt-0.5 text-[9px] text-red-500 font-semibold">{phoneError}</p>
                            )}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="pt-3 pb-2 border-b border-slate-200">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Address Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Address</label>
                            <input type="text" value={newStreetAddress} onChange={(e) => setNewStreetAddress(e.target.value)}
                              placeholder="e.g. 123 Main Street"
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
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">
                              Pincode
                              <span className="ml-1 text-slate-400 font-normal">(6 digits)</span>
                            </label>
                            <input type="text" id="manual-pincode" value={newPincode} onChange={(e) => handlePincodeChange(e.target.value)}
                              placeholder="e.g. 641001"
                              maxLength={6}
                              className={`w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${pincodeError
                                  ? "border-red-400 focus:border-red-500 focus:bg-white"
                                  : newPincode.length === 6
                                    ? "border-emerald-400 focus:border-emerald-500 focus:bg-white"
                                    : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                }`} />
                            {pincodeError && (
                              <p className="mt-0.5 text-[9px] text-red-500 font-semibold">{pincodeError}</p>
                            )}
                          </div>
                        </div>

                        {/* 🔐 Confidential Records & Document Uploads */}
                        <div className="pt-3 pb-2 border-b border-slate-200 mt-2">
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-blue-500" />
                            <span>🔐 Confidential Records & Document Uploads</span>
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          
                          {/* Student Photo */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold flex items-center gap-1">
                              <Camera className="w-3 h-3 text-slate-400" />
                              <span>Student Profile Photo</span>
                            </label>
                            <div className="flex items-center gap-3">
                              {newPhoto && (
                                <img src={newPhoto} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const b64 = await fileToBase64(file);
                                    setNewPhoto(b64);
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Aadhaar Number */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Aadhaar Number (12 digits)</label>
                            <input
                              type="text"
                              placeholder="e.g. 123456789012"
                              maxLength={12}
                              value={newAadharNumber}
                              onChange={(e) => setNewAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                          </div>

                          {/* Aadhaar Document */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Upload Aadhaar Card Copy</label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const b64 = await fileToBase64(file);
                                  setNewDocAadhar(b64);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Bank Name */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>Bank Name</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. State Bank of India"
                              value={newBankName}
                              onChange={(e) => setNewBankName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                          </div>

                          {/* Account Number */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Bank Account Number</label>
                            <input
                              type="text"
                              placeholder="e.g. 30129482718"
                              value={newBankAccount}
                              onChange={(e) => setNewBankAccount(e.target.value.replace(/\D/g, ""))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                          </div>

                          {/* IFSC Code */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Bank IFSC Code</label>
                            <input
                              type="text"
                              placeholder="e.g. SBIN0001234"
                              value={newBankIfsc}
                              onChange={(e) => setNewBankIfsc(e.target.value.toUpperCase())}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                          </div>

                          {/* Income Certificate File */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Income Certificate</label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const b64 = await fileToBase64(file);
                                  setNewDocIncome(b64);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Community Certificate File */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Community Certificate</label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const b64 = await fileToBase64(file);
                                  setNewDocCommunity(b64);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Ration Card File */}
                          <div>
                            <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Ration Card Smart Copy</label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const b64 = await fileToBase64(file);
                                  setNewDocRation(b64);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>

                          {/* Welfare Schemes held */}
                          <div className="col-span-2 mt-1">
                            <label className="block text-[10px] text-slate-600 mb-1.5 font-bold uppercase">Government Welfare Schemes Held</label>
                            <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl">
                              {[
                                "Free Uniform Scheme",
                                "Free Textbook Scheme",
                                "Free Bicycle Scheme",
                                "Noon Meal Program",
                                "Pre-Matric Scholarship",
                                "Post-Matric Scholarship",
                                "Chief Minister's Breakfast Scheme"
                              ].map((scheme) => {
                                const isChecked = newSchemes.includes(scheme);
                                return (
                                  <label key={scheme} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewSchemes((prev) => [...prev, scheme]);
                                        } else {
                                          setNewSchemes((prev) => prev.filter((s) => s !== scheme));
                                        }
                                      }}
                                      className="rounded border-slate-350 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5"
                                    />
                                    <span>{scheme}</span>
                                  </label>
                                );
                              })}
                            </div>
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
                  )
                )} {/* end manual tab */}

                {/* ── EXCEL IMPORT TAB ── */}
                {modalTab === "excel" && (
                  <div className="space-y-4 py-2">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                      <span>📊 Excel / CSV Bulk Import</span>
                      <button onClick={downloadExcelTemplate} type="button"
                        className="flex items-center gap-1.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                        <Download className="w-3 h-3" /> Download Template
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
                          <span className="text-[9px] text-slate-500 leading-normal">Drag & drop Excel or click to upload (max 150 rows per file)</span>
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
                )} {/* end excel tab */}
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
              <button onClick={() => setIsHealthModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center">
                <X className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Red top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />

            <div className="p-6">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete Student</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-red-600 dark:text-red-400">&ldquo;{studentToDelete.name}&rdquo;</span>?
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  All dependent health reports, marks, and attendance records will be permanently removed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setStudentToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(studentToDelete.id!)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>Yes, Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Academic History Modal */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-2xl p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Academic History</h3>
                <p className="text-xs text-slate-500">{historyStudent.name} · Roll {historyStudent.rollNumber} · Currently Class {historyStudent.class}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            {historyLoading ? (
              <div className="py-10 text-center text-slate-400 text-sm">Loading…</div>
            ) : historyRows.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                No archived academic years yet. History is written when a promotion batch is approved by the BEO.
              </div>
            ) : (
              <div className="space-y-3">
                {historyRows.map((row: any) => (
                  <div key={row.id} className="border border-slate-200 rounded-2xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-extrabold text-slate-800">Class {row.class} · Sec {row.section}</span>
                        {row.group && <span className="text-xs font-bold text-violet-600 ml-2">Group {row.group}</span>}
                        <div className="text-[11px] text-slate-500">{row.academicYear}{row.rollNumber ? ` · Roll ${row.rollNumber}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Attendance</div>
                          <div className="text-sm font-extrabold text-slate-700">{row.attendancePct != null ? `${row.attendancePct}%` : "—"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold">Avg Marks</div>
                          <div className="text-sm font-extrabold text-slate-700">{row.averageMarksPct != null ? `${row.averageMarksPct}%` : "—"}</div>
                        </div>
                        {row.result && (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${row.result === "PROMOTED" || row.result === "GRADUATED"
                            ? "bg-emerald-50 text-emerald-600"
                            : row.result === "DETAINED"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-500"
                            }`}>
                            {row.result}
                          </span>
                        )}
                      </div>
                    </div>
                    {Array.isArray(row.marksSummary) && row.marksSummary.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        {row.marksSummary.map((m: any) => (
                          <div key={m.subject} className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-[11px] flex justify-between">
                            <span className="font-semibold text-slate-600 truncate">{m.subject}</span>
                            <span className={`font-extrabold ${m.pct != null && m.pct < 35 ? "text-rose-500" : "text-slate-700"}`}>
                              {m.pct != null ? `${m.pct}%` : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
