export interface Scheme {
  id: string;
  name: string;
  category: "SC/ST Welfare" | "BC/MBC Welfare" | "Minorities Welfare" | "Government School Special" | "Merit / Exam-based" | "Higher Education Support";
  standards: string[];
  standardText: string;
  gender: "Male" | "Female" | "All";
  community: string[];
  communityText: string;
  incomeLimit: number | null;
  incomeLimitText: string;
  amount: number;
  amountText: string;
  description: string;
  eligibilityDetails: string[];
  documentsRequired: string[];
  deadline: string;
  contactDetails: string;
}

export const TAMIL_NADU_SCHEMES: Scheme[] = [
  {
    id: "tn-pudhumai-penn",
    name: "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
    category: "Government School Special",
    standards: ["6", "7", "8", "9", "10", "11", "12"],
    standardText: "Classes 6 to 12 (studied in government schools and joining higher education)",
    gender: "Female",
    community: ["All"],
    communityText: "All Communities",
    incomeLimit: null,
    incomeLimitText: "No income limit",
    amount: 12000,
    amountText: "₹1,000 / month (₹12,000 / year)",
    description: "Financial assistance for girls who studied from Class 6 to 12 in government schools in Tamil Nadu to encourage them to pursue higher education.",
    eligibilityDetails: [
      "Must be a female student.",
      "Must have studied in a government school in Tamil Nadu from Class 6 to Class 12.",
      "Must be enrolled in an undergraduate degree, diploma, or ITI course."
    ],
    documentsRequired: [
      "Transfer Certificate (TC) from school",
      "Class 10th and 12th Marksheets",
      "EMIS Student ID / School Certificate",
      "Aadhaar Card",
      "Bank Account Passbook (sole account in student's name)"
    ],
    deadline: "October 15, 2026",
    contactDetails: "School Headmaster / District Social Welfare Officer"
  },
  {
    id: "tn-tamil-puthalvan",
    name: "Tamil Pudhalvan Scheme",
    category: "Government School Special",
    standards: ["6", "7", "8", "9", "10", "11", "12"],
    standardText: "Classes 6 to 12 (studied in government schools and joining higher education)",
    gender: "Male",
    community: ["All"],
    communityText: "All Communities",
    incomeLimit: null,
    incomeLimitText: "No income limit",
    amount: 12000,
    amountText: "₹1,000 / month (₹12,000 / year)",
    description: "Financial assistance for boys who studied from Class 6 to 12 in government schools in Tamil Nadu to enable them to pursue higher education.",
    eligibilityDetails: [
      "Must be a male student.",
      "Must have studied in a government school in Tamil Nadu from Class 6 to Class 12.",
      "Must be enrolled in an undergraduate degree, diploma, or ITI course."
    ],
    documentsRequired: [
      "Transfer Certificate (TC) from school",
      "Class 10th and 12th Marksheets",
      "EMIS Student ID / School Certificate",
      "Aadhaar Card",
      "Bank Account Passbook (sole account in student's name)"
    ],
    deadline: "October 15, 2026",
    contactDetails: "School Headmaster / District Social Welfare Officer"
  },
  {
    id: "tn-bc-mbc-pre",
    name: "BC/MBC/DNC Pre-Matric Scholarship",
    category: "BC/MBC Welfare",
    standards: ["6", "7", "8", "9", "10"],
    standardText: "Classes 6 to 10",
    gender: "All",
    community: ["BC", "MBC", "DNC"],
    communityText: "Backward Classes / Most Backward Classes / Denotified Communities",
    incomeLimit: 200000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,00,000",
    amount: 1000,
    amountText: "₹1,000 / year",
    description: "Financial assistance to students belonging to BC/MBC/DNC communities studying in Classes 6 to 10 to support their school education.",
    eligibilityDetails: [
      "Must belong to BC, MBC, or DNC communities.",
      "Must be studying in Class 6 to 10.",
      "Annual family income must not exceed ₹2 Lakhs.",
      "Attendance must be at least 75% in the previous academic year."
    ],
    documentsRequired: [
      "Community Certificate",
      "Income Certificate",
      "Aadhaar Card of student",
      "Bank Account details",
      "Previous year marks sheet / report card"
    ],
    deadline: "September 30, 2026",
    contactDetails: "School Scholarship In-Charge / Headmaster"
  },
  {
    id: "tn-bc-mbc-post",
    name: "BC/MBC/DNC Post-Matric Scholarship",
    category: "BC/MBC Welfare",
    standards: ["11", "12"],
    standardText: "Classes 11 and 12",
    gender: "All",
    community: ["BC", "MBC", "DNC"],
    communityText: "Backward Classes / Most Backward Classes / Denotified Communities",
    incomeLimit: 200000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,00,000",
    amount: 3500,
    amountText: "₹3,000 to ₹5,000 / year",
    description: "Provides maintenance allowance and school fees reimbursement to BC/MBC/DNC students studying in Classes 11 and 12.",
    eligibilityDetails: [
      "Must belong to BC, MBC, or DNC communities.",
      "Must be studying in Class 11 or 12.",
      "Annual family income must not exceed ₹2 Lakhs."
    ],
    documentsRequired: [
      "Community Certificate",
      "Income Certificate",
      "Aadhaar Card",
      "Bank Passbook copy",
      "Fees Receipt / School Admission Letter"
    ],
    deadline: "September 30, 2026",
    contactDetails: "School Headmaster / District Backward Classes Welfare Officer"
  },
  {
    id: "tn-sc-st-pre",
    name: "SC/ST Pre-Matric Scholarship",
    category: "SC/ST Welfare",
    standards: ["9", "10"],
    standardText: "Classes 9 and 10",
    gender: "All",
    community: ["SC", "ST"],
    communityText: "Scheduled Castes / Scheduled Tribes",
    incomeLimit: 250000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,50,000",
    amount: 3000,
    amountText: "₹3,000 / year",
    description: "Centrally sponsored scholarship scheme for SC and ST students studying in Classes 9 and 10 to reduce drop-out rates in secondary education.",
    eligibilityDetails: [
      "Must belong to SC or ST communities.",
      "Must be studying in Class 9 or 10 in a government or government-aided school.",
      "Annual family income must not exceed ₹2.5 Lakhs."
    ],
    documentsRequired: [
      "Community Certificate (signed by competent authority)",
      "Income Certificate",
      "Aadhaar Card of student",
      "Bank account details (linked with Aadhaar)",
      "Student EMIS number"
    ],
    deadline: "October 31, 2026",
    contactDetails: "School Scholarship In-Charge / Adi Dravidar Welfare Department"
  },
  {
    id: "tn-sc-st-post",
    name: "SC/ST Post-Matric Scholarship",
    category: "SC/ST Welfare",
    standards: ["11", "12"],
    standardText: "Classes 11 and 12",
    gender: "All",
    community: ["SC", "ST"],
    communityText: "Scheduled Castes / Scheduled Tribes",
    incomeLimit: 250000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,50,000",
    amount: 8500,
    amountText: "Full fee reimbursement + ₹5,000 - ₹12,000 / year",
    description: "Post-matric scholarship scheme for SC/ST students studying in Classes 11, 12, or higher education to cover academic costs and living expenses.",
    eligibilityDetails: [
      "Must belong to SC, ST, or Adi-Dravidar community.",
      "Must be studying in Class 11 or 12.",
      "Annual family income must not exceed ₹2.5 Lakhs."
    ],
    documentsRequired: [
      "Community Certificate",
      "Income Certificate",
      "Aadhaar Card of student and parent",
      "Bank Account details",
      "Class 10 mark sheet"
    ],
    deadline: "October 31, 2026",
    contactDetails: "School Headmaster / Adi Dravidar and Tribal Welfare Officer"
  },
  {
    id: "tn-minority-pre",
    name: "Pre-Matric Scholarship for Minorities",
    category: "Minorities Welfare",
    standards: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    standardText: "Classes 1 to 10",
    gender: "All",
    community: ["Minority"],
    communityText: "Religious Minorities (Muslims, Christians, Sikhs, Buddhists, Parsis, Jains)",
    incomeLimit: 100000,
    incomeLimitText: "Parents' annual income must be ≤ ₹1,00,000",
    amount: 1500,
    amountText: "₹1,000 to ₹5,000 / year (based on standard)",
    description: "Scholarship to provide financial support to minority students studying from Class 1 to Class 10 to assist with schooling and exam fees.",
    eligibilityDetails: [
      "Must belong to a notified religious minority community (Muslim, Christian, Sikh, Buddhist, Zoroastrian/Parsi, Jain).",
      "Must be studying in Class 1 to 10 in a recognized school.",
      "Must have secured not less than 50% marks in the previous final examination (not applicable for Class 1).",
      "Annual income of parents/guardian from all sources should not exceed ₹1 Lakh."
    ],
    documentsRequired: [
      "Self-Declaration of Minority Community by parent",
      "Income Certificate / Self-Attested Income declaration",
      "Previous year's Mark Sheet (Class 2 and above)",
      "Aadhaar Card copy",
      "Bank account details (linked with Aadhaar)"
    ],
    deadline: "August 31, 2026",
    contactDetails: "School Scholarship In-Charge / Minorities Welfare Department"
  },
  {
    id: "tn-minority-post",
    name: "Post-Matric Scholarship for Minorities",
    category: "Minorities Welfare",
    standards: ["11", "12"],
    standardText: "Classes 11 and 12",
    gender: "All",
    community: ["Minority"],
    communityText: "Religious Minorities (Muslims, Christians, Sikhs, Buddhists, Parsis, Jains)",
    incomeLimit: 200000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,00,000",
    amount: 6000,
    amountText: "₹5,000 to ₹10,000 / year",
    description: "Enables minority students in Classes 11 and 12 to pursue higher secondary education by providing tuition fee waiver and maintenance allowance.",
    eligibilityDetails: [
      "Must belong to a religious minority community.",
      "Must be studying in Class 11 or 12.",
      "Must have secured not less than 50% marks in the previous final examination.",
      "Annual income of parents/guardian from all sources should not exceed ₹2 Lakhs."
    ],
    documentsRequired: [
      "Minority Community Certificate / Self-Declaration",
      "Income Certificate",
      "Previous year's Mark Sheet (Class 10 Board exam mark sheet)",
      "Aadhaar Card",
      "Bank account details"
    ],
    deadline: "August 31, 2026",
    contactDetails: "School Headmaster / District Minorities Welfare Officer"
  },
  {
    id: "tn-nmms-merit",
    name: "National Means-cum-Merit Scholarship (NMMS)",
    category: "Merit / Exam-based",
    standards: ["9", "10", "11", "12"],
    standardText: "Classes 9 to 12 (after qualifying exam in Class 8)",
    gender: "All",
    community: ["All"],
    communityText: "All Communities",
    incomeLimit: 350000,
    incomeLimitText: "Parents' annual income must be ≤ ₹3,50,000",
    amount: 12000,
    amountText: "₹12,000 / year (₹1,000 / month)",
    description: "Centrally sponsored scholarship scheme to award meritorious students of government, government-aided, and local body schools to check dropout at Class 8.",
    eligibilityDetails: [
      "Must have secured minimum 55% marks (50% for SC/ST) in Class 8 exam.",
      "Must qualify in the NMMS written examination (MAT & SAT) conducted in Class 8.",
      "Must be studying in a government or government-aided school.",
      "Annual income of parents should not be more than ₹3.5 Lakhs."
    ],
    documentsRequired: [
      "NMMS Exam Qualification Certificate",
      "Community Certificate (if applicable)",
      "Income Certificate",
      "Class 8 Mark Sheet",
      "Bank Account details (Aadhaar Seeded)"
    ],
    deadline: "August 31, 2026",
    contactDetails: "School Headmaster / Chief Educational Officer"
  },
  {
    id: "tn-trust-scholarship",
    name: "Tamil Nadu Rural Students Talent Search Scheme (TRUST) Scholarship",
    category: "Merit / Exam-based",
    standards: ["9", "10", "11", "12"],
    standardText: "Classes 9 to 12 (after qualifying exam in Class 9)",
    gender: "All",
    community: ["All"],
    communityText: "All Communities",
    incomeLimit: 100000,
    incomeLimitText: "Parents' annual income must be ≤ ₹1,00,000",
    amount: 1000,
    amountText: "₹1,000 / year",
    description: "Provides financial aid to rural students (excluding municipal and corporation areas) selected through a talent search exam in Class 9.",
    eligibilityDetails: [
      "Must be studying in a government or government-aided school located in a rural/panchayat area.",
      "Must qualify in the TRUST examination conducted in Class 9.",
      "Annual family income should not exceed ₹1 Lakh."
    ],
    documentsRequired: [
      "TRUST Exam Marksheet / Qualification proof",
      "Rural Study Certificate signed by HM",
      "Income Certificate",
      "Community Certificate",
      "Bank account details"
    ],
    deadline: "September 15, 2026",
    contactDetails: "School Headmaster"
  },
  {
    id: "tn-cm-merit",
    name: "Chief Minister's Merit Scholarship Scheme",
    category: "Merit / Exam-based",
    standards: ["11", "12"],
    standardText: "Classes 11 and 12",
    gender: "All",
    community: ["All"],
    communityText: "All Communities",
    incomeLimit: null,
    incomeLimitText: "No income limit",
    amount: 10000,
    amountText: "₹10,000 / year",
    description: "Awarded to the top 1,000 meritorious students in Tamil Nadu government schools who excel in the Class 10 Board Examinations.",
    eligibilityDetails: [
      "Must have studied Class 10 in a government school in Tamil Nadu.",
      "Must be in the top 500 boys or top 500 girls state-wide in Class 10 board results.",
      "Must be currently studying Class 11 and 12 in a government/aided school."
    ],
    documentsRequired: [
      "Class 10 Board Exam Mark Sheet",
      "Aadhaar Card copy",
      "Active Bank Account details",
      "School Identity Card"
    ],
    deadline: "Automated Roster (No direct application needed, verified via EMIS portal)",
    contactDetails: "Chief Educational Officer / School Headmaster"
  },
  {
    id: "tn-free-education-first-grad",
    name: "Free Education Scheme for BC/MBC (First Graduate Support)",
    category: "Higher Education Support",
    standards: ["12"],
    standardText: "Class 12 (transitioning to college)",
    gender: "All",
    community: ["BC", "MBC", "DNC"],
    communityText: "BC / MBC / DNC Communities",
    incomeLimit: 200000,
    incomeLimitText: "Parents' annual income must be ≤ ₹2,00,000",
    amount: 5000,
    amountText: "Full tuition fee waiver for undergraduate studies",
    description: "Reimbursement of tuition fees for undergraduate courses in government and private colleges to BC/MBC/DNC students who are the first graduates in their families.",
    eligibilityDetails: [
      "Must belong to BC, MBC, or DNC community.",
      "Must have cleared Class 12 board examination.",
      "Must be the first person in the family to graduates (no siblings or parents should have degrees).",
      "Annual family income must not exceed ₹2 Lakhs."
    ],
    documentsRequired: [
      "First Graduate Certificate (obtained from e-Sevai / Tahsildar)",
      "Joint Declaration by student and parent",
      "Class 10 and 12 Mark Sheets",
      "Community Certificate",
      "Income Certificate"
    ],
    deadline: "College Admission counselling season (June - August)",
    contactDetails: "District Backward Classes Welfare Department / e-Sevai Center"
  }
];
