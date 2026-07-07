// ============================================================================
// Zoology Study Centre — Syllabus Map (grade-aware)
// ----------------------------------------------------------------------------
// Content is authored in-house as study summaries aligned to the Tamil Nadu
// State Board (Samacheer Kalvi) 2024 editions. Textbook page numbers are given
// only as references so students can turn to the source book. Figures are
// labelled scientific diagrams from the state textbooks used for study support.
// "Research" and "News" cards are teacher-curated and meant to be refreshed
// each term to keep the subject current.
// ============================================================================

export type GlossaryTerm = { term: string; ta?: string; def: string };
export type QuizItem = { q: string; options: string[]; answer: number; explain: string };
export type Figure = { src?: string; caption: string; page?: string };

export type ZoologyUnit = {
  id: string;
  title: string;
  titleTa?: string;          // Tamil title for Tamil-medium grades
  textbookRef: string;       // e.g. "Class 10 Science · Unit 15 · p.218"
  emoji: string;
  color: "emerald" | "purple" | "amber" | "sky" | "orange" | "rose";
  objectives: string[];      // "what you will be able to do" (teacher voice)
  concepts: { heading: string; body: string }[];
  figure?: Figure;
  research: { title: string; body: string; year: string }[];
  news: { title: string; body: string; tag: string }[];
  glossary: GlossaryTerm[];
  quiz: QuizItem[];
};

export type ZoologyGrade = {
  grade: number;
  label: string;
  medium: "Tamil" | "English";
  book: string;
  intro: string;             // teacher-voice framing for the grade
  units: ZoologyUnit[];
};

// ----------------------------------------------------------------------------
// GRADE 8  (Class 8 Science — Tamil medium) — zoology-related units only
// ----------------------------------------------------------------------------
const grade8: ZoologyGrade = {
  grade: 8,
  label: "Class 8 · Science",
  medium: "Tamil",
  book: "Class 8 Science (Tamil), 2024 Edition",
  intro:
    "In Class 8 we meet the living world up close — the tiny microbes we cannot see, how animal bodies are built from cells and tissues, how animals move, how our own body changes during adolescence, and why protecting animals matters. Explore one unit at a time. Read the idea, look at the diagram, check the 'today's science' cards, then take the quick self-check.",
  units: [
    {
      id: "microorganisms",
      title: "Microorganisms",
      titleTa: "நுண்ணுயிரிகள்",
      textbookRef: "Class 8 Science · Unit 16 · p.201",
      emoji: "🦠",
      color: "emerald",
      objectives: [
        "Tell apart the main groups of microbes — bacteria, viruses, fungi, protozoa and algae.",
        "Explain how microbes help us (curd, bread, medicines) and how some cause disease.",
        "Describe simple ways to stop the spread of harmful microbes.",
      ],
      concepts: [
        { heading: "Friendly and harmful microbes", body: "Most microbes are helpers. Bacteria in curd, yeast in idli batter and bread, and fungi that give us medicines like penicillin all work for us. A small number are harmful and cause diseases such as cholera, tuberculosis and the common cold." },
        { heading: "Where they live", body: "Microbes are everywhere — in air, water, soil, on our skin and inside our gut. Because they are so small, we need a microscope to see them." },
        { heading: "Staying safe", body: "Washing hands, boiling water, covering food and taking vaccines are simple, powerful ways to keep harmful microbes away." },
      ],
      figure: { caption: "Microbes are studied under a microscope (see textbook diagrams).", page: "p.201–214" },
      research: [
        { title: "The gut microbiome", body: "Scientists now know the trillions of friendly bacteria in our intestines help digestion, train our immune system and even affect mood — a fast-growing field of study.", year: "2024" },
        { title: "Phage therapy", body: "Special viruses called bacteriophages are being tested to kill bacteria that no longer respond to antibiotics.", year: "2024" },
      ],
      news: [
        { title: "Vaccines that teach cells", body: "mRNA vaccine technology, made famous during COVID-19, is now being trialled against other diseases.", tag: "Health" },
        { title: "Antibiotic resistance", body: "Doctors warn against overusing antibiotics, because bacteria can become 'superbugs' that resist medicines.", tag: "Public health" },
      ],
      glossary: [
        { term: "Microorganism", ta: "நுண்ணுயிரி", def: "A living thing too small to see without a microscope." },
        { term: "Bacteria", ta: "பாக்டீரியா", def: "Single-celled microbes; some helpful, some harmful." },
        { term: "Vaccine", ta: "தடுப்பூசி", def: "A preparation that trains the body to fight a disease." },
      ],
      quiz: [
        { q: "Which microbe helps set curd from milk?", options: ["Virus", "Bacteria", "Alga"], answer: 1, explain: "Lactic acid bacteria turn milk into curd." },
        { q: "The best simple way to avoid many water-borne microbes is to…", options: ["Freeze water", "Boil water", "Shake water"], answer: 1, explain: "Boiling kills most harmful microbes in water." },
      ],
    },
    {
      id: "organisation",
      title: "Organisation of Organisms (Cells & Tissues)",
      titleTa: "உயிரினங்களின் ஒருங்கமைவு",
      textbookRef: "Class 8 Science · Unit 18 · p.229",
      emoji: "🧫",
      color: "purple",
      objectives: [
        "Explain that the cell is the basic unit of every living body.",
        "Describe how similar cells group into tissues, and tissues into organs.",
        "Name the four main types of animal tissue.",
      ],
      concepts: [
        { heading: "From cell to body", body: "Every animal is built in a ladder of levels: cells → tissues → organs → organ systems → the whole organism. Each level does a bigger job than the one below it." },
        { heading: "Four animal tissues", body: "Animal bodies use four tissue types: epithelial (covering and lining), connective (support and linking, like bone and blood), muscular (movement) and nervous (carrying messages)." },
      ],
      figure: { caption: "Animal tissue types — see the labelled tissue diagrams in the unit.", page: "p.229–243" },
      research: [
        { title: "Lab-grown tissues", body: "Researchers are growing sheets of real human tissue and tiny 'organoids' to test medicines without harming animals.", year: "2024" },
        { title: "Stem cells", body: "Special cells that can become many tissue types are being used to repair injuries and study disease.", year: "2024" },
      ],
      news: [
        { title: "3D-printed skin", body: "Hospitals are trialling bio-printed skin tissue to help burn patients heal.", tag: "Medicine" },
      ],
      glossary: [
        { term: "Cell", ta: "செல்", def: "The smallest living unit of the body." },
        { term: "Tissue", ta: "திசு", def: "A group of similar cells doing the same job." },
        { term: "Organ", ta: "உறுப்பு", def: "Different tissues working together (e.g. the heart)." },
      ],
      quiz: [
        { q: "Which tissue helps the body move?", options: ["Nervous", "Muscular", "Epithelial"], answer: 1, explain: "Muscular tissue contracts to create movement." },
        { q: "The basic unit of life is the…", options: ["Organ", "Tissue", "Cell"], answer: 2, explain: "All living bodies are made of cells." },
      ],
    },
    {
      id: "animal-movement",
      title: "Movement of Animals",
      titleTa: "விலங்குகளின் இயக்கம்",
      textbookRef: "Class 8 Science · Unit 19 · p.244",
      emoji: "🦿",
      color: "sky",
      objectives: [
        "Describe how bones, joints and muscles work together to move the body.",
        "Compare how different animals move — walking, flying, swimming, crawling.",
        "Explain the role of joints in the skeleton.",
      ],
      concepts: [
        { heading: "The skeleton and muscles", body: "Bones give the body its frame and protect soft parts. Muscles are attached to bones and pull them; because muscles can only pull (not push), they work in pairs." },
        { heading: "Joints", body: "Joints are places where bones meet. Hinge joints (elbow, knee) move in one plane; ball-and-socket joints (shoulder, hip) rotate in many directions." },
        { heading: "Many ways to move", body: "Fish use fins and a streamlined body; birds have hollow bones and wings; snakes glide using body muscles; earthworms move with tiny bristles and muscle waves." },
      ],
      figure: { caption: "Joints and limb movement — refer to the skeletal diagrams in the unit.", page: "p.244–254" },
      research: [
        { title: "Bio-inspired robots", body: "Engineers copy how snakes, geckos and insects move to build robots that can climb, swim and squeeze into tight spaces.", year: "2024" },
        { title: "Powered exoskeletons", body: "Wearable robotic frames are helping people with weak muscles to walk again.", year: "2025" },
      ],
      news: [
        { title: "Fastest animals", body: "Studies of the peregrine falcon's dive and the cheetah's stride keep revealing how muscle and bone team up for speed.", tag: "Biomechanics" },
      ],
      glossary: [
        { term: "Joint", ta: "மூட்டு", def: "A point where two bones meet and allow movement." },
        { term: "Muscle", ta: "தசை", def: "Tissue that pulls bones to create movement." },
        { term: "Skeleton", ta: "எலும்புக்கூடு", def: "The bony framework of the body." },
      ],
      quiz: [
        { q: "A ball-and-socket joint is found at the…", options: ["Elbow", "Shoulder", "Knee"], answer: 1, explain: "The shoulder rotates in many directions — a ball-and-socket joint." },
        { q: "Muscles usually work in pairs because a muscle can only…", options: ["Push", "Pull", "Bend"], answer: 1, explain: "Muscles pull; a partner muscle pulls the bone back." },
      ],
    },
    {
      id: "adolescence",
      title: "Reaching Adolescence",
      titleTa: "வளரிளம் பருவமடைதல்",
      textbookRef: "Class 8 Science · Unit 20 · p.244",
      emoji: "🌱",
      color: "rose",
      objectives: [
        "Describe the physical and emotional changes of adolescence.",
        "Explain the role of hormones in growing up.",
        "Understand why good food, hygiene and rest matter at this age.",
      ],
      concepts: [
        { heading: "A time of change", body: "Adolescence is the stage between childhood and adulthood when the body grows quickly. Height, body shape and voice change, and the body prepares for adulthood." },
        { heading: "Hormones as chemical messengers", body: "Glands release hormones into the blood that control these changes. Balanced nutrition, exercise and sleep help the body handle this growth well." },
      ],
      figure: { caption: "Endocrine glands and their roles — see the labelled diagram in the unit.", page: "p.244–254" },
      research: [
        { title: "The teenage brain", body: "Brain scans show the adolescent brain is still 'wiring up', especially the part that plans and controls impulses — which continues into the twenties.", year: "2024" },
        { title: "Sleep and growth", body: "Research links good sleep in teenagers to better memory, mood and healthy growth.", year: "2024" },
      ],
      news: [
        { title: "Nutrition for teens", body: "Health bodies stress iron and protein in the teenage diet to support rapid growth.", tag: "Wellbeing" },
      ],
      glossary: [
        { term: "Hormone", ta: "ஹார்மோன்", def: "A chemical messenger made by a gland." },
        { term: "Adolescence", ta: "வளரிளம் பருவம்", def: "The stage of growing from child to adult." },
        { term: "Gland", ta: "சுரப்பி", def: "An organ that makes and releases hormones." },
      ],
      quiz: [
        { q: "Body changes during adolescence are controlled mainly by…", options: ["Bones", "Hormones", "Blood cells"], answer: 1, explain: "Hormones from glands drive these changes." },
        { q: "Which habit best supports healthy growth in teens?", options: ["Skipping meals", "Good sleep & balanced food", "Less water"], answer: 1, explain: "Sleep and nutrition support rapid teenage growth." },
      ],
    },
    {
      id: "conservation",
      title: "Protecting Plants and Animals",
      titleTa: "தாவரங்கள் மற்றும் விலங்குகளைப் பாதுகாத்தல்",
      textbookRef: "Class 8 Science · Unit 22 · p.289",
      emoji: "🐯",
      color: "amber",
      objectives: [
        "Explain why biodiversity matters.",
        "Describe threats like habitat loss and poaching.",
        "List ways to protect wildlife — sanctuaries, national parks, laws.",
      ],
      concepts: [
        { heading: "Why variety matters", body: "Every species has a role in nature's web. Losing one animal or plant can upset the whole balance — food chains, pollination and clean water all depend on biodiversity." },
        { heading: "Protecting wildlife", body: "Wildlife sanctuaries, national parks and biosphere reserves give animals safe homes. Laws protect endangered species, and 'endemic' species (found only in one place) need special care." },
      ],
      figure: { caption: "Protected areas and endangered species — see the unit's maps and photos.", page: "p.289–296" },
      research: [
        { title: "De-extinction", body: "Scientists are studying whether gene technology could bring back lost species and, more usefully, save ones close to extinction.", year: "2024" },
        { title: "Camera-trap AI", body: "Forest cameras plus AI now count tigers and rare animals automatically, helping conservation.", year: "2025" },
      ],
      news: [
        { title: "Project Tiger", body: "India's long-running tiger conservation programme continues to report rising tiger numbers in many reserves.", tag: "Conservation" },
        { title: "Western Ghats", body: "The Western Ghats near Tamil Nadu remain a global biodiversity hotspot under active protection.", tag: "Ecology" },
      ],
      glossary: [
        { term: "Biodiversity", ta: "பல்லுயிர்ப் பெருக்கம்", def: "The variety of living things in an area." },
        { term: "Endangered", ta: "அழிந்துவரும்", def: "A species at risk of dying out." },
        { term: "Sanctuary", ta: "சரணாலயம்", def: "A protected area where wildlife is safe." },
      ],
      quiz: [
        { q: "A species found only in one region is called…", options: ["Endemic", "Extinct", "Common"], answer: 0, explain: "Endemic species live in just one place." },
        { q: "Which protects animals in their natural home?", options: ["Zoo", "Wildlife sanctuary", "Aquarium"], answer: 1, explain: "Sanctuaries protect animals in the wild." },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// GRADE 10  (Class 10 Science — English medium) — biology/zoology units
// ----------------------------------------------------------------------------
const grade10: ZoologyGrade = {
  grade: 10,
  label: "Class 10 · Science",
  medium: "English",
  book: "Class 10 Science (English), 2024 Edition",
  intro:
    "Class 10 zoology is your board-exam core. You will study how animal bodies are organised, how blood circulates, how nerves and hormones control the body, how life reproduces and is inherited, and how we stay healthy. Work through each unit's objectives, study the labelled diagram, connect it to today's research, then self-check with the quiz.",
  units: [
    {
      id: "structural-organisation",
      title: "Structural Organisation of Animals",
      textbookRef: "Class 10 Science · Unit 13 · p.187",
      emoji: "🪱",
      color: "amber",
      objectives: [
        "Describe the body organisation of study animals like the earthworm and leech.",
        "Identify the main organ systems and what each does.",
        "Relate an animal's body plan to how it lives.",
      ],
      concepts: [
        { heading: "Body plans", body: "Animals are organised into segments and systems suited to their lifestyle. Studying model animals (earthworm, leech, cockroach) shows how digestion, circulation and movement systems are arranged." },
        { heading: "Organ systems", body: "Groups of organs form systems — digestive, circulatory, nervous and reproductive — each carrying out one big life function." },
      ],
      figure: { caption: "Body divisions and organ systems of a study animal.", page: "p.187–199" },
      research: [
        { title: "Regeneration", body: "Earthworms and planarians can regrow body parts; scientists study their genes to understand human tissue repair.", year: "2024" },
        { title: "Soil health", body: "Earthworms are recognised as vital 'ecosystem engineers' that keep farm soil fertile.", year: "2024" },
      ],
      news: [
        { title: "Vermicomposting", body: "Schools and farms increasingly use earthworm composting to recycle waste into rich manure.", tag: "Sustainability" },
      ],
      glossary: [
        { term: "Organ system", def: "A group of organs performing one major function." },
        { term: "Segmentation", def: "A body built from repeating units or segments." },
      ],
      quiz: [
        { q: "The earthworm's body is built from repeating…", options: ["Shells", "Segments", "Scales"], answer: 1, explain: "The earthworm has a segmented body." },
      ],
    },
    {
      id: "circulation",
      title: "Circulation in Animals",
      textbookRef: "Class 10 Science · Unit 14 · p.200",
      emoji: "❤️",
      color: "rose",
      objectives: [
        "Describe the human heart and how blood flows through it.",
        "Explain the difference between arteries, veins and capillaries.",
        "Understand blood groups and why they matter.",
      ],
      concepts: [
        { heading: "Double circulation", body: "In humans blood passes through the heart twice in one full round — once to the lungs (to pick up oxygen) and once to the body. The heart's four chambers keep oxygen-rich and oxygen-poor blood apart." },
        { heading: "Blood vessels", body: "Arteries carry blood away from the heart at high pressure; veins return it; capillaries are thin enough for exchange of gases and nutrients." },
      ],
      figure: { caption: "Human heart and circulation — refer to the labelled heart diagram.", page: "p.200–217" },
      research: [
        { title: "Heart-on-a-chip", body: "Tiny lab devices now beat like real heart tissue to test drugs safely.", year: "2024" },
        { title: "Wearable ECG", body: "Smartwatches can now spot irregular heartbeats early, prompting timely check-ups.", year: "2025" },
      ],
      news: [
        { title: "Organ transplants", body: "Advances in preserving donor hearts are lengthening the window for life-saving transplants.", tag: "Medicine" },
      ],
      glossary: [
        { term: "Artery", def: "A vessel carrying blood away from the heart." },
        { term: "Capillary", def: "The tiniest vessel, where exchange happens." },
        { term: "Double circulation", def: "Blood passes through the heart twice per cycle." },
      ],
      quiz: [
        { q: "Which vessel carries blood away from the heart?", options: ["Vein", "Artery", "Capillary"], answer: 1, explain: "Arteries carry blood away from the heart." },
        { q: "How many chambers does the human heart have?", options: ["2", "3", "4"], answer: 2, explain: "The human heart has four chambers." },
      ],
    },
    {
      id: "nervous-system",
      title: "Nervous System",
      textbookRef: "Class 10 Science · Unit 15 · p.218",
      emoji: "🧠",
      color: "purple",
      objectives: [
        "Draw and label the structure of a neuron.",
        "Explain how a nerve impulse travels and crosses a synapse.",
        "Name the parts of the central nervous system and their jobs.",
      ],
      concepts: [
        { heading: "The neuron", body: "The neuron (nerve cell) is the working unit of the nervous system. Dendrites receive signals, the cell body processes them, and the long axon carries the impulse onward — some axons are over a metre long." },
        { heading: "Synapse", body: "Neurons don't touch. At a synapse, the message is passed on by chemicals called neurotransmitters that cross a tiny gap to the next cell." },
        { heading: "CNS and reflexes", body: "The brain and spinal cord form the central nervous system. Reflex actions (like pulling your hand from a hot object) are fast, automatic responses handled largely by the spinal cord." },
      ],
      figure: { src: "/zoology/grade10/neuron.jpg", caption: "Fig. 15.1 — Structure of a neuron (Class 10 Science).", page: "p.219" },
      research: [
        { title: "Brain connectome", body: "Scientists have mapped every neuron and connection in a fruit-fly brain — a milestone toward understanding how brains compute.", year: "2024" },
        { title: "Brain–computer interfaces", body: "Implants are letting paralysed patients move cursors and robotic arms using thought alone.", year: "2025" },
      ],
      news: [
        { title: "Neuralink & rivals", body: "Several companies are trialling brain implants to restore movement and communication.", tag: "Neurotech" },
      ],
      glossary: [
        { term: "Neuron", def: "The structural and functional unit of the nervous system." },
        { term: "Axon", def: "The long fibre that carries the impulse away from the cell body." },
        { term: "Synapse", def: "The junction where a signal passes between two neurons." },
        { term: "Reflex", def: "A fast, automatic response to a stimulus." },
      ],
      quiz: [
        { q: "The long fibre that carries an impulse away from the cell body is the…", options: ["Dendrite", "Axon", "Nucleus"], answer: 1, explain: "The axon carries the impulse away from the cyton." },
        { q: "Signals cross the synapse with the help of…", options: ["Bones", "Neurotransmitters", "Blood"], answer: 1, explain: "Chemical neurotransmitters carry the signal across the synapse." },
        { q: "Pulling your hand off a hot plate is a…", options: ["Reflex action", "Voluntary action", "Hormonal action"], answer: 0, explain: "It is a fast, automatic reflex action." },
      ],
    },
    {
      id: "hormones",
      title: "Plant and Animal Hormones",
      textbookRef: "Class 10 Science · Unit 16 · p.229",
      emoji: "🧪",
      color: "emerald",
      objectives: [
        "Name the major endocrine glands and their hormones.",
        "Explain how hormones control growth, metabolism and stress.",
        "Link hormone imbalances to conditions like goitre and diabetes.",
      ],
      concepts: [
        { heading: "Endocrine control", body: "Endocrine glands release hormones straight into the blood. The pituitary ('master gland') directs others; the thyroid controls metabolism; the pancreas manages blood sugar; the adrenal glands handle stress." },
        { heading: "When balance breaks", body: "Too little thyroid hormone (from lack of iodine) causes goitre; too little insulin causes diabetes. Small chemical amounts have large effects." },
      ],
      figure: { src: "/zoology/grade10/meninges.jpg", caption: "The brain works closely with the pituitary gland to control hormones (Class 10 Science).", page: "p.221" },
      research: [
        { title: "Smart insulin", body: "New 'glucose-responsive' insulins aim to release only when blood sugar rises, making diabetes safer to manage.", year: "2024" },
        { title: "GLP-1 medicines", body: "Hormone-based drugs are transforming the treatment of diabetes and obesity worldwide.", year: "2025" },
      ],
      news: [
        { title: "Iodised salt", body: "Iodine in salt continues to prevent goitre across India — a public-health success.", tag: "Health" },
      ],
      glossary: [
        { term: "Hormone", def: "A chemical messenger released into the blood by a gland." },
        { term: "Endocrine gland", def: "A ductless gland that secretes hormones into the blood." },
        { term: "Insulin", def: "A pancreatic hormone that lowers blood sugar." },
      ],
      quiz: [
        { q: "The 'master gland' of the body is the…", options: ["Thyroid", "Pituitary", "Pancreas"], answer: 1, explain: "The pituitary directs many other glands." },
        { q: "Goitre is caused by a lack of…", options: ["Iron", "Iodine", "Calcium"], answer: 1, explain: "Iodine deficiency causes goitre." },
      ],
    },
    {
      id: "reproduction",
      title: "Reproduction in Animals",
      textbookRef: "Class 10 Science · Unit 17 · p.243",
      emoji: "🐣",
      color: "sky",
      objectives: [
        "Compare asexual and sexual reproduction.",
        "Outline the human reproductive system's role at a basic level.",
        "Explain fertilisation and early development.",
      ],
      concepts: [
        { heading: "Two strategies", body: "Asexual reproduction (as in Hydra's budding) needs one parent and makes identical offspring. Sexual reproduction needs two parents and mixes their features, giving variety that helps species adapt." },
        { heading: "Fertilisation", body: "In sexual reproduction, a male gamete and a female gamete join at fertilisation to form a zygote, which grows into a new individual." },
      ],
      figure: { src: "/zoology/grade10/synapse.jpg", caption: "Cells communicate and combine to pass on life (Class 10 Science).", page: "p.243–260" },
      research: [
        { title: "IVF advances", body: "Assisted-reproduction techniques keep improving, helping many families and teaching us about early development.", year: "2024" },
        { title: "Genetic screening", body: "Safer prenatal tests can now check for many conditions early in pregnancy.", year: "2024" },
      ],
      news: [
        { title: "Conservation breeding", body: "Zoos use assisted reproduction to boost numbers of endangered animals.", tag: "Conservation" },
      ],
      glossary: [
        { term: "Gamete", def: "A reproductive cell (sperm or egg)." },
        { term: "Zygote", def: "The single cell formed when gametes fuse." },
        { term: "Fertilisation", def: "The joining of male and female gametes." },
      ],
      quiz: [
        { q: "Budding in Hydra is an example of…", options: ["Sexual reproduction", "Asexual reproduction", "Fertilisation"], answer: 1, explain: "Budding needs one parent — asexual reproduction." },
        { q: "The cell formed at fertilisation is the…", options: ["Gamete", "Zygote", "Neuron"], answer: 1, explain: "Fertilisation forms a zygote." },
      ],
    },
    {
      id: "genetics",
      title: "Genetics",
      textbookRef: "Class 10 Science · Unit 18 · p.261",
      emoji: "🧬",
      color: "purple",
      objectives: [
        "State Mendel's laws of inheritance in simple terms.",
        "Use the terms gene, allele, dominant and recessive.",
        "Explain how sex is determined in humans.",
      ],
      concepts: [
        { heading: "Mendel's discovery", body: "By breeding pea plants, Mendel showed that traits pass to offspring through 'factors' (now called genes). Some versions (alleles) are dominant and mask others that are recessive." },
        { heading: "Sex determination", body: "Humans have sex chromosomes X and Y. XX develops as female, XY as male — the sperm decides the sex of the child." },
      ],
      figure: { caption: "Inheritance patterns and Punnett squares — see the genetics diagrams.", page: "p.261–273" },
      research: [
        { title: "CRISPR gene editing", body: "The CRISPR tool lets scientists edit DNA precisely; the first approved CRISPR therapy now treats sickle-cell disease.", year: "2024" },
        { title: "Cheap genome reading", body: "Reading a person's full DNA has become fast and affordable, powering personalised medicine.", year: "2025" },
      ],
      news: [
        { title: "Gene therapy in India", body: "Indian hospitals have begun offering gene therapies for certain inherited blood disorders.", tag: "Medicine" },
      ],
      glossary: [
        { term: "Gene", def: "A unit of heredity carried on DNA." },
        { term: "Allele", def: "A version of a gene." },
        { term: "Dominant", def: "An allele that shows even when paired with a recessive one." },
      ],
      quiz: [
        { q: "A trait that shows even in a mixed pair is…", options: ["Recessive", "Dominant", "Neutral"], answer: 1, explain: "The dominant allele shows in a mixed pair." },
        { q: "In humans, the child's sex is decided by the…", options: ["Egg", "Sperm", "Neither"], answer: 1, explain: "The sperm carries either X or Y and decides sex." },
      ],
    },
    {
      id: "health-diseases",
      title: "Health and Diseases",
      textbookRef: "Class 10 Science · Unit 21 · p.300",
      emoji: "🩺",
      color: "emerald",
      objectives: [
        "Distinguish communicable from non-communicable diseases.",
        "Explain how the immune system defends the body.",
        "Describe the harm from tobacco, alcohol and drugs.",
      ],
      concepts: [
        { heading: "Two kinds of disease", body: "Communicable diseases spread from person to person (through germs, water, air or insects). Non-communicable diseases — like diabetes and heart disease — are not caught but build up over time from lifestyle and other factors." },
        { heading: "The body's defence", body: "White blood cells and antibodies form the immune system that fights invaders. Vaccines prepare this system in advance." },
      ],
      figure: { caption: "Disease spread and the immune response — see the unit's diagrams.", page: "p.300–319" },
      research: [
        { title: "Cancer immunotherapy", body: "New treatments train the patient's own immune cells to attack cancer, a major shift in oncology.", year: "2024" },
        { title: "Universal vaccines", body: "Researchers are working on flu vaccines that could work against many strains at once.", year: "2025" },
      ],
      news: [
        { title: "Malaria vaccine", body: "The world's first malaria vaccines are now being rolled out to protect children.", tag: "Global health" },
      ],
      glossary: [
        { term: "Communicable disease", def: "A disease that spreads from one person to another." },
        { term: "Immunity", def: "The body's ability to resist disease." },
        { term: "Antibody", def: "A protein that targets a specific germ." },
      ],
      quiz: [
        { q: "Which is a non-communicable disease?", options: ["Cholera", "Diabetes", "Influenza"], answer: 1, explain: "Diabetes is not caught from others — non-communicable." },
        { q: "Vaccines work by preparing the…", options: ["Bones", "Immune system", "Muscles"], answer: 1, explain: "Vaccines train the immune system in advance." },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// GRADE 11  (Class 11 Bio-Zoology — Tamil medium) — full course chapters
// ----------------------------------------------------------------------------
const grade11: ZoologyGrade = {
  grade: 11,
  label: "Class 11 · Bio-Zoology",
  medium: "Tamil",
  book: "Class 11 Bio-Zoology (Tamil), 2024 Edition",
  intro:
    "Class 11 Zoology is a full, focused course on animal life — from how we classify animals to how each organ system works and how zoology serves the economy. Use each chapter's objectives and glossary to build strong fundamentals for NEET and board exams. Bilingual terms are given to support Tamil-medium study.",
  units: [
    {
      id: "living-world",
      title: "The Living World",
      titleTa: "உயிரி உலகம்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 1",
      emoji: "🌍",
      color: "emerald",
      objectives: [
        "Define the characteristics that mark something as 'living'.",
        "Explain the need for classifying and naming organisms.",
        "Understand binomial nomenclature.",
      ],
      concepts: [
        { heading: "What is life?", body: "Living things grow, reproduce, respond to their surroundings, use energy (metabolism) and are organised into cells. Together these features separate the living from the non-living." },
        { heading: "Naming life", body: "Because there are millions of species, scientists use a two-word Latin name (binomial nomenclature) so everyone worldwide means the same organism." },
      ],
      figure: { caption: "Diversity and classification of life — see the chapter's charts.", page: "Chapter 1" },
      research: [
        { title: "New species every year", body: "Thousands of new animal species are still being discovered and named, many from unexplored oceans and forests.", year: "2024" },
        { title: "DNA barcoding", body: "A short piece of DNA is now used like a barcode to quickly identify species.", year: "2024" },
      ],
      news: [
        { title: "Deep-sea discoveries", body: "Expeditions keep finding strange new animals in the deep ocean around the world.", tag: "Discovery" },
      ],
      glossary: [
        { term: "Metabolism", ta: "வளர்சிதை மாற்றம்", def: "All chemical reactions that keep an organism alive." },
        { term: "Taxonomy", ta: "வகைப்பாட்டியல்", def: "The science of naming and classifying organisms." },
        { term: "Binomial name", ta: "இருசொற் பெயரிடல்", def: "A two-word scientific name (genus + species)." },
      ],
      quiz: [
        { q: "A two-word scientific name is called…", options: ["Nickname", "Binomial name", "Common name"], answer: 1, explain: "Binomial nomenclature gives a genus + species name." },
      ],
    },
    {
      id: "animal-kingdom",
      title: "Kingdom Animalia",
      titleTa: "விலங்குகளின் வகைப்பாடு",
      textbookRef: "Class 11 Bio-Zoology · Chapter 2",
      emoji: "🐙",
      color: "sky",
      objectives: [
        "Classify animals into major phyla using clear features.",
        "Use criteria like symmetry, body cavity and segmentation.",
        "Give examples from each phylum.",
      ],
      concepts: [
        { heading: "How animals are grouped", body: "Zoologists sort animals by features such as body symmetry (radial or bilateral), the number of tissue layers, the presence of a body cavity (coelom), and segmentation." },
        { heading: "From simple to complex", body: "The animal kingdom runs from sponges (Porifera) with no true tissues, up to chordates with a backbone — including fish, amphibians, reptiles, birds and mammals." },
      ],
      figure: { caption: "The major animal phyla and their features — see the classification chart.", page: "Chapter 2" },
      research: [
        { title: "Rewriting the tree", body: "DNA studies sometimes reshuffle where animals sit on the evolutionary tree, refining old classifications.", year: "2024" },
      ],
      news: [
        { title: "Octopus intelligence", body: "Studies of octopus problem-solving are changing how we think about invertebrate minds.", tag: "Behaviour" },
      ],
      glossary: [
        { term: "Symmetry", ta: "சமச்சீர்", def: "How body parts are arranged around an axis." },
        { term: "Coelom", ta: "உடற்குழி", def: "A fluid-filled body cavity." },
        { term: "Chordata", ta: "முதுகுநாணி", def: "The phylum of animals with a notochord/backbone." },
      ],
      quiz: [
        { q: "Animals with a backbone belong to phylum…", options: ["Porifera", "Chordata", "Annelida"], answer: 1, explain: "Chordates (vertebrates) have a backbone." },
      ],
    },
    {
      id: "digestion",
      title: "Digestion and Absorption",
      titleTa: "செரிமானமும் உட்கவர்தலும்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 5",
      emoji: "🍽️",
      color: "amber",
      objectives: [
        "Trace the path of food through the alimentary canal.",
        "Explain the role of digestive enzymes.",
        "Describe how nutrients are absorbed.",
      ],
      concepts: [
        { heading: "Breaking food down", body: "Digestion turns large food molecules into small ones the body can absorb. Enzymes in saliva, stomach and intestine each act on specific nutrients — carbohydrates, proteins and fats." },
        { heading: "Absorption", body: "The small intestine, lined with finger-like villi, absorbs the digested nutrients into the blood for use by the whole body." },
      ],
      figure: { caption: "The human digestive system — see the labelled alimentary canal diagram.", page: "Chapter 5" },
      research: [
        { title: "Gut–brain axis", body: "Research shows the gut and brain 'talk' constantly, linking digestion to mood and health.", year: "2024" },
      ],
      news: [
        { title: "Microbiome diets", body: "Nutrition science increasingly focuses on feeding helpful gut bacteria with fibre.", tag: "Nutrition" },
      ],
      glossary: [
        { term: "Enzyme", ta: "நொதி", def: "A protein that speeds up a chemical reaction." },
        { term: "Villi", ta: "குடல் நுண்மயிர்", def: "Tiny projections in the intestine that absorb nutrients." },
      ],
      quiz: [
        { q: "Nutrients are mainly absorbed in the…", options: ["Stomach", "Small intestine", "Mouth"], answer: 1, explain: "Villi in the small intestine absorb nutrients." },
      ],
    },
    {
      id: "respiration",
      title: "Respiration — Breathing & Gas Exchange",
      titleTa: "சுவாசித்தலும் வாயுப் பரிமாற்றமும்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 6",
      emoji: "🫁",
      color: "sky",
      objectives: [
        "Describe the human respiratory system.",
        "Explain gas exchange in the lungs.",
        "Compare breathing in different animals.",
      ],
      concepts: [
        { heading: "Why we breathe", body: "Cells need oxygen to release energy from food and must remove carbon dioxide. Breathing brings air to the lungs, where oxygen enters the blood and carbon dioxide leaves." },
        { heading: "Many designs", body: "Fish use gills, insects use tiny air tubes (tracheae), and mammals use lungs — different solutions to the same need for oxygen." },
      ],
      figure: { caption: "Human respiratory system and gas exchange — see the lung diagram.", page: "Chapter 6" },
      research: [
        { title: "Lung repair", body: "Scientists are learning how lung tissue heals, aiming to treat damage from disease and pollution.", year: "2024" },
      ],
      news: [
        { title: "Air quality & health", body: "Studies keep linking clean air to healthier lungs, driving anti-pollution efforts in cities.", tag: "Public health" },
      ],
      glossary: [
        { term: "Alveoli", ta: "நுரையீரல் சிற்றறைகள்", def: "Tiny air sacs in the lungs where gas exchange happens." },
        { term: "Trachea", ta: "மூச்சுக்குழல்", def: "The windpipe carrying air to the lungs." },
      ],
      quiz: [
        { q: "Gas exchange in human lungs happens in the…", options: ["Trachea", "Alveoli", "Bronchi"], answer: 1, explain: "Alveoli are the site of gas exchange." },
      ],
    },
    {
      id: "circulation-11",
      title: "Body Fluids and Circulation",
      titleTa: "உடல் திரவங்களும் சுற்றோட்டமும்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 7",
      emoji: "🩸",
      color: "rose",
      objectives: [
        "Describe the composition of blood and lymph.",
        "Explain the working of the human heart and its cycle.",
        "Understand blood groups and clotting.",
      ],
      concepts: [
        { heading: "Blood — the transport fluid", body: "Blood carries oxygen, nutrients, hormones and wastes. It is made of plasma plus red cells, white cells and platelets, each with a distinct job." },
        { heading: "The cardiac cycle", body: "The heart contracts (systole) and relaxes (diastole) rhythmically to pump blood. A conducting system sets the beat automatically." },
      ],
      figure: { caption: "Human heart and the cardiac cycle — see the labelled diagram.", page: "Chapter 7" },
      research: [
        { title: "Lab-grown blood", body: "Trials have begun giving patients tiny amounts of lab-grown red blood cells.", year: "2024" },
      ],
      news: [
        { title: "Blood donation tech", body: "Better storage and testing keep making transfusions safer.", tag: "Medicine" },
      ],
      glossary: [
        { term: "Plasma", ta: "இரத்த நீர்மம்", def: "The liquid part of blood." },
        { term: "Platelets", ta: "இரத்தத் தட்டுகள்", def: "Cell fragments that help blood clot." },
        { term: "Systole", ta: "சுருங்குதல்", def: "The contraction phase of the heart." },
      ],
      quiz: [
        { q: "Which blood component helps clotting?", options: ["Red cells", "Platelets", "Plasma"], answer: 1, explain: "Platelets help blood clot." },
      ],
    },
    {
      id: "neural-control",
      title: "Neural Control and Coordination",
      titleTa: "நரம்பு கட்டுப்பாடும் ஒருங்கிணைப்பும்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 10",
      emoji: "🧠",
      color: "purple",
      objectives: [
        "Describe the neuron and nerve impulse.",
        "Explain the central and peripheral nervous systems.",
        "Outline how the brain coordinates the body.",
      ],
      concepts: [
        { heading: "Fast messaging", body: "The nervous system gives quick, precise control. Neurons carry electrical impulses and pass them chemically at synapses, letting the body respond in milliseconds." },
        { heading: "Command centres", body: "The brain and spinal cord process information and send instructions, while peripheral nerves connect them to every organ." },
      ],
      figure: { src: "/zoology/grade10/neuron.jpg", caption: "Structure of a neuron — the working unit of the nervous system.", page: "Chapter 10" },
      research: [
        { title: "Whole-brain mapping", body: "New techniques are mapping neurons and their links in ever-larger brains.", year: "2024" },
        { title: "Neuroprosthetics", body: "Brain-controlled limbs are restoring movement for people with paralysis.", year: "2025" },
      ],
      news: [
        { title: "Memory research", body: "Neuroscientists are uncovering how memories form and could be strengthened.", tag: "Neuroscience" },
      ],
      glossary: [
        { term: "Neuron", ta: "நரம்பணு", def: "The unit cell of the nervous system." },
        { term: "Synapse", ta: "நரம்பிணைப்பு", def: "The junction between two neurons." },
        { term: "CNS", ta: "மைய நரம்பு மண்டலம்", def: "Brain + spinal cord." },
      ],
      quiz: [
        { q: "The central nervous system is made of the brain and…", options: ["Heart", "Spinal cord", "Lungs"], answer: 1, explain: "CNS = brain + spinal cord." },
      ],
    },
    {
      id: "economic-zoology",
      title: "Trends in Economic Zoology",
      titleTa: "பொருளாதார விலங்கியலின் போக்குகள்",
      textbookRef: "Class 11 Bio-Zoology · Chapter 12",
      emoji: "🐝",
      color: "amber",
      objectives: [
        "Explain how animals contribute to the economy.",
        "Describe sericulture, apiculture, aquaculture and poultry.",
        "Discuss careers in applied zoology.",
      ],
      concepts: [
        { heading: "Animals at work for us", body: "Applied zoology turns biology into livelihoods: silk from silkworms (sericulture), honey and pollination from bees (apiculture), fish farming (aquaculture) and poultry all feed the economy." },
        { heading: "Careers", body: "Fields like veterinary science, fisheries, dairy technology and wildlife biology offer real career paths built on zoology." },
      ],
      figure: { caption: "Economically important animals and their products — see the chapter.", page: "Chapter 12" },
      research: [
        { title: "Sustainable aquaculture", body: "New methods raise fish with less water and feed, protecting wild stocks.", year: "2024" },
        { title: "Pollinator protection", body: "Because bees pollinate many crops, scientists are working hard to reverse bee decline.", year: "2025" },
      ],
      news: [
        { title: "Tamil Nadu fisheries", body: "Coastal Tamil Nadu continues to modernise fishing and aquaculture for better yields.", tag: "Economy" },
      ],
      glossary: [
        { term: "Sericulture", ta: "பட்டு வளர்ப்பு", def: "Rearing silkworms for silk." },
        { term: "Apiculture", ta: "தேனீ வளர்ப்பு", def: "Beekeeping for honey and pollination." },
        { term: "Aquaculture", ta: "நீர்வாழ் உயிர் வளர்ப்பு", def: "Farming fish and other water animals." },
      ],
      quiz: [
        { q: "Rearing silkworms for silk is called…", options: ["Apiculture", "Sericulture", "Aquaculture"], answer: 1, explain: "Sericulture is silk farming." },
      ],
    },
  ],
};

export const ZOOLOGY_SYLLABUS: Record<number, ZoologyGrade> = {
  8: grade8,
  10: grade10,
  11: grade11,
};

export const AVAILABLE_GRADES = [8, 10, 11];

// Map a student's raw class string (e.g. "8", "VIII", "Std 8", "11-A") to a
// grade we have content for. Falls back to the nearest available grade.
export function resolveGrade(rawClass?: string | number | null): number {
  if (rawClass == null) return 8;
  const s = String(rawClass).toLowerCase();
  const roman: Record<string, number> = { viii: 8, x: 10, xi: 11, ix: 9, xii: 12 };
  for (const [r, g] of Object.entries(roman)) {
    if (new RegExp(`\\b${r}\\b`).test(s)) return closest(g);
  }
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return closest(isNaN(num) ? 8 : num);
}

function closest(g: number): number {
  if (AVAILABLE_GRADES.includes(g)) return g;
  // map 6-9 -> 8, 10 -> 10, 11-12 -> 11
  if (g <= 9) return 8;
  if (g === 10) return 10;
  return 11;
}

// ----------------------------------------------------------------------------
// Curated "online research" links per unit — reputable, freely accessible
// sources students can explore for images and further reading. Teachers can
// extend these in the Studio. (No copyrighted images are embedded in-app.)
// ----------------------------------------------------------------------------
export type OnlineLink = { title: string; url: string; source: string };

export const ONLINE_RESEARCH: Record<string, OnlineLink[]> = {
  microorganisms: [
    { title: "Mould (fungus) — overview & images", url: "https://en.wikipedia.org/wiki/Mold", source: "Wikipedia" },
    { title: "Rhizopus (bread mould)", url: "https://en.wikipedia.org/wiki/Rhizopus", source: "Wikipedia" },
    { title: "Penicillium & the discovery of penicillin", url: "https://en.wikipedia.org/wiki/Penicillium", source: "Wikipedia" },
    { title: "Microorganisms — basics", url: "https://en.wikipedia.org/wiki/Microorganism", source: "Wikipedia" },
  ],
  organisation: [
    { title: "Animal tissue types", url: "https://en.wikipedia.org/wiki/Tissue_(biology)", source: "Wikipedia" },
    { title: "The cell", url: "https://en.wikipedia.org/wiki/Cell_(biology)", source: "Wikipedia" },
  ],
  "animal-movement": [
    { title: "Animal locomotion", url: "https://en.wikipedia.org/wiki/Animal_locomotion", source: "Wikipedia" },
    { title: "Joints of the human body", url: "https://en.wikipedia.org/wiki/Joint", source: "Wikipedia" },
  ],
  adolescence: [
    { title: "Adolescence & puberty", url: "https://en.wikipedia.org/wiki/Puberty", source: "Wikipedia" },
    { title: "The endocrine system", url: "https://en.wikipedia.org/wiki/Endocrine_system", source: "Wikipedia" },
  ],
  conservation: [
    { title: "Project Tiger (India)", url: "https://en.wikipedia.org/wiki/Project_Tiger", source: "Wikipedia" },
    { title: "Western Ghats biodiversity", url: "https://en.wikipedia.org/wiki/Western_Ghats", source: "Wikipedia" },
  ],
  "structural-organisation": [
    { title: "Earthworm anatomy", url: "https://en.wikipedia.org/wiki/Earthworm", source: "Wikipedia" },
  ],
  circulation: [
    { title: "The human heart", url: "https://en.wikipedia.org/wiki/Heart", source: "Wikipedia" },
    { title: "Circulatory system", url: "https://en.wikipedia.org/wiki/Circulatory_system", source: "Wikipedia" },
  ],
  "nervous-system": [
    { title: "Neuron structure", url: "https://en.wikipedia.org/wiki/Neuron", source: "Wikipedia" },
    { title: "The human brain", url: "https://en.wikipedia.org/wiki/Human_brain", source: "Wikipedia" },
  ],
  hormones: [
    { title: "Hormone basics", url: "https://en.wikipedia.org/wiki/Hormone", source: "Wikipedia" },
    { title: "Thyroid & goitre", url: "https://en.wikipedia.org/wiki/Goitre", source: "Wikipedia" },
  ],
  reproduction: [
    { title: "Reproduction in animals", url: "https://en.wikipedia.org/wiki/Sexual_reproduction", source: "Wikipedia" },
  ],
  genetics: [
    { title: "Mendelian inheritance", url: "https://en.wikipedia.org/wiki/Mendelian_inheritance", source: "Wikipedia" },
    { title: "CRISPR gene editing", url: "https://en.wikipedia.org/wiki/CRISPR", source: "Wikipedia" },
  ],
  "health-diseases": [
    { title: "The immune system", url: "https://en.wikipedia.org/wiki/Immune_system", source: "Wikipedia" },
    { title: "Vaccines", url: "https://en.wikipedia.org/wiki/Vaccine", source: "Wikipedia" },
  ],
  "living-world": [
    { title: "Biological classification", url: "https://en.wikipedia.org/wiki/Taxonomy_(biology)", source: "Wikipedia" },
  ],
  "animal-kingdom": [
    { title: "Animal phyla", url: "https://en.wikipedia.org/wiki/Animal", source: "Wikipedia" },
  ],
  digestion: [
    { title: "Human digestive system", url: "https://en.wikipedia.org/wiki/Human_digestive_system", source: "Wikipedia" },
  ],
  respiration: [
    { title: "Respiratory system", url: "https://en.wikipedia.org/wiki/Respiratory_system", source: "Wikipedia" },
  ],
  "circulation-11": [
    { title: "Blood & its components", url: "https://en.wikipedia.org/wiki/Blood", source: "Wikipedia" },
  ],
  "neural-control": [
    { title: "Nervous system", url: "https://en.wikipedia.org/wiki/Nervous_system", source: "Wikipedia" },
  ],
  "economic-zoology": [
    { title: "Sericulture (silk)", url: "https://en.wikipedia.org/wiki/Sericulture", source: "Wikipedia" },
    { title: "Beekeeping (apiculture)", url: "https://en.wikipedia.org/wiki/Beekeeping", source: "Wikipedia" },
  ],
};

// Storage key used in the LabEquipment table to mark a grade as teacher-approved
export const ZOO_APPROVAL_STATUS = "zoology-approved";
export const zooApprovalName = (grade: number) => `Zoology Published · Class ${grade}`;
