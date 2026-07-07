// ============================================================================
// Botany Centre — grade-aware syllabus map (Class 8 / 10 / 11 botany portions).
// Reuses the shared unit/grade types from zoologySyllabus. All study prose is
// authored in-house; figures reference the TN state textbooks.
// ============================================================================
import type { ZoologyGrade, ZoologyUnit } from "./zoologySyllabus";
import { resolveGrade } from "./zoologySyllabus";

export type BotanyUnit = ZoologyUnit;
export type BotanyGrade = ZoologyGrade;

const grade8: BotanyGrade = {
  grade: 8, label: "Class 8 · Science", medium: "Tamil", book: "Class 8 Science (Tamil), 2024 Edition",
  intro: "In Class 8 botany we explore the plant world — how plants are grouped, how they make their own food, and how we grow crops to feed everyone. Open a unit, read the idea, study the diagram and take the quick self-check.",
  units: [
    {
      id: "plant-world", title: "The Plant World", titleTa: "தாவர உலகம்", textbookRef: "Class 8 Science · Unit 17 · p.215",
      emoji: "🌿", color: "lime",
      objectives: ["Group plants into herbs, shrubs, trees and climbers.", "Describe the parts of a plant and their jobs.", "Tell flowering from non-flowering plants."],
      concepts: [
        { heading: "Kinds of plants", body: "Plants come in many forms — soft herbs, woody shrubs and tall trees, plus creepers and climbers. Sorting them helps us study and use them." },
        { heading: "Parts and jobs", body: "Roots anchor the plant and drink water; the stem carries water and holds leaves up; leaves make food; flowers make seeds for the next generation." },
      ],
      figure: { caption: "Parts of a flowering plant — see the labelled diagram in the unit.", page: "p.215–228" },
      research: [
        { title: "Plants that clean air", body: "Studies keep confirming that green cover cools cities and cleans the air we breathe.", year: "2024" },
        { title: "Seed banks", body: "Scientists store seeds of thousands of plant species to protect them for the future.", year: "2024" },
      ],
      news: [{ title: "Miyawaki forests", body: "Dense mini-forests are being planted across Tamil Nadu towns to boost green cover fast.", tag: "Environment" }],
      glossary: [
        { term: "Herb", ta: "மூலிகை", def: "A small plant with a soft stem." },
        { term: "Photosynthesis", ta: "ஒளிச்சேர்க்கை", def: "How green plants make food using sunlight." },
      ],
      quiz: [{ q: "Which part of the plant makes food?", options: ["Root", "Leaf", "Stem"], answer: 1, explain: "Leaves make food by photosynthesis." }],
    },
    {
      id: "crop-management", title: "Crop Production & Management", titleTa: "பயிர்ப் பெருக்கம் மற்றும் மேலாண்மை", textbookRef: "Class 8 Science · Unit 21 · p.271",
      emoji: "🌾", color: "amber",
      objectives: ["List the steps of growing a crop.", "Explain irrigation, manure and fertilisers.", "Describe how crops are stored safely."],
      concepts: [
        { heading: "From soil to harvest", body: "Farming follows steps: preparing soil, sowing seeds, adding water and nutrients, removing weeds, and finally harvesting and storing the crop." },
        { heading: "Feeding the soil", body: "Manure and fertilisers replace the nutrients crops take from the soil, keeping the land fertile year after year." },
      ],
      figure: { caption: "Stages of crop production — see the unit's process diagram.", page: "p.271–288" },
      research: [
        { title: "Precision farming", body: "Sensors and drones now help farmers water and feed crops exactly where needed, saving resources.", year: "2025" },
        { title: "Drought-tolerant crops", body: "New crop varieties are bred to grow with less water as climates change.", year: "2024" },
      ],
      news: [{ title: "Millets revival", body: "India is promoting millets as climate-smart, nutritious crops.", tag: "Agriculture" }],
      glossary: [
        { term: "Irrigation", ta: "நீர்ப்பாசனம்", def: "Supplying water to crops." },
        { term: "Manure", ta: "எரு", def: "Natural material that enriches the soil." },
      ],
      quiz: [{ q: "Adding water to crops is called…", options: ["Sowing", "Irrigation", "Harvesting"], answer: 1, explain: "Irrigation is supplying water to crops." }],
    },
  ],
};

const grade10: BotanyGrade = {
  grade: 10, label: "Class 10 · Science", medium: "English", book: "Class 10 Science (English), 2024 Edition",
  intro: "Class 10 botany covers how plants feed, transport materials, respond with hormones and reproduce. Work each unit's objectives, diagram and quiz to prepare for the board exam.",
  units: [
    {
      id: "plant-nutrition", title: "Nutrition & Photosynthesis", textbookRef: "Class 10 Science · Unit 12 · p.174",
      emoji: "☀️", color: "lime",
      objectives: ["Write the photosynthesis equation.", "Explain the role of chlorophyll and stomata.", "Describe how plants store food."],
      concepts: [
        { heading: "Making food from light", body: "Green plants use sunlight, water and carbon dioxide to make glucose and release oxygen. Chlorophyll in the leaves captures the light energy." },
        { heading: "Gates on the leaf", body: "Tiny pores called stomata let gases in and out and control water loss." },
      ],
      figure: { caption: "Photosynthesis in a leaf — see the labelled diagram.", page: "p.174–186" },
      research: [
        { title: "Artificial photosynthesis", body: "Scientists are building devices that copy leaves to make clean fuel from sunlight.", year: "2024" },
        { title: "Boosting crop yield", body: "Researchers are tuning photosynthesis to help crops grow more food.", year: "2025" },
      ],
      news: [{ title: "Carbon capture by plants", body: "Forests and crops remain our biggest natural tool against rising carbon dioxide.", tag: "Climate" }],
      glossary: [
        { term: "Chlorophyll", def: "The green pigment that captures light." },
        { term: "Stomata", def: "Tiny leaf pores for gas exchange." },
      ],
      quiz: [{ q: "Photosynthesis releases which gas?", options: ["Carbon dioxide", "Oxygen", "Nitrogen"], answer: 1, explain: "Plants release oxygen during photosynthesis." }],
    },
    {
      id: "plant-transport", title: "Transportation in Plants", textbookRef: "Class 10 Science · Unit 14 · p.200",
      emoji: "💧", color: "sky",
      objectives: ["Compare xylem and phloem.", "Explain transpiration.", "Describe how water rises in tall trees."],
      concepts: [
        { heading: "Two pipelines", body: "Xylem carries water and minerals up from the roots; phloem carries food made in the leaves to the rest of the plant." },
        { heading: "The pull from leaves", body: "Water evaporating from leaves (transpiration) pulls a continuous column of water up from the roots." },
      ],
      figure: { caption: "Xylem and phloem transport — see the unit's diagram.", page: "p.200–217" },
      research: [{ title: "Smart irrigation", body: "Sensors read plant water stress so farmers water exactly when needed.", year: "2024" }],
      news: [{ title: "Urban trees & cooling", body: "Transpiration from street trees measurably cools neighbourhoods.", tag: "Environment" }],
      glossary: [
        { term: "Xylem", def: "Tissue that carries water upward." },
        { term: "Transpiration", def: "Loss of water vapour from leaves." },
      ],
      quiz: [{ q: "Which tissue carries water up the plant?", options: ["Phloem", "Xylem", "Cortex"], answer: 1, explain: "Xylem carries water and minerals upward." }],
    },
  ],
};

const grade11: BotanyGrade = {
  grade: 11, label: "Class 11 · Bio-Botany", medium: "Tamil", book: "Class 11 Bio-Botany (Tamil), 2024 Edition",
  intro: "Class 11 Botany builds strong plant-science fundamentals — classification, structure, and how plants function — for board and NEET success.",
  units: [
    {
      id: "plant-kingdom", title: "Plant Kingdom", titleTa: "தாவர வகைப்பாடு", textbookRef: "Class 11 Bio-Botany · Chapter",
      emoji: "🌱", color: "lime",
      objectives: ["Classify plants from algae to flowering plants.", "Use features like seeds and vascular tissue.", "Give examples of each group."],
      concepts: [
        { heading: "From simple to seed plants", body: "Plants range from simple algae and mosses, through ferns, up to seed plants — gymnosperms (naked seeds) and angiosperms (flowering plants)." },
        { heading: "Why classify", body: "Grouping plants by shared features helps us study, name and use them across the world." },
      ],
      figure: { caption: "Major plant groups — see the classification chart.", page: "Chapter" },
      research: [{ title: "Plant DNA trees", body: "Genetic studies refine how plant groups are related on the tree of life.", year: "2024" }],
      news: [{ title: "New species", body: "Botanists still discover new plant species in the Western Ghats each year.", tag: "Discovery" }],
      glossary: [
        { term: "Angiosperm", ta: "மலரும் தாவரம்", def: "A flowering, seed-producing plant." },
        { term: "Gymnosperm", ta: "வெளிவிதைத் தாவரம்", def: "A plant with naked (uncovered) seeds." },
      ],
      quiz: [{ q: "Flowering plants are called…", options: ["Gymnosperms", "Angiosperms", "Algae"], answer: 1, explain: "Angiosperms are flowering, seed plants." }],
    },
  ],
};

export const BOTANY_SYLLABUS: Record<number, BotanyGrade> = { 8: grade8, 10: grade10, 11: grade11 };
export const BOTANY_GRADES = [8, 10, 11];
export const BOTANY_APPROVAL_STATUS = "botany-approved";
export { resolveGrade };
