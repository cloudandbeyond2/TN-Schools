export interface ProxyAssignment {
  subject?: string;
  timetable?: {
    subject?: string;
  };
  [key: string]: any;
}

export interface TeacherPermissionInput {
  role?: string;
  subject?: string;
  isClassTeacher?: boolean;
  assignedClass?: string;
  assignedSection?: string;
  proxyAssignments?: ProxyAssignment[];
  timetableClasses?: string[];
}

export interface TeacherPermissions {
  isPrimaryScienceTeacher: boolean;
  hasActiveScienceProxy: boolean;
  canUseScienceLabs: boolean;
  canUseSpecializedScienceLabs: boolean;
  canUseChemistryLab: boolean;
  canUseZoologyCentre: boolean;
  canViewMathsFormulas: boolean;
  canViewComputerEducation: boolean;
  canViewStudentProfiles: boolean;
  canViewScholarships: boolean;
  canViewSports: boolean;
  canTakeAttendance: boolean;
  canViewSSLCPrep: boolean;
  canViewNEETPrep: boolean;
  canViewCompetitiveExams: boolean;
}

const SCIENCE_KEYWORDS = [
  "science",
  "physics",
  "chemistry",
  "biology",
  "zoology",
  "botany",
  "natural science",
  "physical science"
];

const MATHS_KEYWORDS = [
  "math",
  "maths",
  "mathematics",
  "algebra",
  "geometry",
  "trigonometry",
  "calculus",
  "statistics"
];

const COMPUTER_KEYWORDS = [
  "computer",
  "cs",
  "information technology",
  "it",
  "computer science",
  "computer education",
  "computer applications"
];

const UNWANTED_MENUS = new Set([
  "Science Draw Mat",
  "School Press",
  "Student Status",
  "/teacher/science-draw-mat",
  "/teacher/school-press",
  "/teacher/student-status"
]);

export function isScienceSubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const normalized = String(subjectName).trim().toLowerCase();

  // Exclude Social Science / Social Studies (Humanities)
  if (normalized.includes("social science") || normalized.includes("social studies") || normalized.includes("social")) {
    return false;
  }

  return SCIENCE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isMathsSubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const normalized = String(subjectName).trim().toLowerCase();
  return MATHS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isComputerSubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const normalized = String(subjectName).trim().toLowerCase();
  return COMPUTER_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isChemistrySubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const normalized = String(subjectName).trim().toLowerCase();
  return normalized.includes("chemistry") || normalized.includes("chem");
}

export function isZoologySubject(subjectName?: string): boolean {
  if (!subjectName) return false;
  const normalized = String(subjectName).trim().toLowerCase();
  return normalized.includes("zoology") || normalized.includes("biology") || normalized.includes("botany") || normalized.includes("bio");
}

export function isUnwantedTeacherMenu(hrefOrLabel?: string): boolean {
  if (!hrefOrLabel) return false;
  return UNWANTED_MENUS.has(hrefOrLabel);
}

export function getTeacherPermissions(input: TeacherPermissionInput): TeacherPermissions {
  const role = String(input.role || "").toUpperCase();
  const subject = String(input.subject || "");
  const isClassTeacher = !!input.isClassTeacher;

  // 1. Primary Science Teacher check
  const isPrimaryScienceTeacher = isScienceSubject(subject);

  // 2. Active Temporary Science Proxy check
  let hasActiveScienceProxy = false;
  if (Array.isArray(input.proxyAssignments)) {
    hasActiveScienceProxy = input.proxyAssignments.some((proxy) => {
      const proxySubject = proxy.subject || proxy.timetable?.subject || "";
      return isScienceSubject(proxySubject);
    });
  }

  // Science Labs access = Primary Science Teacher OR active temporary Science proxy class
  const canUseScienceLabs = isPrimaryScienceTeacher || hasActiveScienceProxy;

  // 3. Primary & Proxy Maths Teacher check
  const isPrimaryMathsTeacher = isMathsSubject(subject);
  let hasActiveMathsProxy = false;
  if (Array.isArray(input.proxyAssignments)) {
    hasActiveMathsProxy = input.proxyAssignments.some((proxy) => {
      const proxySubject = proxy.subject || proxy.timetable?.subject || "";
      return isMathsSubject(proxySubject);
    });
  }
  const canViewMathsFormulas = isPrimaryMathsTeacher || hasActiveMathsProxy;

  // 4. Build set of taught grades
  const teacherGrades = new Set<string>();
  if (input.assignedClass) {
    const matches = String(input.assignedClass).match(/\d+/g);
    if (matches) matches.forEach((g) => teacherGrades.add(g));
  }
  if (Array.isArray(input.timetableClasses)) {
    input.timetableClasses.forEach((c) => {
      const m = String(c).match(/\d+/);
      if (m) teacherGrades.add(m[0]);
    });
  }

  const hasHigherSecondaryGrades = teacherGrades.has("11") || teacherGrades.has("12");
  const isMiddleSchoolOnly = teacherGrades.size > 0 && Array.from(teacherGrades).every((g) => ["6", "7", "8"].includes(g));

  // Specialized Science Labs (Chemistry Lab, Zoology Centre, Science Lab Support) require 11th or 12th grade Science
  const canUseSpecializedScienceLabs = canUseScienceLabs && hasHigherSecondaryGrades;

  // Chemistry Lab require Chemistry subject (or Chemistry proxy class) in 11th/12th
  const isPrimaryChemistry = isChemistrySubject(subject);
  let hasActiveChemistryProxy = false;
  if (Array.isArray(input.proxyAssignments)) {
    hasActiveChemistryProxy = input.proxyAssignments.some((proxy) => {
      const proxySubject = proxy.subject || proxy.timetable?.subject || "";
      return isChemistrySubject(proxySubject);
    });
  }
  const canUseChemistryLab = hasHigherSecondaryGrades && (isPrimaryChemistry || hasActiveChemistryProxy);

  // Zoology Centre require Zoology/Biology/Botany subject (or Zoology proxy class) in 11th/12th
  const isPrimaryZoology = isZoologySubject(subject);
  let hasActiveZoologyProxy = false;
  if (Array.isArray(input.proxyAssignments)) {
    hasActiveZoologyProxy = input.proxyAssignments.some((proxy) => {
      const proxySubject = proxy.subject || proxy.timetable?.subject || "";
      return isZoologySubject(proxySubject);
    });
  }
  const canUseZoologyCentre = hasHigherSecondaryGrades && (isPrimaryZoology || hasActiveZoologyProxy);

  // Computer Education is NOT for Middle School (6, 7, 8). Only for High/Higher Secondary CS teachers.
  const isComputerTeacher = isComputerSubject(subject);
  const canViewComputerEducation = isComputerTeacher && !isMiddleSchoolOnly;

  // 5. Permission Flags
  const canViewStudentProfiles = isClassTeacher;
  const canViewScholarships = isClassTeacher;
  const canViewSports = isClassTeacher || role === "PET" || subject.toLowerCase() === "pet";
  const canTakeAttendance = isClassTeacher;
  const canViewSSLCPrep = teacherGrades.has("10");
  const canViewNEETPrep = hasHigherSecondaryGrades;
  const canViewCompetitiveExams = hasHigherSecondaryGrades;

  return {
    isPrimaryScienceTeacher,
    hasActiveScienceProxy,
    canUseScienceLabs,
    canUseSpecializedScienceLabs,
    canUseChemistryLab,
    canUseZoologyCentre,
    canViewMathsFormulas,
    canViewComputerEducation,
    canViewStudentProfiles,
    canViewScholarships,
    canViewSports,
    canTakeAttendance,
    canViewSSLCPrep,
    canViewNEETPrep,
    canViewCompetitiveExams
  };
}

export function canAccessTeacherNavItem(item: { href: string; label: string }, permissions: TeacherPermissions): boolean {
  if (isUnwantedTeacherMenu(item.label) || isUnwantedTeacherMenu(item.href)) {
    return false;
  }

  // Daily Attendance - Class Teachers ONLY
  if (item.href === "/teacher/attendance" || item.label === "Daily Attendance") {
    return permissions.canTakeAttendance;
  }

  // Maths Formulas - Maths Teachers ONLY
  if (item.href === "/teacher/maths-formulas" || item.label === "Maths Formulas") {
    return permissions.canViewMathsFormulas;
  }

  // Computer Education - High / Higher Secondary CS Teachers ONLY
  if (item.href === "/teacher/computer-education" || item.label === "Computer Education") {
    return permissions.canViewComputerEducation;
  }

  // Chemistry Lab (11th & 12th Chemistry teachers or proxy)
  if (item.href === "/teacher/chemistry-lab" || item.label === "Chemistry Lab") {
    return permissions.canUseChemistryLab;
  }

  // Zoology Centre (11th & 12th Biology / Zoology teachers or proxy)
  if (item.href === "/teacher/zoology-centre" || item.label === "Zoology Centre") {
    return permissions.canUseZoologyCentre;
  }

  // Science Lab Support (11th & 12th Science Teachers)
  if (item.href === "/teacher/science-lab-support" || item.label === "Science Lab Support") {
    return permissions.canUseSpecializedScienceLabs;
  }

  // General Science Labs & Lab Creator (6th-10th & 11th-12th Science Teachers)
  const generalScienceRoutes = new Set([
    "/teacher/labs",
    "/teacher/lab-creator"
  ]);

  if (
    generalScienceRoutes.has(item.href) ||
    item.label === "Science Labs" ||
    item.label === "Lab Creator"
  ) {
    return permissions.canUseScienceLabs;
  }

  // Class Teacher Menus
  if (item.href === "/teacher/student-profiles" || item.label === "Student Profiles") {
    return permissions.canViewStudentProfiles;
  }
  if (item.href === "/teacher/scholarships" || item.label === "Scholarship Details") {
    return permissions.canViewScholarships;
  }
  if (item.href === "/teacher/risk-alerts" || item.label === "Risk Alerts") {
    return permissions.canViewStudentProfiles;
  }
  if (item.href === "/teacher/sports" || item.label === "Sports & Athletics") {
    return permissions.canViewSports;
  }

  // Grade Specific Menus
  if (item.href === "/teacher/sslc-prep" || item.label === "SSLC Board Prep") {
    return permissions.canViewSSLCPrep;
  }
  if (item.href === "/teacher/neet-prep" || item.label === "NEET Preparation") {
    return permissions.canViewNEETPrep;
  }
  if (item.href === "/teacher/competitive-exams" || item.label === "Competitive Exams") {
    return permissions.canViewCompetitiveExams;
  }

  return true;
}
