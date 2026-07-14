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

  // ── Commerce group ──────────────────────────────────────────
  "commerce-lab": {
    slug: "commerce-lab", title: "Commerce & Business Lab", titleTa: "வணிகவியல் ஆய்வகம்",
    tagline: "Trade, banking, GST and entrepreneurship — simulated.",
    icon: "Briefcase", grad: "from-amber-500 to-orange-500",
    groups: [
      { heading: "Business", items: [I("Types of Business","🏢"),I("Sole Trader","🧑‍💼"),I("Partnership","🤝"),I("Company","🏛️"),I("Entrepreneurship","🚀")] },
      { heading: "Trade & Money", items: [I("Banking","🏦"),I("GST & Tax","🧾"),I("Stock Market","📈"),I("Import/Export","🚢"),I("E-Commerce","🛒")] },
      { heading: "Practice", items: [I("Business Plan Builder","📋"),I("Invoice Simulator","🧮"),I("Case Studies","📂")] },
    ],
  },
  "accountancy": {
    slug: "accountancy", title: "Accountancy Practice Lab", titleTa: "கணக்கியல் ஆய்வகம்",
    tagline: "From journal entries to final accounts — step by step.",
    icon: "Calculator", grad: "from-emerald-500 to-teal-600",
    groups: [
      { heading: "Books of Accounts", items: [I("Journal","📓"),I("Ledger","📗"),I("Cash Book","💵"),I("Trial Balance","⚖️")] },
      { heading: "Final Accounts", items: [I("Trading Account","📊"),I("Profit & Loss","💹"),I("Balance Sheet","🧾"),I("Depreciation","📉")] },
      { heading: "Practice", items: [I("Ledger Simulator","🖥️"),I("Worked Examples","✏️"),I("Self-Test","☑️")] },
    ],
  },
  "economics": {
    slug: "economics", title: "Economics Data Center", titleTa: "பொருளியல் மையம்",
    tagline: "Micro to macro — demand, supply and national income.",
    icon: "TrendingUp", grad: "from-sky-500 to-blue-600",
    groups: [
      { heading: "Micro", items: [I("Demand & Supply","⚖️"),I("Elasticity","📐"),I("Market Types","🏪"),I("Cost & Revenue","💰")] },
      { heading: "Macro", items: [I("National Income","🇮🇳"),I("Money & Banking","🏦"),I("Inflation","🎈"),I("Budget","📑")] },
      { heading: "India Data", items: [I("GDP Trends","📈"),I("Population","👥"),I("Live Indicators","🛰️")] },
    ],
  },
  "business-stats": {
    slug: "business-stats", title: "Business Statistics Lab", titleTa: "வணிகப் புள்ளியியல்",
    tagline: "Turn numbers into charts, averages and insight.",
    icon: "BarChart3", grad: "from-indigo-500 to-violet-600",
    groups: [
      { heading: "Measures", items: [I("Mean","➗"),I("Median","🔢"),I("Mode","📊"),I("Standard Deviation","📐")] },
      { heading: "Tools", items: [I("Bar & Pie Charts","📊"),I("Index Numbers","🔖"),I("Correlation","🔗"),I("Time Series","🕰️")] },
      { heading: "Practice", items: [I("Data Interpreter","🖥️"),I("Chart Builder","🎨")] },
    ],
  },

  // ── Computer Science group ──────────────────────────────────
  "programming-lab": {
    slug: "programming-lab", title: "Programming Lab", titleTa: "நிரலாக்க ஆய்வகம்",
    tagline: "Write and run C++, Python and Java in the browser.",
    icon: "Code", grad: "from-cyan-500 to-sky-600",
    groups: [
      { heading: "Languages", items: [I("C++","➕"),I("Python","🐍"),I("Java","☕"),I("C","🔤")] },
      { heading: "Concepts", items: [I("Variables","📦"),I("Loops","🔁"),I("Functions","🧩"),I("Arrays","🗂️"),I("OOP","🏗️")] },
      { heading: "Practice", items: [I("Code Editor","⌨️"),I("Debug Challenge","🐞"),I("Mini Projects","🚀")] },
    ],
  },
  "cs-lab": {
    slug: "cs-lab", title: "Computer Science Lab", titleTa: "கணினி அறிவியல் ஆய்வகம்",
    tagline: "Data structures, operating systems and digital logic.",
    icon: "Cpu", grad: "from-sky-500 to-blue-600",
    groups: [
      { heading: "Fundamentals", items: [I("Number Systems","🔢"),I("Boolean Logic","⚙️"),I("Logic Gates","🚪"),I("Computer Architecture","🖥️")] },
      { heading: "Data Structures", items: [I("Stack","📚"),I("Queue","🚶"),I("Linked List","🔗"),I("Trees","🌳"),I("Sorting","🔀")] },
      { heading: "Systems", items: [I("Operating System","🖲️"),I("Networking","🌐"),I("Cyber Safety","🛡️")] },
    ],
  },
  "web-tech": {
    slug: "web-tech", title: "Web Technology Lab", titleTa: "வலைத் தொழில்நுட்பம்",
    tagline: "Build a live web page with HTML, CSS and JavaScript.",
    icon: "Globe", grad: "from-orange-500 to-red-500",
    groups: [
      { heading: "HTML", items: [I("Tags & Structure","🏷️"),I("Forms","📝"),I("Tables","🔲"),I("Media","🖼️")] },
      { heading: "CSS", items: [I("Selectors","🎯"),I("Layout","📐"),I("Flexbox","🧱"),I("Responsive","📱")] },
      { heading: "JavaScript", items: [I("Variables","📦"),I("Events","⚡"),I("DOM","🌲"),I("Live Preview","👀")] },
    ],
  },
  "database-lab": {
    slug: "database-lab", title: "Database & SQL Lab", titleTa: "தரவுத்தள ஆய்வகம்",
    tagline: "Design tables and run real SQL queries.",
    icon: "Database", grad: "from-purple-500 to-fuchsia-600",
    groups: [
      { heading: "Concepts", items: [I("Tables","🔲"),I("Keys","🔑"),I("Relationships","🔗"),I("Normalization","🧹")] },
      { heading: "SQL", items: [I("SELECT","🔍"),I("INSERT","➕"),I("JOIN","🔗"),I("GROUP BY","📊"),I("Query Runner","⌨️")] },
      { heading: "Practice", items: [I("Sample Database","🗄️"),I("Challenges","🏆")] },
    ],
  },
  "ai-ml": {
    slug: "ai-ml", title: "AI & Machine Learning Lab", titleTa: "செயற்கை நுண்ணறிவு ஆய்வகம்",
    tagline: "Explore datasets and train no-code models.",
    icon: "Bot", grad: "from-emerald-500 to-teal-600",
    groups: [
      { heading: "Foundations", items: [I("What is AI?","🤖"),I("Datasets","🗂️"),I("Features","🔧"),I("Ethics","⚖️")] },
      { heading: "Learn", items: [I("Classification","🏷️"),I("Regression","📈"),I("Clustering","🫧"),I("Neural Nets","🧠")] },
      { heading: "Build", items: [I("Image Classifier","🖼️"),I("Chatbot Demo","💬"),I("Model Playground","🎛️")] },
    ],
  },
  "geography-lab": {
    slug: "geography-lab", title: "Geography & Mapping Lab", titleTa: "புவியியல் ஆய்வகம்",
    tagline: "Interactive mapping, GIS systems, and weather patterns.",
    icon: "Globe", grad: "from-sky-500 to-indigo-600",
    groups: [
      { heading: "Mapping", items: [I("Latitude & Longitude","🌐"),I("Topography","⛰️"),I("GIS & Remote Sensing","📡")] },
      { heading: "Earth Systems", items: [I("Atmosphere","🌤️"),I("Ocean Currents","🌊"),I("Monsoon Dynamics","🌧️")] },
      { heading: "Practice", items: [I("Map Projection Builder","🗺️"),I("Weather Station Simulator","🌡️")] },
    ],
  },
  "history-hub": {
    slug: "history-hub", title: "History & Heritage Hub", titleTa: "வரலாறு & பாரம்பரிய மையம்",
    tagline: "Virtual archaeological digs, historical timelines & artifacts.",
    icon: "Landmark", grad: "from-amber-500 to-orange-600",
    groups: [
      { heading: "Civilizations", items: [I("Indus Valley Civilization","🏺"),I("Ancient Tamil Kingdoms (Chola/Chera/Pandya)","🛡️"),I("Megastructures","🏛️")] },
      { heading: "Timelines", items: [I("Indian Independence Movement","🇮🇳"),I("World Wars","🌍")] },
      { heading: "Archaeology", items: [I("Excavation Simulation","⛏️"),I("Deciphering Inscriptions","📜")] },
    ],
  },
  "civics-hub": {
    slug: "civics-hub", title: "Civics & Politics Lab", titleTa: "குடிமையியல் ஆய்வகம்",
    tagline: "Mock parliaments, constitution structure, election simulators.",
    icon: "Scale", grad: "from-purple-500 to-fuchsia-600",
    groups: [
      { heading: "Governance", items: [I("Indian Constitution","📕"),I("Preamble & Rights","⚖️"),I("Three Branches of Government","🏛️")] },
      { heading: "Electoral Systems", items: [I("How Elections Work","🗳️"),I("Voter Literacy Campaign","👥")] },
      { heading: "Simulations", items: [I("Mock Parliament Debate","🗣️"),I("Bill Drafting Simulator","📝")] },
    ],
  },
  "vocational-campus": {
    slug: "vocational-campus", title: "Trades & Tech Hub", titleTa: "கைவினைத் தொழில்நுட்ப மையம்",
    tagline: "Carpentry, metalworking, plumbing and technical skills.",
    icon: "Wrench", grad: "from-orange-500 to-red-600",
    groups: [
      { heading: "Materials", items: [I("Woodworking Basics","🪵"),I("Metal Fabrication","🔩"),I("Plumbing Systems","🚰")] },
      { heading: "Safety & Tools", items: [I("Hand Tools Guide","🪚"),I("Safety Wear Guidelines","🥽"),I("Workshop First Aid","🩹")] },
      { heading: "Practice", items: [I("Joint Assembly Builder","🪵"),I("Pipe Fitting Simulator","🔧")] },
    ],
  },
  "electrical-lab": {
    slug: "electrical-lab", title: "Basic Electrical Lab", titleTa: "மின்சார ஆய்வகம்",
    tagline: "Circuit wiring, safety protocols, solar panels, and electronics.",
    icon: "Zap", grad: "from-sky-500 to-blue-600",
    groups: [
      { heading: "Wiring", items: [I("House Wiring Basics","🏠"),I("Series & Parallel Circuits","🔌"),I("Safety Fuses & MCBs","⚡")] },
      { heading: "Green Energy", items: [I("Solar Power Principles","☀️"),I("Inverters & Batteries","🔋")] },
      { heading: "Practice", items: [I("Wiring Sandbox","🔌"),I("Multimeter Measurement","📟")] },
    ],
  },
  "agriculture-lab": {
    slug: "agriculture-lab", title: "Agriculture Lab", titleTa: "விவசாய ஆய்வகம்",
    tagline: "Smart organic farming, crop rotation, soil health.",
    icon: "Sprout", grad: "from-emerald-500 to-green-600",
    groups: [
      { heading: "Soil & Water", items: [I("Soil Types & Testing","🟤"),I("Drip & Sprinkler Irrigation","💧")] },
      { heading: "Crop Science", items: [I("Crop Rotation Planner","🌾"),I("Organic Fertilizers","🍂"),I("Pest Management","🐛")] },
      { heading: "Modern Tech", items: [I("Hydroponics Setup","🌱"),I("Greenhouse Control","🌡️")] },
    ],
  },
  "office-mgmt": {
    slug: "office-mgmt", title: "Office & Web Design Lab", titleTa: "அலுவலக வடிவமைப்பு",
    tagline: "Office suites, document workflows, and basic web creation.",
    icon: "Award", grad: "from-purple-500 to-indigo-600",
    groups: [
      { heading: "Workflows", items: [I("Spreadsheet Data Formulas","📊"),I("Document Processing","📄")] },
      { heading: "Web Design", items: [I("Basic HTML/CSS Pages","💻"),I("User Interface Design","🎨")] },
      { heading: "Practice", items: [I("Office Suite Challenge","⌨️"),I("Portfolio Web Builder","🌐")] },
    ],
  },
};

export function getCenterTopics(slug: string): CenterTopics | undefined {
  return CENTER_TOPICS[slug];
}
