// ============================================================================
// Science Labs & Centers — Digital Science Campus registry.
// Dedicated centers link to their own route; all other centers use the
// generic dynamic page /student/science/<id> (data from centerTopics.ts).
//
// Every center is tagged with the higher-secondary streams it belongs to.
// The Science Campus page + the sidebar use this to change the menu when a
// student is in the Commerce or Computer Science group.
// ============================================================================

export type CenterStatus = "live" | "soon";

// Higher-secondary group / stream.
export type Stream = "Science" | "Commerce" | "ComputerScience";

export type ScienceCenter = {
  id: string;
  name: string;
  nameTa?: string;
  desc: string;
  icon: string;      // lucide icon key resolved in the page
  route: string;
  status: CenterStatus;
  accent: "emerald" | "sky" | "purple" | "amber" | "rose" | "indigo" | "cyan" | "orange" | "lime";
  group: "Labs" | "Centers" | "Commerce" | "Computer Science" | "Library & Media" | "Innovation" | "For Teachers";
  streams: Stream[];   // which higher-secondary groups see this center
};

const dyn = (id: string) => `/student/science/${id}`;

// Centers that are useful to every stream (books, careers, museum, etc.)
const ALL_STREAMS: Stream[] = ["Science", "Commerce", "ComputerScience"];

export const SCIENCE_CENTERS: ScienceCenter[] = [
  // --- Labs (Science stream) ---
  { id: "virtual-lab", name: "Virtual Science Lab", desc: "3D experiments — rotate, mix, measure and observe.", icon: "FlaskConical", route: "/student/labs", status: "live", accent: "emerald", group: "Labs", streams: ["Science"] },
  { id: "interactive-lab", name: "Interactive Laboratory", desc: "The virtual lab bench — shelves, tools and specimens.", icon: "FlaskConical", route: dyn("interactive-lab"), status: "live", accent: "emerald", group: "Labs", streams: ["Science"] },
  { id: "chemistry-lab", name: "Chemistry Center", nameTa: "வேதியியல் மையம்", desc: "Reactions, periodic table, molecule & atom viewers.", icon: "FlaskConical", route: "/student/chemistry-lab", status: "live", accent: "orange", group: "Labs", streams: ["Science"] },
  { id: "physics-lab", name: "Physics Center", desc: "Mechanics, optics, electricity & circuit builder.", icon: "Atom", route: dyn("physics-lab"), status: "live", accent: "sky", group: "Labs", streams: ["Science"] },
  { id: "biology-lab", name: "Biology Center", desc: "Cell explorer, microscope slides & human anatomy.", icon: "Dna", route: dyn("biology-lab"), status: "live", accent: "lime", group: "Labs", streams: ["Science"] },
  { id: "lab-support", name: "Science Lab Support", desc: "Equipment, safety gear and lab readiness.", icon: "Wrench", route: "/student/science-lab-support", status: "live", accent: "amber", group: "Labs", streams: ["Science"] },

  // --- Centers (Science stream) ---
  { id: "zoology", name: "Zoology Center", nameTa: "விலங்கியல் மையம்", desc: "Animal kingdom, organs, evolution — syllabus-mapped.", icon: "Bug", route: "/student/zoology-centre", status: "live", accent: "emerald", group: "Centers", streams: ["Science"] },
  { id: "botany", name: "Botany Center", nameTa: "தாவரவியல் மையம்", desc: "Plant kingdom, photosynthesis, medicinal plants.", icon: "Leaf", route: "/student/botany-centre", status: "live", accent: "lime", group: "Centers", streams: ["Science"] },
  { id: "earth", name: "Earth Science Center", desc: "Earth layers, volcanoes, rocks, weather & the globe.", icon: "Globe", route: dyn("earth"), status: "live", accent: "cyan", group: "Centers", streams: ["Science"] },
  { id: "space", name: "Space Science Center", desc: "Solar system, galaxies, ISRO missions & the universe.", icon: "Rocket", route: dyn("space"), status: "live", accent: "indigo", group: "Centers", streams: ["Science"] },
  { id: "anatomy", name: "3D Human Anatomy", desc: "Heart, brain, eye, lungs — interactive 3D labels.", icon: "HeartPulse", route: dyn("anatomy"), status: "live", accent: "rose", group: "Centers", streams: ["Science"] },
  { id: "dna", name: "DNA & Cell Explorer", desc: "Chromosomes, mitosis, meiosis and cell structure.", icon: "Dna", route: dyn("dna"), status: "live", accent: "purple", group: "Centers", streams: ["Science"] },
  { id: "environmental", name: "Environmental Science", desc: "Ecosystems, pollution, climate & conservation.", icon: "Leaf", route: dyn("environmental"), status: "live", accent: "emerald", group: "Centers", streams: ["Science"] },
  { id: "agriculture", name: "Agriculture Science", desc: "Soil, crops, irrigation and smart farming.", icon: "Sprout", route: dyn("agriculture"), status: "live", accent: "lime", group: "Centers", streams: ["Science"] },
  { id: "knowledge", name: "Science Knowledge Center", desc: "History of science, Tamil & Indian scientists, news.", icon: "Brain", route: dyn("knowledge"), status: "live", accent: "amber", group: "Centers", streams: ALL_STREAMS },
  { id: "museum", name: "Digital Science Museum", desc: "360° halls: ancient to modern science exhibits.", icon: "Landmark", route: dyn("museum"), status: "live", accent: "orange", group: "Centers", streams: ALL_STREAMS },
  { id: "research-centers", name: "Research Centers", desc: "ISRO, DRDO, CSIR, IITs — India's science institutions.", icon: "Microscope", route: dyn("research-centers"), status: "live", accent: "sky", group: "Centers", streams: ALL_STREAMS },
  { id: "scientist-gallery", name: "Scientist Gallery", desc: "Indian, Tamil and world scientists who shaped science.", icon: "Users", route: dyn("scientist-gallery"), status: "live", accent: "purple", group: "Centers", streams: ALL_STREAMS },

  // --- Commerce group ---
  { id: "commerce-lab", name: "Commerce & Business Lab", nameTa: "வணிகவியல் ஆய்வகம்", desc: "Trade, banking, GST, entrepreneurship simulations.", icon: "Briefcase", route: dyn("commerce-lab"), status: "live", accent: "amber", group: "Commerce", streams: ["Commerce"] },
  { id: "accountancy", name: "Accountancy Practice Lab", desc: "Journals, ledgers, trial balance & final accounts.", icon: "Calculator", route: dyn("accountancy"), status: "live", accent: "emerald", group: "Commerce", streams: ["Commerce"] },
  { id: "economics", name: "Economics Data Center", desc: "Demand, supply, national income & live indicators.", icon: "TrendingUp", route: dyn("economics"), status: "live", accent: "sky", group: "Commerce", streams: ["Commerce"] },
  { id: "business-stats", name: "Business Statistics Lab", desc: "Charts, averages, index numbers & interpretation.", icon: "BarChart3", route: dyn("business-stats"), status: "live", accent: "indigo", group: "Commerce", streams: ["Commerce", "ComputerScience"] },

  // --- Computer Science group ---
  { id: "programming-lab", name: "Programming Lab", nameTa: "நிரலாக்க ஆய்வகம்", desc: "C++, Python & Java — run code in the browser.", icon: "Code", route: dyn("programming-lab"), status: "live", accent: "cyan", group: "Computer Science", streams: ["ComputerScience"] },
  { id: "cs-lab", name: "Computer Science Lab", desc: "Data structures, OS, boolean logic & number systems.", icon: "Cpu", route: dyn("cs-lab"), status: "live", accent: "sky", group: "Computer Science", streams: ["ComputerScience"] },
  { id: "web-tech", name: "Web Technology Lab", desc: "HTML, CSS, JavaScript & build a live web page.", icon: "Globe", route: dyn("web-tech"), status: "live", accent: "orange", group: "Computer Science", streams: ["ComputerScience"] },
  { id: "database-lab", name: "Database & SQL Lab", desc: "Tables, queries, joins — practice SQL live.", icon: "Database", route: dyn("database-lab"), status: "live", accent: "purple", group: "Computer Science", streams: ["ComputerScience"] },
  { id: "ai-ml", name: "AI & Machine Learning Lab", desc: "Datasets, models & no-code ML experiments.", icon: "Bot", route: dyn("ai-ml"), status: "live", accent: "emerald", group: "Computer Science", streams: ["ComputerScience"] },

  // --- Library & Media (all streams) ---
  { id: "library", name: "Science Book Library", nameTa: "அறிவியல் நூலகம்", desc: "All TN Govt books (PDF) — Class 6-12, TA & EN.", icon: "BookOpen", route: "/student/science-library", status: "live", accent: "sky", group: "Library & Media", streams: ALL_STREAMS },
  { id: "videos", name: "Experiment Videos", desc: "Curated lab & concept videos by subject and class.", icon: "Video", route: dyn("videos"), status: "live", accent: "rose", group: "Library & Media", streams: ALL_STREAMS },
  { id: "question-bank", name: "Question Bank", desc: "MCQs, previous-year questions and diagram practice.", icon: "ListChecks", route: dyn("question-bank"), status: "live", accent: "purple", group: "Library & Media", streams: ALL_STREAMS },

  // --- Innovation (all streams) ---
  { id: "robotics", name: "Robotics & AI Lab", desc: "Sensors, Arduino, coding, ML & virtual robot builder.", icon: "Bot", route: dyn("robotics"), status: "live", accent: "cyan", group: "Innovation", streams: ["Science", "ComputerScience"] },
  { id: "stem", name: "STEM Innovation Hub", desc: "Design thinking, prototyping, electronics & maker projects.", icon: "Lightbulb", route: dyn("stem"), status: "live", accent: "amber", group: "Innovation", streams: ALL_STREAMS },
  { id: "projects", name: "Science Projects", desc: "By class & topic — steps, materials, submission.", icon: "FlaskConical", route: dyn("projects"), status: "live", accent: "emerald", group: "Innovation", streams: ALL_STREAMS },
  { id: "competitions", name: "Science Competitions", desc: "Challenges, quizzes and leaderboards.", icon: "Trophy", route: dyn("competitions"), status: "live", accent: "orange", group: "Innovation", streams: ALL_STREAMS },
  { id: "career", name: "Science Career Guidance", desc: "Pathways from school science to careers.", icon: "Compass", route: "/student/career", status: "live", accent: "indigo", group: "Innovation", streams: ALL_STREAMS },

  // --- For Teachers ---
  { id: "teacher-resource", name: "Teacher Resource Center", desc: "Studio, lesson plans, worksheet & quiz generators.", icon: "GraduationCap", route: "/teacher/zoology-centre", status: "live", accent: "purple", group: "For Teachers", streams: ALL_STREAMS },
];

export const CENTER_GROUPS: ScienceCenter["group"][] = [
  "Labs", "Centers", "Commerce", "Computer Science", "Library & Media", "Innovation", "For Teachers",
];

// Streams offered on the Science Campus stream switcher.
export const STREAMS: { id: Stream; label: string; labelTa: string; emoji: string }[] = [
  { id: "Science", label: "Science", labelTa: "அறிவியல்", emoji: "🔬" },
  { id: "Commerce", label: "Commerce", labelTa: "வணிகவியல்", emoji: "📊" },
  { id: "ComputerScience", label: "Computer Science", labelTa: "கணினி அறிவியல்", emoji: "💻" },
];

export function centersForStream(stream: Stream): ScienceCenter[] {
  return SCIENCE_CENTERS.filter((c) => c.streams.includes(stream));
}
