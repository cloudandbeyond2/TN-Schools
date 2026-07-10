"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { 
  Users, Search, Plus, Upload, Download, Trash2, Edit2, Award, 
  Calendar, BookOpen, Heart, DollarSign, Gift, CheckCircle, Clock, 
  MapPin, Phone, Mail, ChevronDown, ChevronUp, AlertCircle, PlusCircle, Trash
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface AlumniEvent {
  type: string; // "Guest Lecture" | "Mentorship" | "Career Guidance" | "Alumni Meet"
  date: string;
  topic: string;
  status: "Scheduled" | "Completed";
}

interface AlumniSupportProject {
  title: string;
  cost: number;
  status: "In Progress" | "Completed";
}

interface AlumniRecord {
  id?: string;
  name: string;
  batch: string;
  contribution: string; // Serialized JSON or plain text
  role: string;
  phone: string;
  email: string;
  location: string;
  value: string;
  schoolId?: string | null;
  createdAt?: string;
}

interface ParsedAlumni extends AlumniRecord {
  contributionDetails: string;
  achievements: string[];
  engagements: AlumniEvent[];
  initiatives: AlumniSupportProject[];
  isExpanded?: boolean;
}

interface ParsedPreviewAlumni {
  id: number;
  name: string;
  batch: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  value: string;
  contribution: string;
  isValid: boolean;
  validationError?: string;
}

export default function AlumniPage() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [alumni, setAlumni] = useState<ParsedAlumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"directory" | "achievements" | "engagement" | "initiatives" | "import">("directory");

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Main CRUD Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumnusId, setEditingAlumnusId] = useState<string | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formBatch, setFormBatch] = useState("");
  const [formRole, setFormRole] = useState("Alumni Member");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formContributionDetails, setFormContributionDetails] = useState("");
  const [formAchievements, setFormAchievements] = useState<string[]>([]);
  const [formEngagements, setFormEngagements] = useState<AlumniEvent[]>([]);
  const [formInitiatives, setFormInitiatives] = useState<AlumniSupportProject[]>([]);

  // Sub-forms states for quick adding items in lists
  const [newAchievementInput, setNewAchievementInput] = useState("");
  const [newEngagementType, setNewEngagementType] = useState("Guest Lecture");
  const [newEngagementDate, setNewEngagementDate] = useState("");
  const [newEngagementTopic, setNewEngagementTopic] = useState("");
  const [newEngagementStatus, setNewEngagementStatus] = useState<"Scheduled" | "Completed">("Scheduled");
  const [newInitiativeTitle, setNewInitiativeTitle] = useState("");
  const [newInitiativeCost, setNewInitiativeCost] = useState("");
  const [newInitiativeStatus, setNewInitiativeStatus] = useState<"In Progress" | "Completed">("Completed");

  // Inline action forms (Achievements tab, Engagement tab, Initiatives tab)
  const [selectedAlumnusId, setSelectedAlumnusId] = useState("");
  const [inlineAchievementText, setInlineAchievementText] = useState("");
  const [inlineEngagementType, setInlineEngagementType] = useState("Guest Lecture");
  const [inlineEngagementDate, setInlineEngagementDate] = useState("");
  const [inlineEngagementTopic, setInlineEngagementTopic] = useState("");
  const [inlineInitiativeTitle, setInlineInitiativeTitle] = useState("");
  const [inlineInitiativeCost, setInlineInitiativeCost] = useState("");

  // Upload/Import states
  const [previewAlumni, setPreviewAlumni] = useState<ParsedPreviewAlumni[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Parses JSON contribution or falls back to plain string
  const parseContribution = (contributionStr: string) => {
    try {
      const parsed = JSON.parse(contributionStr);
      if (parsed && typeof parsed === "object") {
        return {
          contributionDetails: parsed.contributionDetails || "",
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          engagements: Array.isArray(parsed.engagements) ? parsed.engagements : [],
          initiatives: Array.isArray(parsed.initiatives) ? parsed.initiatives : []
        };
      }
    } catch (e) {
      // Fallback
    }
    return {
      contributionDetails: contributionStr || "",
      achievements: [],
      engagements: [],
      initiatives: []
    };
  };

  // Helper: Format rupees
  const formatRupees = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper: Parse currency values safely
  const parseCurrency = (val: string): number => {
    if (!val || val === "N/A") return 0;
    const sanitized = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Fetch school list
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

  // Fetch Alumni data
  const fetchAlumni = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        const parsed = json.data.map((item: AlumniRecord) => {
          const meta = parseContribution(item.contribution);
          return {
            ...item,
            contributionDetails: meta.contributionDetails,
            achievements: meta.achievements,
            engagements: meta.engagements,
            initiatives: meta.initiatives,
            isExpanded: false
          };
        });
        setAlumni(parsed);
      } else {
        Swal.fire({ title: "Error", text: "Could not load alumni data.", icon: "error" });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: "Offline", text: "Failed to connect to server.", icon: "warning" });
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  // Handle Edit/Save/Add flow
  const handleSaveAlumnus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBatch) return;

    setIsSaving(true);
    const serializedContribution = JSON.stringify({
      contributionDetails: formContributionDetails,
      achievements: formAchievements,
      engagements: formEngagements,
      initiatives: formInitiatives
    });

    const body = {
      name: formName,
      batch: formBatch,
      contribution: serializedContribution,
      role: formRole,
      phone: formPhone || "N/A",
      email: formEmail || "N/A",
      location: formLocation || "N/A",
      value: formValue || "N/A",
      schoolId: mySchoolId
    };

    try {
      let res;
      if (editingAlumnusId) {
        res = await fetch(`${API_BASE}/api/headmaster/alumni/${editingAlumnusId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API_BASE}/api/headmaster/alumni`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }

      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: editingAlumnusId ? "Alumnus Updated" : "Alumnus Registered",
          text: `${formName} has been successfully saved in the database.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--bg-card)",
          color: "var(--text-heading)"
        });
        resetForm();
        setIsModalOpen(false);
        fetchAlumni();
      } else {
        throw new Error(json.error || "Save failed");
      }
    } catch (err: any) {
      Swal.fire({ title: "Failed to Save", text: err.message, icon: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: Save parsed alumni record directly to backend
  const updateAlumnusMeta = async (alumnus: ParsedAlumni, updatedMeta: Partial<ParsedAlumni>) => {
    try {
      const payload = {
        name: updatedMeta.name ?? alumnus.name,
        batch: updatedMeta.batch ?? alumnus.batch,
        role: updatedMeta.role ?? alumnus.role,
        phone: updatedMeta.phone ?? alumnus.phone,
        email: updatedMeta.email ?? alumnus.email,
        location: updatedMeta.location ?? alumnus.location,
        value: updatedMeta.value ?? alumnus.value,
        contribution: JSON.stringify({
          contributionDetails: updatedMeta.contributionDetails ?? alumnus.contributionDetails,
          achievements: updatedMeta.achievements ?? alumnus.achievements,
          engagements: updatedMeta.engagements ?? alumnus.engagements,
          initiatives: updatedMeta.initiatives ?? alumnus.initiatives
        })
      };

      const res = await fetch(`${API_BASE}/api/headmaster/alumni/${alumnus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        fetchAlumni();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Delete Alumnus
  const handleDeleteAlumnus = async (id: string, name: string) => {
    Swal.fire({
      title: "Remove Alumnus?",
      text: `Are you sure you want to delete ${name} from the directory?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      background: "var(--bg-card)",
      color: "var(--text-heading)"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/headmaster/alumni/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            Swal.fire({ title: "Deleted", text: `${name} has been removed.`, icon: "success", timer: 1000, showConfirmButton: false });
            fetchAlumni();
          } else {
            Swal.fire({ title: "Error", text: "Failed to delete record.", icon: "error" });
          }
        } catch {
          Swal.fire({ title: "Error", text: "Connection error.", icon: "error" });
        }
      }
    });
  };

  // Toggle detail card expanded state
  const toggleExpand = (id: string) => {
    setAlumni(prev => prev.map(a => a.id === id ? { ...a, isExpanded: !a.isExpanded } : a));
  };

  // Reset form fields
  const resetForm = () => {
    setEditingAlumnusId(null);
    setFormName("");
    setFormBatch("");
    setFormRole("Alumni Member");
    setFormPhone("");
    setFormEmail("");
    setFormLocation("");
    setFormValue("");
    setFormContributionDetails("");
    setFormAchievements([]);
    setFormEngagements([]);
    setFormInitiatives([]);
    
    // reset list subform inputs
    setNewAchievementInput("");
    setNewEngagementTopic("");
    setNewEngagementDate("");
    setNewInitiativeTitle("");
    setNewInitiativeCost("");
  };

  // Add items to sub-form arrays (modal edits)
  const addAchievement = () => {
    if (!newAchievementInput.trim()) return;
    setFormAchievements(prev => [...prev, newAchievementInput.trim()]);
    setNewAchievementInput("");
  };

  const removeAchievement = (index: number) => {
    setFormAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const addEngagement = () => {
    if (!newEngagementTopic.trim() || !newEngagementDate) return;
    setFormEngagements(prev => [...prev, {
      type: newEngagementType,
      date: newEngagementDate,
      topic: newEngagementTopic.trim(),
      status: newEngagementStatus
    }]);
    setNewEngagementTopic("");
    setNewEngagementDate("");
  };

  const removeEngagement = (index: number) => {
    setFormEngagements(prev => prev.filter((_, i) => i !== index));
  };

  const addInitiative = () => {
    if (!newInitiativeTitle.trim()) return;
    const cost = parseFloat(newInitiativeCost) || 0;
    setFormInitiatives(prev => [...prev, {
      title: newInitiativeTitle.trim(),
      cost,
      status: newInitiativeStatus
    }]);
    setNewInitiativeTitle("");
    setNewInitiativeCost("");
  };

  const removeInitiative = (index: number) => {
    setFormInitiatives(prev => prev.filter((_, i) => i !== index));
  };

  // Inline forms submit handlers
  const handleInlineAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnusId || !inlineAchievementText.trim()) return;
    const alumnus = alumni.find(a => a.id === selectedAlumnusId);
    if (!alumnus) return;

    const updatedAchievements = [...alumnus.achievements, inlineAchievementText.trim()];
    const success = await updateAlumnusMeta(alumnus, { achievements: updatedAchievements });
    if (success) {
      Swal.fire({ title: "Achievement Added", text: `Logged for ${alumnus.name}`, icon: "success", timer: 1000, showConfirmButton: false });
      setInlineAchievementText("");
      setSelectedAlumnusId("");
    }
  };

  const handleInlineEngagementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnusId || !inlineEngagementTopic.trim() || !inlineEngagementDate) return;
    const alumnus = alumni.find(a => a.id === selectedAlumnusId);
    if (!alumnus) return;

    const newEvent: AlumniEvent = {
      type: inlineEngagementType,
      date: inlineEngagementDate,
      topic: inlineEngagementTopic.trim(),
      status: "Scheduled"
    };

    const updatedEvents = [...alumnus.engagements, newEvent];
    const success = await updateAlumnusMeta(alumnus, { engagements: updatedEvents });
    if (success) {
      Swal.fire({ title: "Event Scheduled", text: `Scheduled session with ${alumnus.name}`, icon: "success", timer: 1000, showConfirmButton: false });
      setInlineEngagementTopic("");
      setInlineEngagementDate("");
      setSelectedAlumnusId("");
    }
  };

  const handleInlineInitiativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumnusId || !inlineInitiativeTitle.trim()) return;
    const alumnus = alumni.find(a => a.id === selectedAlumnusId);
    if (!alumnus) return;

    const cost = parseFloat(inlineInitiativeCost) || 0;
    const newProject: AlumniSupportProject = {
      title: inlineInitiativeTitle.trim(),
      cost,
      status: "In Progress"
    };

    const updatedProjects = [...alumnus.initiatives, newProject];
    const updatedValue = cost > 0 
      ? String(parseCurrency(alumnus.value) + cost) 
      : alumnus.value;

    const success = await updateAlumnusMeta(alumnus, { 
      initiatives: updatedProjects,
      value: updatedValue
    });

    if (success) {
      Swal.fire({ title: "Initiative Registered", text: `Linked to ${alumnus.name}`, icon: "success", timer: 1000, showConfirmButton: false });
      setInlineInitiativeTitle("");
      setInlineInitiativeCost("");
      setSelectedAlumnusId("");
    }
  };

  // Open edit modal
  const openEditModal = (alumnus: ParsedAlumni) => {
    setEditingAlumnusId(alumnus.id!);
    setFormName(alumnus.name);
    setFormBatch(alumnus.batch);
    setFormRole(alumnus.role);
    setFormPhone(alumnus.phone);
    setFormEmail(alumnus.email);
    setFormLocation(alumnus.location);
    setFormValue(alumnus.value === "N/A" ? "" : alumnus.value);
    setFormContributionDetails(alumnus.contributionDetails);
    setFormAchievements(alumnus.achievements);
    setFormEngagements(alumnus.engagements);
    setFormInitiatives(alumnus.initiatives);
    setIsModalOpen(true);
  };

  // Filtered lists
  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => {
      const matchesSearch = 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contributionDetails.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBatch = batchFilter === "all" || a.batch === batchFilter;
      const matchesLocation = locationFilter === "all" || a.location === locationFilter;

      return matchesSearch && matchesBatch && matchesLocation;
    });
  }, [alumni, searchTerm, batchFilter, locationFilter]);

  // Unique batches and locations for filters
  const batchesList = useMemo(() => {
    const set = new Set(alumni.map(a => a.batch));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [alumni]);

  const locationsList = useMemo(() => {
    const set = new Set(alumni.map(a => a.location).filter(l => l && l !== "N/A"));
    return Array.from(set).sort();
  }, [alumni]);

  // Aggregated lists for other tabs
  const allAchievements = useMemo(() => {
    const arr: { id: string; name: string; batch: string; text: string }[] = [];
    alumni.forEach(a => {
      a.achievements.forEach(ach => {
        arr.push({ id: a.id!, name: a.name, batch: a.batch, text: ach });
      });
    });
    return arr;
  }, [alumni]);

  const allEngagements = useMemo(() => {
    const arr: { id: string; name: string; batch: string; event: AlumniEvent }[] = [];
    alumni.forEach(a => {
      a.engagements.forEach(ev => {
        arr.push({ id: a.id!, name: a.name, batch: a.batch, event: ev });
      });
    });
    return arr.sort((a, b) => b.event.date.localeCompare(a.event.date));
  }, [alumni]);

  const allInitiatives = useMemo(() => {
    const arr: { id: string; name: string; batch: string; project: AlumniSupportProject }[] = [];
    alumni.forEach(a => {
      a.initiatives.forEach(proj => {
        arr.push({ id: a.id!, name: a.name, batch: a.batch, project: proj });
      });
    });
    return arr;
  }, [alumni]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalDonations = alumni.reduce((sum, item) => sum + parseCurrency(item.value), 0);
    const totalEvents = alumni.reduce((sum, item) => sum + item.engagements.length, 0);
    const totalProjects = alumni.reduce((sum, item) => sum + item.initiatives.length, 0);
    return {
      count: alumni.length,
      donations: totalDonations,
      events: totalEvents,
      projects: totalProjects
    };
  }, [alumni]);

  // Excel handlers
  const downloadExcelTemplate = () => {
    const headers = [
      "Alumni Name", "Batch Year", "Current Role", "Phone Number", 
      "Email Address", "Current Location", "Contribution Value", "Contribution Details"
    ];
    const sampleData = [
      {
        "Alumni Name": "Dr. S. Ramakrishnan",
        "Batch Year": "1994",
        "Current Role": "Software Architect",
        "Phone Number": "9876543240",
        "Email Address": "ramakrishnan@gmail.com",
        "Current Location": "Coimbatore",
        "Contribution Value": "150000",
        "Contribution Details": "Donated computers and set up ICT lab"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Roster Template");
    XLSX.writeFile(workbook, "alumni_bulk_import_template.xlsx");
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
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

        interface ExcelRow {
          "Alumni Name"?: string;
          "Batch Year"?: string;
          "Current Role"?: string;
          "Phone Number"?: string;
          "Email Address"?: string;
          "Current Location"?: string;
          "Contribution Value"?: string;
          "Contribution Details"?: string;
        }

        const parsedData = XLSX.utils.sheet_to_json<ExcelRow>(sheet);
        const validated: ParsedPreviewAlumni[] = parsedData.map((row, idx) => {
          const name = row["Alumni Name"]?.toString().trim() || "";
          const batch = row["Batch Year"]?.toString().trim() || "";
          const role = row["Current Role"]?.toString().trim() || "Alumni Member";
          const phone = row["Phone Number"]?.toString().trim() || "N/A";
          const email = row["Email Address"]?.toString().trim() || "N/A";
          const location = row["Current Location"]?.toString().trim() || "N/A";
          const value = row["Contribution Value"]?.toString().trim() || "0";
          const details = row["Contribution Details"]?.toString().trim() || "";

          const contribution = JSON.stringify({
            contributionDetails: details,
            achievements: [],
            engagements: [],
            initiatives: details ? [{ title: details.slice(0, 40), cost: parseFloat(value) || 0, status: "Completed" }] : []
          });

          const isValid = name !== "" && batch !== "";

          return {
            id: idx,
            name,
            batch,
            role,
            phone,
            email,
            location,
            value,
            contribution,
            isValid,
            validationError: !name ? "Name missing" : !batch ? "Batch missing" : undefined
          };
        });

        setPreviewAlumni(validated);
        setActiveTab("import");
      } catch (err) {
        console.error(err);
        Swal.fire({ title: "Parse Failed", text: "Spreadsheet structure is invalid.", icon: "error" });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const valids = previewAlumni.filter(x => x.isValid);
    if (valids.length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumni: valids.map(v => ({
            name: v.name,
            batch: v.batch,
            role: v.role,
            phone: v.phone,
            email: v.email,
            location: v.location,
            value: v.value,
            contribution: v.contribution,
            schoolId: mySchoolId
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({ title: "Import Successful", text: `${json.created} alumni records added!`, icon: "success" });
        setPreviewAlumni([]);
        setActiveTab("directory");
        fetchAlumni();
      }
    } catch {
      Swal.fire({ title: "Error", text: "Failed to write records to database.", icon: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const exportExcel = () => {
    const headers = [
      "Alumni Name", "Batch Year", "Current Role", "Phone Number", 
      "Email Address", "Current Location", "Total Contribution (₹)", "Details/Initiatives"
    ];
    const data = alumni.map(a => [
      a.name,
      a.batch,
      a.role,
      a.phone,
      a.email,
      a.location,
      a.value,
      a.contributionDetails
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Roster");
    XLSX.writeFile(workbook, "school_alumni_directory.xlsx");
  };

  return (
    <PortalLayout
      title="Alumni Management Portal"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      
      {/* Scope Institutional Banner */}
      <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 fade-in">
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Managed Network</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Scoping database records to your assigned school catalog only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-500 dark:text-blue-400 text-sm">🏫</span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || "GHS Coimbatore"}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active</span>
        </div>
      </div>

      {/* Dynamic Metric cards - "Flaticon" Style colored cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        
        {/* Card 1: Registered */}
        <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alumni Database</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{isLoading ? "..." : stats.count}</span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-1">Registered Profiles</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Donations */}
        <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Donations</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{isLoading ? "..." : formatRupees(stats.donations)}</span>
            <span className="text-[9px] text-emerald-650 dark:text-emerald-400 font-semibold mt-1">Financial Contributions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Engagements */}
        <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-violet-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engagement Activities</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{isLoading ? "..." : stats.events}</span>
            <span className="text-[9px] text-violet-655 dark:text-violet-400 font-semibold mt-1">Lectures & Mentorships</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Support Projects */}
        <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Support Projects</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{isLoading ? "..." : stats.projects}</span>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">School Initiatives</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Gift className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800/80 mb-6 gap-2">
        {[
          { id: "directory", label: "Alumni Directory", icon: Users },
          { id: "achievements", label: "Notable Achievements", icon: Award },
          { id: "engagement", label: "Engagement Scheduler", icon: Calendar },
          { id: "initiatives", label: "Support Initiatives", icon: Gift }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); }}
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

      {/* Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-6 fade-in">
          
          {/* Action Toolbar */}
          <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 min-w-[200px] md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, batch, location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <select
                value={batchFilter}
                onChange={e => setBatchFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Batches</option>
                {batchesList.map(b => <option key={b} value={b}>Batch {b}</option>)}
              </select>

              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Locations</option>
                {locationsList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Alumnus</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={exportExcel}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>

          </div>

          {/* Alumni Directory Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
                <span>Loading institutional alumni network...</span>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                No registered alumni matching selected search filters.
              </div>
            ) : (
              filteredAlumni.map(al => (
                <div 
                  key={al.id}
                  className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                    
                    {/* Alumnus summary info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {al.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{al.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[9px] font-bold text-slate-500">
                            Batch {al.batch}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[9px] font-bold text-blue-600 dark:text-blue-400">
                            {al.role}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 mt-1 font-semibold">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {al.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {al.phone}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {al.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats counters */}
                    <div className="flex items-center gap-3 self-end lg:self-auto">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Contribution</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {al.value !== "N/A" ? (al.value.startsWith("₹") ? al.value : `₹${parseFloat(al.value).toLocaleString('en-IN')}`) : "₹0"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                        <button
                          onClick={() => openEditModal(al)}
                          className="p-2 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAlumnus(al.id!, al.name)}
                          className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Expand / Collapse Section */}
                  <div className="pt-3">
                    <button
                      onClick={() => toggleExpand(al.id!)}
                      className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline outline-none uppercase"
                    >
                      {al.isExpanded ? (
                        <>
                          <span>Hide Involvement & Contributions</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>View Involvement & Contributions ({al.achievements.length} Ach. · {al.engagements.length} Eng. · {al.initiatives.length} Init.)</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    {al.isExpanded && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-900 fade-in">
                        
                        {/* Column 1: Achievements */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-blue-500" />
                            <span>Achievements</span>
                          </h4>
                          {al.achievements.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No logged achievements.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {al.achievements.map((ach, idx) => (
                                <li key={idx} className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                  {ach}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Column 2: Engagements */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-violet-500" />
                            <span>Engagement Activities</span>
                          </h4>
                          {al.engagements.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No engagement logs.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {al.engagements.map((ev, idx) => (
                                <li key={idx} className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-violet-600 dark:text-violet-400">{ev.type}</span>
                                    <span className="text-slate-400">{ev.date}</span>
                                  </div>
                                  <p className="text-slate-700 dark:text-slate-350 font-semibold">{ev.topic}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Column 3: Support Initiatives */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5 text-amber-500" />
                            <span>Support Initiatives</span>
                          </h4>
                          <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
                            <span className="text-[10px] text-slate-400 font-bold block">Contribution Details</span>
                            <p className="text-slate-700 dark:text-slate-300 font-semibold">{al.contributionDetails || "No specified details."}</p>
                          </div>
                          {al.initiatives.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No registered support projects.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {al.initiatives.map((proj, idx) => (
                                <li key={idx} className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-700 dark:text-slate-350">{proj.title}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">{proj.cost > 0 ? `₹${proj.cost.toLocaleString('en-IN')}` : "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] text-slate-400">
                                    <span>Initiative Type</span>
                                    <span className={`font-bold px-1.5 py-0.2 rounded ${proj.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}>
                                      {proj.status}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Achievements Gallery Tab */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          
          {/* Achievements List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Notable Alumni Achievements Roster</h3>
            
            {allAchievements.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                No notable achievements logged yet. Use the sidebar form to highlight outstanding alumni accomplishments.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAchievements.map((ach, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <Award className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-350 font-semibold leading-relaxed mb-4">
                        "{ach.text}"
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-900 dark:text-slate-350">{ach.name}</span>
                      <span className="text-slate-400">Batch {ach.batch}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Add Sidebar */}
          <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-blue-500" />
              <span>Highlight Achievement</span>
            </h3>
            
            <form onSubmit={handleInlineAchievementSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Select Alumnus</label>
                <select
                  required
                  value={selectedAlumnusId}
                  onChange={e => setSelectedAlumnusId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">-- Choose Alumnus --</option>
                  {alumni.map(a => <option key={a.id} value={a.id}>{a.name} (Batch {a.batch})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Achievement Accomplishment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Promoted to Senior IAS officer in Chennai, or Founded ed-tech startup funding scholarships..."
                  value={inlineAchievementText}
                  onChange={e => setInlineAchievementText(e.target.value)}
                  className="w-full bg-slate-155 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedAlumnusId || !inlineAchievementText.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Save Achievement
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Engagement Scheduler Tab */}
      {activeTab === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          
          {/* Engagement Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scheduled Alumni Interaction Schedules</h3>
            
            {allEngagements.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                No active engagement events scheduled. Use the scheduler panel on the right to register meetings.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {allEngagements.map((eng, idx) => (
                  <div key={idx} className="relative bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 shadow-sm">
                    {/* Circle bullet on timeline */}
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-violet-500 border-4 border-slate-100 dark:border-slate-900" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-full text-[9px] font-extrabold text-violet-650 dark:text-violet-400 uppercase">
                          {eng.event.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{eng.event.date}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full self-start sm:self-auto ${
                        eng.event.status === "Completed" ? "bg-emerald-500/15 text-emerald-650" : "bg-blue-500/15 text-blue-650"
                      }`}>
                        {eng.event.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-snug">{eng.event.topic}</h4>
                    
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-900 flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Speaker: {eng.name}</span>
                      <span>Batch of {eng.batch}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Scheduler Sidebar */}
          <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-violet-500" />
              <span>Schedule Engagement</span>
            </h3>

            <form onSubmit={handleInlineEngagementSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Select Host / Alumnus</label>
                <select
                  required
                  value={selectedAlumnusId}
                  onChange={e => setSelectedAlumnusId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">-- Choose Alumnus --</option>
                  {alumni.map(a => <option key={a.id} value={a.id}>{a.name} (Batch {a.batch})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Activity Type</label>
                <select
                  value={inlineEngagementType}
                  onChange={e => setInlineEngagementType(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Guest Lecture">Guest Lecture</option>
                  <option value="Mentorship Session">Mentorship Session</option>
                  <option value="Alumni Meet">Alumni Meet</option>
                  <option value="Career Guidance">Career Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Date of Interaction</label>
                <input
                  type="date"
                  required
                  value={inlineEngagementDate}
                  onChange={e => setInlineEngagementDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Topic / Agenda</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Careers in Medical Science, or STEM coding workshop"
                  value={inlineEngagementTopic}
                  onChange={e => setInlineEngagementTopic(e.target.value)}
                  className="w-full bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedAlumnusId || !inlineEngagementTopic.trim() || !inlineEngagementDate}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Schedule Interaction
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Support Initiatives Tab */}
      {activeTab === "initiatives" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          
          {/* Projects lists */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">School Support Projects & Funding Registry</h3>
            
            {allInitiatives.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                No active support initiatives registered. Link donations using the panel on the right.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allInitiatives.map((init, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 leading-tight">{init.project.title}</h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          init.project.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        }`}>
                          {init.project.status}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-semibold mb-3">
                        Supported by: <span className="text-slate-600 dark:text-slate-300 font-bold">{init.name}</span> (Batch {init.batch})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Funding Value</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {init.project.cost > 0 ? `₹${init.project.cost.toLocaleString('en-IN')}` : "₹0"}
                        </span>
                      </div>
                      <div className="w-20 bg-slate-150 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: init.project.status === "Completed" ? "100%" : "40%" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Support Register Sidebar */}
          <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>Link Support Project</span>
            </h3>

            <form onSubmit={handleInlineInitiativeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Select Contributor / Alumnus</label>
                <select
                  required
                  value={selectedAlumnusId}
                  onChange={e => setSelectedAlumnusId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">-- Choose Alumnus --</option>
                  {alumni.map(a => <option key={a.id} value={a.id}>{a.name} (Batch {a.batch})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Project / Donation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Set up ICT Lab Terminals, or Smart Classroom Sponsorship"
                  value={inlineInitiativeTitle}
                  onChange={e => setInlineInitiativeTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Financial Value (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={inlineInitiativeCost}
                  onChange={e => setInlineInitiativeCost(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedAlumnusId || !inlineInitiativeTitle.trim()}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Register Support Project
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Spreadsheet Bulk Preview Tab */}
      {activeTab === "import" && (
        <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 fade-in">
          
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              📋 Spreadsheet Import Preview
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {previewAlumni.filter(x => x.isValid).length} Valid rows ready
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-905 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                  <th className="p-3">Name</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Donation (₹)</th>
                  <th className="p-3">Contribution Details</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {previewAlumni.map(s => (
                  <tr key={s.id} className={`${s.isValid ? "hover:bg-slate-50 dark:hover:bg-slate-900/60" : "bg-red-500/10"} text-slate-700 dark:text-slate-300`}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name || <span className="text-red-500">Missing</span>}</td>
                    <td className="p-3">{s.batch || <span className="text-red-500">Missing</span>}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3">{s.location}</td>
                    <td className="p-3">{s.value}</td>
                    <td className="p-3 truncate max-w-[200px]" title={JSON.parse(s.contribution).contributionDetails}>
                      {JSON.parse(s.contribution).contributionDetails}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {s.isValid ? <span className="text-emerald-500">✓ Ready</span> : <span className="text-red-500">✕ Invalid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmImport}
              disabled={isSaving || previewAlumni.filter(x => x.isValid).length === 0}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
            >
              Confirm Import ({previewAlumni.filter(x => x.isValid).length} Profiles)
            </button>
            
            <button
              onClick={() => { setPreviewAlumni([]); setActiveTab("directory"); }}
              className="px-6 py-2.5 bg-slate-150 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-slate-800"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* Main CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-500" />
                <span>{editingAlumnusId ? "Edit Alumni Profile" : "Register New Alumni Contributor"}</span>
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveAlumnus} className="space-y-4">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Ramakrishnan"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Batch Year</label>
                  <input
                    type="text"
                    required
                    value={formBatch}
                    onChange={e => setFormBatch(e.target.value)}
                    placeholder="e.g. 1994"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Current Designation / Role</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    placeholder="e.g. Software Architect"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. ram@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Current Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Financial Donation (₹)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Contribution Details / Overview</label>
                <textarea
                  value={formContributionDetails}
                  onChange={e => setFormContributionDetails(e.target.value)}
                  placeholder="Summarize key support initiatives, scholarships, or equipment donated..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Modal Ach list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logged Achievements</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add outstanding award..."
                      value={newAchievementInput}
                      onChange={e => setNewAchievementInput(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      +
                    </button>
                  </div>
                  <ul className="space-y-1 max-h-[140px] overflow-y-auto">
                    {formAchievements.map((ach, idx) => (
                      <li key={idx} className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[180px]">{ach}</span>
                        <button type="button" onClick={() => removeAchievement(idx)} className="text-red-500 hover:text-red-700">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Eng list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Interaction Schedule</span>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                    <select
                      value={newEngagementType}
                      onChange={e => setNewEngagementType(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                    >
                      <option value="Guest Lecture">Guest Lecture</option>
                      <option value="Mentorship Session">Mentorship Session</option>
                      <option value="Alumni Meet">Alumni Meet</option>
                      <option value="Career Guidance">Career Guidance</option>
                    </select>
                    <input
                      type="date"
                      value={newEngagementDate}
                      onChange={e => setNewEngagementDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Agenda/Topic..."
                        value={newEngagementTopic}
                        onChange={e => setNewEngagementTopic(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addEngagement}
                        className="px-2 py-0.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-1 max-h-[100px] overflow-y-auto">
                    {formEngagements.map((ev, idx) => (
                      <li key={idx} className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                        <div className="truncate max-w-[160px]">
                          <span className="font-bold text-violet-600 mr-1">[{ev.type}]</span>
                          <span>{ev.topic}</span>
                        </div>
                        <button type="button" onClick={() => removeEngagement(idx)} className="text-red-500 hover:text-red-700 shrink-0 ml-1">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal Init list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initiative Projects</span>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                    <input
                      type="text"
                      placeholder="Project Title..."
                      value={newInitiativeTitle}
                      onChange={e => setNewInitiativeTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-slate-800 dark:text-white"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="Cost (₹)..."
                        value={newInitiativeCost}
                        onChange={e => setNewInitiativeCost(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-slate-800 dark:text-white"
                      />
                      <select
                        value={newInitiativeStatus}
                        onChange={e => setNewInitiativeStatus(e.target.value as any)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px]"
                      >
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                      <button
                        type="button"
                        onClick={addInitiative}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-1 max-h-[100px] overflow-y-auto">
                    {formInitiatives.map((proj, idx) => (
                      <li key={idx} className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-350">
                        <div className="truncate max-w-[150px]">
                          <span className="font-bold text-amber-650 mr-1">{proj.title}</span>
                          <span>(₹{proj.cost})</span>
                        </div>
                        <button type="button" onClick={() => removeInitiative(idx)} className="text-red-500 hover:text-red-700 shrink-0 ml-1">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  <span>{editingAlumnusId ? "Save Profile Updates" : "Add Alumnus to Network"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Excel Upload Template Help Footer Info */}
      <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 fade-in">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            Did you know? You can download the EMIS standard excel template, populate it offline, and import all alumni contribution details at once.
          </span>
        </div>
        <button
          onClick={downloadExcelTemplate}
          className="text-xs text-blue-600 dark:text-blue-400 font-bold underline whitespace-nowrap self-start md:self-auto"
        >
          📥 Download Spreadsheet Template
        </button>
      </div>

    </PortalLayout>
  );
}
