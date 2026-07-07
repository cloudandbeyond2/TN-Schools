// ============================================================================
// Center topic maps — sub-topic menus for each Science Center (from the spec).
// Rendered by the generic /student/science/[center] page. Slugs match the
// registry ids in scienceCenters.ts.
// ============================================================================

export type TopicGroup = { heading: string; items: { label: string; emoji: string }[] };
export type CenterTopics = {
  slug: string;
  title: string;
  titleTa?: string;
  tagline: string;
  icon: string;     // lucide key
  grad: string;     // tailwind gradient (from-... to-...)
  groups: TopicGroup[];
};

const I = (label: string, emoji: string) => ({ label, emoji });

export const CENTER_TOPICS: Record<string, CenterTopics> = {
  "physics-lab": {
    slug: "physics-lab", title: "Physics Center", titleTa: "இயற்பியல் மையம்",
    tagline: "Mechanics to modern physics — simulate, build and measure.",
    icon: "Atom", grad: "from-sky-500 to-blue-600",
    groups: [
      { heading: "Branches", items: [I("Mechanics","⚙️"),I("Electricity","⚡"),I("Magnetism","🧲"),I("Optics","🔦"),I("Heat","🔥"),I("Sound","🔊"),I("Modern Physics","🌌")] },
      { heading: "Experiments", items: [I("Projectile Motion","🎯"),I("Simple Pendulum","🕰️"),I("Lens","🔍"),I("Mirror","🪞"),I("Prism","🌈"),I("Electric Circuits","🔌"),I("Generator","🔋"),I("Transformer","⚡"),I("Motor","🌀")] },
      { heading: "Tools", items: [I("Wave Simulator","〰️"),I("Circuit Builder","🧩"),I("Measurement Tools","📏")] },
    ],
  },
  "biology-lab": {
    slug: "biology-lab", title: "Biology Center", titleTa: "உயிரியல் மையம்",
    tagline: "Cells, tissues, microscope slides and the human body.",
    icon: "Dna", grad: "from-lime-500 to-green-600",
    groups: [
      { heading: "Cell Explorer", items: [I("Animal Cell","🔬"),I("Plant Cell","🌿"),I("DNA","🧬"),I("Chromosomes","🧵"),I("Mitosis","➗"),I("Meiosis","➕")] },
      { heading: "Processes", items: [I("Photosynthesis","☀️"),I("Respiration","🫁"),I("Plant Tissues","🌱"),I("Animal Tissues","🧫")] },
      { heading: "Human Anatomy", items: [I("Heart","🫀"),I("Brain","🧠"),I("Eye","👁️"),I("Ear","👂"),I("Lungs","🫁"),I("Digestive System","🍽️"),I("Excretory System","💧"),I("Reproductive System","🌸")] },
      { heading: "Lab", items: [I("Microscope Simulation","🔬"),I("Virtual Slides","🧫"),I("Specimens","🐸")] },
    ],
  },
  "earth": {
    slug: "earth", title: "Earth Science Center", titleTa: "புவி அறிவியல் மையம்",
    tagline: "Inside the Earth, its rocks, weather and oceans.",
    icon: "Globe", grad: "from-cyan-500 to-teal-600",
    groups: [
      { heading: "Inside Earth", items: [I("Earth Layers","🌍"),I("Volcanoes","🌋"),I("Earthquakes","📉"),I("Mountains","⛰️")] },
      { heading: "Materials", items: [I("Minerals","💎"),I("Rocks","🪨")] },
      { heading: "Climate & Water", items: [I("Weather","🌦️"),I("Climate","🌡️"),I("Water Cycle","💧"),I("Ocean","🌊")] },
      { heading: "Explore", items: [I("Interactive Globe","🌐"),I("3D Earth","🪐")] },
    ],
  },
  "space": {
    slug: "space", title: "Space Science Center", titleTa: "விண்வெளி அறிவியல் மையம்",
    tagline: "From the Solar System to galaxies and ISRO missions.",
    icon: "Rocket", grad: "from-indigo-500 to-violet-600",
    groups: [
      { heading: "Our neighbourhood", items: [I("Solar System","☀️"),I("Planets","🪐"),I("Moon","🌙")] },
      { heading: "Deep space", items: [I("Stars","⭐"),I("Galaxy","🌌"),I("Black Hole","🕳️")] },
      { heading: "Exploration", items: [I("Satellite","🛰️"),I("Rocket","🚀"),I("ISRO Missions","🇮🇳"),I("Space Missions","👨‍🚀"),I("Interactive Universe","🌠")] },
    ],
  },
  "anatomy": {
    slug: "anatomy", title: "3D Human Anatomy", titleTa: "மனித உடலமைப்பு 3D",
    tagline: "Explore the human body organ by organ.",
    icon: "HeartPulse", grad: "from-rose-500 to-pink-600",
    groups: [
      { heading: "Organs", items: [I("Heart","🫀"),I("Brain","🧠"),I("Eye","👁️"),I("Ear","👂"),I("Lungs","🫁")] },
      { heading: "Systems", items: [I("Digestive System","🍽️"),I("Excretory System","💧"),I("Reproductive System","🌸"),I("Skeleton","🦴")] },
      { heading: "Study", items: [I("Interactive Labels","🏷️")] },
    ],
  },
  "dna": {
    slug: "dna", title: "DNA & Cell Explorer", titleTa: "டி.என்.ஏ & செல் ஆய்வு",
    tagline: "Zoom into the code of life and how cells divide.",
    icon: "Dna", grad: "from-purple-500 to-fuchsia-600",
    groups: [
      { heading: "The code of life", items: [I("DNA","🧬"),I("Chromosomes","🧵"),I("Genes","🔡")] },
      { heading: "Cells", items: [I("Animal Cell","🔬"),I("Plant Cell","🌿"),I("Organelles","⚛️")] },
      { heading: "Division", items: [I("Mitosis","➗"),I("Meiosis","➕")] },
    ],
  },
  "knowledge": {
    slug: "knowledge", title: "Science Knowledge Center", titleTa: "அறிவியல் அறிவு மையம்",
    tagline: "The story of science and the people behind it.",
    icon: "Brain", grad: "from-amber-500 to-orange-500",
    groups: [
      { heading: "History", items: [I("Timeline of Science","🕰️"),I("History of Science","📜"),I("Famous Discoveries","💡"),I("Scientific Inventions","⚙️"),I("Nobel Prize","🏅")] },
      { heading: "People", items: [I("Indian Scientists","🇮🇳"),I("Tamil Scientists","🪔")] },
      { heading: "Today", items: [I("Science News","📰"),I("Daily Science Facts","✨"),I("Today's Discovery","🔭"),I("AI Science Assistant","🤖")] },
    ],
  },
  "museum": {
    slug: "museum", title: "Digital Science Museum", titleTa: "இணைய அறிவியல் அருங்காட்சியகம்",
    tagline: "Walk through halls of science, ancient to modern.",
    icon: "Landmark", grad: "from-orange-500 to-red-500",
    groups: [
      { heading: "Halls", items: [I("Museum Hall","🏛️"),I("Ancient Science","🏺"),I("Modern Science","🔬")] },
      { heading: "Galleries", items: [I("Robotics","🤖"),I("Medicine","💊"),I("Space","🚀"),I("Physics","⚛️"),I("Chemistry","⚗️"),I("Biology","🧬")] },
      { heading: "Experience", items: [I("Interactive Exhibits","🖐️"),I("Walkthrough Mode","🚶"),I("360° View","🌐")] },
    ],
  },
  "robotics": {
    slug: "robotics", title: "Robotics & AI Lab", titleTa: "ரோபோடிக்ஸ் & AI ஆய்வகம்",
    tagline: "Sensors, code and machine learning — build a robot.",
    icon: "Bot", grad: "from-cyan-500 to-sky-600",
    groups: [
      { heading: "Hardware", items: [I("Sensors","📡"),I("Arduino","🔌"),I("Raspberry Pi","🍓"),I("IoT","🌐")] },
      { heading: "Software", items: [I("Coding","💻"),I("Machine Learning","📈"),I("AI Models","🧠")] },
      { heading: "Build", items: [I("Robotics","🤖"),I("Projects","🛠️"),I("Virtual Robot Builder","🦾")] },
    ],
  },
  "environmental": {
    slug: "environmental", title: "Environmental Science", titleTa: "சுற்றுச்சூழல் அறிவியல்",
    tagline: "Ecosystems, pollution and how to protect our planet.",
    icon: "Leaf", grad: "from-green-500 to-emerald-600",
    groups: [
      { heading: "Systems", items: [I("Ecosystems","🌳"),I("Biodiversity","🦋"),I("Food Chains","🔗")] },
      { heading: "Challenges", items: [I("Pollution","🏭"),I("Climate Change","🌡️"),I("Waste Management","♻️")] },
      { heading: "Solutions", items: [I("Renewable Energy","🔆"),I("Conservation","🌱"),I("Water Harvesting","💧")] },
    ],
  },
  "agriculture": {
    slug: "agriculture", title: "Agriculture Science", titleTa: "வேளாண் அறிவியல்",
    tagline: "How we grow food — from soil to smart farming.",
    icon: "Sprout", grad: "from-lime-500 to-green-600",
    groups: [
      { heading: "Basics", items: [I("Soil","🟤"),I("Crops","🌾"),I("Irrigation","💧"),I("Fertilisers","🧪")] },
      { heading: "Care", items: [I("Pest Management","🐛"),I("Horticulture","🍎"),I("Plant Diseases","🍂")] },
      { heading: "Modern", items: [I("Smart Farming","🚜"),I("Hydroponics","🌱"),I("Drones","🛸")] },
    ],
  },
  "stem": {
    slug: "stem", title: "STEM Innovation Hub", titleTa: "STEM புத்தாக்க மையம்",
    tagline: "Design, build and invent — hands-on STEM.",
    icon: "Lightbulb", grad: "from-amber-500 to-yellow-500",
    groups: [
      { heading: "Think", items: [I("Design Thinking","🧠"),I("Problem Solving","🧩")] },
      { heading: "Make", items: [I("Prototyping","🛠️"),I("Electronics","🔌"),I("Coding","💻"),I("Maker Projects","🔧")] },
      { heading: "Compete", items: [I("Innovation Challenges","🏆")] },
    ],
  },
  "projects": {
    slug: "projects", title: "Science Project Center", titleTa: "அறிவியல் திட்டப்பணி மையம்",
    tagline: "Guided projects with steps, materials and submission.",
    icon: "FlaskConical", grad: "from-emerald-500 to-teal-600",
    groups: [
      { heading: "Browse", items: [I("By Class","🎓"),I("By Topic","📚"),I("By Difficulty","📊")] },
      { heading: "Each project", items: [I("Materials Required","🧰"),I("Steps","📝"),I("Images","🖼️"),I("Videos","🎥")] },
      { heading: "Assessment", items: [I("Teacher Rubric","📋"),I("Student Submission","📤")] },
    ],
  },
  "competitions": {
    slug: "competitions", title: "Science Competitions", titleTa: "அறிவியல் போட்டிகள்",
    tagline: "Quizzes, olympiads and science fairs.",
    icon: "Trophy", grad: "from-orange-500 to-amber-500",
    groups: [
      { heading: "Compete", items: [I("Quizzes","❓"),I("Olympiads","🥇"),I("Science Fair","🔬"),I("Model Exhibition","🏗️")] },
      { heading: "Track", items: [I("Challenges","⚡"),I("Leaderboard","📊"),I("Certificates","📜")] },
    ],
  },
  "scientist-gallery": {
    slug: "scientist-gallery", title: "Scientist Gallery", titleTa: "விஞ்ஞானிகள் கூடம்",
    tagline: "Meet the minds who shaped science.",
    icon: "Users", grad: "from-purple-500 to-indigo-600",
    groups: [
      { heading: "India", items: [I("Indian Scientists","🇮🇳"),I("Tamil Scientists","🪔"),I("ISRO Pioneers","🚀")] },
      { heading: "World", items: [I("Nobel Laureates","🏅"),I("Women in Science","👩‍🔬"),I("Modern Innovators","💡")] },
    ],
  },
  "research-centers": {
    slug: "research-centers", title: "Research Centers", titleTa: "ஆராய்ச்சி மையங்கள்",
    tagline: "India's great science institutions and what they do.",
    icon: "Microscope", grad: "from-sky-500 to-indigo-600",
    groups: [
      { heading: "Space & Defence", items: [I("ISRO","🚀"),I("DRDO","🛡️")] },
      { heading: "Research bodies", items: [I("CSIR","🔬"),I("BARC","⚛️"),I("IITs","🎓"),I("ICMR","🧪")] },
    ],
  },
  "interactive-lab": {
    slug: "interactive-lab", title: "Interactive Laboratory", titleTa: "ஊடாடும் ஆய்வகம்",
    tagline: "The virtual lab bench — shelves, tools and specimens.",
    icon: "FlaskConical", grad: "from-emerald-500 to-teal-600",
    groups: [
      { heading: "Shelves", items: [I("Equipment Shelf","🧰"),I("Chemical Shelf","⚗️"),I("Physics Instruments","📐")] },
      { heading: "Stations", items: [I("Microscope","🔬"),I("Dissection Table","🔪"),I("Biology Specimens","🐸")] },
    ],
  },
  "videos": {
    slug: "videos", title: "Experiment Videos", titleTa: "பரிசோதனை காணொளிகள்",
    tagline: "Watch experiments and concepts come alive.",
    icon: "Video", grad: "from-rose-500 to-pink-600",
    groups: [
      { heading: "By subject", items: [I("Physics","⚛️"),I("Chemistry","⚗️"),I("Biology","🧬"),I("Earth & Space","🌍")] },
      { heading: "By class", items: [I("Class 6-8","🎒"),I("Class 9-10","📘"),I("Class 11-12","🎓")] },
    ],
  },
  "question-bank": {
    slug: "question-bank", title: "Question Bank", titleTa: "வினா வங்கி",
    tagline: "Practice MCQs, PYQs and diagrams.",
    icon: "ListChecks", grad: "from-purple-500 to-fuchsia-600",
    groups: [
      { heading: "Types", items: [I("MCQ","☑️"),I("Previous Year Questions","📅"),I("Diagram Practice","✏️"),I("Short/Long Answers","📝")] },
      { heading: "Browse", items: [I("By Class","🎓"),I("By Subject","📚"),I("By Chapter","🔖")] },
    ],
  },
};

export function getCenterTopics(slug: string): CenterTopics | undefined {
  return CENTER_TOPICS[slug];
}
