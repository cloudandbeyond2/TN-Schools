// ============================================================================
// Rich content for each Science Center topic.
// Keyed as "slug:TopicLabel" (matching the key used in handleSelectItem).
// Rendered by the generic /student/science/[center] page.
// ============================================================================

export type TopicContent = {
  title: string;
  emoji: string;
  summary: string;           // 2-3 sentence overview
  keyPoints: string[];       // 4-6 bullet facts
  formula?: string;          // optional formula string
  funFact: string;
  image?: string;            // optional path to image
  quiz: {
    question: string;
    options: string[];
    answer: string;
  };
  links?: { label: string; href: string }[];
};

export const CENTER_CONTENT: Record<string, TopicContent> = {

  // ── BIOLOGY LAB ─────────────────────────────────────────────────────────────
  "Cell Explorer:Animal Cell": {
    title: "Animal Cell", emoji: "🔬",
    summary: "Animal cells are the basic structural and functional units of animal life. They lack a cell wall and a large central vacuole, which gives them more flexible shapes.",
    keyPoints: ["Has a nucleus containing DNA", "No cell wall — only a thin cell membrane", "Mitochondria provide energy (ATP)", "Centrioles help in cell division", "Lysosomes digest waste material"],
    funFact: "A human body contains about 37 trillion cells!",
    quiz: { question: "Which organelle is the 'powerhouse' of the animal cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"], answer: "Mitochondria" },
    links: [{ label: "AI Tutor", href: "/student/ai-tutor" }],
  },
  "Cell Explorer:Plant Cell": {
    title: "Plant Cell", emoji: "🌿",
    summary: "Plant cells have unique features including a rigid cell wall made of cellulose, chloroplasts for photosynthesis, and a large central vacuole for storage.",
    keyPoints: ["Cell wall made of cellulose gives rigidity", "Chloroplasts contain chlorophyll for photosynthesis", "Large central vacuole for storing water and nutrients", "Plastids store food and pigments", "No centrioles in plant cells"],
    funFact: "The cell wall of a plant cell can be up to 0.1 micrometers thick yet strong enough to support a massive tree!",
    quiz: { question: "Which organelle is responsible for photosynthesis in plant cells?", options: ["Mitochondria", "Chloroplast", "Vacuole", "Nucleus"], answer: "Chloroplast" },
  },
  "Cell Explorer:DNA": {
    title: "DNA", emoji: "🧬",
    summary: "DNA (Deoxyribonucleic Acid) is the hereditary material found in the nucleus of cells. It carries the genetic instructions for development, functioning, growth and reproduction.",
    keyPoints: ["Double helix structure discovered by Watson & Crick (1953)", "Made of nucleotides: adenine (A), thymine (T), guanine (G), cytosine (C)", "A always pairs with T; G always pairs with C", "Located in the nucleus (nuclear DNA) and mitochondria", "Human DNA has about 3 billion base pairs"],
    formula: "A-T, G-C (Chargaff's Rule)",
    funFact: "If stretched out, the DNA from all the cells in your body would reach the sun and back about 300 times!",
    quiz: { question: "Which base pairs with Adenine (A) in DNA?", options: ["Guanine", "Cytosine", "Thymine", "Uracil"], answer: "Thymine" },
  },
  "Cell Explorer:Chromosomes": {
    title: "Chromosomes", emoji: "🧵",
    summary: "Chromosomes are thread-like structures made of DNA and proteins found in the nucleus. They carry genes that determine inherited traits.",
    keyPoints: ["Humans have 46 chromosomes (23 pairs)", "Sex chromosomes: XX = female, XY = male", "Chromosomes become visible during cell division", "Autosomes = non-sex chromosomes (22 pairs in humans)", "Chromatids are two identical copies joined at the centromere"],
    funFact: "The potato has 48 chromosomes — two more than a human!",
    quiz: { question: "How many chromosomes does a normal human body cell contain?", options: ["23", "46", "48", "44"], answer: "46" },
  },
  "Cell Explorer:Mitosis": {
    title: "Mitosis", emoji: "➗",
    summary: "Mitosis is the process of cell division that produces two genetically identical daughter cells. It is used for growth and repair of body tissues.",
    keyPoints: ["4 phases: Prophase → Metaphase → Anaphase → Telophase", "Produces 2 daughter cells, each with same chromosomes as parent", "Used for growth, repair and asexual reproduction", "Preceded by interphase (DNA replication)", "Net result: 2n → 2n (diploid to diploid)"],
    funFact: "Some cancer cells divide uncontrollably through rapid mitosis — understanding it helps doctors fight cancer!",
    quiz: { question: "How many daughter cells are produced in mitosis?", options: ["1", "2", "4", "8"], answer: "2" },
  },
  "Cell Explorer:Meiosis": {
    title: "Meiosis", emoji: "➕",
    summary: "Meiosis is a special type of cell division that produces four genetically unique gametes (sperm/egg cells) with half the chromosome number.",
    keyPoints: ["Produces 4 haploid cells from 1 diploid cell", "Consists of Meiosis I and Meiosis II", "Crossing over during prophase I creates genetic variation", "Results in cells with half the chromosome number (n)", "Occurs only in reproductive organs (testes/ovaries)"],
    funFact: "Due to meiosis and crossing over, the chance of two siblings being genetically identical is 1 in 70 trillion!",
    quiz: { question: "Meiosis produces how many daughter cells?", options: ["2", "4", "8", "1"], answer: "4" },
  },
  "Processes:Photosynthesis": {
    title: "Photosynthesis", emoji: "☀️",
    summary: "Photosynthesis is the process by which green plants and algae convert light energy into chemical energy stored as glucose, releasing oxygen as a byproduct.",
    keyPoints: ["Occurs in chloroplasts, specifically in the thylakoids and stroma", "Light reactions produce ATP and NADPH", "Dark reactions (Calvin cycle) fix CO₂ into glucose", "Requires sunlight, water and CO₂", "Produces glucose (C₆H₁₂O₆) and oxygen"],
    formula: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
    funFact: "Photosynthesis produces about 150 billion tonnes of organic matter every year on Earth!",
    quiz: { question: "Which gas is released during photosynthesis?", options: ["CO₂", "Nitrogen", "Oxygen", "Hydrogen"], answer: "Oxygen" },
  },
  "Processes:Respiration": {
    title: "Cellular Respiration", emoji: "🫁",
    summary: "Cellular respiration is the process cells use to break down glucose to release energy (ATP). It requires oxygen (aerobic) or can occur without oxygen (anaerobic).",
    keyPoints: ["Aerobic respiration: glucose + O₂ → CO₂ + H₂O + 38 ATP", "Anaerobic respiration produces lactic acid (animals) or ethanol (yeast)", "Occurs in the mitochondria (aerobic) and cytoplasm (anaerobic)", "Three stages: glycolysis, Krebs cycle, electron transport chain", "Opposite of photosynthesis in terms of reactants/products"],
    formula: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP",
    funFact: "Your body produces its own weight in ATP every single day through cellular respiration!",
    quiz: { question: "Where does aerobic respiration mainly take place?", options: ["Nucleus", "Mitochondria", "Chloroplast", "Vacuole"], answer: "Mitochondria" },
  },
  "Human Anatomy:Heart": {
    title: "Human Heart", emoji: "🫀",
    summary: "The heart is a muscular organ that pumps blood throughout the body. It has 4 chambers: left and right atria (upper) and left and right ventricles (lower).",
    keyPoints: ["4 chambers: 2 atria (upper) + 2 ventricles (lower)", "Pumps about 5 litres of blood per minute at rest", "Right side pumps deoxygenated blood to lungs (pulmonary circuit)", "Left side pumps oxygenated blood to body (systemic circuit)", "SA node (pacemaker) controls heart rhythm"],
    funFact: "Your heart beats about 100,000 times a day — over 2.5 billion times in an average lifetime!",
    quiz: { question: "Which chamber pumps oxygenated blood to the entire body?", options: ["Right Atrium", "Left Atrium", "Right Ventricle", "Left Ventricle"], answer: "Left Ventricle" },
  },
  "Human Anatomy:Brain": {
    title: "Human Brain", emoji: "🧠",
    summary: "The human brain is the control centre of the nervous system, responsible for thought, memory, emotion, motor control, and sensory processing.",
    keyPoints: ["Consists of cerebrum, cerebellum, and brainstem", "Cerebrum: thinking, memory, speech, movement", "Cerebellum: balance and coordination", "Brainstem: controls breathing, heart rate and sleep", "Contains about 86 billion neurons"],
    funFact: "The brain generates about 23 watts of power — enough to run a small LED light bulb!",
    quiz: { question: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Brainstem", "Hypothalamus"], answer: "Cerebellum" },
  },
  "Human Anatomy:Eye": {
    title: "Human Eye", emoji: "👁️",
    summary: "The eye is the sensory organ that detects light and converts it into neural signals for vision. Light passes through the cornea, lens and focuses on the retina.",
    keyPoints: ["Cornea: transparent front layer that refracts light", "Iris controls the size of the pupil", "Lens focuses light onto the retina", "Retina contains rods (dim light) and cones (colour)", "Optic nerve carries signals to the brain"],
    funFact: "The human eye can detect about 10 million different colours!",
    quiz: { question: "Which cells in the retina detect colour?", options: ["Rods", "Cones", "Ganglion cells", "Bipolar cells"], answer: "Cones" },
  },

  // ── EARTH SCIENCE ───────────────────────────────────────────────────────────
  "Inside Earth:Earth Layers": {
    title: "Earth's Layers", emoji: "🌍",
    summary: "Earth is structured in distinct layers: the thin crust, the thick mantle, the liquid outer core, and the solid inner core.",
    keyPoints: ["Crust: thin outermost layer (5-70 km thick)", "Mantle: thickest layer (~2900 km), made of silicate rocks", "Outer core: liquid iron and nickel (~2200 km thick)", "Inner core: solid iron-nickel ball, radius ~1220 km", "Temperature at the core reaches ~5700°C"],
    funFact: "The solid inner core of Earth is as hot as the surface of the Sun!",
    quiz: { question: "Which layer of the Earth is liquid?", options: ["Inner Core", "Outer Core", "Mantle", "Crust"], answer: "Outer Core" },
  },
  "Inside Earth:Volcanoes": {
    title: "Volcanoes", emoji: "🌋",
    summary: "Volcanoes are openings in the Earth's crust through which molten rock (magma), ash and gases escape. When magma reaches the surface it is called lava.",
    keyPoints: ["Form at tectonic plate boundaries or hotspots", "Shield volcanoes: broad, gentle slopes (e.g. Hawaii)", "Stratovolcanoes: steep, explosive (e.g. Mt. Vesuvius)", "Magma = molten rock underground; Lava = at the surface", "The Ring of Fire has 75% of world's active volcanoes"],
    funFact: "The largest volcano in the solar system is Olympus Mons on Mars — nearly 3 times taller than Mount Everest!",
    quiz: { question: "What is molten rock called when it reaches the Earth's surface?", options: ["Magma", "Lava", "Pumice", "Ash"], answer: "Lava" },
  },
  "Inside Earth:Earthquakes": {
    title: "Earthquakes", emoji: "📉",
    summary: "Earthquakes are caused by the sudden release of energy in the Earth's crust due to movement along fault lines, creating seismic waves.",
    keyPoints: ["Focus (hypocenter): point within Earth where quake originates", "Epicenter: point on the surface directly above the focus", "P-waves (primary): fastest, travel through all materials", "S-waves (secondary): slower, don't travel through liquids", "Measured on the Richter scale or Moment Magnitude scale"],
    funFact: "About 500,000 earthquakes occur every year, but only 100,000 are felt and only 100 cause damage!",
    quiz: { question: "What is the point on Earth's surface directly above the earthquake's focus called?", options: ["Focus", "Epicenter", "Fault", "Seismograph"], answer: "Epicenter" },
  },
  "Climate & Water:Water Cycle": {
    title: "Water Cycle", emoji: "💧",
    summary: "The water cycle (hydrological cycle) describes the continuous movement of water within Earth and its atmosphere — evaporation, condensation, precipitation and collection.",
    keyPoints: ["Evaporation: water from oceans/lakes turns to vapour", "Condensation: vapour cools to form clouds", "Precipitation: water falls as rain, snow or hail", "Runoff: water flows into rivers and oceans", "Transpiration: plants release water vapour through leaves"],
    funFact: "The same water has been cycling on Earth for 4 billion years — the water you drink may have been drunk by a dinosaur!",
    quiz: { question: "What process converts liquid water into water vapour?", options: ["Condensation", "Precipitation", "Evaporation", "Transpiration"], answer: "Evaporation" },
  },
  "Climate & Water:Weather": {
    title: "Weather", emoji: "🌦️",
    summary: "Weather is the short-term state of the atmosphere at a specific place and time, including temperature, humidity, precipitation, cloudiness, and wind.",
    keyPoints: ["Temperature measures heat in the atmosphere", "Humidity is the amount of water vapour in the air", "Precipitation includes rain, snow, sleet and hail", "Wind is caused by differences in air pressure", "A weather front is where two air masses meet"],
    funFact: "Lightning strikes the Earth about 100 times every second — that's 8 million strikes per day!",
    quiz: { question: "What instrument is used to measure air pressure?", options: ["Thermometer", "Barometer", "Hygrometer", "Anemometer"], answer: "Barometer" },
  },

  // ── SPACE SCIENCE ───────────────────────────────────────────────────────────
  "Our neighbourhood:Solar System": {
    title: "Solar System | சூரிய குடும்பம்", emoji: "☀️",
    summary: "Our Solar System consists of the Sun and all objects bound to it by gravity — 8 planets, moons, asteroids, comets and the dwarf planet Pluto. / நமது சூரிய குடும்பம் சூரியன் மற்றும் ஈர்ப்பு விசையால் அதனுடன் பிணைக்கப்பட்டுள்ள 8 கோள்கள், நிலவுகள், விண்கற்கள், வால்மீன்கள் மற்றும் குறுங்கோளான புளூட்டோ ஆகியவற்றை உள்ளடக்கியது.",
    keyPoints: [
      "8 planets in order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune / வரிசைப்படி 8 கோள்கள்: புதன், வெள்ளி, பூமி, செவ்வாய், வியாழன், சனி, யுரேனஸ், நெப்டியூன்",
      "Inner rocky planets: Mercury, Venus, Earth, Mars / உட்புற பாறை கோள்கள்: புதன், வெள்ளி, பூமி, செவ்வாய்",
      "Outer gas giants: Jupiter, Saturn; Ice giants: Uranus, Neptune / வெளிப்புற வாயு அரக்கர்கள்: வியாழன், சனி; பனி அரக்கர்கள்: யுரேனஸ், நெப்டியூன்",
      "Asteroid belt lies between Mars and Jupiter / செவ்வாய் மற்றும் வியாழன் கோள்களுக்கு இடையே விண்கல் பட்டை அமைந்துள்ளது",
      "The Sun contains 99.86% of the Solar System's mass / சூரிய குடும்பத்தின் மொத்த நிறையில் 99.86% சூரியனிலேயே உள்ளது"
    ],
    funFact: "If the Sun were the size of a basketball, Earth would be the size of a peppercorn 26 meters away! / சூரியன் ஒரு கூடைப்பந்து அளவில் இருந்தால், பூமி 26 மீட்டர் தொலைவில் உள்ள ஒரு மிளகு அளவில் இருக்கும்!",
    quiz: { 
      question: "Which is the largest planet in the Solar System? / சூரிய குடும்பத்தில் மிகப்பெரிய கோள் எது?", 
      options: ["Saturn | சனி", "Jupiter | வியாழன்", "Neptune | நெப்டியூன்", "Uranus | யுரேனஸ்"], 
      answer: "Jupiter | வியாழன்" 
    },
  },
  "Our neighbourhood:Planets": {
    title: "Planets | கோள்கள்", emoji: "🪐",
    summary: "A planet is a celestial body that orbits the Sun, has sufficient mass for gravity to make it nearly spherical, and has cleared its orbital neighbourhood. / கோள் என்பது சூரியனைச் சுற்றி வரும், தனது சொந்த ஈர்ப்பு விசையால் உருண்டை வடிவத்தைப் பெற்றுள்ள, தனது சுற்றுப்பாதையில் உள்ள பிற பொருட்களை விலக்கியுள்ள ஒரு விண்பொருளாகும்.",
    keyPoints: [
      "Mercury: closest to Sun, extreme temperature swings / புதன்: சூரியனுக்கு மிக அருகில் உள்ளது, கடுமையான வெப்பநிலை மாற்றங்கள் கொண்டது",
      "Venus: hottest planet due to greenhouse effect (462°C) / வெள்ளி: பசுமை இல்ல விளைவு காரணமாக சூரிய குடும்பத்தின் வெப்பமான கோள் (462°C)",
      "Mars: the 'Red Planet', has the tallest volcano (Olympus Mons) / செவ்வாய்: 'சிவப்பு கோள்', மிக உயரமான எரிமலையான ஒலிம்பஸ் மான்ஸ் இங்குள்ளது",
      "Jupiter: largest planet, has the Great Red Spot storm / வியாழன்: மிகப்பெரிய கோள், பெரும் சிவப்பு புள்ளி எனப்படும் மாபெரும் புயலைக் கொண்டுள்ளது",
      "Saturn: least dense planet, famous for its ring system / சனி: அடர்த்தி மிகக் குறைந்த கோள், அதன் அழகான வளையங்களுக்குப் புகழ்பெற்றது"
    ],
    funFact: "A day on Venus is longer than a year on Venus — it rotates so slowly! / வெள்ளியின் ஒரு நாள் அதன் ஒரு ஆண்டை விட நீளமானது - அது மிகவும் மெதுவாக சுழல்கிறது!",
    quiz: { 
      question: "Which planet is known as the Red Planet? / சிவப்பு கோள் என்று அழைக்கப்படும் கோள் எது?", 
      options: ["Mercury | புதன்", "Venus | வெள்ளி", "Mars | செவ்வாய்", "Jupiter | வியாழன்"], 
      answer: "Mars | செவ்வாய்" 
    },
  },
  "Our neighbourhood:Moon": {
    title: "The Moon | சந்திரன்", emoji: "🌙",
    summary: "The Moon is Earth's only natural satellite. It orbits Earth every 27.3 days and is responsible for oceanic tides through its gravitational pull. / சந்திரன் பூமியின் ஒரே இயற்கை செயற்கைக்கோள் ஆகும். இது 27.3 நாட்களுக்கு ஒருமுறை பூமியைச் சுற்றி வருகிறது, மேலும் இதன் ஈர்ப்பு விசை கடல் அலைகள் உருவாகக் காரணமாகிறது.",
    keyPoints: [
      "Orbits Earth in a synchronous rotation, meaning we always see the same side / பூமியை ஒத்திசைவு சுழற்சியில் சுற்றுவதால், நாம் எப்போதும் நிலவின் ஒரு பக்கத்தையே பார்க்கிறோம்",
      "Gravitational pull causes high and low tides in Earth's oceans / சந்திரனின் ஈர்ப்பு விசை பூமியின் கடல்களில் உயர் மற்றும் தாழ் அலைகளை ஏற்படுத்துகிறது",
      "Has no atmosphere, which means there is no wind, weather, or liquid water / காற்றுமண்டலம் இல்லாததால் இங்கு காற்று, வானிலை அல்லது திரவ நீர் கிடையாது",
      "Surface is covered in craters created by asteroid impacts / விண்கற்கள் மோதியதால் ஏற்பட்ட பள்ளங்கள் நிலவின் மேற்பரப்பில் நிறைந்துள்ளன",
      "Lunar phases depend on its position relative to Earth and Sun / பூமியையும் சூரியனையும் பொறுத்து சந்திரனின் நிலைகள் (வளர்பிறை, தேய்பிறை) மாறுகின்றன"
    ],
    image: "/moon_phases_diagram.png",
    funFact: "Because the Moon has no atmosphere or wind, the footprints left by Apollo astronauts will stay there forever! / சந்திரனில் காற்றுமண்டலம் அல்லது காற்று இல்லாததால், அப்பல்லோ விண்வெளி வீரர்கள் விட்டுச் சென்ற கால்தடங்கள் என்றும் அழியாமல் இருக்கும்!",
    quiz: { 
      question: "How long does it take the Moon to complete one orbit around Earth? / சந்திரன் பூமியை ஒரு முறை சுற்றி வர எவ்வளவு காலம் ஆகும்?", 
      options: ["24 hours | 24 மணிநேரம்", "27.3 days | 27.3 நாட்கள்", "365 days | 365 நாட்கள்", "30 days | 30 நாட்கள்"], 
      answer: "27.3 days | 27.3 நாட்கள்" 
    },
  },
  "Exploration:ISRO Missions": {
    title: "ISRO Missions | இஸ்ரோ திட்டங்கள்", emoji: "🇮🇳",
    summary: "ISRO (Indian Space Research Organisation) has achieved major milestones: Chandrayaan Moon missions, Mangalyaan Mars mission, and commercial satellite launches. / இஸ்ரோ (இந்திய விண்வெளி ஆராய்ச்சி நிறுவனம்) நிலவுக்கான சந்திரயான், செவ்வாய்க்கான மங்கள்யான் மற்றும் வணிக ரீதியிலான செயற்கைக்கோள் ஏவுதல் போன்ற முக்கிய மைல்கற்களை எட்டியுள்ளது.",
    keyPoints: [
      "Founded in 1969 by Dr. Vikram Sarabhai / 1969 இல் டாக்டர் விக்ரம் சாராபாயால் நிறுவப்பட்டது",
      "Chandrayaan-1 (2008): discovered water molecules on the Moon / சந்திரயான்-1 (2008): நிலவில் நீர் மூலக்கூறுகள் இருப்பதை முதன்முதலில் கண்டறிந்தது",
      "Mangalyaan (2014): India's first interplanetary mission / மங்கள்யான் (2014): இந்தியாவின் முதல் கோள்களுக்கு இடையேயான விண்வெளித் திட்டம்",
      "Chandrayaan-3 (2023): first soft landing on Moon's south pole / சந்திரயான்-3 (2023): நிலவின் தென்துருவத்தில் தரையிறங்கிய உலகின் முதல் விண்கலம்",
      "PSLV is one of the world's most reliable rockets / பி.எஸ்.எல்.வி உலகின் மிகவும் நம்பகமான ராக்கெட்டுகளில் ஒன்றாகும்"
    ],
    funFact: "ISRO's Chandrayaan-3 mission cost less than the budget of the movie Interstellar! / இஸ்ரோவின் சந்திரயான்-3 திட்டத்தின் செலவு இன்டர்ஸ்டெல்லார் திரைப்படத்தின் பட்ஜெட்டை விடக் குறைவு!",
    quiz: { 
      question: "Which was India's first interplanetary mission? / இந்தியாவின் முதல் கோள்களுக்கு இடையேயான விண்வெளித் திட்டம் எது?", 
      options: ["Chandrayaan-1 | சந்திரயான்-1", "Mangalyaan | மங்கள்யான்", "PSLV-C11", "Chandrayaan-3 | சந்திரயான்-3"], 
      answer: "Mangalyaan | மங்கள்யான்" 
    },
  },
  "Deep space:Stars": {
    title: "Stars | விண்மீன்கள்", emoji: "⭐",
    summary: "Stars are massive balls of plasma held together by gravity, generating energy through nuclear fusion in their cores. The Sun is an average-sized star. / விண்மீன்கள் என்பவை ஈர்ப்பு விசையால் ஒன்றாகப் பிணைக்கப்பட்டுள்ள மாபெரும் பிளாஸ்மா பந்துகள் ஆகும், இவை தங்கள் மையத்தில் அணுக்கரு இணைவு மூலம் ஆற்றலை உருவாக்குகின்றன. சூரியன் ஒரு நடுத்தர அளவிலான விண்மீன் ஆகும்.",
    keyPoints: [
      "Powered by nuclear fusion: hydrogen → helium / அணுக்கரு இணைவு மூலம் ஆற்றல் பெறுகிறது: ஹைட்ரஜன் → ஹீலியமாக மாறுகிறது",
      "Life cycle: nebula → protostar → main sequence → red giant → white dwarf/supernova / வாழ்க்கைச் சுழற்சி: விண்மீன் தூசுப்படலம் → இள விண்மீன் → முதன்மை நிலை → சிவப்பு அரக்கன் → வெள்ளை குறுமீன்/சூப்பர்நோவா",
      "Colour indicates temperature: blue (hottest) → red (coolest) / விண்மீனின் நிறம் அதன் வெப்பநிலையைக் குறிக்கிறது: நீலம் (மிக அதிக வெப்பம்) → சிவப்பு (குறைந்த வெப்பம்)",
      "Proxima Centauri is the nearest star to Earth (after the Sun) / பிராக்ஸிமா செண்டாரி என்பது பூமிக்கு மிக அருகில் உள்ள விண்மீன் ஆகும் (சூரியனுக்கு அடுத்து)",
      "Stars are classified by spectral type: O, B, A, F, G, K, M / விண்மீன்கள் அவற்றின் நிறமாலை அடிப்படையில் வகைப்படுத்தப்படுகின்றன: O, B, A, F, G, K, M"
    ],
    funFact: "There are more stars in the universe than grains of sand on all of Earth's beaches combined! / பூமியின் அனைத்து கடற்கரைகளிலும் உள்ள மணல் துகள்களை விட அதிகமான விண்மீன்கள் பிரபஞ்சத்தில் உள்ளன!",
    quiz: { 
      question: "What process produces energy in a star? / விண்மீன்களில் ஆற்றலை உருவாக்கும் செயல்முறை எது?", 
      options: ["Nuclear fission | அணுக்கரு பிளவு", "Nuclear fusion | அணுக்கரு இணைவு", "Combustion | எரிதல்", "Photosynthesis | ஒளிச்சேர்க்கை"], 
      answer: "Nuclear fusion | அணுக்கரு இணைவு" 
    },
  },
  "Deep space:Galaxy": {
    title: "Galaxies | விண்மீன் திரள்கள்", emoji: "🌌",
    summary: "A galaxy is a massive gravitationally bound system consisting of stars, stellar remnants, interstellar gas, dust, and dark matter. / விண்மீன் திரள் என்பது விண்மீன்கள், விண்மீன் எச்சங்கள், வாயுக்கள், விண்வெளி தூசிகள் மற்றும் கரும்பொருட்களை உள்ளடக்கிய ஒரு மாபெரும் ஈர்ப்பு விசை அமைப்பாகும்.",
    keyPoints: [
      "Classified into three main types: Spiral, Elliptical, and Irregular / மூன்று முக்கிய வகைகளாக வகைப்படுத்தப்படுகின்றன: சுருள், நீள்வட்டம் மற்றும் ஒழுங்கற்ற விண்மீன் திரள்கள்",
      "Our Solar System is located in the Orion Arm of the Milky Way, a barred spiral galaxy / நமது சூரிய குடும்பம் பால்வெளி என்ற சுருள் விண்மீன் திரளின் ஓரியன் கையில் அமைந்துள்ளது",
      "Andromeda is the closest spiral galaxy to the Milky Way, located 2.5 million light-years away / ஆண்ட்ரோமெடா என்பது பால்வெளிக்கு மிக அருகில் 25 லட்சம் ஒளி ஆண்டுகள் தொலைவில் உள்ள சுருள் விண்மீன் திரள் ஆகும்",
      "Most galaxies are thought to have a supermassive black hole at their centers / பெரும்பாலான விண்மீன் திரள்களின் மையத்தில் ஒரு மாபெரும் கருந்துளை இருப்பதாகக் கருதப்படுகிறது",
      "Galaxies are grouped into clusters; the Milky Way is in the Local Group / விண்மீன் திரள்கள் குழுக்களாக வகைப்படுத்தப்படுகின்றன; பால்வெளி 'உள்ளூர் குழுவில்' உள்ளது"
    ],
    image: "/galaxy_types_diagram.png",
    funFact: "The Milky Way is spinning at 270 km/s, but it still takes about 230 million years to make one full rotation! / பால்வெளி விண்மீன் திரள் வினாடிக்கு 270 கி.மீ வேகத்தில் சுழல்கிறது, இருப்பினும் அது ஒரு முறை முழுமையாகச் சுழல 23 கோடி ஆண்டுகள் ஆகும்!",
    quiz: { 
      question: "What type of galaxy is the Milky Way? / பால்வெளி எந்த வகையான விண்மீன் திரள்?", 
      options: ["Elliptical | நீள்வட்டம்", "Spiral | சுருள் வடிவம்", "Irregular | ஒழுங்கற்ற வடிவம்", "Lenticular | லெண்டிகுலர்"], 
      answer: "Spiral | சுருள் வடிவம்" 
    },
  },
  "Deep space:Black Hole": {
    title: "Black Holes | கருந்துளைகள்", emoji: "🕳️",
    summary: "A black hole is a region of space where gravity is so strong that nothing — not even light — can escape. They form from the collapsed cores of massive stars. / கருந்துளை என்பது ஈர்ப்பு விசை மிகவும் அதிகமாக உள்ள விண்வெளிப் பகுதி ஆகும், இதிலிருந்து ஒளியால் கூட தப்ப முடியாது. இவை மிகப்பெரிய விண்மீன்களின் வீழ்ச்சியடைந்த மையப்பகுதியிலிருந்து உருவாகின்றன.",
    keyPoints: [
      "Formed when a massive star collapses at the end of its life / விண்மீன்கள் தங்கள் வாழ்நாளின் இறுதியில் அழியும் போது உருவாகின்றன",
      "Event horizon: the point of no return / நிகழ்வு எல்லை: இதைக் கடந்தால் எவராலும் அல்லது எதனாலும் திரும்பி வர முடியாது",
      "Singularity: the point of infinite density at the centre / ஒருமைப்புள்ளி: கருந்துளையின் மையத்தில் உள்ள எல்லையற்ற அடர்த்தி கொண்ட புள்ளி",
      "Supermassive black holes exist at the centre of most galaxies / பெரும்பாலான விண்மீன் திரள்களின் மையத்தில் மாபெரும் கருந்துளைகள் உள்ளன",
      "First black hole image captured in 2019 (M87*) / 2019 இல் முதன்முதலாக ஒரு கருந்துளையின் புகைப்படம் எடுக்கப்பட்டது (M87*)"
    ],
    funFact: "The supermassive black hole at the centre of the Milky Way (Sagittarius A*) is 4 million times the mass of the Sun! / பால்வெளியின் மையத்தில் உள்ள மாபெரும் கருந்துளை (சகிட்டாரியஸ் A*) சூரியனை விட 40 லட்சம் மடங்கு அதிக நிறை கொண்டது!",
    quiz: { 
      question: "What is the boundary around a black hole from which nothing can escape? / கருந்துளையைச் சுற்றி எதனாலும் தப்ப முடியாத எல்லை எது?", 
      options: ["Singularity | ஒருமைப்புள்ளி", "Event horizon | நிகழ்வு எல்லை", "Photon sphere | ஃபோட்டான் கோளம்", "Accretion disk | திரள் வட்டு"], 
      answer: "Event horizon | நிகழ்வு எல்லை" 
    },
  },
  "Exploration:Satellite": {
    title: "Satellites | செயற்கைக்கோள்கள்", emoji: "🛰️",
    summary: "A satellite is any object that orbits a larger celestial body. Artificial satellites are launched into orbit to assist with communications, weather monitoring, and scientific research. / செயற்கைக்கோள் என்பது ஒரு பெரிய விண்பொருளைச் சுற்றி வரும் பொருளாகும். தகவல் தொடர்பு, வானிலை கண்காணிப்பு மற்றும் அறிவியல் ஆராய்ச்சிக்காக செயற்கைக்கோள்கள் ஏவப்படுகின்றன.",
    keyPoints: [
      "First artificial satellite was Sputnik 1, launched by the USSR in 1957 / உலகின் முதல் செயற்கைக்கோள் ஸ்புட்னிக் 1, 1957 இல் சோவியத் யூனியனால் ஏவப்பட்டது",
      "Geostationary satellites orbit at 35,786 km and stay fixed above the same point on Earth / புவிநிலை செயற்கைக்கோள்கள் 35,786 கி.மீ உயரத்தில் பூமியின் சுழற்சிக்கு ஏற்ப நிலையாகச் சுற்றுகின்றன",
      "Low Earth Orbit (LEO) satellites are closer (160–2,000 km) and move fast — e.g. ISS, Starlink / குறைந்த புவி வட்டப்பாதை செயற்கைக்கோள்கள் மிக அருகில் வேகமாகச் சுற்றுகின்றன — எ.கா: விண்வெளி நிலையம்",
      "Aryabhata was India's first satellite, launched in 1975 / 1975 இல் ஏவப்பட்ட ஆர்யபட்டா இந்தியாவின் முதல் செயற்கைக்கோள் ஆகும்",
      "Key uses: global positioning (GPS/NavIC), weather forecasting, TV, and military intelligence / முக்கிய பயன்கள்: ஜி.பி.எஸ்/நவிக் வழிசெலுத்தல், வானிலை கணிப்பு, தொலைக்காட்சி மற்றும் ராணுவ உளவுப் பணி"
    ],
    funFact: "There are currently over 8,000 active artificial satellites orbiting the Earth, along with millions of pieces of space junk! / தற்போது பூமியைச் சுற்றி 8,000-க்கும் மேற்பட்ட செயல்பாட்டில் உள்ள செயற்கைக்கோள்களும், பல கோடி விண்வெளி குப்பைகளும் உள்ளன!",
    quiz: { 
      question: "What was the name of India's first artificial satellite, launched in 1975? / 1975 இல் ஏவப்பட்ட இந்தியாவின் முதல் செயற்கைக்கோளின் பெயர் என்ன?", 
      options: ["Rohini | ரோகிணி", "INSAT-1A | இன்சாட்-1A", "Aryabhata | ஆர்யபட்டா", "GSAT-1 | ஜிசாட்-1"], 
      answer: "Aryabhata | ஆர்யபட்டா" 
    },
  },
  "Exploration:Rocket": {
    title: "Rockets | ராக்கெட்டுகள்", emoji: "🚀",
    summary: "A rocket is a spacecraft propelled by the reaction of escaping exhaust gases. Multi-stage rockets shed spent fuel tanks as they ascend to reach orbital velocity. / ராக்கெட் என்பது வேகமாக வெளியேறும் வாயுக்களின் எதிர்வினை மூலம் செலுத்தப்படும் விண்கலமாகும். சுற்றுப்பாதை வேகத்தை எட்ட பல அடுக்கு ராக்கெட்டுகள் பயன்படுத்தப்படுகின்றன.",
    keyPoints: [
      "Operate on Newton's Third Law of Motion: action and reaction / நியூட்டனின் மூன்றாம் இயக்க விதியின் அடிப்படையில் செயல்படுகிறது: வினை மற்றும் எதிர்வினை",
      "Carry both fuel and an oxidizer (oxygen) because there is no air in space / விண்வெளியில் காற்று இல்லாததால் இவை எரிபொருளையும் ஆக்சிஜனையும் சேர்த்து எடுத்துச் செல்கின்றன",
      "Multi-stage rockets drop empty stages during ascent to reduce weight / எடையைக் குறைக்க விண்கலம் மேலே செல்லும்போது காலியான அடுக்குகளைக் கழற்றி விடுகின்றன",
      "Solid fuel rockets provide massive thrust but cannot be turned off; liquid fuel can be controlled / திட எரிபொருள் ராக்கெட்டுகளை நிறுத்த முடியாது; திரவ எரிபொருளைக் கட்டுப்படுத்த முடியும்",
      "India's LVM3 (GSLV Mk III) is ISRO's heaviest rocket, used to launch Chandrayaan-3 / இந்தியாவின் எல்.வி.எம்3 என்பது சந்திரயான்-3 ஐ ஏவிய இஸ்ரோவின் மிகக் கனமான ராக்கெட் ஆகும்"
    ],
    image: "/rocket_stages_diagram.png",
    funFact: "To escape Earth's gravity and reach orbit, a rocket must travel at approximately 28,000 km/h (escape velocity is 40,270 km/h)! / பூமியின் ஈர்ப்பு விசையிலிருந்து தப்பித்து விண்வெளிக்குச் செல்ல, ஒரு ராக்கெட் மணிக்கு சுமார் 40,270 கி.மீ வேகத்தில் பயணிக்க வேண்டும்!",
    quiz: { 
      question: "Which physical law explains how a rocket generates thrust? / ராக்கெட் எவ்வாறு உந்துவிசையை உருவாக்குகிறது என்பதை விளக்கும் இயற்பியல் விதி எது?", 
      options: ["Newton's First Law | நியூட்டனின் முதல் விதி", "Newton's Third Law | நியூட்டனின் மூன்றாம் விதி", "Kepler's Second Law | கெப்லரின் இரண்டாம் விதி", "Law of Gravitation | ஈர்ப்பு விதி"], 
      answer: "Newton's Third Law | நியூட்டனின் மூன்றாம் விதி" 
    },
  },
  "Exploration:Space Missions": {
    title: "Space Missions | விண்வெளித் திட்டங்கள்", emoji: "👨‍🚀",
    summary: "Space missions explore other bodies in our solar system and beyond. Key human missions include the Apollo Moon landings, the International Space Station, and future Mars projects. / விண்வெளித் திட்டங்கள் நமது சூரிய குடும்பம் மற்றும் அதற்கு அப்பால் உள்ள விண்பொருட்களை ஆராய்கின்றன. அப்பல்லோ நிலவு பயணம், சர்வதேச விண்வெளி நிலையம் ஆகியவை இதில் முக்கியமானவை.",
    keyPoints: [
      "Apollo 11 (1969): Neil Armstrong and Buzz Aldrin become first humans on the Moon / அப்பல்லோ 11 (1969): நீல் ஆம்ஸ்ட்ராங் மற்றும் பஸ் ஆல்ட்ரின் நிலவில் கால் பதித்த முதல் மனிதர்கள் ஆவர்",
      "International Space Station (ISS): habitable lab orbiting Earth since 1998 / சர்வதேச விண்வெளி நிலையம்: 1998 முதல் பூமியைச் சுற்றி வரும் விண்வெளி ஆய்வுக்கூடம்",
      "Voyager 1 & 2 (1977): entered interstellar space, carrying the Golden Record / வாயேஜர் 1 & 2 (1977): விண்மீன்களுக்கு இடையேயான பகுதிக்குச் சென்றவை, தங்கத் தட்டைக் கொண்டுள்ளன",
      "Gaganyaan: India's upcoming manned space mission to send 3 astronauts to LEO / ககன்யான்: 3 விண்வெளி வீரர்களை விண்வெளிக்கு அனுப்பும் இந்தியாவின் வரவிருக்கும் மனித விண்வெளிப் பயணம்",
      "Artemis program: NASA's plan to land the next humans (including first woman) on the Moon / ஆர்டெமிஸ் திட்டம்: நிலவுக்கு மீண்டும் மனிதர்களை (முதன்முறையாக ஒரு பெண்ணையும் சேர்த்து) அனுப்பும் நாசாவின் திட்டம்"
    ],
    funFact: "Voyager 1 is the farthest human-made object from Earth — currently over 24 billion km away and still transmitting data! / வாயேஜர் 1 என்பது பூமியிலிருந்து மனிதனால் உருவாக்கப்பட்ட மிகத் தொலைவில் உள்ள பொருள் - தற்போது 2400 கோடி கி.மீ தொலைவில் இருந்து தகவல் அனுப்புகிறது!",
    quiz: { 
      question: "Which upcoming mission is India's first crewed spaceflight program? / இந்தியாவின் முதல் மனித விண்வெளிப் பயணத் திட்டம் எது?", 
      options: ["Chandrayaan-4 | சந்திரயான்-4", "Gaganyaan | ககன்யான்", "Aditya-L1 | ஆதித்யா-L1", "Shukrayaan | சுக்ராயன்"], 
      answer: "Gaganyaan | ககன்யான்" 
    },
  },
  "Exploration:Interactive Universe": {
    title: "Interactive Universe | ஊடாடும் பிரபஞ்சம்", emoji: "🌠",
    summary: "The observable universe is vast, containing trillions of galaxies. Exploring the cosmos interactively helps students visualize scale, light travel time, and cosmic coordinates. / நாம் காணக்கூடிய பிரபஞ்சம் எல்லையற்றது, இதில் பல லட்சம் கோடி விண்மீன் திரள்கள் உள்ளன. பிரபஞ்சத்தை ஊடாடும் முறையில் ஆராய்வது அதன் அளவையும் ஒளியின் வேகத்தையும் புரிந்துகொள்ள உதவுகிறது.",
    keyPoints: [
      "Observable universe has a diameter of about 93 billion light-years / நாம் காணக்கூடிய பிரபஞ்சத்தின் விட்டம் சுமார் 9300 கோடி ஒளி ஆண்டுகள் ஆகும்",
      "Cosmic Microwave Background (CMB) is the remnant heat of the Big Bang / பெருவெடிப்பின் மீதமுள்ள வெப்ப அலைகளே பிரபஞ்சப் பின்னணி கதிர்வீச்சு (CMB) ஆகும்",
      "The universe is expanding at an accelerating rate due to Dark Energy / கரும்பொருள் ஆற்றல் காரணமாக பிரபஞ்சம் தொடர்ந்து முடுக்கப்பட்ட வேகத்தில் விரிவடைந்து வருகிறது",
      "Light year: distance light travels in one year (~9.46 trillion km) / ஒளி ஆண்டு என்பது ஒளி ஒரு ஆண்டில் பயணிக்கும் தூரம் ஆகும் (சுமார் 9.46 லட்சம் கோடி கி.மீ)",
      "Looking far into space is looking back in time due to the speed of light limits / விண்வெளியின் ஆழத்தைப் பார்ப்பது என்பது காலத்தைக் கடந்து கடந்த காலத்தைப் பார்ப்பது போன்றதாகும்"
    ],
    funFact: "If you rode a beam of light, it would take you 8 minutes to reach the Sun, but 100,000 years to cross the Milky Way! / நீங்கள் ஒளியின் வேகத்தில் பயணித்தால், சூரியனை அடைய 8 நிமிடங்கள் ஆகும், ஆனால் நமது பால்வெளி விண்மீன் திரளைக் கடக்க 1,000,000 ஆண்டுகள் ஆகும்!",
    quiz: { 
      question: "What is a light-year a measure of? / ஒளி ஆண்டு என்பது எதைக் குறிக்கிறது?", 
      options: ["Time | காலம்", "Speed | வேகம்", "Distance | தூரம்", "Brightness | பிரகாசம்"], 
      answer: "Distance | தூரம்" 
    },
  },

  // ── DNA & CELL EXPLORER ──────────────────────────────────────────────────────
  "The code of life:DNA": {
    title: "DNA Structure", emoji: "🧬",
    summary: "DNA (Deoxyribonucleic Acid) is a double helix polymer made of nucleotides. Its sequence encodes genetic instructions for all living organisms.",
    keyPoints: ["Double helix structure: two strands wound around each other", "Nucleotides: sugar (deoxyribose) + phosphate + nitrogenous base", "Base pairing rules: A-T and G-C", "Antiparallel strands: one runs 5'→3', other 3'→5'", "Histone proteins help DNA coil into compact chromosomes"],
    formula: "A=T, G≡C (hydrogen bonds: A-T = 2 bonds, G-C = 3 bonds)",
    funFact: "The total DNA in one human cell, stretched out, would be about 2 meters long!",
    quiz: { question: "How many hydrogen bonds connect G and C bases?", options: ["1", "2", "3", "4"], answer: "3" },
  },
  "The code of life:Genes": {
    title: "Genes", emoji: "🔡",
    summary: "A gene is a segment of DNA that encodes instructions for making a protein. Genes are the units of heredity passed from parents to offspring.",
    keyPoints: ["Genes are segments of DNA on chromosomes", "Each gene codes for a specific protein", "Alleles are alternate forms of the same gene", "Dominant alleles mask recessive alleles (Mendel's laws)", "The human genome has about 20,000–25,000 genes"],
    funFact: "Humans share about 98.7% of their DNA with chimpanzees and about 60% with bananas!",
    quiz: { question: "What term describes alternate forms of the same gene?", options: ["Chromosome", "Allele", "Genome", "Codon"], answer: "Allele" },
  },

  // ── 3D HUMAN ANATOMY ────────────────────────────────────────────────────────
  "Organs:Heart": {
    title: "Heart", emoji: "🫀",
    summary: "The heart is a fist-sized muscular organ that pumps blood continuously through the circulatory system. It beats about 70 times per minute at rest.",
    keyPoints: ["4 chambers: right atrium, right ventricle, left atrium, left ventricle", "Right side: handles deoxygenated blood → lungs", "Left side: handles oxygenated blood → body", "Coronary arteries supply blood to the heart muscle itself", "ECG (electrocardiogram) records heart's electrical activity"],
    funFact: "The heart pumps about 7,000 litres of blood every day — enough to fill a large swimming pool in a year!",
    quiz: { question: "Which chamber of the heart has the thickest walls?", options: ["Right Atrium", "Left Atrium", "Right Ventricle", "Left Ventricle"], answer: "Left Ventricle" },
  },
  "Organs:Brain": {
    title: "Brain", emoji: "🧠",
    summary: "The brain is the most complex organ, with three main parts: cerebrum (thinking), cerebellum (balance), and brainstem (automatic functions).",
    keyPoints: ["Cerebrum: largest part, two hemispheres, controls thought and movement", "Cerebellum: coordinates movement and balance", "Brainstem: controls heart rate, breathing, and reflexes", "Frontal lobe: personality and decision making", "Contains about 86 billion neurons connected by trillions of synapses"],
    funFact: "The brain is about 73% water — being dehydrated by just 2% can impair your thinking!",
    quiz: { question: "Which lobe of the brain is responsible for vision?", options: ["Frontal", "Temporal", "Parietal", "Occipital"], answer: "Occipital" },
  },
  "Systems:Digestive System": {
    title: "Digestive System", emoji: "🍽️",
    summary: "The digestive system breaks down food into nutrients that the body can absorb. It includes the mouth, oesophagus, stomach, small intestine and large intestine.",
    keyPoints: ["Mouth: mechanical and chemical digestion begins (amylase breaks starch)", "Stomach: HCl and pepsin break down proteins", "Small intestine: main site of nutrient absorption (duodenum, jejunum, ileum)", "Liver: produces bile to emulsify fats", "Large intestine: absorbs water; rectum stores waste"],
    funFact: "Your small intestine is about 6 metres long — if you unfolded all its villi, it would have the surface area of a tennis court!",
    quiz: { question: "Where does most nutrient absorption take place?", options: ["Stomach", "Large intestine", "Small intestine", "Oesophagus"], answer: "Small intestine" },
  },

  // ── ENVIRONMENTAL SCIENCE ───────────────────────────────────────────────────
  "Systems:Ecosystems": {
    title: "Ecosystems", emoji: "🌳",
    summary: "An ecosystem is a community of living organisms interacting with each other and their physical environment. It includes biotic (living) and abiotic (non-living) components.",
    keyPoints: ["Biotic components: producers, consumers, decomposers", "Abiotic components: sunlight, water, soil, temperature", "Energy flow: Sun → Producers → Consumers → Decomposers", "Nutrient cycling: carbon, nitrogen and water cycles", "Types: forest, grassland, aquatic, desert ecosystems"],
    funFact: "The Amazon rainforest produces 20% of the world's oxygen — it's often called the 'Lungs of the Earth'!",
    quiz: { question: "Which organisms are called producers in an ecosystem?", options: ["Animals", "Fungi", "Green plants", "Bacteria"], answer: "Green plants" },
  },
  "Challenges:Climate Change": {
    title: "Climate Change", emoji: "🌡️",
    summary: "Climate change refers to long-term shifts in global temperatures and weather patterns, primarily caused by human activities increasing greenhouse gas concentrations.",
    keyPoints: ["Main greenhouse gases: CO₂, methane (CH₄), nitrous oxide (N₂O)", "Global average temperature has risen ~1.1°C since pre-industrial times", "Effects: rising sea levels, extreme weather, loss of biodiversity", "Paris Agreement (2015): limit warming to 1.5°C above pre-industrial levels", "India's target: 45% reduction in emissions intensity by 2030"],
    funFact: "Each year, global CO₂ emissions are about 37 billion tonnes — equivalent to weight of 6,000 Great Pyramids of Giza!",
    quiz: { question: "Which gas is the most abundant greenhouse gas emitted by human activities?", options: ["Methane", "Nitrous oxide", "Carbon dioxide", "Water vapour"], answer: "Carbon dioxide" },
  },

  // ── KNOWLEDGE CENTER ────────────────────────────────────────────────────────
  "History:Timeline of Science": {
    title: "Timeline of Science", emoji: "🕰️",
    summary: "Science has evolved over thousands of years, from ancient Greek natural philosophy to the scientific revolution and modern quantum physics.",
    keyPoints: ["600 BCE: Thales of Miletus — first scientific explanations", "1543: Copernicus proposes heliocentric model", "1687: Newton publishes Principia Mathematica (laws of motion and gravity)", "1859: Darwin publishes On the Origin of Species (evolution)", "1905: Einstein's Special Theory of Relativity"],
    funFact: "The word 'scientist' was only coined in 1833 by William Whewell — before that, they were called 'natural philosophers'!",
    quiz: { question: "Who proposed the heliocentric model of the solar system?", options: ["Galileo", "Copernicus", "Newton", "Kepler"], answer: "Copernicus" },
  },
  "People:Indian Scientists": {
    title: "Indian Scientists", emoji: "🇮🇳",
    summary: "India has produced many great scientists who made pioneering contributions to mathematics, physics, chemistry, astronomy and biology.",
    keyPoints: ["C.V. Raman (1888–1970): discovered Raman Effect, Nobel Prize 1930", "Srinivasa Ramanujan (1887–1920): mathematical genius, infinite series", "Dr. APJ Abdul Kalam (1931–2015): missile technology, PSLV rocket", "Homi J. Bhabha: father of Indian nuclear programme", "Satyendra Nath Bose: co-founded quantum statistics (Bose-Einstein)"],
    funFact: "Ramanujan independently rediscovered nearly 3,900 results in mathematics with no formal training!",
    quiz: { question: "Who won India's first Nobel Prize in Science?", options: ["APJ Abdul Kalam", "C.V. Raman", "Homi Bhabha", "Vikram Sarabhai"], answer: "C.V. Raman" },
  },
  "People:Tamil Scientists": {
    title: "Tamil Scientists", emoji: "🪔",
    summary: "Tamil Nadu has produced eminent scientists in many fields who have made contributions globally and to India's development.",
    keyPoints: ["C.V. Raman: Born in Tiruchirapalli, discovered the Raman Effect", "E.C.G. Sudarshan: quantum optics, faster-than-light tachyons theory", "G.N. Ramachandran: Ramachandran plot for protein structures", "M.S. Swaminathan: father of Green Revolution in India", "K. Kasturirangan: ISRO chief, led Chandrayaan-1"],
    funFact: "G.N. Ramachandran's work on protein structures is used by every biologist in the world today!",
    quiz: { question: "C.V. Raman was born in which Tamil Nadu city?", options: ["Chennai", "Madurai", "Tiruchirapalli", "Coimbatore"], answer: "Tiruchirapalli" },
  },

  // ── RESEARCH CENTERS ────────────────────────────────────────────────────────
  "Space & Defence:ISRO": {
    title: "ISRO", emoji: "🚀",
    summary: "ISRO (Indian Space Research Organisation) headquartered in Bengaluru is India's national space agency, responsible for developing and operating space technology.",
    keyPoints: ["Founded: 1969, Headquarters: Bengaluru", "PSLV: workhorse rocket for Earth-observation and interplanetary missions", "Chandrayaan-3 (2023): first soft landing on Moon's south pole", "Key centres: VSSC (Thiruvananthapuram), URSC, SAC (Ahmedabad)", "NavIC: India's own GPS satellite navigation system"],
    funFact: "ISRO launched 104 satellites in a single rocket launch in 2017 — a world record at the time!",
    quiz: { question: "Where is ISRO's headquarters located?", options: ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad"], answer: "Bengaluru" },
  },
  "Research bodies:IITs": {
    title: "IITs — Indian Institutes of Technology", emoji: "🎓",
    summary: "IITs are premier autonomous public technical universities established by the Government of India to provide world-class engineering and science education.",
    keyPoints: ["First IIT established at Kharagpur in 1951", "Currently 23 IITs across India", "Admission through JEE Advanced (one of world's toughest exams)", "IIT alumni lead top global tech companies (Google, Microsoft, etc.)", "IIT Madras: ranked #1 in India for engineering research consistently"],
    funFact: "IIT Bombay's placement package record is over ₹3 crore per annum from international companies!",
    quiz: { question: "Which was the first IIT established in India?", options: ["IIT Bombay", "IIT Delhi", "IIT Kharagpur", "IIT Madras"], answer: "IIT Kharagpur" },
  },

  // ── SCIENTIST GALLERY ────────────────────────────────────────────────────────
  "India:Indian Scientists": {
    title: "Indian Scientists Gallery", emoji: "🇮🇳",
    summary: "India's scientific heritage spans from ancient mathematics (Aryabhata, Brahmagupta) to modern Nobel laureates and space pioneers.",
    keyPoints: ["Aryabhata (476 CE): calculated value of π, proposed Earth's rotation", "Brahmagupta: rules for computing with zero", "C.V. Raman: Nobel Prize in Physics (1930) for Raman Effect", "Homi Bhabha: established India's nuclear research programme", "Vikram Sarabhai: founded ISRO, father of India's space programme"],
    funFact: "Aryabhata accurately calculated the circumference of the Earth as 39,968 km — the actual value is 40,075 km!",
    quiz: { question: "Who is considered the father of India's space programme?", options: ["C.V. Raman", "Homi Bhabha", "Vikram Sarabhai", "APJ Abdul Kalam"], answer: "Vikram Sarabhai" },
  },
  "World:Nobel Laureates": {
    title: "Nobel Prize Laureates", emoji: "🏅",
    summary: "The Nobel Prize is the most prestigious scientific award, given annually in Physics, Chemistry, Medicine, Literature, Peace, and Economics since 1901.",
    keyPoints: ["Founded by Alfred Nobel (inventor of dynamite) in 1895", "First Nobel Prize in Physics: Wilhelm Röntgen (1901) for X-rays", "Marie Curie: only person to win Nobel Prizes in two different sciences", "Indian Nobel laureates in science: C.V. Raman (Physics, 1930)", "Most recent: Nobel Prize for mRNA vaccine technology (2023, Medicine)"],
    funFact: "Marie Curie's notebooks are still so radioactive that they are kept in lead-lined boxes — visitors need protective gear to view them!",
    quiz: { question: "In how many scientific categories is the Nobel Prize awarded?", options: ["3", "4", "5", "6"], answer: "5" },
  },

  // ── STEM INNOVATION HUB ─────────────────────────────────────────────────────
  "Think:Design Thinking": {
    title: "Design Thinking", emoji: "🧠",
    summary: "Design Thinking is a human-centred approach to innovation that draws from the designer's toolkit to integrate the needs of people and technology.",
    keyPoints: ["5 stages: Empathise → Define → Ideate → Prototype → Test", "Focus on understanding real user needs", "Encourages rapid prototyping and iterative testing", "Used by Apple, Google, and IDEO", "Applicable to science, engineering, business and social problems"],
    funFact: "Design Thinking was popularised by IDEO — the firm also redesigned the first Apple mouse!",
    quiz: { question: "What is the first stage of Design Thinking?", options: ["Ideate", "Define", "Empathise", "Prototype"], answer: "Empathise" },
  },
  "Make:Electronics": {
    title: "Electronics", emoji: "🔌",
    summary: "Electronics is the branch of physics that studies the flow of electrons and their use in devices. It underpins computers, phones, televisions and more.",
    keyPoints: ["Resistor: controls current flow (measured in ohms, Ω)", "Capacitor: stores electrical energy temporarily", "Transistor: the building block of all computers (amplifier/switch)", "LED: Light Emitting Diode — emits light when current flows", "Breadboard: used for building circuits without soldering"],
    funFact: "A modern CPU chip contains over 50 billion transistors — each one smaller than a virus!",
    quiz: { question: "Which component is called the building block of computers?", options: ["Resistor", "Capacitor", "Transistor", "Diode"], answer: "Transistor" },
  },

  // ── COMPETITIONS ─────────────────────────────────────────────────────────────
  "Compete:Olympiads": {
    title: "Science Olympiads", emoji: "🥇",
    summary: "Science Olympiads are prestigious competitions testing deep knowledge and problem-solving skills in Physics, Chemistry, Biology, Maths and Astronomy.",
    keyPoints: ["International Olympiads: IPhO, IChO, IBO, IMO, IAO", "India selects students through HBCSE (Homi Bhabha Centre)", "Olympiad medals: Gold, Silver, Bronze, Honourable Mention", "Exam stages: school → state → national → international selection", "Winning can lead to direct admission to premier colleges"],
    funFact: "India has won 27 medals at the International Physics Olympiad since 1998!",
    quiz: { question: "Which organisation conducts national science olympiad selection in India?", options: ["NCERT", "CBSE", "HBCSE", "ISRO"], answer: "HBCSE" },
  },

  // ── AGRICULTURE SCIENCE ──────────────────────────────────────────────────────
  "Basics:Soil": {
    title: "Soil", emoji: "🟤",
    summary: "Soil is the upper layer of earth that supports plant life. It is a mixture of minerals, organic matter, water, air and living organisms.",
    keyPoints: ["Layers (horizons): O (organic), A (topsoil), B (subsoil), C (parent rock)", "Types: sandy (drains fast), clay (retains water), loamy (ideal for farming)", "pH: most crops grow best between pH 6–7", "Humus: decomposed organic matter that improves fertility", "Earthworms aerate and enrich soil naturally"],
    funFact: "A single teaspoon of healthy soil contains more microorganisms than there are people on Earth!",
    quiz: { question: "Which soil type is considered best for agriculture?", options: ["Sandy", "Clay", "Loamy", "Silty"], answer: "Loamy" },
  },
  "Basics:Crops": {
    title: "Crops", emoji: "🌾",
    summary: "Crops are plants grown in large quantities for food, fibre, medicine or other uses. India grows a wide variety due to its diverse climate and geography.",
    keyPoints: ["Kharif crops: grown in monsoon (June-Sept) — rice, maize, cotton", "Rabi crops: grown in winter (Oct-March) — wheat, mustard, barley", "Zaid crops: grown in summer — cucumber, watermelon", "India is the world's largest producer of milk, pulses and jute", "Green Revolution (1960s): M.S. Swaminathan introduced high-yield varieties"],
    funFact: "Rice feeds more than half of the world's population!",
    quiz: { question: "Which crops are grown during the monsoon season in India?", options: ["Rabi crops", "Kharif crops", "Zaid crops", "Cash crops"], answer: "Kharif crops" },
  },
  "Basics:Irrigation": {
    title: "Irrigation", emoji: "💧",
    summary: "Irrigation is the artificial supply of water to land for growing crops. It is essential in regions with irregular or insufficient rainfall to ensure year-round farming.",
    keyPoints: [
      "Surface irrigation: water flows over the land surface (flood, furrow, basin methods)",
      "Drip irrigation: water delivered drop by drop at the root zone — highly efficient",
      "Sprinkler irrigation: water sprayed like rain — good for uneven terrains",
      "Canal irrigation: major source in India, water from rivers via a network of canals",
      "Tamil Nadu major irrigation sources: Cauvery basin, tanks (ooranies), and tube wells",
    ],
    formula: "Water Use Efficiency (WUE) = Crop yield ÷ Total water used",
    funFact: "Drip irrigation uses up to 50% less water than traditional flood irrigation — it was invented in Israel in the 1960s!",
    quiz: { question: "Which type of irrigation delivers water directly to the root zone drop by drop?", options: ["Sprinkler", "Canal", "Flood", "Drip"], answer: "Drip" },
  },
  "Basics:Fertilisers": {
    title: "Fertilisers", emoji: "🧪",
    summary: "Fertilisers are substances added to soil to supply essential nutrients that promote plant growth. They may be natural (organic manure) or artificial (chemical fertilisers).",
    keyPoints: [
      "Primary nutrients needed by plants: Nitrogen (N), Phosphorus (P), Potassium (K) — NPK",
      "Urea is the most commonly used nitrogenous fertiliser in India",
      "Organic fertilisers: compost, vermicompost, farmyard manure (FYM)",
      "Chemical fertilisers give quick results but excess use can degrade soil and pollute water",
      "Biofertilisers use microorganisms (e.g. Rhizobium) to fix atmospheric nitrogen naturally",
    ],
    formula: "NPK Ratio (e.g. 10-26-26): N% – P₂O₅% – K₂O% on fertiliser labels",
    funFact: "Leguminous plants (beans, peas) can fix their own nitrogen from the air using Rhizobium bacteria in root nodules — saving farmers fertiliser costs!",
    quiz: { question: "Which are the three primary macro-nutrients in fertilisers?", options: ["N, P, K", "Ca, Mg, S", "Fe, Zn, Cu", "C, H, O"], answer: "N, P, K" },
  },

  // ── AGRICULTURE — CARE ───────────────────────────────────────────────────────
  "Care:Pest Management": {
    title: "Pest Management", emoji: "🐛",
    summary: "Pest management controls harmful insects, weeds and diseases that damage crops. Integrated Pest Management (IPM) uses a combination of biological, cultural and chemical methods.",
    keyPoints: [
      "Pests include insects (aphids, borers), rodents, fungi and weeds",
      "Chemical control: pesticides/insecticides — quick but can harm environment",
      "Biological control: using natural predators (ladybirds eat aphids)",
      "Cultural control: crop rotation, intercropping, adjusting planting dates",
      "IPM (Integrated Pest Management): combines all methods to minimise pesticide use",
    ],
    funFact: "The boll weevil destroyed nearly half of the US cotton crop in the 1920s — it drove farmers to diversify and actually strengthened local economies!",
    quiz: { question: "What does IPM stand for in agriculture?", options: ["Indian Pest Methods", "Integrated Pest Management", "Irrigation and Pest Monitoring", "Internal Plant Medicines"], answer: "Integrated Pest Management" },
  },
  "Care:Horticulture": {
    title: "Horticulture", emoji: "🍎",
    summary: "Horticulture is the science and art of cultivating fruits, vegetables, flowers and ornamental plants. It differs from agronomy in its focus on high-value, small-scale crops.",
    keyPoints: [
      "Pomology: study and cultivation of fruits (mango, banana, guava)",
      "Olericulture: vegetable cultivation (tomato, brinjal, onion)",
      "Floriculture: growing flowers and ornamental plants",
      "Tamil Nadu is one of India's leading producers of banana, mango and flowers",
      "Grafting, budding and layering are common propagation techniques in horticulture",
    ],
    funFact: "India is the world's second largest producer of fruits and vegetables — horticulture contributes over 30% of agricultural GDP!",
    quiz: { question: "Which branch of horticulture deals with fruit cultivation?", options: ["Olericulture", "Floriculture", "Pomology", "Silviculture"], answer: "Pomology" },
  },
  "Care:Plant Diseases": {
    title: "Plant Diseases", emoji: "🍂",
    summary: "Plant diseases are caused by pathogens such as fungi, bacteria, viruses and nematodes, or by environmental factors. They reduce crop yield and quality significantly.",
    keyPoints: [
      "Fungal diseases are the most common — e.g. rice blast, wheat rust, powdery mildew",
      "Bacterial diseases: citrus canker, fire blight in apples",
      "Viral diseases transmitted by insects (vectors) — e.g. tomato mosaic virus",
      "Symptoms: leaf spots, wilting, yellowing (chlorosis), rotting, abnormal growth",
      "Control: resistant varieties, fungicides, crop sanitation, quarantine measures",
    ],
    funFact: "The Irish Potato Famine (1845–49) was caused by a water mould Phytophthora infestans — it caused over 1 million deaths and massive emigration!",
    quiz: { question: "Which type of pathogen causes the most common plant diseases?", options: ["Bacteria", "Virus", "Fungi", "Nematode"], answer: "Fungi" },
  },

  // ── AGRICULTURE — MODERN ─────────────────────────────────────────────────────
  "Modern:Smart Farming": {
    title: "Smart Farming", emoji: "🚜",
    summary: "Smart farming uses modern technology — IoT sensors, GPS, drones, AI and data analytics — to maximise crop yield while minimising resource wastage.",
    keyPoints: [
      "IoT sensors monitor soil moisture, temperature and nutrient levels in real time",
      "GPS-guided tractors ensure precision planting and spraying",
      "AI analyses satellite imagery to detect crop stress or disease early",
      "Variable Rate Technology (VRT): applies fertiliser/water only where needed",
      "India's eNAM (National Agriculture Market): digital platform linking farmers to buyers",
    ],
    funFact: "A single drone can spray pesticides over an acre of farmland in about 10 minutes — a task that takes a farmer an entire day by hand!",
    quiz: { question: "What does IoT stand for in smart farming?", options: ["Internet of Things", "Indian Organisation of Technology", "Integrated Output Technology", "Internet of Tools"], answer: "Internet of Things" },
  },
  "Modern:Hydroponics": {
    title: "Hydroponics", emoji: "🌱",
    summary: "Hydroponics is a method of growing plants without soil, using mineral nutrient solutions in water. Plants grow faster and produce higher yields than soil-grown counterparts.",
    keyPoints: [
      "Plants' roots are directly exposed to nutrient-rich water (and oxygen)",
      "Uses up to 90% less water than conventional soil farming",
      "Can be set up indoors, in urban areas, or in regions with poor soil",
      "Types: NFT (Nutrient Film Technique), Deep Water Culture, Aeroponics",
      "Common hydroponic crops: lettuce, spinach, tomatoes, strawberries, herbs",
    ],
    funFact: "NASA uses hydroponics to grow food for astronauts in space — it's the future of farming beyond Earth!",
    quiz: { question: "What is the main characteristic of hydroponics?", options: ["Growing in sandy soil", "Growing without sunlight", "Growing without soil using nutrient water", "Growing using only rainwater"], answer: "Growing without soil using nutrient water" },
  },
  "Modern:Drones": {
    title: "Agricultural Drones", emoji: "🛸",
    summary: "Agricultural drones are unmanned aerial vehicles (UAVs) used for crop monitoring, spraying pesticides and fertilisers, mapping fields, and improving farm efficiency.",
    keyPoints: [
      "Multispectral cameras on drones can detect crop stress, water deficit and disease",
      "Precision spraying drones reduce pesticide use by up to 30–40%",
      "LiDAR sensors map terrain and estimate plant height and density",
      "India's government launched the Kisan Drone policy (2022) to promote drone use",
      "One drone can survey 40–60 acres per hour — far faster than manual scouting",
    ],
    funFact: "China is the world's largest user of agricultural drones — over 100,000 drones spray more than 100 million acres of crops every year!",
    quiz: { question: "What type of camera on agricultural drones detects crop health?", options: ["Infrared camera", "Multispectral camera", "Thermal camera", "Regular RGB camera"], answer: "Multispectral camera" },
  },

  // ── VIDEOS ──────────────────────────────────────────────────────────────────
  "By subject:Physics": {
    title: "Physics Videos", emoji: "⚛️",
    summary: "Explore curated experiment and concept videos for Physics — from mechanics to electromagnetism, all aligned with the TN board syllabus.",
    keyPoints: ["Laws of Motion demonstrations", "Optics experiments: reflection, refraction, prism", "Electric circuit building tutorials", "Projectile and pendulum experiments", "Nuclear physics explainer animations"],
    funFact: "Richard Feynman, a Nobel Prize-winning physicist, became famous for his entertaining physics lectures on YouTube!",
    quiz: { question: "Which scientist developed the three laws of motion?", options: ["Einstein", "Galileo", "Newton", "Faraday"], answer: "Newton" },
    links: [{ label: "Question Bank", href: "/student/science/question-bank" }],
  },
  "By subject:Chemistry": {
    title: "Chemistry Videos", emoji: "⚗️",
    summary: "Watch chemical reactions, periodic table lessons and molecular animations aligned to TN board Class 9–12 curriculum.",
    keyPoints: ["Acid-base reactions and indicators", "Electrolysis experiments", "Organic chemistry reaction mechanisms", "Periodic table trends — ionisation energy, electronegativity", "Corrosion and rusting prevention"],
    funFact: "The most expensive element is Francium — less than an ounce of it exists on Earth at any moment!",
    quiz: { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: "Au" },
    links: [{ label: "Chemistry Lab", href: "/student/chemistry-lab" }],
  },
  "By class:Class 9-10": {
    title: "Class 9 & 10 Videos", emoji: "📘",
    summary: "Specifically curated video lessons for Class 9 and 10 students covering all Science chapters from the Tamil Nadu Samacheer textbook.",
    keyPoints: ["Newton's laws, gravitation and motion (Class 9)", "Chemical reactions, acids and bases (Class 9)", "Ohm's Law, light and optics (Class 10)", "Heredity, evolution and life processes (Class 10)", "Available in Tamil and English"],
    funFact: "Visual learning through videos can improve retention by up to 65% compared to text alone!",
    quiz: { question: "Which board do these videos follow?", options: ["CBSE", "ICSE", "Tamil Nadu Samacheer", "Cambridge"], answer: "Tamil Nadu Samacheer" },
  },

  // ── INTERACTIVE LAB ──────────────────────────────────────────────────────────
  "Shelves:Equipment Shelf": {
    title: "Lab Equipment Shelf", emoji: "🧰",
    summary: "Explore common science lab equipment — from beakers to microscopes — and learn their uses, handling procedures and safety guidelines.",
    keyPoints: ["Beaker: holds liquids, not for accurate measurement", "Measuring cylinder: accurate liquid volume measurement", "Test tube: heating small amounts of substances", "Bunsen burner: heat source in labs", "Balance: accurate mass measurement"],
    funFact: "The Bunsen burner was not actually invented by Bunsen — it was his assistant Robert Bunsen who designed the final version!",
    quiz: { question: "Which equipment is used for accurate liquid volume measurement?", options: ["Beaker", "Flask", "Measuring Cylinder", "Test Tube"], answer: "Measuring Cylinder" },
  },
  "Stations:Microscope": {
    title: "Microscope Simulation", emoji: "🔬",
    summary: "A microscope magnifies objects too small to see with the naked eye. Optical microscopes use lenses; electron microscopes use beams of electrons.",
    keyPoints: ["Eyepiece lens (ocular): usually 10x magnification", "Objective lens: 4x, 10x, 40x or 100x (oil immersion)", "Total magnification = eyepiece × objective", "Stage: holds the specimen slide", "Condenser: focuses light onto the specimen"],
    formula: "Total Magnification = Eyepiece Lens × Objective Lens",
    funFact: "The most powerful electron microscope can magnify objects 10 million times!",
    quiz: { question: "How is total magnification of a microscope calculated?", options: ["Eyepiece + Objective", "Eyepiece × Objective", "Eyepiece ÷ Objective", "Eyepiece - Objective"], answer: "Eyepiece × Objective" },
  },

  // ── COMMERCE LAB ─────────────────────────────────────────────────────────────
  "Business:Entrepreneurship": {
    title: "Entrepreneurship", emoji: "🚀",
    summary: "Entrepreneurship is the process of creating, launching and running a new business venture, taking financial risks in the hope of profit.",
    keyPoints: ["Entrepreneur: takes risks to start a new venture", "Innovation: creating new products or improving existing ones", "Business plan: roadmap for a business venture", "Start-up ecosystem in India is 3rd largest in the world", "Famous Indian entrepreneurs: Ratan Tata, Narayana Murthy, Deepinder Goyal"],
    funFact: "India has over 100 unicorn startups (companies valued over $1 billion) — the 3rd highest in the world!",
    quiz: { question: "What document outlines a business's goals and strategy?", options: ["Balance Sheet", "Business Plan", "Journal", "Ledger"], answer: "Business Plan" },
  },
  "Trade & Money:Banking": {
    title: "Banking", emoji: "🏦",
    summary: "Banks are financial institutions that accept deposits, provide loans, and offer various financial services. The Reserve Bank of India (RBI) is India's central bank.",
    keyPoints: ["Commercial banks: accept deposits and give loans (SBI, HDFC, etc.)", "RBI: central bank, controls monetary policy and currency issue", "Types of accounts: savings, current, fixed deposit, recurring deposit", "NEFT, RTGS, UPI: electronic fund transfer methods", "KYC (Know Your Customer): mandatory verification for bank accounts"],
    funFact: "India's UPI system processes over 10 billion transactions per month — more than any other country's digital payment system!",
    quiz: { question: "Which is India's central bank?", options: ["SBI", "HDFC", "RBI", "ICICI"], answer: "RBI" },
  },

  // ── PROGRAMMING LAB ─────────────────────────────────────────────────────────
  "Languages:Python": {
    title: "Python Programming", emoji: "🐍",
    summary: "Python is a high-level, interpreted programming language known for its simple syntax and versatility. It's used in web development, data science, AI and automation.",
    keyPoints: ["Created by Guido van Rossum in 1991", "Interpreted language: runs line by line", "Dynamically typed: no need to declare variable types", "Extensive libraries: NumPy, Pandas, TensorFlow, Django", "Used by Google, Instagram, Netflix and NASA"],
    formula: 'print("Hello, World!") — simplest Python program',
    funFact: "Python is named after Monty Python's Flying Circus, not the snake!",
    quiz: { question: "Who created the Python programming language?", options: ["James Gosling", "Bjarne Stroustrup", "Guido van Rossum", "Dennis Ritchie"], answer: "Guido van Rossum" },
    links: [{ label: "AI Tutor", href: "/student/ai-tutor" }],
  },
  "Languages:C++": {
    title: "C++ Programming", emoji: "➕",
    summary: "C++ is a powerful, general-purpose programming language that supports object-oriented programming. It is widely used in game development, system programming, and competitive coding.",
    keyPoints: ["Created by Bjarne Stroustrup in 1979 as an extension of C", "Supports OOP: classes, objects, inheritance, polymorphism", "Compiled language: faster execution than interpreted languages", "STL (Standard Template Library): built-in data structures", "Used in competitive programming, games (Unreal Engine), OS"],
    formula: 'int main() { cout << "Hello World"; return 0; }',
    funFact: "The first video game to use C++ was Zork in 1977 — C++ made it possible to build complex games!",
    quiz: { question: "Who created C++?", options: ["Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum", "James Gosling"], answer: "Bjarne Stroustrup" },
  },
  "Concepts:Loops": {
    title: "Loops in Programming", emoji: "🔁",
    summary: "Loops allow repeated execution of a block of code. The main types are: for loop, while loop, and do-while loop.",
    keyPoints: ["for loop: repeat a fixed number of times", "while loop: repeat while a condition is true", "do-while: execute at least once, then check condition", "break: exits the loop immediately", "continue: skips current iteration and goes to next"],
    formula: "for i in range(5): print(i)  # prints 0,1,2,3,4",
    funFact: "The first loop in computer history was written by Ada Lovelace in 1843 — for a machine that didn't even exist yet!",
    quiz: { question: "Which loop always executes at least once?", options: ["for loop", "while loop", "do-while loop", "for-each loop"], answer: "do-while loop" },
  },

  // ── DATABASE LAB ─────────────────────────────────────────────────────────────
  "SQL:SELECT": {
    title: "SQL SELECT Statement", emoji: "🔍",
    summary: "The SELECT statement is the most used SQL command. It retrieves data from one or more tables in a database based on specified conditions.",
    keyPoints: ["SELECT *: retrieves all columns", "SELECT col1, col2: retrieves specific columns", "WHERE: filters rows based on a condition", "ORDER BY: sorts the results", "LIMIT: restricts number of rows returned"],
    formula: "SELECT name, age FROM students WHERE class = 10 ORDER BY name;",
    funFact: "SQL was originally called SEQUEL (Structured English QUEry Language) in the 1970s!",
    quiz: { question: "Which SQL clause is used to filter rows?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], answer: "WHERE" },
  },
  "SQL:JOIN": {
    title: "SQL JOIN", emoji: "🔗",
    summary: "JOINs combine rows from two or more tables based on a related column. The most common types are INNER JOIN, LEFT JOIN, RIGHT JOIN and FULL OUTER JOIN.",
    keyPoints: ["INNER JOIN: returns matching rows from both tables", "LEFT JOIN: all rows from left table + matching from right", "RIGHT JOIN: all rows from right table + matching from left", "FULL OUTER JOIN: all rows from both tables", "JOIN condition specified with ON keyword"],
    formula: "SELECT * FROM students INNER JOIN marks ON students.id = marks.student_id;",
    funFact: "A database table in a social media app can have billions of rows — JOINs are optimised using indexes!",
    quiz: { question: "Which JOIN returns only rows that have matches in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], answer: "INNER JOIN" },
  },

  // ── AI & ML LAB ──────────────────────────────────────────────────────────────
  "Foundations:What is AI?": {
    title: "What is Artificial Intelligence?", emoji: "🤖",
    summary: "Artificial Intelligence (AI) is the simulation of human intelligence by machines — enabling computers to learn, reason, solve problems and understand language.",
    keyPoints: ["AI is a branch of computer science started in the 1950s", "Narrow AI: specialised tasks (chess, image recognition)", "General AI: human-level intelligence (still theoretical)", "Machine Learning: AI learns from data without explicit programming", "Deep Learning: uses neural networks with many layers"],
    funFact: "The term 'Artificial Intelligence' was coined by John McCarthy in 1956 at Dartmouth College!",
    quiz: { question: "Which type of AI can perform only specific tasks?", options: ["General AI", "Super AI", "Narrow AI", "Conscious AI"], answer: "Narrow AI" },
  },
  "Learn:Neural Nets": {
    title: "Neural Networks", emoji: "🧠",
    summary: "Neural networks are computing systems inspired by the biological neurons in the human brain. They learn patterns from large datasets.",
    keyPoints: ["Consists of input layer, hidden layers and output layer", "Each neuron applies a weight to inputs and passes through an activation function", "Backpropagation: algorithm to update weights during training", "Deep learning uses neural networks with many hidden layers", "Applications: image recognition, NLP, voice assistants"],
    formula: "Output = Activation(Σ(weights × inputs) + bias)",
    funFact: "ChatGPT uses a neural network with about 175 billion parameters — trained on text from most of the internet!",
    quiz: { question: "What algorithm is used to train neural networks?", options: ["Gradient Descent only", "Forward propagation", "Backpropagation", "K-means"], answer: "Backpropagation" },
  },

  // ── ECONOMICS ────────────────────────────────────────────────────────────────
  "Micro:Demand & Supply": {
    title: "Demand & Supply", emoji: "⚖️",
    summary: "The law of demand states price and quantity demanded move in opposite directions. The law of supply states price and quantity supplied move in the same direction.",
    keyPoints: ["Law of Demand: higher price → lower quantity demanded (inverse)", "Law of Supply: higher price → higher quantity supplied (direct)", "Equilibrium: where demand = supply (market clearing price)", "Demand shifts: income, tastes, prices of related goods", "Supply shifts: input costs, technology, number of sellers"],
    funFact: "During the 2020 COVID lockdown, demand for toilet paper surged so much that economists called it a 'demand shock'!",
    quiz: { question: "At the equilibrium price, what happens to demand and supply?", options: ["Demand > Supply", "Supply > Demand", "Demand = Supply", "Both become zero"], answer: "Demand = Supply" },
  },
  "Macro:National Income": {
    title: "National Income", emoji: "🇮🇳",
    summary: "National income is the total value of goods and services produced by a country's residents in a year. GDP, GNP and NNP are key measures.",
    keyPoints: ["GDP: Gross Domestic Product — total output within a country's borders", "GNP: GDP + income from abroad - income paid abroad", "NDP: GDP - Depreciation", "India's GDP (2024): approximately $3.7 trillion (5th largest globally)", "GDP measured by output, income or expenditure method"],
    formula: "NNP = GNP − Depreciation",
    funFact: "If India's GDP growth rate stays at 7%, the economy will double in size in about 10 years!",
    quiz: { question: "GDP stands for:", options: ["Gross Domestic Production", "Gross Domestic Product", "General Domestic Product", "Gross Direct Product"], answer: "Gross Domestic Product" },
  },

  // ── ACCOUNTANCY ─────────────────────────────────────────────────────────────
  "Books of Accounts:Journal": {
    title: "Journal Entry", emoji: "📓",
    summary: "A journal is the book of prime entry where all financial transactions are recorded chronologically using double-entry bookkeeping.",
    keyPoints: ["Every transaction has a debit and credit entry (double entry)", "Debit: left side of an account; Credit: right side", "Format: Date | Account | Debit (Dr) | Credit (Cr) | Narration", "Golden rules: Real, Personal and Nominal accounts", "Journal is the source for posting to the ledger"],
    formula: "Debit = Credit (always, for every transaction)",
    funFact: "Double-entry bookkeeping was first described by Luca Pacioli in 1494 — it's been used unchanged for 500+ years!",
    quiz: { question: "Which side of a T-account represents a debit entry?", options: ["Right side", "Left side", "Top", "Bottom"], answer: "Left side" },
  },
  "Final Accounts:Balance Sheet": {
    title: "Balance Sheet", emoji: "🧾",
    summary: "A balance sheet is a financial statement showing a company's assets, liabilities and equity at a specific point in time. It always balances: Assets = Liabilities + Equity.",
    keyPoints: ["Assets: what the business owns (current + non-current)", "Liabilities: what the business owes (current + non-current)", "Equity (Capital): owner's stake = Assets - Liabilities", "Current assets: cash, debtors, stock (within 1 year)", "Non-current assets: land, machinery, buildings"],
    formula: "Assets = Liabilities + Owner's Equity",
    funFact: "The largest balance sheet in the world belongs to the US Federal Reserve — over $8 trillion in assets!",
    quiz: { question: "What is the accounting equation?", options: ["Assets + Liabilities = Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Equity - Assets"], answer: "Assets = Liabilities + Equity" },
  },

  // ── WEB TECHNOLOGY ───────────────────────────────────────────────────────────
  "HTML:Tags & Structure": {
    title: "HTML Tags & Structure", emoji: "🏷️",
    summary: "HTML (HyperText Markup Language) uses tags to structure web content. Every HTML page has a standard structure with head and body sections.",
    keyPoints: ["<!DOCTYPE html>: declares the document type", "<html>: root element of the page", "<head>: metadata (title, links, scripts)", "<body>: visible content of the page", "Tags come in pairs: <p> content </p> (opening and closing)"],
    formula: "<!DOCTYPE html><html><head><title>Page</title></head><body>Hello</body></html>",
    funFact: "The first website ever created is still live at info.cern.ch — it was created by Tim Berners-Lee in 1991!",
    quiz: { question: "Which HTML tag defines the title of the webpage shown in browser tabs?", options: ["<header>", "<h1>", "<title>", "<meta>"], answer: "<title>" },
  },
  "JavaScript:DOM": {
    title: "DOM — Document Object Model", emoji: "🌲",
    summary: "The DOM is a tree-like representation of an HTML document. JavaScript uses it to dynamically access, modify, and manipulate HTML elements and content.",
    keyPoints: ["DOM represents HTML as a tree of nodes", "document.getElementById(): selects element by ID", "innerHTML: gets or sets content of an element", "addEventListener(): attaches event handlers", "DOM manipulation enables interactive web pages"],
    formula: "document.getElementById('btn').addEventListener('click', function() { alert('Clicked!'); });",
    funFact: "A typical modern web page makes thousands of DOM manipulations per second to create smooth animations!",
    quiz: { question: "Which method selects an HTML element by its ID using JavaScript?", options: ["querySelector", "getElementById", "getElementByClass", "selectById"], answer: "getElementById" },
  },
};

export function getTopicContent(slug: string, groupHeading: string, itemLabel: string): TopicContent | undefined {
  return CENTER_CONTENT[`${groupHeading}:${itemLabel}`];
}
