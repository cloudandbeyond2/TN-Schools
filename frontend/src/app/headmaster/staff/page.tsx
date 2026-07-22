"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  FileText, 
  Search, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Plus, 
  ChevronRight, 
  Filter, 
  RefreshCw,
  BookOpen,
  Award,
  CalendarDays
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface StaffMetadata {
  address?: string;
  staffType: "Teaching" | "Non-Teaching";
  joiningDate?: string;
  workAllocation?: string;
  assignedClass?: string;
  assignedSection?: string;
  docAppointment?: string;
}

interface StaffMember {
  id?: string;
  name: string;
  emisId: string;
  subject: string;
  phone: string;
  email: string;
  attendance: number;
  performance: "Excellent" | "Good" | "Average";
  leaveUsed: number;
  password?: string;
  createdAt?: string;
  address?: string;
  dob?: string;
  gender?: string;
  // Parsed metadata
  parsedMeta?: StaffMetadata;
}

interface TempStaffMember {
  id?: string;
  name: string;
  role: string;
  agency: string;
  joined: string;
  phone: string;
  email: string;
  duration: string;
  salary: string;
  status: string;
  password?: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  duration: string;
  reason: string;
  status: "Approved" | "Pending" | "Rejected";
  createdAt: string;
  staffId?: string | null;
  teacherName?: string;
  teacherEmis?: string;
}

export default function StaffManagementPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [tempStaffList, setTempStaffList] = useState<TempStaffMember[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"directory" | "attendance" | "leave" | "work" | "appointments">("directory");
  // Directory sub-tabs
  const [directoryType, setDirectoryType] = useState<"teaching" | "non-teaching" | "temporary">("teaching");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Selected items
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedTempStaff, setSelectedTempStaff] = useState<TempStaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string; isTemp: boolean } | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Forms state
  const [formType, setFormType] = useState<"Teaching" | "Non-Teaching" | "Temporary">("Teaching");
  const [formName, setFormName] = useState("");
  const [formEmisId, setFormEmisId] = useState("");
  const [formSubjectOrRole, setFormSubjectOrRole] = useState("Science");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formPassword, setFormPassword] = useState("123456");
  const [formPerformance, setFormPerformance] = useState<"Excellent" | "Good" | "Average">("Good");
  const [formAttendance, setFormAttendance] = useState(100);
  const [formLeaveUsed, setFormLeaveUsed] = useState(0);
  
  // Custom metadata fields
  const [formAddressVal, setFormAddressVal] = useState("");
  const [formJoiningDate, setFormJoiningDate] = useState("");
  const [formWorkAllocation, setFormWorkAllocation] = useState("");
  const [formAssignedClass, setFormAssignedClass] = useState("");
  const [formAssignedSection, setFormAssignedSection] = useState("");
  const [formDocAppointment, setFormDocAppointment] = useState("");

  // Temporary Staff specific form fields
  const [formTempAgency, setFormTempAgency] = useState("Direct Contract");
  const [formTempJoined, setFormTempJoined] = useState("");
  const [formTempDuration, setFormTempDuration] = useState("12 Months");
  const [formTempSalary, setFormTempSalary] = useState("22,000");

  // Daily attendance temp log
  const [attendanceLog, setAttendanceLog] = useState<Record<string, "Present" | "Absent" | "Leave">>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Bulk Upload Preview state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helper: Parse Address JSON
  const parseStaffAddress = (rawAddress: string | null | undefined, defaultSubject: string): StaffMetadata => {
    let parsedMeta: StaffMetadata = {
      address: "",
      staffType: defaultSubject === "Non-Teaching" || defaultSubject === "Office Staff" || defaultSubject === "Administrative" ? "Non-Teaching" : "Teaching",
      joiningDate: "",
      workAllocation: defaultSubject || "",
      docAppointment: ""
    };

    if (rawAddress) {
      try {
        const parsed = JSON.parse(rawAddress);
        if (parsed && (parsed.staffType || parsed.joiningDate || parsed.workAllocation || parsed.assignedClass || parsed.assignedSection || parsed.docAppointment)) {
          parsedMeta = {
            address: parsed.address || "",
            staffType: parsed.staffType || parsedMeta.staffType,
            joiningDate: parsed.joiningDate || "",
            workAllocation: parsed.workAllocation || parsedMeta.workAllocation,
            assignedClass: parsed.assignedClass || "",
            assignedSection: parsed.assignedSection || "",
            docAppointment: parsed.docAppointment || ""
          };
        } else {
          parsedMeta.address = rawAddress;
        }
      } catch {
        parsedMeta.address = rawAddress;
      }
    }
    return parsedMeta;
  };

  // Fetch schools list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/schools`);
        const json = await res.json();
        if (json.success) setSchools(json.data);
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };
    fetchSchools();
  }, []);

  // Fetch all staff data
  const fetchData = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Permanent Staff
      const staffRes = await fetch(`${API_BASE}/api/headmaster/staff?schoolId=${mySchoolId}`);
      const staffJson = await staffRes.json();
      
      // 2. Fetch Temporary Staff
      const tempRes = await fetch(`${API_BASE}/api/headmaster/temp-staff?schoolId=${mySchoolId}`);
      const tempJson = await tempRes.json();

      // 3. Fetch Leave Requests
      const leaveRes = await fetch(`${API_BASE}/api/teacher/leave?schoolId=${mySchoolId}`);
      const leaveJson = await leaveRes.json();

      let formattedStaff: StaffMember[] = [];
      if (staffJson.success) {
        formattedStaff = staffJson.data.map((s: StaffMember) => {
          const parsedMeta = parseStaffAddress(s.address, s.subject);
          return {
            ...s,
            parsedMeta
          };
        });
        setStaffList(formattedStaff);

        // Prepopulate attendance tracker with current active staff list
        const initialAttendance: Record<string, "Present" | "Absent" | "Leave"> = {};
        formattedStaff.forEach(s => {
          initialAttendance[s.id || s.emisId] = "Present";
        });
        tempJson.data?.forEach((s: any) => {
          initialAttendance[s.id || s.name] = "Present";
        });
        setAttendanceLog(initialAttendance);
      }

      if (tempJson.success) {
        setTempStaffList(tempJson.data || []);
      }

      if (leaveJson.success) {
        // Find teacher names from the staff list for leave items
        const rawLeaves = leaveJson.data || [];
        const formattedLeaves = rawLeaves.map((l: any) => {
          const teacher = formattedStaff.find((s: any) => s.id === l.staffId || s.emisId === l.staffId);
          return {
            ...l,
            teacherName: teacher ? teacher.name : l.studentName || "Staff Member",
            teacherEmis: teacher ? teacher.emisId : "—"
          };
        }).filter((l: any) => l.staffId !== null && l.staffId !== undefined); // only show staff leaves here
        
        setLeaveRequests(formattedLeaves);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    if (mySchoolId) {
      fetchData();
    }
  }, [mySchoolId, fetchData]);

  // Handle manual additions
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || (!formEmisId && formType !== "Temporary")) return;
    setIsSaving(true);

    try {
      if (formType === "Temporary") {
        // Save Temporary Staff member
        const body = {
          name: formName,
          role: formSubjectOrRole,
          agency: formTempAgency,
          joined: formTempJoined || new Date().toISOString().split("T")[0],
          phone: formPhone || "N/A",
          email: formEmail || "N/A",
          duration: formTempDuration,
          salary: formTempSalary,
          status: "Active",
          password: formPassword || "123456",
          schoolId: mySchoolId
        };

        const res = await fetch(`${API_BASE}/api/headmaster/temp-staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const json = await res.json();
        
        if (json.success) {
          Swal.fire({
            title: "Staff Added",
            text: `Contract staff member ${formName} registered!`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "var(--bg-card)",
            color: "var(--text-heading)"
          });
          setIsAddModalOpen(false);
          resetForm();
          fetchData();
        } else {
          throw new Error(json.error);
        }

      } else {
        // Save Permanent Staff member (Teaching or Non-Teaching)
        // Serialize metadata fields into address string
        const serializedAddress = JSON.stringify({
          address: formAddressVal,
          staffType: formType,
          joiningDate: formJoiningDate,
          workAllocation: formWorkAllocation,
          assignedClass: formAssignedClass,
          assignedSection: formAssignedSection,
          docAppointment: formDocAppointment
        });

        const body = {
          name: formName,
          emisId: formEmisId,
          subject: formType === "Teaching" ? formSubjectOrRole : "Non-Teaching",
          phone: formPhone || "N/A",
          email: formEmail || null,
          attendance: formAttendance,
          performance: formPerformance,
          leaveUsed: formLeaveUsed,
          password: formPassword || "123456",
          schoolId: mySchoolId,
          address: serializedAddress,
          dob: formDob || null,
          gender: formGender || null
        };

        const res = await fetch(`${API_BASE}/api/headmaster/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const json = await res.json();

        if (json.success) {
          Swal.fire({
            title: "Staff Registered",
            text: `${formName} added to the permanent registry.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "var(--bg-card)",
            color: "var(--text-heading)"
          });
          setIsAddModalOpen(false);
          resetForm();
          fetchData();
        } else {
          throw new Error(json.error);
        }
      }
    } catch (err: any) {
      Swal.fire({
        title: "Registration Failed",
        text: err.message || "An error occurred while saving staff details.",
        icon: "error",
        background: "var(--bg-card)",
        color: "var(--text-heading)",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Updates
  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedTempStaff) {
        const body = {
          name: formName,
          role: formSubjectOrRole,
          agency: formTempAgency,
          joined: formTempJoined,
          phone: formPhone,
          email: formEmail,
          duration: formTempDuration,
          salary: formTempSalary,
          password: formPassword || undefined
        };

        const res = await fetch(`${API_BASE}/api/headmaster/temp-staff/${selectedTempStaff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const json = await res.json();

        if (json.success) {
          Swal.fire({
            title: "Updated Successfully",
            text: `Contract records for ${formName} have been updated.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "var(--bg-card)",
            color: "var(--text-heading)"
          });
          setIsEditModalOpen(false);
          resetForm();
          fetchData();
        } else {
          throw new Error(json.error);
        }

      } else if (selectedStaff) {
        // Serialize metadata fields into address string
        const serializedAddress = JSON.stringify({
          address: formAddressVal,
          staffType: formType,
          joiningDate: formJoiningDate,
          workAllocation: formWorkAllocation,
          assignedClass: formAssignedClass,
          assignedSection: formAssignedSection,
          docAppointment: formDocAppointment
        });

        const body = {
          name: formName,
          subject: formType === "Teaching" ? formSubjectOrRole : "Non-Teaching",
          phone: formPhone,
          email: formEmail,
          attendance: formAttendance,
          performance: formPerformance,
          leaveUsed: formLeaveUsed,
          password: formPassword || undefined,
          address: serializedAddress,
          dob: formDob || null,
          gender: formGender
        };

        const res = await fetch(`${API_BASE}/api/headmaster/staff/${selectedStaff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const json = await res.json();

        if (json.success) {
          Swal.fire({
            title: "Updated Successfully",
            text: `Roster record for ${formName} has been saved.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "var(--bg-card)",
            color: "var(--text-heading)"
          });
          setIsEditModalOpen(false);
          resetForm();
          fetchData();
        } else {
          throw new Error(json.error);
        }
      }
    } catch (err: any) {
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Could not apply changes to the record.",
        icon: "error",
        background: "var(--bg-card)",
        color: "var(--text-heading)",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modals
  const openEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setSelectedTempStaff(null);
    setFormType(staff.parsedMeta?.staffType || "Teaching");
    setFormName(staff.name);
    setFormEmisId(staff.emisId);
    setFormSubjectOrRole(staff.subject);
    setFormPhone(staff.phone || "");
    setFormEmail(staff.email || "");
    setFormDob(staff.dob ? new Date(staff.dob).toISOString().split("T")[0] : "");
    setFormGender(staff.gender || "Male");
    setFormPassword(""); // blank
    setFormPerformance(staff.performance || "Good");
    setFormAttendance(staff.attendance || 100);
    setFormLeaveUsed(staff.leaveUsed || 0);
    setFormAddressVal(staff.parsedMeta?.address || "");
    setFormJoiningDate(staff.parsedMeta?.joiningDate || "");
    setFormWorkAllocation(staff.parsedMeta?.workAllocation || "");
    setFormAssignedClass(staff.parsedMeta?.assignedClass || "");
    setFormAssignedSection(staff.parsedMeta?.assignedSection || "");
    setFormDocAppointment(staff.parsedMeta?.docAppointment || "");
    setIsEditModalOpen(true);
  };

  const openTempEdit = (temp: TempStaffMember) => {
    setSelectedTempStaff(temp);
    setSelectedStaff(null);
    setFormType("Temporary");
    setFormName(temp.name);
    setFormSubjectOrRole(temp.role);
    setFormPhone(temp.phone || "");
    setFormEmail(temp.email || "");
    setFormTempAgency(temp.agency || "Direct Contract");
    setFormTempJoined(temp.joined || "");
    setFormTempDuration(temp.duration || "12 Months");
    setFormTempSalary(temp.salary || "N/A");
    setFormPassword("");
    setIsEditModalOpen(true);
  };

  // Handle Deletes
  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      let res;
      if (staffToDelete.isTemp) {
        res = await fetch(`${API_BASE}/api/headmaster/temp-staff/${staffToDelete.id}`, { method: "DELETE" });
      } else {
        res = await fetch(`${API_BASE}/api/headmaster/staff/${staffToDelete.id}`, { method: "DELETE" });
      }
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Deleted!",
          text: `${staffToDelete.name} has been removed from the directory.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--bg-card)",
          color: "var(--text-heading)"
        });
        fetchData();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      Swal.fire({
        title: "Delete Failed",
        text: err.message || "An error occurred during removal.",
        icon: "error",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });
    } finally {
      setStaffToDelete(null);
    }
  };

  // Handle Leave approvals/rejections
  const handleLeaveAction = async (id: string, status: "Approved" | "Rejected") => {
    const isApproved = status === "Approved";
    
    const result = await Swal.fire({
      title: isApproved ? 'Approve Leave Request?' : 'Reject Leave Request?',
      text: `Are you sure you want to ${status.toLowerCase()} this staff leave request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isApproved ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isApproved ? 'Yes, Approve' : 'Yes, Reject',
      background: 'var(--bg-card)',
      color: 'var(--text-heading)',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/headmaster/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedById: (session?.user as any)?.id }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          title: 'Success!',
          text: `Leave request has been ${status.toLowerCase()}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--bg-card)',
          color: 'var(--text-heading)',
        });
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to update leave status.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: 'var(--bg-card)',
        color: 'var(--text-heading)',
      });
    }
  };

  // Save attendance daily log
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      // Simulate taking attendance: adjust attendance rate dynamically
      const promises = Object.entries(attendanceLog).map(async ([id, status]) => {
        const staff = staffList.find(s => s.id === id || s.emisId === id);
        if (!staff) return;

        let newRate = staff.attendance;
        let newLeave = staff.leaveUsed;
        
        if (status === "Absent") {
          newRate = Math.max(0, newRate - 1.5); // decrease slightly
        } else if (status === "Leave") {
          newLeave = newLeave + 1; // consume leave day
        } else {
          newRate = Math.min(100, newRate + 0.2); // positive gain
        }

        // Apply to backend
        return fetch(`${API_BASE}/api/headmaster/staff/${staff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendance: Math.round(newRate * 10) / 10,
            leaveUsed: newLeave
          })
        });
      });

      await Promise.all(promises);

      Swal.fire({
        title: "Attendance Logged",
        text: `Daily staff attendance for ${attendanceDate} successfully compiled!`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline work allocation save
  const handleInlineWorkAllocation = async (id: string, assignedClass: string, assignedSection: string) => {
    const staff = staffList.find(s => s.id === id);
    if (!staff) return;

    try {
      const serializedAddress = JSON.stringify({
        ...(staff.parsedMeta || {}),
        assignedClass,
        assignedSection
      });

      const res = await fetch(`${API_BASE}/api/headmaster/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: serializedAddress })
      });
      const json = await res.json();
      if (json.success) {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, parsedMeta: { ...s.parsedMeta!, assignedClass, assignedSection } } : s));
      }
    } catch (err) {
      console.error("Failed to update work allocation inline", err);
    }
  };

  // Bulk Excel imports
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseExcel(file);
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<any>(sheet);
        
        const validated = rawJson.map((row, index) => {
          const name = row["Staff Name"] || row["Name"] || "";
          const emisId = row["EMIS ID"] || row["ID"] || "";
          const staffType = row["Category"] || row["Staff Type"] || "Teaching";
          const subject = row["Subject"] || row["Role"] || "General";
          const phone = row["Phone"] || row["Phone Number"] || "N/A";
          const email = row["Email"] || "";
          const joiningDate = row["Joined Date"] || row["Joining Date"] || "";
          const workAllocation = row["Work Allocation"] || "";
          const assignedClass = row["Assigned Class"] || "";
          const assignedSection = row["Assigned Section"] || "";
          const docAppointment = row["Document Appointment"] || "";

          // Serialize extra fields into address
          const address = JSON.stringify({
            address: row["Address"] || "",
            staffType,
            joiningDate,
            workAllocation,
            assignedClass,
            assignedSection,
            docAppointment
          });

          return {
            name,
            emisId,
            subject: staffType === "Teaching" ? subject : "Non-Teaching",
            phone: phone.toString(),
            email,
            attendance: parseFloat(row["Attendance"] || "100"),
            performance: row["Performance"] || "Good",
            leaveUsed: parseInt(row["Leave Used"] || "0", 10),
            password: row["Password"] || "123456",
            address,
            isValid: name !== "" && emisId !== ""
          };
        });

        setPreviewData(validated);
      } catch (err) {
        console.error(err);
        Swal.fire({ title: "Parse Error", text: "Invalid Excel template format.", icon: "error" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmBulkImport = async () => {
    const valids = previewData.filter(d => d.isValid).map(d => ({
      ...d,
      schoolId: mySchoolId
    }));
    if (valids.length === 0) return;
    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff: valids })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Import Success",
          text: `Successfully imported ${json.created} staff members!`,
          icon: "success",
          background: "var(--bg-card)",
          color: "var(--text-heading)"
        });
        setIsImportModalOpen(false);
        setPreviewData([]);
        fetchData();
      }
    } catch {
      Swal.fire({ title: "Import Error", text: "Failed to save records in database.", icon: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const exportExcel = () => {
    const headers = [
      "Staff Name", "EMIS ID", "Category", "Subject/Role", "Phone",
      "Email", "Attendance (%)", "Performance", "Leave Used", "Joined Date", "Work Allocation", "Assigned Class", "Assigned Section", "Doc Appointment"
    ];
    const data = staffList.map(s => [
      s.name,
      s.emisId,
      s.parsedMeta?.staffType || "Teaching",
      s.subject,
      s.phone,
      s.email || "",
      s.attendance,
      s.performance,
      s.leaveUsed,
      s.parsedMeta?.joiningDate || "",
      s.parsedMeta?.workAllocation || "",
      s.parsedMeta?.assignedClass || "",
      s.parsedMeta?.assignedSection || "",
      s.parsedMeta?.docAppointment || ""
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Roster");
    XLSX.writeFile(workbook, "school_staff_roster.xlsx");
  };

  const downloadSampleTemplate = () => {
    const headers = [
      "Staff Name", "EMIS ID", "Category", "Subject/Role", "Phone",
      "Email", "Joined Date", "Work Allocation", "Assigned Class", "Assigned Section", "Document Appointment",
      "Address", "Attendance", "Performance", "Leave Used", "Password"
    ];
    const sampleRows = [
      [
        "Karthik Raja", "TCHKR001", "Teaching", "Mathematics", "9876543210",
        "karthik.raja@email.com", "2024-06-01", "Exam Coordinator", "10", "A", "Completed",
        "12, Anna Salai, Coimbatore", "95", "Excellent", "1", "123456"
      ],
      [
        "Meena Kumari", "NTCMK002", "Non-Teaching", "Librarian", "9876543211",
        "meena.kumari@email.com", "2023-09-15", "Library Management", "", "", "Completed",
        "45, Gandhi Road, Coimbatore", "98", "Good", "0", "123456"
      ]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Roster Template");
    XLSX.writeFile(workbook, "sample_staff_roster_template.xlsx");
  };

  const resetForm = () => {
    setFormName("");
    setFormEmisId("");
    setFormSubjectOrRole("Science");
    setFormPhone("");
    setFormEmail("");
    setFormDob("");
    setFormGender("Male");
    setFormPassword("123456");
    setFormPerformance("Good");
    setFormAttendance(100);
    setFormLeaveUsed(0);
    setFormAddressVal("");
    setFormJoiningDate("");
    setFormWorkAllocation("");
    setFormAssignedClass("");
    setFormAssignedSection("");
    setFormDocAppointment("");
    setFormTempAgency("Direct Contract");
    setFormTempJoined("");
    setFormTempDuration("12 Months");
    setFormTempSalary("22,000");
    setSelectedStaff(null);
    setSelectedTempStaff(null);
  };

  // Filtering Lists
  const filteredTeachingStaff = useMemo(() => {
    return staffList.filter(s => {
      const isTeaching = s.parsedMeta?.staffType === "Teaching" || (s.subject && s.subject !== "Non-Teaching");
      if (!isTeaching) return false;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.emisId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerf = performanceFilter === "all" || s.performance === performanceFilter;
      const matchesSubj = subjectFilter === "all" || s.subject === subjectFilter;
      return matchesSearch && matchesPerf && matchesSubj;
    });
  }, [staffList, searchTerm, performanceFilter, subjectFilter]);

  const filteredNonTeachingStaff = useMemo(() => {
    return staffList.filter(s => {
      const isNonTeaching = s.parsedMeta?.staffType === "Non-Teaching" || s.subject === "Non-Teaching";
      if (!isNonTeaching) return false;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.emisId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerf = performanceFilter === "all" || s.performance === performanceFilter;
      return matchesSearch && matchesPerf;
    });
  }, [staffList, searchTerm, performanceFilter]);

  const filteredTempStaff = useMemo(() => {
    return tempStaffList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [tempStaffList, searchTerm]);

  // Document collection appointments lists
  const documentAppointments = useMemo(() => {
    return staffList
      .filter(s => s.parsedMeta?.docAppointment)
      .map(s => ({
        id: s.id,
        name: s.name,
        category: s.parsedMeta?.staffType || "Teaching",
        phone: s.phone,
        appointment: s.parsedMeta!.docAppointment!,
        status: new Date(s.parsedMeta!.docAppointment!) < new Date() ? "Completed" : "Scheduled"
      }))
      .sort((a, b) => new Date(a.appointment).getTime() - new Date(b.appointment).getTime());
  }, [staffList]);

  // Statistics
  const stats = useMemo(() => {
    const teachingCount = staffList.filter(s => s.parsedMeta?.staffType === "Teaching" || (s.subject && s.subject !== "Non-Teaching")).length;
    const nonTeachingCount = staffList.filter(s => s.parsedMeta?.staffType === "Non-Teaching" || s.subject === "Non-Teaching").length;
    const tempCount = tempStaffList.length;
    const pendingLeaves = leaveRequests.filter(l => l.status === "Pending").length;
    return {
      teaching: teachingCount,
      nonTeaching: nonTeachingCount,
      temp: tempCount,
      leaves: pendingLeaves
    };
  }, [staffList, tempStaffList, leaveRequests]);

  const activeDirectoryList = useMemo(() => {
    if (directoryType === "teaching") return filteredTeachingStaff;
    if (directoryType === "non-teaching") return filteredNonTeachingStaff;
    return filteredTempStaff;
  }, [directoryType, filteredTeachingStaff, filteredNonTeachingStaff, filteredTempStaff]);

  // Paginated active list
  const paginatedActiveList = useMemo(() => {
    return activeDirectoryList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [activeDirectoryList, currentPage, pageSize]);

  const totalPages = Math.ceil(activeDirectoryList.length / pageSize);

  // Subject options
  const subjectsList = ["Mathematics", "Science", "English", "Tamil", "Social Science", "Computer Science", "Physical Education"];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "ஆசிரியர்கள் & பணியாளர்கள் மேலாண்மை" : "Staff Management Portal"}
      subtitle={lang === "தமிழ்" ? "பள்ளி ஆசிரியர்கள் மற்றும் பணியாளர்கள் அட்டவணை, வருகைப்பதிவு மற்றும் விடுப்பு ஒப்புதல்கள்." : "Staff roster, attendance, and leave approvals."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      
      {/* Dynamic Header Metrics - "Flaticon" Style colored cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        
        {/* Card 1: Teaching */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "தமிழ்" ? "கற்பித்தல் ஆசிரியர்கள்" : "Teaching Faculty"}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.teaching}</span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-1">{lang === "தமிழ்" ? "நிரந்தரப் பட்டியல்" : "Permanent Roster"}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Non-Teaching */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-violet-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "தமிழ்" ? "கற்பிக்காத பணியாளர்கள்" : "Non-Teaching Staff"}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.nonTeaching}</span>
            <span className="text-[9px] text-violet-600 dark:text-violet-400 font-semibold mt-1">{lang === "தமிழ்" ? "நிர்வாகம் & ஆதரவு" : "Admin & Support"}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-500 dark:text-violet-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Temporary */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contract Staff</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.temp}</span>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Temporary / Support</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Leave Requests */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-red-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "தமிழ்" ? "நிலுவையில் உள்ள விடுப்புகள்" : "Pending Leaves"}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.leaves}</span>
            <span className="text-[9px] text-red-650 dark:text-red-450 font-bold mt-1">{lang === "தமிழ்" ? "தேவைப்படும் நடவடிக்கை" : "Action Required"}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 dark:text-red-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800/80 mb-6 gap-2">
        {[
          { id: "directory", label: lang === "தமிழ்" ? "பட்டியல் & அடைவு" : "Roster & Directory", icon: Users },
          { id: "attendance", label: lang === "தமிழ்" ? "தினசரி வருகைப்பதிவு" : "Daily Attendance", icon: UserCheck },
          { id: "leave", label: lang === "தமிழ்" ? "விடுப்பு ஒப்புதல்கள்" : "Leave Approvals", icon: FileText },
          { id: "work", label: lang === "தமிழ்" ? "கடமைகள் & பணி ஒதுக்கீடு" : "Duties & Work Allocation", icon: Briefcase },
          { id: "appointments", label: lang === "தமிழ்" ? "சரிபார்ப்பு நியமனங்கள்" : "Verification Appointments", icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 outline-none -mb-[2px] ${
                active 
                  ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Roster & Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-6 fade-in">
          
          {/* Sub-directory Filter and Toolbar */}
          <div className="glass rounded-2xl p-4 border border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Sub-Tabs: Teaching, Non-Teaching, Temporary */}
            <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
              {[
                { id: "teaching", label: "Teaching Staff" },
                { id: "non-teaching", label: "Non-Teaching" },
                { id: "temporary", label: "Contractual / Temp" }
              ].map(subTab => {
                const active = directoryType === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => { setDirectoryType(subTab.id as any); setCurrentPage(1); }}
                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active 
                        ? "bg-blue-600 text-white shadow-md font-bold" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {subTab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  setFormType(directoryType === "teaching" ? "Teaching" : directoryType === "non-teaching" ? "Non-Teaching" : "Temporary");
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
              
              {directoryType !== "temporary" && (
                <>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Excel Import</span>
                  </button>
                  
                  <button
                    onClick={exportExcel}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Search, Filter Bar */}
          <div className="glass rounded-2xl p-4 border border-slate-800/60 flex flex-wrap items-center gap-4">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by Name or Staff ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Performance filter (Permanent Only) */}
            {directoryType !== "temporary" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Performance:</span>
                <select
                  value={performanceFilter}
                  onChange={e => setPerformanceFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Grades</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                </select>
              </div>
            )}

            {/* Subject filter (Teaching Only) */}
            {directoryType === "teaching" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {subjectsList.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Directory Table Display */}
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Updating Roster...</span>
              </div>
            ) : activeDirectoryList.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No matching staff records found in the {directoryType} directory.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Name & Profile Details</th>
                      <th className="p-4">{directoryType === "temporary" ? "Agency / Source" : "Designation / Subject"}</th>
                      <th className="p-4">{directoryType === "temporary" ? "Contract Term" : "Joining Date"}</th>
                      <th className="p-4">{directoryType === "temporary" ? "Compensation" : "Doc Verification"}</th>
                      <th className="p-4">{directoryType === "temporary" ? "Duty Role" : "Attendance & Performance"}</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {paginatedActiveList.map((item: any) => {
                      if (directoryType === "temporary") {
                        const temp = item as TempStaffMember;
                        return (
                          <tr key={temp.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4 font-bold text-white">
                              <div>{temp.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium mt-1 flex flex-wrap gap-2">
                                <span>Ph: {temp.phone}</span>
                                <span>•</span>
                                <span>Email: {temp.email}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-300">{temp.agency}</td>
                            <td className="p-4 text-slate-400">
                              <div>Joined: {temp.joined || "—"}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Duration: {temp.duration}</div>
                            </td>
                            <td className="p-4 font-bold text-emerald-400">₹{temp.salary} / mo</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                                {temp.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openTempEdit(temp)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-blue-500/20 transition-all"
                                  title="Edit contract details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setStaffToDelete({ id: temp.id!, name: temp.name, isTemp: true })}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all"
                                  title="End contract"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      } else {
                        const s = item as StaffMember;
                        const dateFormatted = s.parsedMeta?.joiningDate 
                          ? new Date(s.parsedMeta.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
                          : "—";
                        const apptDate = s.parsedMeta?.docAppointment 
                          ? new Date(s.parsedMeta.docAppointment).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) 
                          : "Pending";
                        
                        return (
                          <tr key={s.id || s.emisId} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white">{s.name}</div>
                              <div className="text-[10px] text-slate-500 font-semibold mt-1 flex flex-wrap gap-2">
                                <span>ID: {s.emisId}</span>
                                <span>•</span>
                                <span>Ph: {s.phone}</span>
                                <span>•</span>
                                <span>Email: {s.email || "N/A"}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-300">{s.subject}</td>
                            <td className="p-4 text-slate-400">{dateFormatted}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.parsedMeta?.docAppointment 
                                  ? (new Date(s.parsedMeta.docAppointment) < new Date() ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20")
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                              }`}>
                                {apptDate}
                              </span>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  s.attendance >= 95 ? "bg-emerald-500/10 text-emerald-400" : s.attendance >= 90 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                  {s.attendance}% Attendance
                                </span>
                              </div>
                              <div>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  s.performance === "Excellent" ? "bg-emerald-500/10 text-emerald-400" : s.performance === "Good" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {s.performance} Performance
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEdit(s)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-blue-500/20 transition-all"
                                  title="Edit profile & verification details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setStaffToDelete({ id: s.id!, name: s.name, isTemp: false })}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all"
                                  title="Deregister staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-slate-800/80 bg-slate-950/20">
                <span className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, activeDirectoryList.length)} of {activeDirectoryList.length} staff members
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-400 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Attendance Manager Tab */}
      {activeTab === "attendance" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Daily Staff Attendance Registry
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Toggle daily status for permanent and contract staff to automatically re-compile average attendance.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Current Average</th>
                  <th className="p-4 text-center">Toggle Daily Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {/* Permanent Staff */}
                {staffList.map(s => (
                  <tr key={s.id || s.emisId} className="hover:bg-slate-900/10">
                    <td className="p-4 font-bold text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ID: {s.emisId} · {s.subject}</div>
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">{s.parsedMeta?.staffType || "Teaching"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.attendance >= 95 ? "bg-emerald-500/10 text-emerald-400" : s.attendance >= 90 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {[
                          { id: "Present", color: "bg-emerald-600 text-white border-emerald-500", idle: "hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                          { id: "Absent", color: "bg-red-600 text-white border-red-500", idle: "hover:bg-red-500/10 text-red-400 border-red-500/20" },
                          { id: "Leave", color: "bg-amber-600 text-white border-amber-500", idle: "hover:bg-amber-500/10 text-amber-400 border-amber-500/20" }
                        ].map(btn => {
                          const active = attendanceLog[s.id || s.emisId] === btn.id;
                          return (
                            <button
                              key={btn.id}
                              onClick={() => setAttendanceLog(prev => ({ ...prev, [s.id || s.emisId]: btn.id as any }))}
                              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                active ? btn.color : btn.idle
                              }`}
                            >
                              {btn.id}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Temporary Staff */}
                {tempStaffList.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/10">
                    <td className="p-4 font-bold text-white">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Contractor · {t.role}</div>
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">Temporary</td>
                    <td className="p-4 text-slate-500">—</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {[
                          { id: "Present", color: "bg-emerald-600 text-white border-emerald-500", idle: "hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                          { id: "Absent", color: "bg-red-600 text-white border-red-500", idle: "hover:bg-red-500/10 text-red-400 border-red-500/20" },
                          { id: "Leave", color: "bg-amber-600 text-white border-amber-500", idle: "hover:bg-amber-500/10 text-amber-400 border-amber-500/20" }
                        ].map(btn => {
                          const active = attendanceLog[t.id!] === btn.id;
                          return (
                            <button
                              key={btn.id}
                              onClick={() => setAttendanceLog(prev => ({ ...prev, [t.id!]: btn.id as any }))}
                              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                active ? btn.color : btn.idle
                              }`}
                            >
                              {btn.id}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2"
            >
              {isSaving ? "Saving Attendance..." : "💾 Compile & Save Attendance Logs"}
            </button>
          </div>
        </div>
      )}

      {/* Leave Management Tab */}
      {activeTab === "leave" && (
        <div className="space-y-6 fade-in">
          
          {/* Leaves list */}
          <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                Staff Leave Request Approvals
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Authoritative action requests forwarded from classroom instructors and non-instructional faculty.</p>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No active leave requests found in the system.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Employee Name</th>
                      <th className="p-4">Leave Category</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Reason Statement</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4">Approval Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {leaveRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-900/10">
                        <td className="p-4 font-bold text-white">
                          <div>{req.teacherName}</div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">ID: {req.teacherEmis}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-300">{req.type}</td>
                        <td className="p-4 text-slate-300">{req.duration}</td>
                        <td className="p-4 text-slate-400 italic font-medium max-w-[200px] truncate" title={req.reason}>
                          "{req.reason}"
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            req.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {req.status === "Pending" ? (
                              <>
                                <button
                                  onClick={() => handleLeaveAction(req.id, "Approved")}
                                  className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 rounded-lg border border-emerald-500/30 transition-all font-bold"
                                  title="Approve leave"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(req.id, "Rejected")}
                                  className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg border border-red-500/30 transition-all font-bold"
                                  title="Reject leave"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold italic">Processed</span>
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

          {/* Leave Balances Grid */}
          <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Leave Balance Logs</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Tracking cumulative leave days used by faculty members during the current term.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.slice(0, 6).map(s => (
                <div key={s.id} className="p-4 border border-slate-800 bg-slate-950/20 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-xs">{s.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{s.subject} · ID: {s.emisId}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-amber-400">{s.leaveUsed}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Days Used</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Duties & Work Allocation Tab */}
      {activeTab === "work" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 fade-in space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-violet-400" />
              Duties & Work Allocation Manager
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Assign administrative, non-academic portfolios, or specific classes/subjects to permanent staff members.</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Primary Subject/Role</th>
                  <th className="p-4">Assigned Work Portfolio & Duty Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {staffList.map(s => (
                  <tr key={s.id || s.emisId} className="hover:bg-slate-900/10">
                    <td className="p-4 font-bold text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ID: {s.emisId}</div>
                    </td>
                    <td className="p-4 text-slate-400 font-semibold">{s.parsedMeta?.staffType || "Teaching"}</td>
                    <td className="p-4 font-medium text-slate-300">{s.subject}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <select
                          value={s.parsedMeta?.assignedClass || ""}
                          onChange={e => handleInlineWorkAllocation(s.id!, e.target.value, s.parsedMeta?.assignedSection || "")}
                          className="w-1/2 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition-colors"
                        >
                          <option value="">Class</option>
                          {["Pre-KG", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                        <select
                          value={s.parsedMeta?.assignedSection || ""}
                          onChange={e => handleInlineWorkAllocation(s.id!, s.parsedMeta?.assignedClass || "", e.target.value)}
                          className="w-1/2 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition-colors"
                        >
                          <option value="">Section</option>
                          {["A", "B", "C", "D", "E", "F"].map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-[11px] text-slate-500 italic bg-slate-950/40 border border-slate-800 p-3 rounded-xl">
            * Note: Simply select the Class and Section dropdowns to assign the staff member. Changing the selection will automatically save the allocation in the database.
          </div>
        </div>
      )}

      {/* Verification Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="space-y-6 fade-in">
          
          {/* Scheduling & Info */}
          <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Staff Document Collection & Verification Appointments
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Track and plan verification appointments for new staff members, checking original certificates, IDs, and credentials.</p>
            </div>

            {documentAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No active document collection appointments scheduled. Edit a staff member's profile to set an appointment time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentAppointments.map(appt => {
                  const isCompleted = appt.status === "Completed";
                  const dateObj = new Date(appt.appointment);
                  return (
                    <div 
                      key={appt.id} 
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between bg-slate-950/20 ${
                        isCompleted ? "border-slate-800 opacity-60" : "border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? "bg-slate-500" : "bg-blue-400 animate-pulse"}`} />
                          <span className="font-bold text-white text-xs">{appt.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-semibold uppercase">
                            {appt.category}
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{dateObj.toLocaleDateString("en-IN", { dateStyle: "medium" })} at {dateObj.toLocaleTimeString("en-IN", { timeStyle: "short" })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Phone: {appt.phone}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted ? "bg-slate-800/40 text-slate-400 border-slate-700/40" : "bg-blue-600/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline View */}
          <div className="glass rounded-2xl p-6 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Verification Appointments Timeline</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Chronological checklist of scheduled credential handovers.</p>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
              {documentAppointments.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No timeline available.</div>
              ) : (
                documentAppointments.map((appt, idx) => {
                  const isCompleted = appt.status === "Completed";
                  const dateObj = new Date(appt.appointment);
                  return (
                    <div key={appt.id} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                        isCompleted ? "bg-slate-800 border-slate-700" : "bg-blue-500 border-slate-900"
                      }`} />
                      
                      <div className="text-xs space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold">
                          {dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })} · {dateObj.toLocaleTimeString("en-IN", { timeStyle: "short" })}
                        </div>
                        <div className="font-bold text-white">{appt.name}</div>
                        <div className="text-[10px] text-slate-400">Document collection for {appt.category === "Teaching" ? "Academic Certification" : "Employment Credentials"} verification.</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ADD STAFF MEMBER MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl p-6 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-800 dark:text-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Register New School Faculty / Contractor
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-semibold">✕ Close</button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Employment Category</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700 max-w-md">
                  {["Teaching", "Non-Teaching", "Temporary"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type as any)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        formType === type ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Mr. Vignesh K."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {formType !== "Temporary" && (
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">EMIS ID / Staff ID *</label>
                    <input
                      type="text"
                      required
                      value={formEmisId}
                      onChange={e => setFormEmisId(e.target.value)}
                      placeholder="e.g. TCH206"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="10 digit mobile"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Temporary Staff specific fields */}
              {formType === "Temporary" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Contracting Agency / Provider</label>
                    <input
                      type="text"
                      value={formTempAgency}
                      onChange={e => setFormTempAgency(e.target.value)}
                      placeholder="e.g. Direct Contract, Swift Security"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Contract Duration</label>
                    <input
                      type="text"
                      value={formTempDuration}
                      onChange={e => setFormTempDuration(e.target.value)}
                      placeholder="e.g. 12 Months"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Monthly Compensation (₹)</label>
                    <input
                      type="text"
                      value={formTempSalary}
                      onChange={e => setFormTempSalary(e.target.value)}
                      placeholder="e.g. 18,000"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Permanent Staff details */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        placeholder="e.g. name@emis.tn.gov.in"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Date of Birth</label>
                      <input
                        type="date"
                        value={formDob}
                        onChange={e => setFormDob(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Gender</label>
                      <select
                        value={formGender}
                        onChange={e => setFormGender(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Joined Date & Appointments */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-50/40 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                    <div>
                      <label className="block text-[10px] text-blue-800 dark:text-blue-300 mb-1 font-bold">Official Joining Date</label>
                      <input
                        type="date"
                        value={formJoiningDate}
                        onChange={e => setFormJoiningDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-blue-800 dark:text-blue-300 mb-1 font-bold">Doc Collection Appointment</label>
                      <input
                        type="datetime-local"
                        value={formDocAppointment}
                        onChange={e => setFormDocAppointment(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Address */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Residential Address</label>
                  <textarea
                    rows={2}
                    value={formAddressVal}
                    onChange={e => setFormAddressVal(e.target.value)}
                    placeholder="Current postal address..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Account Setting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formType === "Temporary" ? (
                  <div>
                    <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Joined Date</label>
                    <input
                      type="date"
                      value={formTempJoined}
                      onChange={e => setFormTempJoined(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Attendance Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formAttendance}
                        onChange={e => setFormAttendance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Leave Used (Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={formLeaveUsed}
                        onChange={e => setFormLeaveUsed(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-slate-600 dark:text-slate-400 mb-1 font-semibold">Portal Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "💾 Register Staff"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT STAFF MEMBER MODAL */}
      {/* ======================================================== */}
      {isEditModalOpen && (selectedStaff || selectedTempStaff) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl p-6 relative bg-white border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-800">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-blue-600" />
                Modify Staff Record - {formName}
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-800 text-xs font-semibold">✕ Close</button>
            </div>

            <form onSubmit={handleEditStaff} className="space-y-4 text-xs">
              
              {/* Category Info */}
              <div className="bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employment Profile</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{formType} Category</span>
              </div>

              {/* Name & ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">EMIS ID / Staff ID (Locked)</label>
                  <input
                    type="text"
                    disabled
                    value={formEmisId || "Contractor - No ID"}
                    className="w-full bg-slate-200 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              {/* Temporary Staff specific fields */}
              {formType === "Temporary" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contracting Agency / Provider</label>
                    <input
                      type="text"
                      value={formTempAgency}
                      onChange={e => setFormTempAgency(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contract Duration</label>
                    <input
                      type="text"
                      value={formTempDuration}
                      onChange={e => setFormTempDuration(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Monthly Compensation (₹)</label>
                    <input
                      type="text"
                      value={formTempSalary}
                      onChange={e => setFormTempSalary(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Permanent Staff details */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Date of Birth</label>
                      <input
                        type="date"
                        value={formDob}
                        onChange={e => setFormDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Gender</label>
                      <select
                        value={formGender}
                        onChange={e => setFormGender(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Joined Date & Appointments */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-50/40 p-3 rounded-2xl border border-blue-100">
                    <div>
                      <label className="block text-[10px] text-blue-800 mb-1 font-bold">Official Joining Date</label>
                      <input
                        type="date"
                        value={formJoiningDate}
                        onChange={e => setFormJoiningDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-blue-800 mb-1 font-bold">Doc Collection Appointment</label>
                      <input
                        type="datetime-local"
                        value={formDocAppointment}
                        onChange={e => setFormDocAppointment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Address */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Residential Address</label>
                  <textarea
                    rows={2}
                    value={formAddressVal}
                    onChange={e => setFormAddressVal(e.target.value)}
                    placeholder="Residential address..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Account Setting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formType === "Temporary" ? (
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Joined Date</label>
                    <input
                      type="date"
                      value={formTempJoined}
                      onChange={e => setFormTempJoined(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Attendance Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formAttendance}
                        onChange={e => setFormAttendance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Leave Used (Days)</label>
                      <input
                        type="number"
                        min="0"
                        value={formLeaveUsed}
                        onChange={e => setFormLeaveUsed(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Update Password (Leave blank to preserve)</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSaving ? "Saving Changes..." : "💾 Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      {staffToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 relative bg-white border border-slate-200 shadow-2xl text-slate-800">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Deregister Staff Member?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to remove <strong>{staffToDelete.name}</strong> from the database registry? This action will permanently drop all history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setStaffToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Confirm Deregister
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXCEL IMPORT PREVIEW MODAL */}
      {/* ======================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full ${previewData.length > 0 ? "max-w-5xl" : "max-w-md"} rounded-3xl p-6 space-y-6 relative transition-all duration-300 bg-white border border-slate-200 shadow-2xl text-slate-800`}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {previewData.length > 0 ? "📋 Preview Excel Data" : "📥 Bulk Import Staff Roster"}
              </h3>
              <button onClick={() => { setIsImportModalOpen(false); setPreviewData([]); }} className="text-slate-400 hover:text-slate-800 text-xs font-semibold">✕ Close</button>
            </div>

            {previewData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold text-emerald-600 uppercase tracking-wider">Parsed {previewData.length} Staff Records</div>
                  <div className="text-slate-500 font-semibold">{previewData.filter(d => !d.isValid).length} invalid rows found</div>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100 sticky top-0 font-bold text-slate-600">
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">EMIS ID</th>
                        <th className="p-3">Subject/Role</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Performance</th>
                        <th className="p-3">Attendance</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewData.map((d, idx) => (
                        <tr key={idx} className={d.isValid ? "hover:bg-slate-100" : "bg-red-50 text-red-700"}>
                          <td className="p-3 font-semibold">{d.name || "Missing Name"}</td>
                          <td className="p-3">{d.emisId || "Missing ID"}</td>
                          <td className="p-3">{d.subject}</td>
                          <td className="p-3">{d.phone}</td>
                          <td className="p-3">{d.performance}</td>
                          <td className="p-3">{d.attendance}%</td>
                          <td className="p-3 font-bold">{d.isValid ? "✓ Ready" : "⚠️ Error"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={confirmBulkImport}
                    disabled={previewData.filter(d => d.isValid).length === 0 || isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? "Saving to database..." : `💾 Confirm & Import ${previewData.filter(d => d.isValid).length} Records`}
                  </button>
                  <button
                    onClick={() => { setPreviewData([]); setIsImportModalOpen(false); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all border border-slate-200"
                  >Discard</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[200px] border-2 border-dashed ${
                    isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-500"
                  }`}
                >
                  <Upload className="w-10 h-10 text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">Upload Staff Directory Template</span>
                  <span className="text-[10px] text-slate-400">Drag & drop .xlsx, .xls or .csv spreadsheets here</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="text-slate-500 font-medium">Need a starting template?</div>
                  <button
                    onClick={downloadSampleTemplate}
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100/60 px-3 py-1.5 rounded-xl border border-blue-100 transition-all"
                  >
                    📥 Download Sample Excel
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => { const file = e.target.files?.[0]; if (file) parseExcel(file); }}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
