"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

type Subject = "Biology" | "Chemistry" | "Physics";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Chapter {
  id: string;
  subject: Subject;
  chapter: string;
  difficulty: Difficulty;
  totalQuestions: number;
  attempted: number;
  correct: number;
  status: "Completed" | "In Progress" | "Pending";
  generatedQuestions?: any[];
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  examDate: string;
  myScore: number;
  maxScore: number;
  duration: string;
  myRank: number | null;
  totalStudents: number;
  myAccuracy?: number;
  attempted?: boolean;
}

interface Question {
  q: string;
  o: string[];
  a: number; // index of correct option
  exp: string; // explanation
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const studyTips = [
  {
    category: "Biology",
    icon: "fi-rr-leaf",
    color: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-800",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    title: "100% NCERT Biology Line-by-Line Mastery",
    desc: "Over 95% of NEET Biology questions come directly verbatim from NCERT textbooks. Read line-by-line, annotate margins, and memorize all diagram labels and summary tables.",
    action: "Target: 340+ / 360 Marks",
    badge: "High Yield (360 Marks)"
  },
  {
    category: "Chemistry",
    icon: "fi-rr-flask",
    color: "pink",
    bg: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 border-pink-200 dark:border-pink-800",
    badgeBg: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    title: "Organic Reaction Maps & Inorganic Mnemonics",
    desc: "Create a wall chart of all Organic Name Reactions, Reagents & Mechanisms. For Inorganic Chemistry, master periodic trends, oxidation states, and s/p/d block exception rules.",
    action: "Target: 150+ / 180 Marks",
    badge: "Chemistry Hacks"
  },
  {
    category: "Physics",
    icon: "fi-rr-bolt",
    color: "blue",
    bg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    title: "Formula Cheat Sheet & Extreme Unit Tricks",
    desc: "Maintain a dedicated Physics Formula notebook. Practice 30 numerical problems daily. Use dimensional analysis and extreme value elimination to crack complex questions under 60 sec.",
    action: "Target: 140+ / 180 Marks",
    badge: "Speed & Accuracy"
  },
  {
    category: "Strategy",
    icon: "fi-rr-clock-three",
    color: "amber",
    bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    title: "200-Minute Exam Time Management Plan",
    desc: "Allocate exam time strategically: Biology (45 mins) ➔ Chemistry (45 mins) ➔ Physics (60 mins) ➔ OMR Bubbling & Review (30 mins). Never spend over 2 minutes on any single question!",
    action: "Exam Time Breakdown",
    badge: "Time Management"
  },
  {
    category: "Strategy",
    icon: "fi-rr-cross-circle",
    color: "red",
    bg: "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-800",
    badgeBg: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    title: "Avoid Negative Marking Penalties (-1 Mark)",
    desc: "Each wrong attempt costs -1 mark. If you cannot eliminate at least 2 options, skip the question. Leaving 10 risky questions unattempted saves you 10 precious marks!",
    action: "+4 / -1 Rule Control",
    badge: "Score Saver"
  },
  {
    category: "Strategy",
    icon: "fi-rr-document-signed",
    color: "indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-200 dark:border-indigo-800",
    badgeBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    title: "Solve 15 Years of NEET & AIPMT PYQs",
    desc: "Solve 2010–2025 PYQs under strictly timed conditions. Over 70% of real NEET exam concepts repeat with modified numerical values or swapped option order.",
    action: "15 Years Question Bank",
    badge: "70% Question Repeat"
  },
  {
    category: "Method",
    icon: "fi-rr-brain",
    color: "violet",
    bg: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 border-violet-200 dark:border-violet-800",
    badgeBg: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    title: "Active Recall & Spaced Repetition Cycle",
    desc: "Close your textbook after each chapter and sketch diagrams or write key formulas from memory. Revisit Biology topics on Day 1, Day 3, Day 7, and Day 21 to build long-term memory.",
    action: "Long-term Memory",
    badge: "Active Learning"
  },
  {
    category: "Strategy",
    icon: "fi-rr-sparkles",
    color: "teal",
    bg: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 border-teal-200 dark:border-teal-800",
    badgeBg: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    title: "Mock Test Post-Mortem & Error Notebook",
    desc: "Maintain an 'Error Journal'. For every wrong answer in a mock test, record: 1) Why you got it wrong (Conceptual vs Calculation vs Silly mistake), 2) Correct solution key.",
    action: "Zero Error Strategy",
    badge: "Score Booster"
  }
];

const subjectGradient: Record<Subject, string> = {
  Biology: "from-emerald-500 to-teal-500",
  Chemistry: "from-pink-500 to-rose-500",
  Physics: "from-blue-500 to-indigo-500",
};

const subjectBadge: Record<Subject, string> = {
  Biology: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Chemistry: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const diffColor: Record<Difficulty, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const chapterQuestions: Record<Subject, Question[]> = {
  Biology: [
    { q: "Which organelle is referred to as the powerhouse of the cell?", o: ["Mitochondria", "Nucleus", "Ribosome", "Lysosome"], a: 0, exp: "Mitochondria produce ATP through cellular respiration, earning them the powerhouse title." },
    { q: "Who discovered the nucleus in the cell?", o: ["Robert Hooke", "Robert Brown", "Antoni van Leeuwenhoek", "Rudolf Virchow"], a: 1, exp: "Robert Brown discovered the nucleus in orchid roots in 1831." },
    { q: "What is the primary site of protein synthesis in a cell?", o: ["Golgi apparatus", "Ribosome", "Lysosome", "Centrosome"], a: 1, exp: "Ribosomes translate mRNA into amino acid chains to synthesize proteins." },
    { q: "Which of the following is responsible for cell division in animal cells?", o: ["Chloroplast", "Centrosome", "Mitochondria", "Vacuole"], a: 1, exp: "Centrosomes organize microtubules during animal cell division (mitosis)." },
    { q: "Which phase of mitosis involves chromosomes aligning at the cell equator?", o: ["Prophase", "Metaphase", "Anaphase", "Telophase"], a: 1, exp: "During Metaphase, chromosomes attach to spindle fibers and line up along the metaphase plate." },
    { q: "Who is known as the Father of Genetics?", o: ["Charles Darwin", "Gregor Mendel", "Jean Lamarck", "Hugo de Vries"], a: 1, exp: "Gregor Mendel formulated the fundamental laws of inheritance through pea plant experiments." },
    { q: "Who proposed the double-helix model of DNA?", o: ["Hershey and Chase", "Watson and Crick", "Meselson and Stahl", "Avery, MacLeod, and McCarty"], a: 1, exp: "James Watson and Francis Crick proposed the double-helix model of DNA in 1953." },
    { q: "Which enzyme is responsible for unwinding the DNA double helix during replication?", o: ["DNA Polymerase", "Helicase", "DNA Ligase", "RNA Polymerase"], a: 1, exp: "Helicase breaks hydrogen bonds between nitrogenous bases to unwind DNA." },
    { q: "Which blood group is considered the universal recipient?", o: ["O positive", "AB positive", "A positive", "B negative"], a: 1, exp: "AB positive individuals have both A and B antigens and lack anti-A and anti-B antibodies." },
    { q: "Which blood group is considered the universal donor?", o: ["AB positive", "O negative", "A negative", "B positive"], a: 1, exp: "O negative red blood cells lack A, B, and Rh antigens, preventing immune rejection." },
    { q: "What is the structural and functional unit of the human kidney?", o: ["Neuron", "Nephron", "Alveoli", "Hepatocyte"], a: 1, exp: "Nephrons filter blood, reabsorb nutrients, and produce urine in kidneys." },
    { q: "Which hormone regulates blood glucose levels by promoting glucose uptake in cells?", o: ["Glucagon", "Insulin", "Thyroxine", "Adrenaline"], a: 1, exp: "Insulin secreted by pancreatic beta cells lowers blood glucose levels." },
    { q: "What is the structural and functional unit of the nervous system?", o: ["Nephron", "Neuron", "Axon", "Synapse"], a: 1, exp: "Neurons transmit electrical and chemical signals throughout the nervous system." },
    { q: "Which gas is primarily absorbed by green plants during photosynthesis?", o: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], a: 1, exp: "Plants take in CO2 through stomata for carbon fixation in the Calvin cycle." },
    { q: "Which plant tissue is responsible for transporting water and minerals from roots to leaves?", o: ["Phloem", "Xylem", "Cambium", "Epidermis"], a: 1, exp: "Xylem vessels transport water and dissolved minerals unidirectionally upwards." },
    { q: "Which plant tissue transports organic food materials synthesized in leaves?", o: ["Xylem", "Phloem", "Pith", "Cortex"], a: 1, exp: "Phloem transports sucrose and nutrients via translocation bidirectionally." },
    { q: "How many chambers are present in a normal human heart?", o: ["2", "3", "4", "5"], a: 2, exp: "The human heart consists of 2 atria and 2 ventricles (4 chambers)." },
    { q: "Which endocrine gland is known as the master gland of the human body?", o: ["Thyroid gland", "Pituitary gland", "Adrenal gland", "Pancreas"], a: 1, exp: "The pituitary gland regulates multiple other endocrine glands via tropic hormones." },
    { q: "Which vitamin is synthesized in human skin upon exposure to sunlight?", o: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], a: 2, exp: "UV-B rays convert 7-dehydrocholesterol in skin cells into Vitamin D3." },
    { q: "Which blood components are primarily responsible for fighting pathogens?", o: ["Erythrocytes", "Leukocytes", "Thrombocytes", "Plasma"], a: 1, exp: "Leukocytes (White Blood Cells) orchestrate immune responses against infections." },
    { q: "Which cell division process reduces the chromosome number by half to form gametes?", o: ["Mitosis", "Meiosis", "Amitosis", "Binary fission"], a: 1, exp: "Meiosis produces haploid gametes (n) from diploid germ cells (2n)." },
    { q: "What is the primary energy currency of biological cells?", o: ["ADP", "ATP", "NADPH", "GTP"], a: 1, exp: "ATP (Adenosine Triphosphate) stores and yields energy for cellular functions." },
    { q: "Through which microscopic pores does maximum transpiration occur in plant leaves?", o: ["Lenticels", "Stomata", "Cuticle", "Hydathodes"], a: 1, exp: "Stomata regulate water vapor loss and gas exchange in leaves." },
    { q: "Where does fertilisation normally take place in the human female reproductive system?", o: ["Uterus", "Fallopian tube (Ampulla)", "Ovary", "Cervix"], a: 1, exp: "Fertilisation occurs at the ampullary-isthmic junction of the Fallopian tube." },
    { q: "Which organ secretes bile juice for lipid digestion?", o: ["Gallbladder", "Liver", "Pancreas", "Stomach"], a: 1, exp: "The liver produces bile, which is stored in the gallbladder and emulsifies fats." }
  ],
  Chemistry: [
    { q: "Which element in the periodic table possesses the highest electronegativity?", o: ["Oxygen", "Fluorine", "Nitrogen", "Chlorine"], a: 1, exp: "Fluorine is the most electronegative element with a Pauling value of 4.0." },
    { q: "What is the hybridisation of carbon in methane (CH4)?", o: ["sp", "sp2", "sp3", "dsp2"], a: 2, exp: "Methane has 4 single sigma bonds resulting in tetrahedral sp3 hybridisation." },
    { q: "Which gas law states that volume is directly proportional to absolute temperature at constant pressure?", o: ["Boyle's Law", "Charles's Law", "Avogadro's Law", "Dalton's Law"], a: 1, exp: "Charles's Law states V ∝ T at constant pressure." },
    { q: "Which gas is liberated when sodium metal reacts with water?", o: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"], a: 1, exp: "2Na + 2H2O -> 2NaOH + H2 (gas)." },
    { q: "What is the pH of a 10⁻³ M aqueous HCl solution?", o: ["3", "7", "11", "1.3"], a: 0, exp: "pH = -log[H+] = -log(10⁻³) = 3." },
    { q: "In the metallurgy of iron, limestone (CaCO3) is added to the blast furnace to act as:", o: ["Reducing agent", "Flux", "Gangue", "Fuel"], a: 1, exp: "Limestone decomposes to CaO which acts as a basic flux, combining with SiO2 gangue to form CaSiO3 slag." },
    { q: "Which metallurgical refining process is used for the purification of Nickel?", o: ["Mond Process", "Van Arkel Process", "Zone Refining", "Liquation"], a: 0, exp: "Mond process converts nickel to volatile nickel tetracarbonyl Ni(CO)4 and decomposes it to pure Ni." },
    { q: "Which concentration method is widely used for sulfide ores such as Galena (PbS)?", o: ["Gravity separation", "Froth Floatation", "Leaching", "Magnetic separation"], a: 1, exp: "Froth floatation uses pine oil collector to preferentially wet sulfide ore particles." },
    { q: "Blister copper is obtained by reducing copper matte in which vessel?", o: ["Blast Furnace", "Bessemer Converter", "Reverberatory Furnace", "Electric Arc Furnace"], a: 1, exp: "Bessemerisation of copper matte produces blister copper with trapped SO2 bubbles." },
    { q: "Bauxite (Al2O3·2H2O) ore of Aluminium is purified by which process?", o: ["Leaching (Bayer's Process)", "Zone Refining", "Distillation", "Poling"], a: 0, exp: "Bayer's process uses concentrated NaOH solution to leach alumina from bauxite ore." },
    { q: "Zone refining is primarily employed for producing ultra-pure samples of:", o: ["Iron & Copper", "Silicon & Germanium", "Gold & Silver", "Sodium & Potassium"], a: 1, exp: "Zone refining produces semiconductor grade high-purity Silicon and Germanium." },
    { q: "Why is Cryolite (Na3AlF6) added to molten alumina in the Hall-Heroult electrolytic process?", o: ["To precipitate impurities", "To lower melting point & increase electrical conductivity", "To act as oxidising agent", "To prevent corrosion"], a: 1, exp: "Cryolite lowers the melting point of Al2O3 from 2050°C to ~950°C and increases conductivity." },
    { q: "Which extraction technique is used to extract Gold and Silver using cyanide solution?", o: ["MacArthur-Forrest Cyanide Process", "Hall-Heroult Process", "Pidgeon Process", "Kroll Process"], a: 0, exp: "Gold and Silver dissolve in dilute NaCN solution to form soluble cyano complexes." },
    { q: "What is the composition of German Silver alloy?", o: ["Cu + Zn + Ni", "Cu + Sn + Ag", "Cu + Ag + Au", "Fe + Cr + Ni"], a: 0, exp: "German Silver consists of Copper (50%), Zinc (30%), and Nickel (20%) — it contains NO silver." },
    { q: "Calcination process involves heating the ore in:", o: ["Excess air below melting point", "Absence or limited supply of air", "Presence of flux only", "Electric arc at 3000°C"], a: 1, exp: "Calcination expels volatile impurities and moisture in the absence or limited supply of air." },
    { q: "Roasting process is generally applied to which class of ores?", o: ["Carbonate ores", "Sulfide ores", "Oxide ores", "Halide ores"], a: 1, exp: "Roasting heats sulfide ores in excess oxygen to convert them into metal oxides and SO2 gas." },
    { q: "Van Arkel method is utilized for ultra-refining of which metals?", o: ["Zirconium & Titanium", "Copper & Zinc", "Lead & Tin", "Aluminum & Iron"], a: 0, exp: "Van Arkel method converts Zr/Ti to volatile iodides (ZrI4) and thermally decomposes them on tungsten filament." },
    { q: "Which gas is released causing blister-like surface on blister copper?", o: ["CO2", "SO2", "NO2", "H2S"], a: 1, exp: "Escaping Sulfur Dioxide (SO2) bubbles create blisters on cooling copper." },
    { q: "What is the chemical formula of the slag formed during Iron extraction?", o: ["FeSiO3", "CaSiO3", "MgSiO3", "Al2SiO5"], a: 1, exp: "CaO (flux) + SiO2 (gangue) -> CaSiO3 (calcium silicate slag)." },
    { q: "Cinnabar is the principal ore of which metal?", o: ["Lead", "Mercury (HgS)", "Copper", "Zinc"], a: 1, exp: "Cinnabar is Mercury(II) sulfide (HgS)." },
    { q: "Volatile metals with low boiling points like Zinc and Mercury are refined by:", o: ["Liquation", "Distillation", "Poling", "Zone refining"], a: 1, exp: "Distillation vaporizes low-boiling metals leaving non-volatile impurities behind." },
    { q: "Poling process uses green wood poles to refine molten copper by reducing:", o: ["Cu2S", "Cuprous oxide (Cu2O)", "CuO", "FeS"], a: 1, exp: "Hydrocarbons from green wood logs reduce residual Cu2O to pure copper metal." },
    { q: "Siderite is a mineral ore containing:", o: ["FeCO3", "Fe2O3", "Fe3O4", "FeS2"], a: 0, exp: "Siderite is iron(II) carbonate (FeCO3)." },
    { q: "Which oxidation state of Iron exists in Magnetite (Fe3O4)?", o: ["+2 only", "+3 only", "Mixed +2 and +3", "+4"], a: 2, exp: "Fe3O4 is a mixed oxide composed of FeO (+2) and Fe2O3 (+3)." },
    { q: "What is the role of collector in Froth Floatation process?", o: ["To enhance non-wettability of mineral particles", "To create froth", "To dissolve ore", "To neutralize flux"], a: 0, exp: "Collectors like potassium ethyl xanthate make mineral particles water-repellent." }
  ],
  Physics: [
    { q: "In Wave Optics, what causes the alternating bright and dark fringes in Young's double slit experiment?", o: ["Diffraction", "Interference", "Polarization", "Refraction"], a: 1, exp: "Interference of light waves from coherent sources produces the alternate fringes." },
    { q: "What is the focal length of a plane mirror?", o: ["Zero", "Infinite", "10 cm", "Dependent on object distance"], a: 1, exp: "A plane mirror has no curvature, so its center of curvature and focal length are at infinity." },
    { q: "Which of the following phenomena proves the transverse nature of light waves?", o: ["Interference", "Diffraction", "Polarization", "Photoelectric Effect"], a: 2, exp: "Only transverse waves can be polarized; longitudinal waves (like sound) cannot." },
    { q: "What is the SI unit of magnetic flux?", o: ["Tesla", "Weber", "Henry", "Farad"], a: 1, exp: "Weber (Wb) is the SI unit of magnetic flux; Tesla is the unit of magnetic field strength." },
    { q: "What happens to the electrical resistance of a semiconductor as temperature increases?", o: ["Increases", "Decreases", "Remains same", "First increases then decreases"], a: 1, exp: "Semiconductors have a negative temperature coefficient of resistance, so resistance decreases as temperature rises." },
    { q: "The threshold frequency in photoelectric effect depends on which factor?", o: ["Intensity of incident light", "Work function of target metal", "Distance of light source", "Angle of incidence"], a: 1, exp: "Threshold frequency hν0 = W0 depends entirely on the metal work function." },
    { q: "What is the de Broglie wavelength formula for a particle of momentum p?", o: ["λ = hp", "λ = h/p", "λ = p/h", "λ = h/p²"], a: 1, exp: "De Broglie relation states λ = h/p = h/(mv)." },
    { q: "Stopping potential in photoelectric effect is directly proportional to:", o: ["Light intensity", "Frequency of incident radiation", "Time of exposure", "Surface area of emitter"], a: 1, exp: "eV0 = hν - W0; stopping potential depends linearly on incident light frequency." },
    { q: "What is the slope of the graph plotted between stopping potential (V0) and frequency (ν)?", o: ["h", "h/e", "e/h", "W0"], a: 1, exp: "Since V0 = (h/e)ν - W0/e, the slope equals h/e." },
    { q: "Which metal has the lowest work function making it ideal for photoelectric emitters?", o: ["Copper", "Cesium", "Platinum", "Iron"], a: 1, exp: "Cesium has a very low work function (~2.14 eV) allowing photoelectric emission with visible light." },
    { q: "A light-year is a unit used to measure:", o: ["Time", "Distance", "Speed of light", "Intensity of stellar light"], a: 1, exp: "A light-year is the distance light travels in one Julian year in vacuum (~9.46 × 10¹⁵ m)." },
    { q: "What are the dimensional formulas of Planck's constant (h)?", o: ["[ML²T⁻¹]", "[ML²T⁻²]", "[MLT⁻¹]", "[M⁰L⁰T⁻¹]"], a: 0, exp: "E = hν => [h] = [ML²T⁻²]/[T⁻¹] = [ML²T⁻¹]." },
    { q: "Under what condition does total internal reflection occur?", o: ["Light travels from rarer to denser medium at any angle", "Light travels from denser to rarer medium at angle > critical angle", "Light strikes normal to boundary", "Light frequency changes"], a: 1, exp: "TIR requires light traveling from denser to rarer medium with angle of incidence exceeding critical angle." },
    { q: "What is the SI unit of electric capacitance?", o: ["Ohm", "Farad", "Coulomb", "Volt"], a: 1, exp: "Farad (F) = Coulomb per Volt (C/V)." },
    { q: "What is the internal resistance of an ideal ammeter?", o: ["Infinite", "Zero", "100 Ohms", "1 Ohm"], a: 1, exp: "An ideal ammeter has zero resistance so it does not alter circuit current when connected in series." },
    { q: "What is the internal resistance of an ideal voltmeter?", o: ["Zero", "Infinite", "1 Ohm", "1000 Ohms"], a: 1, exp: "An ideal voltmeter has infinite resistance so no current flows through it in parallel." },
    { q: "Lenz's law of electromagnetic induction is a direct consequence of which conservation law?", o: ["Conservation of Charge", "Conservation of Energy", "Conservation of Momentum", "Conservation of Mass"], a: 1, exp: "Lenz's law ensures mechanical work spent moving a magnet converts to electrical energy." },
    { q: "What is the SI unit of self-inductance?", o: ["Tesla", "Weber", "Henry", "Farad"], a: 2, exp: "Henry (H) is the SI unit of electrical inductance." },
    { q: "An electrical transformer operates on the principle of:", o: ["Self-induction", "Mutual induction", "Joule heating", "Piezoelectric effect"], a: 1, exp: "Transformers transfer energy between primary and secondary coils via mutual magnetic induction." },
    { q: "Electromagnetic waves are characteristically:", o: ["Longitudinal pressure waves", "Transverse in nature", "Mechanical sound waves", "Stationary matter waves"], a: 1, exp: "EM waves consist of mutually perpendicular oscillating electric and magnetic fields perpendicular to wave propagation." },
    { q: "What is the formula for the speed of light c in vacuum?", o: ["c = 1/√(μ₀ε₀)", "c = √(μ₀/ε₀)", "c = μ₀ε₀", "c = 1/(μ₀ε₀)"], a: 0, exp: "Maxwell proved c = 1/√(μ₀ε₀) in free space." },
    { q: "What is the half-life period (T1/2) relation with decay constant (λ) in radioactivity?", o: ["T1/2 = 0.693/λ", "T1/2 = λ/0.693", "T1/2 = 1/λ", "T1/2 = 0.693 × λ"], a: 0, exp: "T1/2 = ln(2)/λ = 0.693/λ." },
    { q: "Which ray among the following has the highest penetrating power?", o: ["Alpha rays", "Beta rays", "Gamma rays", "Cathode rays"], a: 2, exp: "Gamma rays are high-energy photons with uncharged nature, giving them maximum penetrating depth." },
    { q: "What happens to the focal length of a convex lens when immersed in water?", o: ["Decreases", "Increases", "Remains unchanged", "Becomes zero"], a: 1, exp: "Relative refractive index decreases in water, causing the focal length to increase." },
    { q: "In a p-n junction diode under reverse bias condition, the depletion layer width:", o: ["Decreases", "Increases", "Remains constant", "Disappears"], a: 1, exp: "Reverse bias pulls majority carriers away from the junction, widening the depletion region." }
  ]
};

export default function StudentNEETPrepPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [myTests, setMyTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"syllabus" | "tests" | "tips" | "gemini">("syllabus");
  const [filterSubject, setFilterSubject] = useState<"All" | Subject>("All");
  const [tipsCategoryFilter, setTipsCategoryFilter] = useState<string>("All");

  // Practice States
  const [activePracticeChapter, setActivePracticeChapter] = useState<Chapter | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionAttempted, setSessionAttempted] = useState(0);
  const [savingPractice, setSavingPractice] = useState(false);

  // Gemini AI States
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState<Subject>("Biology");
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>("Medium");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(25);
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    if (!schoolId) return;
    try {
      const params = new URLSearchParams();
      params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/chapters?${params}`);
      const data = await res.json();
      if (data.success) setChapters(data.data);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchTests = useCallback(async () => {
    if (!schoolId) return;
    try {
      const params = new URLSearchParams();
      params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/mock-tests?${params}`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((t: any) => {
          const isAttempted = Boolean(t.totalStudents > 0 || t.avgScore > 0 || t.topScore > 0 || t.myScore > 0);
          const score = t.myScore !== undefined ? t.myScore : (t.avgScore || 0);
          const max = t.maxScore || 720;
          const accuracy = isAttempted && max > 0 ? Math.round((score / max) * 100) : 0;
          const rank = isAttempted ? (t.myRank || 1) : null;
          return {
            id: t.id,
            title: t.title,
            subject: t.subject,
            examDate: t.examDate,
            myScore: score,
            maxScore: max,
            duration: t.duration,
            myRank: rank,
            totalStudents: t.totalStudents || 0,
            myAccuracy: accuracy,
            attempted: isAttempted,
          };
        });
        setMyTests(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchAll = useCallback(async () => {
    if (status === "loading") return;
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.all([fetchSyllabus(), fetchTests()]);
    setLoading(false);
  }, [fetchSyllabus, fetchTests, schoolId, status]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const startPracticeSession = async (ch: Chapter) => {
    if (ch.generatedQuestions && ch.generatedQuestions.length > 0) {
      const mappedQuestions = ch.generatedQuestions.map((q: any) => {
        const ansLetter = String(q.answer).charAt(0).toUpperCase();
        const ansIndex = ansLetter === "A" ? 0 : ansLetter === "B" ? 1 : ansLetter === "C" ? 2 : ansLetter === "D" ? 3 : 0;
        
        // Strip prefix "A) " or "A." if it exists in options for cleaner UI
        const cleanOptions = (q.options || ["A", "B", "C", "D"]).map((opt: string) => {
          return opt.replace(/^[A-D][\.\)]\s*/i, "");
        });

        return {
          q: q.text,
          o: cleanOptions,
          a: ansIndex,
          exp: `This is a model solution generated by Gemini AI for topic: "${ch.chapter}".`,
        };
      });

      setPracticeQuestions(mappedQuestions);
      setCurrentQIndex(ch.attempted < mappedQuestions.length ? ch.attempted : 0);
      setSessionAttempted(0);
      setSelectedAns(null);
      setShowExplanation(false);
      setCorrectCount(0);
      setActivePracticeChapter(ch);
    } else {
      Swal.fire({
        icon: "info",
        title: "No Questions Available",
        text: "Please ask your teacher to generate practice questions for this chapter.",
      });
    }
  };

  const startMockTestSession = (test: MockTest) => {
    const subKey: Subject = (test.subject === "Full Syllabus" ? "Chemistry" : test.subject) as Subject;
    const basePool = chapterQuestions[subKey] || chapterQuestions["Chemistry"];

    // Determine target question count dynamically from Max Score (e.g., 400 marks = 100 Qs, 720 marks = 180 Qs, 200 marks = 50 Qs)
    let targetCount = 25;
    if (test.maxScore >= 700) targetCount = 180;
    else if (test.maxScore >= 350) targetCount = 100;
    else if (test.maxScore >= 180) targetCount = 50;
    else if (test.maxScore >= 90) targetCount = 25;

    // Expand pool to match exact targetCount (e.g. 100 questions for 400 marks)
    const expandedPool: Question[] = [];
    for (let i = 0; i < targetCount; i++) {
      const baseQ = basePool[i % basePool.length];
      expandedPool.push({
        q: `[Q${i + 1}] ${baseQ.q}`,
        o: baseQ.o,
        a: baseQ.a,
        exp: baseQ.exp,
      });
    }

    setPracticeQuestions(expandedPool);
    setCurrentQIndex(0);
    setSessionAttempted(0);
    setSelectedAns(null);
    setShowExplanation(false);
    setCorrectCount(0);
    setActivePracticeChapter({
      id: `test-${test.id}`,
      subject: test.subject as any,
      chapter: `📝 Mock Exam: ${test.title}`,
      difficulty: "Medium",
      totalQuestions: expandedPool.length,
      attempted: 0,
      correct: 0,
      status: "Pending",
    });

    Swal.fire({
      icon: "info",
      title: `Starting ${targetCount}-Question NEET Mock Test`,
      text: `Mock Exam: "${test.title}" (${test.duration}). ${targetCount} Questions loaded!`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleSelectOption = (idx: number) => {
    if (selectedAns !== null) return; // already answered
    setSelectedAns(idx);
    setShowExplanation(true);
    setSessionAttempted((prev) => prev + 1);
    if (idx === practiceQuestions[currentQIndex].a) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQ = () => {
    setSelectedAns(null);
    setShowExplanation(false);
    if (currentQIndex + 1 < practiceQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      savePracticeResults();
    }
  };

  const handleGenerateGeminiQuestions = async () => {
    if (!aiTopic.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Topic Required",
        text: "Please enter a topic title for Gemini to generate practice questions.",
      });
    }

    setGeneratingAi(true);
    try {
      const res = await fetch(`${API}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: "12",
          subject: aiSubject,
          topic: aiTopic.trim(),
          difficulty: aiDifficulty,
          mcqCount: aiQuestionCount,
          shortCount: 0,
          longCount: 0,
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const mappedQuestions = data.data.map((q: any) => {
          const ansLetter = String(q.answer).charAt(0).toUpperCase();
          const ansIndex = ansLetter === "A" ? 0 : ansLetter === "B" ? 1 : ansLetter === "C" ? 2 : ansLetter === "D" ? 3 : 0;
          return {
            q: q.text,
            o: q.options || ["A", "B", "C", "D"],
            a: ansIndex,
            exp: `This is a model solution generated by Gemini AI for topic: "${aiTopic.trim()}".`,
          };
        });

        setPracticeQuestions(mappedQuestions);
        setCurrentQIndex(0);
        setSelectedAns(null);
        setShowExplanation(false);
        setCorrectCount(0);
        setActivePracticeChapter({
          id: "gemini",
          subject: aiSubject,
          chapter: `🤖 AI: ${aiTopic.trim()}`,
          difficulty: aiDifficulty,
          totalQuestions: mappedQuestions.length,
          attempted: 0,
          correct: 0,
          status: "Pending",
        });

        Swal.fire({
          icon: "success",
          title: "AI Questions Generated!",
          text: `Gemini has generated ${mappedQuestions.length} customized mock questions on "${aiTopic.trim()}". Starting practice...`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "AI Generation Failed",
          text: data.error || "Failed to generate AI questions. Please try again.",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Failed to connect to the Gemini AI API.",
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const savePracticeResults = async (earlyClose: boolean = false) => {
    if (!activePracticeChapter) return;
    
    if (earlyClose && sessionAttempted === 0) {
      setActivePracticeChapter(null);
      return;
    }

    setSavingPractice(true);
    const addedAttempted = sessionAttempted;
    const addedCorrect = correctCount;

    if (activePracticeChapter.id.startsWith("test-")) {
      const realTestId = activePracticeChapter.id.replace("test-", "");
      const totalTestQs = activePracticeChapter.totalQuestions || 100;

      // Real NEET Marking Scheme (+4 for correct, -1 for wrong)
      const incorrectCount = Math.max(0, addedAttempted - addedCorrect);
      const rawScore = (addedCorrect * 4) - (incorrectCount * 1);
      const targetTest = myTests.find((t) => t.id === realTestId);
      const maxScore = targetTest?.maxScore || (totalTestQs * 4);
      const calculatedScore = Math.max(0, Math.min(rawScore, maxScore));
      const accuracyPct = addedAttempted > 0 ? Math.round((addedCorrect / addedAttempted) * 100) : 0;

      // Save student test attempt to PostgreSQL database
      try {
        const currentTotalStudents = targetTest?.totalStudents || 0;
        const newTotalStudents = Math.max(currentTotalStudents + 1, 1);
        const currentTopScore = targetTest?.myScore || 0;
        const newTopScore = Math.max(currentTopScore, calculatedScore);

        await fetch(`${API}/api/neet-prep/mock-tests/${realTestId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avgScore: calculatedScore,
            topScore: newTopScore,
            totalStudents: newTotalStudents,
          }),
        });
      } catch (e) {
        console.error("Failed to update mock test DB:", e);
      }

      setMyTests((prev) =>
        prev.map((t) =>
          t.id === realTestId
            ? {
                ...t,
                myScore: calculatedScore,
                myRank: 1,
                myAccuracy: accuracyPct,
                attempted: true,
                totalStudents: Math.max(t.totalStudents + 1, 1),
              }
            : t
        )
      );

      fetchTests();

      setSavingPractice(false);
      setActivePracticeChapter(null);

      Swal.fire({
        title: "<i class='fi fi-rr-trophy text-amber-500 mr-1.5'></i> NEET Mock Test Results",
        html: `
          <div class="text-sm space-y-2 mt-3 text-left">
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div class="flex justify-between"><span>Questions Attempted:</span> <b>${addedAttempted} / ${totalTestQs}</b></div>
              <div class="flex justify-between text-emerald-600"><span>Correct Answers (+4):</span> <b>+${addedCorrect * 4} marks (${addedCorrect} Qs)</b></div>
              <div class="flex justify-between text-red-500"><span>Incorrect Penalty (-1):</span> <b>-${incorrectCount} marks (${incorrectCount} Qs)</b></div>
            </div>
            <div class="text-center pt-2">
              <div class="text-2xl font-black text-slate-800 dark:text-white">${calculatedScore} / ${maxScore} Marks</div>
              <div class="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs mt-1">
                <i class="fi fi-rr-bullseye mr-1"></i> Accuracy: ${accuracyPct}% · Rank: #1
              </div>
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "View My Score",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (activePracticeChapter.id === "gemini") {
      setSavingPractice(false);
      setActivePracticeChapter(null);
      const accuracyPct = Math.round((addedCorrect / addedAttempted) * 100);
      Swal.fire({
        title: "<i class='fi fi-rr-sparkles text-violet-500 mr-1.5'></i> AI Practice Completed!",
        html: `
          <div class="text-sm space-y-2 mt-3">
            <p>You answered <b>${addedCorrect}</b> out of <b>${addedAttempted}</b> correctly.</p>
            <div class="inline-block bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full font-bold text-xs">
              <i class="fi fi-rr-bullseye mr-1"></i> AI Accuracy: ${accuracyPct}%
            </div>
            <p class="text-slate-500 italic mt-2">Excellent job! This AI generated topic has been completed.</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Done",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    let newAttempted = activePracticeChapter.attempted;
    let newCorrect = activePracticeChapter.correct;
    
    if (activePracticeChapter.attempted < activePracticeChapter.totalQuestions) {
      newAttempted = Math.min(activePracticeChapter.attempted + addedAttempted, activePracticeChapter.totalQuestions);
      newCorrect = Math.min(activePracticeChapter.correct + addedCorrect, newAttempted);
    }
    
    let newStatus: "Completed" | "In Progress" | "Pending" = "In Progress";
    if (newAttempted >= activePracticeChapter.totalQuestions) {
      newStatus = "Completed";
    }

    try {
      const res = await fetch(`${API}/api/neet-prep/chapters/${activePracticeChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activePracticeChapter.subject,
          chapter: activePracticeChapter.chapter,
          difficulty: activePracticeChapter.difficulty,
          totalQuestions: activePracticeChapter.totalQuestions,
          attempted: newAttempted,
          correct: newCorrect,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSyllabus();
        const accuracyPct = Math.round((addedCorrect / addedAttempted) * 100);
        Swal.fire({
          title: "<i class='fi fi-rr-trophy text-red-500 mr-1.5'></i> Practice Completed!",
          html: `
            <div class="text-sm space-y-2 mt-3">
              <p>You answered <b>${addedCorrect}</b> out of <b>${addedAttempted}</b> correctly.</p>
              <div class="inline-block bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold text-xs">
                <i class="fi fi-rr-bullseye mr-1"></i> Accuracy: ${accuracyPct}%
              </div>
              <p class="text-slate-500 italic mt-2">Chapter status: <b>${newStatus}</b></p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Done",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({ icon: "error", title: "Error Saving Results", text: data.error || "Failed to update db." });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to the database." });
    } finally {
      setSavingPractice(false);
      setActivePracticeChapter(null);
    }
  };

  const totalAttempted = chapters.reduce((a, c) => a + c.attempted, 0);
  const totalCorrect = chapters.reduce((a, c) => a + c.correct, 0);
  const chapterAcc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  
  const attemptedTests = myTests.filter((t) => t.attempted || t.myScore > 0 || (t.totalStudents || 0) > 0);
  const bestTest = attemptedTests.length > 0 ? attemptedTests.reduce((best, cur) => (cur.myScore > best.myScore ? cur : best), attemptedTests[0]) : null;
  const bestScoreVal = bestTest ? `${bestTest.myScore}/${bestTest.maxScore}` : "0";
  
  const testAccSum = attemptedTests.reduce((sum, t) => sum + (t.myAccuracy !== undefined ? t.myAccuracy : (t.maxScore > 0 ? Math.round((t.myScore / t.maxScore) * 100) : 0)), 0);
  const testAccAvg = attemptedTests.length > 0 ? Math.round(testAccSum / attemptedTests.length) : 0;
  
  const overallAccuracy = attemptedTests.length > 0 ? testAccAvg : chapterAcc;
  const completed = chapters.filter((c) => c.status === "Completed").length;

  const filteredChapters = chapters.filter(
    (c) => filterSubject === "All" || c.subject === filterSubject
  );

  return (
    <PortalLayout title="NEET Preparation" subtitle="Track your syllabus, mock tests & performance for NEET success" accentColor="#ef4444">
      <div className="space-y-6 animate-in fade-in duration-300">

        {/* ── Hero Banner Icon Update ──────────────────────────── */}
        <div 
          className="relative overflow-hidden rounded-3xl text-white p-6 md:p-8 shadow-xl border border-rose-500/20"
          style={{ background: "linear-gradient(135deg, #dc2626 0%, #f43f5e 50%, #db2777 100%)" }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            :root:not(.dark) .banner-title,
            .banner-title {
              color: #ffffff !important;
            }
            :root:not(.dark) .banner-desc,
            .banner-desc {
              color: rgba(255, 255, 255, 0.85) !important;
            }
            :root:not(.dark) .banner-stat-val,
            .banner-stat-val {
              color: #ffffff !important;
            }
            :root:not(.dark) .banner-stat-lbl,
            .banner-stat-lbl {
              color: rgba(255, 255, 255, 0.7) !important;
            }
            :root:not(.dark) .banner-stat-icon,
            .banner-stat-icon {
              color: rgba(255, 255, 255, 0.9) !important;
            }
          ` }} />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-white">
            <i className="fi fi-rr-dna text-[120px] leading-none" />
          </div>
          <div className="relative z-10 text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 shadow-sm border border-white/10">
              <i className="fi fi-rr-bullseye mr-1 text-[10px]" /> NEET UG 2026 Target
            </span>
            <h2 className="banner-title text-2xl md:text-3xl font-black tracking-tight mb-2">Your NEET Dashboard</h2>
            <p className="banner-desc text-xs md:text-sm font-medium max-w-lg leading-relaxed">
              Every chapter you complete brings you one step closer to your medical dream. Track your Biology, Chemistry & Physics progress here.
            </p>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Chapters Done", value: `${completed}/${chapters.length}`, icon: <i className="banner-stat-icon fi fi-rr-book-alt text-sm" /> },
                { label: "Overall Accuracy", value: `${overallAccuracy}%`, icon: <i className="banner-stat-icon fi fi-rr-bullseye text-sm" /> },
                { label: "Best Mock Score", value: bestScoreVal, icon: <i className="banner-stat-icon fi fi-rr-trophy text-sm" /> },
                { label: "Mock Tests Taken", value: attemptedTests.length, icon: <i className="banner-stat-icon fi fi-rr-list text-sm" /> },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 min-w-[120px] shadow-sm flex flex-col justify-between hover:bg-white/15 transition-all">
                  <div className="banner-stat-val text-sm font-black flex items-center gap-1.5">{s.icon} <span>{s.value}</span></div>
                  <div className="banner-stat-lbl text-[10px] font-bold mt-1.5 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit">
          {([
            { key: "syllabus", label: "Syllabus", icon: "fi-rr-book-alt" },
            { key: "tests", label: "My Tests", icon: "fi-rr-list" },
            { key: "gemini", label: "AI Gemini Generator", icon: "fi-rr-robot" },
            { key: "tips", label: "Study Tips", icon: "fi-rr-star" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${activeTab === tab.key
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              <i className={`fi ${tab.icon} flex items-center`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Syllabus Tab ──────────────────────────────────────── */}
        {activeTab === "syllabus" && (
          <>
            <div className="flex gap-2 flex-wrap">
              {(["All", "Biology", "Chemistry", "Physics"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSubject(s)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${filterSubject === s
                    ? "bg-red-500 text-white border-red-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-red-300"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
            ) : filteredChapters.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No chapters assigned under this category.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredChapters.map((ch) => {
                  const cappedAttempted = Math.min(ch.attempted, ch.totalQuestions);
                  const cappedCorrect = Math.min(ch.correct, cappedAttempted);
                  const accuracy = cappedAttempted > 0 ? Math.round((cappedCorrect / cappedAttempted) * 100) : 0;
                  const progress = ch.totalQuestions > 0 ? Math.round((cappedAttempted / ch.totalQuestions) * 100) : 0;
                  return (
                    <div key={ch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${subjectBadge[ch.subject] || ""}`}>{ch.subject}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${ch.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                          : ch.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                          }`}>
                          {ch.status === "Completed" ? "✓ Done" : ch.status === "In Progress" ? "● Active" : "○ Pending"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 group-hover:text-red-500 transition-colors leading-tight">{ch.chapter}</h4>

                      <div className="flex gap-2 mb-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${diffColor[ch.difficulty] || "bg-slate-100"}`}>{ch.difficulty}</span>
                        <span className="text-[9px] text-slate-400">{ch.totalQuestions} Qs</span>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">Questions Done</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">{cappedAttempted}/{ch.totalQuestions}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${subjectGradient[ch.subject] || ""}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {ch.attempted > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-400">Accuracy</span>
                            <span className={`font-black ${accuracy >= 80 ? "text-emerald-500" : accuracy >= 60 ? "text-amber-500" : "text-red-500"}`}>
                              {accuracy}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${accuracy >= 80 ? "bg-emerald-500" : accuracy >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <button
                          onClick={() => startPracticeSession(ch)}
                          className={`w-full py-2 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md ${ch.status === "Completed"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ch.status === "In Progress"
                              ? "bg-amber-500 hover:bg-amber-600"
                              : "bg-red-500 hover:bg-red-600"
                            }`}
                        >
                          {ch.status === "Pending" ? (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-rocket" /> Start Practice</span>
                          ) : ch.status === "In Progress" ? (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-play" /> Continue</span>
                          ) : (
                            <span className="flex items-center gap-1"><i className="fi fi-rr-refresh" /> Revise Again</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── My Tests Tab ──────────────────────────────────────── */}
        {activeTab === "tests" && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
              <i className="fi fi-rr-list text-red-500" /> My Mock Test Results
            </h3>
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
            ) : myTests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No scheduled mock tests.</div>
            ) : (
              myTests.map((test) => {
                const isAttempted = Boolean(test.attempted || test.myAccuracy !== undefined || test.myScore > 0 || (test.myRank !== null && test.myRank !== undefined));
                const displayAccuracy = test.myAccuracy !== undefined ? test.myAccuracy : (test.maxScore > 0 ? Math.round((test.myScore / test.maxScore) * 100) : 0);
                const displayRank = isAttempted ? `#${test.myRank || 1}` : "-";

                return (
                  <div key={test.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fi fi-rr-list text-red-500 flex items-center" />
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{test.title}</h4>
                          <span className="text-[9px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full font-semibold">{test.subject}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><i className="fi fi-rr-calendar" /> {test.examDate}</span>
                          <span className="flex items-center gap-1"><i className="fi fi-rr-clock" /> {test.duration}</span>
                          <span className="flex items-center gap-1"><i className="fi fi-rr-users-alt" /> {test.totalStudents} students</span>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center flex-wrap">
                        <div className="text-center">
                          <div className={`text-xl font-black ${displayAccuracy >= 80 ? "text-emerald-500" : displayAccuracy >= 60 ? "text-amber-500" : "text-red-500"}`}>
                            {test.myScore}/{test.maxScore}
                          </div>
                          <div className="text-[9px] text-slate-400">My Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-blue-500">{displayRank}</div>
                          <div className="text-[9px] text-slate-400">Rank</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-black ${displayAccuracy >= 80 ? "text-emerald-500" : displayAccuracy >= 60 ? "text-amber-500" : "text-red-500"}`}>
                            {isAttempted ? `${displayAccuracy}%` : "0%"}
                          </div>
                          <div className="text-[9px] text-slate-400">Accuracy</div>
                        </div>
                        <button
                          onClick={() => startMockTestSession(test)}
                          className={`px-4 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0 ${
                            isAttempted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          <i className={`fi ${isAttempted ? "fi-rr-refresh" : "fi-rr-edit"}`} />
                          {isAttempted ? "Retake Test" : "Take Mock Test"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${displayAccuracy >= 80 ? "bg-emerald-500" : displayAccuracy >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${isAttempted ? displayAccuracy : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Gemini AI Tab ────────────────────────────────────── */}
        {activeTab === "gemini" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 animate-in fade-in duration-200 text-left">
            <div className="flex items-center gap-3">
              <i className="fi fi-rr-robot text-violet-500 text-3xl shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Gemini AI Question Generator</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Type any chapter title to generate custom mock practice questions instantly.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold">Select Subject</label>
                <div className="flex gap-2">
                  {(["Biology", "Chemistry", "Physics"] as Subject[]).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setAiSubject(sub)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        aiSubject === sub
                          ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-bold">Practice Chapter/Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Basis of Inheritance, Chemical Kinetics, Ray Optics..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-bold">Difficulty Level</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as Difficulty)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-bold">Number of Questions</label>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                  >
                    <option value={10}>10 Questions (Quick Practice)</option>
                    <option value={25}>25 Questions (NEET Practice Set)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateGeminiQuestions}
                disabled={generatingAi}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {generatingAi ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    Generating Practice Questions...
                  </>
                ) : (
                  <span className="flex items-center gap-1.5"><i className="fi fi-rr-sparkles" /> Generate & Start Practice Session</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Study Tips Tab ────────────────────────────────────── */}
        {activeTab === "tips" && (
          <div className="space-y-5 text-left">
            {/* Header Strategy Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <i className="fi fi-rr-trophy text-amber-500" /> NEET UG 2026 Strategy Guide
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Proven Strategies to Target 650+ Marks in NEET
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    Master line-by-line NCERT techniques, negative marking control tactics, speed shortcut formulas, and time distribution methods recommended by top NEET rankers.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shrink-0 text-center space-y-1 min-w-[140px]">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">720 Marks</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">200 Mins · 180 Qs</div>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Tactics:</span>
              {["All", "Biology", "Chemistry", "Physics", "Strategy", "Method"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTipsCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipsCategoryFilter === cat
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-red-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Strategy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyTips
                .filter((t) => tipsCategoryFilter === "All" || t.category === tipsCategoryFilter)
                .map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${tip.bg}`}>
                          <i className={`fi ${tip.icon} text-lg flex items-center justify-center`} />
                        </div>
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${tip.badgeBg}`}>
                          {tip.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5 leading-tight">{tip.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <i className="fi fi-rr-target text-red-500" /> {tip.action}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tip.category}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Interactive Practice Modal ───────────────────────── */}
        {activePracticeChapter && practiceQuestions.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 p-5 text-white flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                    NEET Practice Mode
                  </span>
                  <h3 className="text-sm font-bold mt-1 line-clamp-1">
                    {activePracticeChapter.chapter}
                  </h3>
                </div>
                <button
                  onClick={() => savePracticeResults(true)}
                  className="text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-700 shadow-sm inline-flex items-center gap-1"
                >
                  <i className="fi fi-rr-cross text-[10px]" /> Close
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 shrink-0">
                <div
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${(((currentQIndex - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0)) + (selectedAns !== null ? 1 : 0)) / (practiceQuestions.length - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0))) * 100}%` }}
                />
              </div>

              {/* Question Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                    Question {currentQIndex - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0) + 1} of {practiceQuestions.length - (activePracticeChapter.attempted < practiceQuestions.length ? activePracticeChapter.attempted : 0)}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold">
                    Score: {correctCount}/{sessionAttempted}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                  {practiceQuestions[currentQIndex].q}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {practiceQuestions[currentQIndex].o.map((option, idx) => {
                    const isCorrectOption = idx === practiceQuestions[currentQIndex].a;
                    const isSelected = idx === selectedAns;

                    let optStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-red-300";
                    if (selectedAns !== null) {
                      if (isCorrectOption) {
                        optStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300";
                      } else if (isSelected) {
                        optStyle = "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300";
                      } else {
                        optStyle = "border-slate-200 dark:border-slate-800 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={selectedAns !== null}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all ${optStyle}`}
                      >
                        <span>{idx + 1}. &nbsp;{option}</span>
                        {selectedAns !== null && isCorrectOption && <span className="text-emerald-500 font-black">✓ Correct</span>}
                        {selectedAns !== null && isSelected && !isCorrectOption && <span className="text-red-500 font-black">✕ Incorrect</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <i className="fi fi-rr-interrogation text-slate-400" /> Explanation
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {practiceQuestions[currentQIndex].exp}
                    </p>
                  </div>
                )}

                {/* Next / Submit Button */}
                {selectedAns !== null && (
                  <button
                    onClick={handleNextQ}
                    disabled={savingPractice}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    {savingPractice
                      ? "Saving..."
                      : currentQIndex + 1 < practiceQuestions.length ? (
                        <span className="flex items-center gap-1">Next Question <i className="fi fi-rr-arrow-right" /></span>
                      ) : (
                        <span className="flex items-center gap-1">Finish & Save Session <i className="fi fi-rr-flag" /></span>
                      )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
