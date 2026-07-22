"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import ThreeDModelViewer from "@/components/ThreeDModelViewer";
import { useSession } from "next-auth/react";
import styles from "./ThreeDPreview.module.css";
import {
  Box,
  Rotate3D,
  Eye,
  MousePointer2,
  Maximize2,
  X,
  Sparkles,
  Heart,
  Globe2,
  Leaf,
  Settings,
  Search,
  Layers,
  Sparkle
} from "lucide-react";

// Pre-defined high-fidelity 3D shapes for default library items (Hologram mode fallback) with part explanations
const defaultHeartShapes = [
  {
    type: "sphere", x: 0, y: 0, z: 0, radius: 25, color: "#f43f5e",
    label: "Left Ventricle (இடது வென்ட்ரிகிள்)",
    description: "One of the heart's four chambers. It has thick muscular walls to pump oxygen-rich blood to the entire body."
  },
  {
    type: "sphere", x: -10, y: 15, z: -5, radius: 18, color: "#ec4899",
    label: "Right Atrium (வலது ஏட்ரியம்)",
    description: "The chamber that receives oxygen-poor blood returning from the body tissues and pumps it into the right ventricle."
  },
  {
    type: "cylinder", x1: -5, y1: 15, z1: 0, x2: -5, y2: 45, z2: 0, radius: 6, color: "#3b82f6",
    label: "Superior Vena Cava (மேற்பெருநாளம்)",
    description: "A large vein carrying deoxygenated blood from the upper half of the body (head, neck, arms) back to the heart's right atrium."
  },
  {
    type: "cylinder", x1: 5, y1: 10, z1: 0, x2: 12, y2: 50, z2: -10, radius: 7, color: "#ef4444",
    label: "Aorta (பெருநாடி)",
    description: "The largest artery in the human body. It originates from the left ventricle and carries oxygenated blood out to the systemic circulation."
  },
  { type: "cylinder", x1: 12, y1: 50, z1: -10, x2: 25, y2: 45, z2: -15, radius: 4, color: "#ef4444" },
  { type: "cylinder", x1: 12, y1: 50, z1: -10, x2: 12, y2: 45, z2: 10, radius: 4, color: "#ef4444" },
  {
    type: "text", x: 35, y: 55, z: -15, text: "Aorta", color: "#ef4444", fontSize: 10, xLink: 12, yLink: 50, zLink: -10,
    label: "Aorta (பெருநாடி)",
    description: "The largest artery in the human body. It originates from the left ventricle and carries oxygenated blood out to the systemic circulation."
  },
  {
    type: "text", x: -45, y: 45, z: 0, text: "Vena Cava", color: "#3b82f6", fontSize: 10, xLink: -5, yLink: 45, zLink: 0,
    label: "Superior Vena Cava (மேற்பெருநாளம்)",
    description: "A large vein carrying deoxygenated blood from the upper half of the body (head, neck, arms) back to the heart's right atrium."
  },
  {
    type: "text", x: 45, y: -25, z: 0, text: "Left Ventricle", color: "#f43f5e", fontSize: 10, xLink: 0, yLink: 0, zLink: 0,
    label: "Left Ventricle (இடது வென்ட்ரிகிள்)",
    description: "One of the heart's four chambers. It has thick muscular walls to pump oxygen-rich blood to the entire body."
  }
];

const defaultSolarShapes = [
  {
    type: "sphere", x: 0, y: 0, z: 0, radius: 24, color: "#eab308",
    label: "Sun (சூரியன்)",
    description: "The yellow dwarf star at the center of the Solar System. It generates light and heat through nuclear fusion in its core."
  },
  { type: "ring", x: 0, y: 0, z: 0, radius: 50, plane: "xz", color: "#475569", thickness: 1 },
  {
    type: "sphere", x: 35, y: 0, z: 35, radius: 6, color: "#3b82f6",
    label: "Earth (பூமி)",
    description: "Our home planet. It is the third planet from the Sun and the only place in the universe known to support life, with liquid water oceans."
  },
  { type: "ring", x: 0, y: 0, z: 0, radius: 80, plane: "xz", color: "#475569", thickness: 1 },
  {
    type: "sphere", x: -65, y: 0, z: 45, radius: 10, color: "#f59e0b",
    label: "Saturn (சனி)",
    description: "The second-largest planet in our solar system, famous for its magnificent ring system composed of ice chunks and rocky debris particles."
  },
  { type: "ring", x: -65, y: 0, z: 45, radius: 18, plane: "xz", color: "#d97706", thickness: 2 },
  { type: "ring", x: 0, y: 0, z: 0, radius: 110, plane: "xz", color: "#475569", thickness: 1 },
  {
    type: "sphere", x: -80, y: 0, z: -80, radius: 8, color: "#67e8f9",
    label: "Uranus (யுரேனஸ்)",
    description: "An ice giant planet that rotates on its side. It has a blue-green color due to methane gas in its cold atmosphere."
  },
  {
    type: "text", x: 0, y: 35, z: 0, text: "The Sun", color: "#eab308", fontSize: 10, xLink: 0, yLink: 0, zLink: 0,
    label: "Sun (சூரியன்)",
    description: "The yellow dwarf star at the center of the Solar System. It generates light and heat through nuclear fusion in its core."
  },
  {
    type: "text", x: 60, y: 15, z: 35, text: "Earth", color: "#3b82f6", fontSize: 10, xLink: 35, yLink: 0, zLink: 35,
    label: "Earth (பூமி)",
    description: "Our home planet. It is the third planet from the Sun and the only place in the universe known to support life, with liquid water oceans."
  }
];

const defaultCellShapes = [
  {
    type: "ring", x: 0, y: 0, z: 0, radius: 70, plane: "xz", color: "#10b981", thickness: 3,
    label: "Cell Wall (செல் சுவர்)",
    description: "A tough, flexible but rigid structural layer surrounding plant cells, composed of cellulose, which provides support and shape."
  },
  { type: "ring", x: 0, y: -20, z: 0, radius: 70, plane: "xz", color: "#047857", thickness: 3 },
  { type: "ring", x: 0, y: 20, z: 0, radius: 70, plane: "xz", color: "#047857", thickness: 3 },
  { type: "cylinder", x1: -70, y1: -20, z1: 0, x2: -70, y2: 20, z2: 0, radius: 2, color: "#10b981" },
  { type: "cylinder", x1: 70, y1: -20, z1: 0, x2: 70, y2: 20, z2: 0, radius: 2, color: "#10b981" },
  {
    type: "sphere", x: 0, y: -5, z: 10, radius: 25, color: "#38bdf8",
    label: "Central Vacuole (மைய வெற்றிடம்)",
    description: "A large storage organelle in plant cells that holds water and nutrients, maintaining turgor pressure to keep the plant upright."
  },
  {
    type: "sphere", x: -35, y: 10, z: -20, radius: 14, color: "#a855f7",
    label: "Nucleus (உட்கரு)",
    description: "The membrane-bound control center of eukaryotic cells. It houses the cell's genetic material (DNA) and directs cellular activities."
  },
  {
    type: "sphere", x: 40, y: 15, z: -15, radius: 8, color: "#22c55e",
    label: "Chloroplast (பசுங்கணிகம்)",
    description: "The photosynthetic organelle in plant cells. It absorbs solar light and uses it to synthesize sugars from carbon dioxide and water."
  },
  { type: "sphere", x: -45, y: -10, z: 30, radius: 8, color: "#22c55e", label: "Chloroplast" },
  {
    type: "text", x: -50, y: 35, z: -20, text: "Nucleus", color: "#a855f7", fontSize: 10, xLink: -35, yLink: 10, zLink: -20,
    label: "Nucleus (உட்கரு)",
    description: "The membrane-bound control center of eukaryotic cells. It houses the cell's genetic material (DNA) and directs cellular activities."
  },
  {
    type: "text", x: 20, y: -30, z: 10, text: "Central Vacuole", color: "#38bdf8", fontSize: 10, xLink: 0, yLink: -5, zLink: 10,
    label: "Central Vacuole (மைய வெற்றிடம்)",
    description: "A large storage organelle in plant cells that holds water and nutrients, maintaining turgor pressure to keep the plant upright."
  },
  {
    type: "text", x: 65, y: 35, z: -15, text: "Chloroplast", color: "#22c55e", fontSize: 10, xLink: 40, yLink: 15, zLink: -15,
    label: "Chloroplast (பசுங்கணிகம்)",
    description: "The photosynthetic organelle in plant cells. It absorbs solar light and uses it to synthesize sugars from carbon dioxide and water."
  }
];

const defaultEngineShapes = [
  {
    type: "cylinder", x1: -50, y1: 0, z1: 0, x2: 50, y2: 0, z2: 0, radius: 8, color: "#94a3b8",
    label: "Main Crankshaft (முக்கிய தண்டு)",
    description: "A robust shaft that translates the up-and-down (linear) motion of the engine pistons into rotation to drive the vehicle's wheels."
  },
  {
    type: "ring", x: 0, y: 0, z: 0, radius: 45, plane: "yz", color: "#f59e0b", thickness: 6,
    label: "Flywheel / Gear (சுழல்சக்கரம்)",
    description: "A heavy, balanced rotating disk connected to the crankshaft. It stores kinetic energy to smooth out the engine's power strokes."
  },
  { type: "cylinder", x1: -25, y1: 0, z1: 0, x2: -25, y2: 30, z2: 15, radius: 4, color: "#cbd5e1" },
  { type: "cylinder", x1: 25, y1: 0, z1: 0, x2: 25, y2: -30, z2: -15, radius: 4, color: "#cbd5e1" },
  {
    type: "box", x: -25, y: 30, z: 15, w: 18, h: 20, d: 18, color: "#f43f5e",
    label: "Piston A (உந்துதண்டு A)",
    description: "Moves back and forth in its cylinder to compress the fuel-air mixture and capture the force of combustion to turn the crankshaft."
  },
  {
    type: "box", x: 25, y: -30, z: -15, w: 18, h: 20, d: 18, color: "#3b82f6",
    label: "Piston B (உந்துதண்டு B)",
    description: "Piston B works in balanced opposition to Piston A, compressing gas on alternate cycles to ensure smooth continuous power."
  },
  {
    type: "particle_cloud", points: [[-25, 45, 15], [-22, 48, 17], [-28, 46, 13]], color: "#f59e0b", particleSize: 2,
    label: "Combustion Spark (தீப்பொறி)",
    description: "Created by the spark plug to ignite the compressed fuel-air mixture in the cylinder, generating explosive force that drives the piston down."
  },
  {
    type: "text", x: -65, y: 55, z: 15, text: "Piston A", color: "#f43f5e", fontSize: 10, xLink: -25, yLink: 30, zLink: 15,
    label: "Piston A (உந்துதண்டு A)",
    description: "Moves back and forth in its cylinder to compress the fuel-air mixture and capture the force of combustion to turn the crankshaft."
  },
  {
    type: "text", x: 60, y: -50, z: -15, text: "Piston B", color: "#3b82f6", fontSize: 10, xLink: 25, yLink: -30, zLink: -15,
    label: "Piston B (உந்துதண்டு B)",
    description: "Piston B works in balanced opposition to Piston A, compressing gas on alternate cycles to ensure smooth continuous power."
  }
];

const defaultWaterShapes = [
  {
    type: "sphere", x: 0, y: -30, z: 0, radius: 45, color: "#0284c7",
    label: "Ocean & Water Reservoir (கடல் / நீர் நிலை)",
    description: "Surface water bodies like oceans, lakes, and rivers that absorb thermal energy from the Sun to begin evaporation."
  },
  {
    type: "cylinder", x1: -20, y1: -10, z1: 0, x2: -20, y2: 30, z2: 0, radius: 4, color: "#38bdf8",
    label: "Evaporating Water Vapor (நீராவிப்போக்கு)",
    description: "Liquid water converts into water vapor gas due to solar heat and rises into the upper atmosphere."
  },
  {
    type: "cylinder", x1: 20, y1: -10, z1: 0, x2: 20, y2: 30, z2: 0, radius: 4, color: "#38bdf8"
  },
  {
    type: "sphere", x: 0, y: 40, z: 0, radius: 25, color: "#e2e8f0",
    label: "Cloud Condensation (மேகப்படை / சுருங்குதல்)",
    description: "Rising water vapor cools down and condenses around microscopic dust particles to form clouds."
  },
  {
    type: "particle_cloud", points: [[0, 20, 0], [-10, 15, 5], [10, 15, -5]], color: "#60a5fa", particleSize: 3,
    label: "Precipitation & Raindrops (மழைப்பொழிவு)",
    description: "When condensed droplets in clouds become too heavy, they fall back to Earth as rain or snow."
  },
  {
    type: "text", x: -55, y: -25, z: 0, text: "Ocean Bed", color: "#0284c7", fontSize: 10, xLink: 0, yLink: -30, zLink: 0,
    label: "Ocean & Water Reservoir (கடல் / நீர் நிலை)",
    description: "Surface water bodies like oceans, lakes, and rivers that absorb thermal energy from the Sun to begin evaporation."
  },
  {
    type: "text", x: 45, y: 45, z: 0, text: "Clouds", color: "#cbd5e1", fontSize: 10, xLink: 0, yLink: 40, zLink: 0,
    label: "Cloud Condensation (மேகப்படை / சுருங்குதல்)",
    description: "Rising water vapor cools down and condenses around microscopic dust particles to form clouds."
  }
];

const defaultAtomShapes = [
  // Central Nucleus: Clustered Protons (+) and Neutrons (0)
  {
    type: "sphere", x: 0, y: 0, z: 0, radius: 12, color: "#ef4444",
    label: "Protons & Atomic Nucleus (புரோட்டான்கள் & அணுக்கரு)",
    description: "Positively charged protons (+) in the dense central nucleus that determine the atomic number and chemical identity."
  },
  {
    type: "sphere", x: 6, y: 5, z: -4, radius: 10, color: "#3b82f6",
    label: "Neutrons (நியூட்ரான்கள்)",
    description: "Uncharged neutral particles (0) inside the nucleus that add nuclear mass and bind the nucleus together."
  },
  {
    type: "sphere", x: -6, y: -4, z: 5, radius: 10, color: "#ef4444"
  },
  {
    type: "sphere", x: -4, y: 6, z: -3, radius: 9, color: "#3b82f6"
  },
  
  // K-Shell Orbit (Inner Orbit, XZ Plane)
  { type: "ring", x: 0, y: 0, z: 0, radius: 45, plane: "xz", color: "#38bdf8", thickness: 1.5 },
  {
    type: "sphere", x: 45, y: 0, z: 0, radius: 5, color: "#00f0ff",
    label: "K-Shell Electron e⁻ (K-சுற்றுப்பாதை எலக்ட்ரான்)",
    description: "Negatively charged electron (-) orbiting in the first energy level (K-shell)."
  },
  {
    type: "sphere", x: -45, y: 0, z: 0, radius: 5, color: "#00f0ff"
  },

  // L-Shell Orbit 1 (Tilted Orbit, XY Plane)
  { type: "ring", x: 0, y: 0, z: 0, radius: 75, plane: "xy", color: "#a855f7", thickness: 1.5 },
  {
    type: "sphere", x: 0, y: 75, z: 0, radius: 5, color: "#c084fc",
    label: "L-Shell Valence Electron e⁻ (L-சுற்றுப்பாதை எலக்ட்ரான்)",
    description: "Electrons orbiting in the outer L-shell energy level, responsible for chemical bonding and reactions."
  },
  {
    type: "sphere", x: 0, y: -75, z: 0, radius: 5, color: "#c084fc"
  },

  // L-Shell Orbit 2 (Tilted Orbit, YZ Plane)
  { type: "ring", x: 0, y: 0, z: 0, radius: 75, plane: "yz", color: "#ec4899", thickness: 1.5 },
  {
    type: "sphere", x: 0, y: 0, z: 75, radius: 5, color: "#f472b6"
  },
  {
    type: "sphere", x: 0, y: 0, z: -75, radius: 5, color: "#f472b6"
  },

  // Text Pointers & Labels
  {
    type: "text", x: -50, y: 35, z: 0, text: "Nucleus (Protons+Neutrons)", color: "#ef4444", fontSize: 10, xLink: 0, yLink: 0, zLink: 0,
    label: "Protons & Atomic Nucleus (புரோட்டான்கள் & அணுக்கரு)",
    description: "Positively charged protons (+) in the dense central nucleus that determine the atomic number and chemical identity."
  },
  {
    type: "text", x: 60, y: -20, z: 0, text: "K-Shell Electron (e-)", color: "#00f0ff", fontSize: 10, xLink: 45, yLink: 0, zLink: 0,
    label: "K-Shell Electron e⁻ (K-சுற்றுப்பாதை எலக்ட்ரான்)",
    description: "Negatively charged electron (-) orbiting in the first energy level (K-shell)."
  },
  {
    type: "text", x: 0, y: 90, z: 0, text: "L-Shell Orbit", color: "#c084fc", fontSize: 10, xLink: 0, yLink: 75, zLink: 0,
    label: "L-Shell Valence Electron e⁻ (L-சுற்றுப்பாதை எலக்ட்ரான்)",
    description: "Electrons orbiting in the outer L-shell energy level, responsible for chemical bonding and reactions."
  }
];

const defaultDnaShapes = [
  // Strand A
  {
    type: "sphere", x: 25, y: -50, z: 0, radius: 7, color: "#ec4899",
    label: "Sugar-Phosphate Backbone (சர்க்கரை-பாஸ்பேட் சங்கிலி)",
    description: "The structural framework of DNA composed of alternating sugar and phosphate groups."
  },
  { type: "sphere", x: 18, y: -30, z: 18, radius: 7, color: "#ec4899" },
  { type: "sphere", x: 0, y: -10, z: 25, radius: 7, color: "#ec4899" },
  { type: "sphere", x: -18, y: 10, z: 18, radius: 7, color: "#ec4899" },
  { type: "sphere", x: -25, y: 30, z: 0, radius: 7, color: "#ec4899" },
  { type: "sphere", x: -18, y: 50, z: -18, radius: 7, color: "#ec4899" },

  // Strand B
  { type: "sphere", x: -25, y: -50, z: 0, radius: 7, color: "#3b82f6" },
  { type: "sphere", x: -18, y: -30, z: -18, radius: 7, color: "#3b82f6" },
  { type: "sphere", x: 0, y: -10, z: -25, radius: 7, color: "#3b82f6" },
  { type: "sphere", x: 18, y: 10, z: -18, radius: 7, color: "#3b82f6" },
  { type: "sphere", x: 25, y: 30, z: 0, radius: 7, color: "#3b82f6" },
  { type: "sphere", x: 18, y: 50, z: 18, radius: 7, color: "#3b82f6" },

  // Nitrogenous Base Pairs (Connecting Rungs)
  {
    type: "cylinder", x1: 25, y1: -50, z1: 0, x2: -25, y2: -50, z2: 0, radius: 3, color: "#eab308",
    label: "Adenine - Thymine Base Pair (A-T பிணைப்பு)",
    description: "Complementary nitrogenous base pair linked by hydrogen bonds."
  },
  {
    type: "cylinder", x1: 18, y1: -30, z1: 18, x2: -18, y2: -30, z2: -18, radius: 3, color: "#10b981",
    label: "Guanine - Cytosine Base Pair (G-C பிணைப்பு)",
    description: "Triple hydrogen bonded complementary base pairing in the interior of DNA."
  },
  { type: "cylinder", x1: 0, y1: -10, z1: 25, x2: 0, y2: -10, z2: -25, radius: 3, color: "#eab308" },
  { type: "cylinder", x1: -18, y1: 10, z1: 18, x2: 18, y2: 10, z2: -18, radius: 3, color: "#10b981" },
  { type: "cylinder", x1: -25, y1: 30, z1: 0, x2: 25, y2: 30, z2: 0, radius: 3, color: "#eab308" },

  // Text Annotations
  {
    type: "text", x: 45, y: -50, z: 0, text: "Sugar Backbone", color: "#ec4899", fontSize: 10, xLink: 25, yLink: -50, zLink: 0,
    label: "Sugar-Phosphate Backbone (சர்க்கரை-பாஸ்பேட் சங்கிலி)",
    description: "The structural framework of DNA composed of alternating sugar and phosphate groups."
  },
  {
    type: "text", x: -55, y: -30, z: 0, text: "Base Pair (A-T / G-C)", color: "#eab308", fontSize: 10, xLink: 0, yLink: -30, zLink: 0,
    label: "Adenine - Thymine Base Pair (A-T பிணைப்பு)",
    description: "Complementary nitrogenous base pair linked by hydrogen bonds."
  }
];

const defaultBrainShapes = [
  // Frontal Lobe
  {
    type: "sphere", x: -20, y: 15, z: 10, radius: 28, color: "#f43f5e",
    label: "Frontal Lobe (முன்புற கதுப்பு)",
    description: "Responsible for high-level cognitive functions, decision making, problem solving, motor control, and speech."
  },
  // Parietal Lobe
  {
    type: "sphere", x: -10, y: 35, z: -10, radius: 25, color: "#a855f7",
    label: "Parietal Lobe (உச்சி கதுப்பு)",
    description: "Processes sensory information including touch, temperature, pressure, spatial awareness, and body perception."
  },
  // Occipital Lobe
  {
    type: "sphere", x: -25, y: 15, z: -35, radius: 22, color: "#0284c7",
    label: "Occipital Lobe (பிடரி கதுப்பு)",
    description: "The primary visual processing center of the brain, interpreting colors, shapes, light, and movement."
  },
  // Cerebellum
  {
    type: "sphere", x: -20, y: -25, z: -30, radius: 18, color: "#f59e0b",
    label: "Cerebellum (சிறுமூளை)",
    description: "Coordinates muscle movements, maintains posture, balance, and fine motor skills."
  },
  // Brainstem
  {
    type: "cylinder", x1: -5, y1: -20, z1: 0, x2: -5, y2: -50, z2: 0, radius: 8, color: "#10b981",
    label: "Brainstem & Medulla (மூளைத்தண்டு)",
    description: "Connects the brain to the spinal cord and controls automatic life-sustaining functions like heartbeat, breathing, and blood pressure."
  },

  // Text Annotations
  {
    type: "text", x: 25, y: 30, z: 10, text: "Frontal Lobe", color: "#f43f5e", fontSize: 10, xLink: -20, yLink: 15, zLink: 10,
    label: "Frontal Lobe (முன்புற கதுப்பு)",
    description: "Responsible for high-level cognitive functions, decision making, problem solving, motor control, and speech."
  },
  {
    type: "text", x: 25, y: 50, z: -10, text: "Parietal Lobe", color: "#a855f7", fontSize: 10, xLink: -10, yLink: 35, zLink: -10,
    label: "Parietal Lobe (உச்சி கதுப்பு)",
    description: "Processes sensory information including touch, temperature, pressure, spatial awareness, and body perception."
  },
  {
    type: "text", x: -65, y: -35, z: 0, text: "Brainstem", color: "#10b981", fontSize: 10, xLink: -5, yLink: -40, zLink: 0,
    label: "Brainstem & Medulla (மூளைத்தண்டு)",
    description: "Connects the brain to the spinal cord and controls automatic life-sustaining functions like heartbeat, breathing, and blood pressure."
  }
];

const modelColorStyles: Record<string, {
  activeWrapper: string;
  inactiveWrapper: string;
  activeIcon: string;
  inactiveIcon: string;
  activeTitle: string;
  subjectBadge: string;
}> = {
  rose: {
    activeWrapper: "bg-rose-50/85 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800 shadow-md scale-[1.02] xl:scale-105 text-rose-700 dark:text-rose-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-rose-200 hover:bg-rose-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-rose-500 text-white",
    inactiveIcon: "bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400",
    activeTitle: "text-rose-700 dark:text-rose-350",
    subjectBadge: "bg-rose-500 text-white"
  },
  indigo: {
    activeWrapper: "bg-indigo-50/85 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800 shadow-md scale-[1.02] xl:scale-105 text-indigo-700 dark:text-indigo-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-indigo-500 text-white",
    inactiveIcon: "bg-indigo-100 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400",
    activeTitle: "text-indigo-700 dark:text-indigo-350",
    subjectBadge: "bg-indigo-500 text-white"
  },
  emerald: {
    activeWrapper: "bg-emerald-50/85 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 shadow-md scale-[1.02] xl:scale-105 text-emerald-700 dark:text-emerald-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-emerald-500 text-white",
    inactiveIcon: "bg-emerald-100 text-indigo-500 dark:bg-emerald-950/40 dark:text-emerald-400",
    activeTitle: "text-emerald-700 dark:text-emerald-350",
    subjectBadge: "bg-emerald-500 text-white"
  },
  amber: {
    activeWrapper: "bg-amber-50/85 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800 shadow-md scale-[1.02] xl:scale-105 text-amber-700 dark:text-amber-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-amber-200 hover:bg-amber-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-amber-500 text-white",
    inactiveIcon: "bg-amber-100 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400",
    activeTitle: "text-amber-700 dark:text-amber-350",
    subjectBadge: "bg-amber-500 text-white"
  },
  sky: {
    activeWrapper: "bg-sky-50/85 border-sky-300 dark:bg-sky-950/20 dark:border-sky-800 shadow-md scale-[1.02] xl:scale-105 text-sky-700 dark:text-sky-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-sky-200 hover:bg-sky-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-sky-500 text-white",
    inactiveIcon: "bg-sky-100 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400",
    activeTitle: "text-sky-700 dark:text-sky-350",
    subjectBadge: "bg-sky-500 text-white"
  },
  purple: {
    activeWrapper: "bg-purple-50/85 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800 shadow-md scale-[1.02] xl:scale-105 text-purple-700 dark:text-purple-300",
    inactiveWrapper: "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-purple-200 hover:bg-purple-50/30 xl:hover:scale-[1.02]",
    activeIcon: "bg-purple-500 text-white",
    inactiveIcon: "bg-purple-100 text-purple-500 dark:bg-purple-950/40 dark:text-purple-400",
    activeTitle: "text-purple-700 dark:text-purple-350",
    subjectBadge: "bg-purple-500 text-white"
  }
};

export default function ThreeDPreviewPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [studentGrade, setStudentGrade] = useState<string>("10"); // Default grade fallback
  const [loadingStudent, setLoadingStudent] = useState<boolean>(true);

  const initialModels = [
    {
      id: 1,
      name: "Human Heart Structure ❤️",
      subject: "Class 10 Biology",
      category: "Class 10",
      views: 245,
      icon: <Heart />,
      color: "rose",
      shapes: defaultHeartShapes,
      sketchfabUid: "775d6629622740de8a5ed61a959c7506",
      description: "Detailed, anatomically correct 3D model of the human heart, showing blood flows, aorta, and ventricles. Drag around to view it at 360 degrees."
    },
    {
      id: 2,
      name: "Solar System Map 🪐",
      subject: "Class 9 Physics",
      category: "Class 9",
      views: 189,
      icon: <Globe2 />,
      color: "indigo",
      shapes: defaultSolarShapes,
      sketchfabUid: "f7896d085f474ef28631d88129268411",
      description: "A simulated solar system model. Displays orbits (XZ plane) and planets relative to the central Sun."
    },
    {
      id: 3,
      name: "Plant Cell Organelles 🌿",
      subject: "Class 9 Biology",
      category: "Class 9",
      views: 312,
      icon: <Leaf />,
      color: "emerald",
      shapes: defaultCellShapes,
      sketchfabUid: "06c34533b4f441569bfa207aff7c8a19",
      description: "A detailed cross section of a plant cell showcasing the cell wall, central vacuole, chloroplasts, and nucleus."
    },
    {
      id: 4,
      name: "Cool Engine Parts ⚙️",
      subject: "Class 10 Physics",
      category: "Class 10",
      views: 156,
      icon: <Settings />,
      color: "amber",
      shapes: defaultEngineShapes,
      sketchfabUid: "fc1ba33a0902445980078d24d92ec54f",
      description: "High-fidelity mechanical four-stroke piston and crankshaft engine system. Spin to view assembly."
    },
    {
      id: 5,
      name: "Structure of the Atom ⚛️",
      subject: "Class 8 Chemistry",
      category: "Class 8",
      views: 210,
      icon: <Box />,
      color: "sky",
      shapes: defaultAtomShapes,
      sketchfabUid: null,
      description: "3D model of atomic nucleus with electrons revolving in orbital shells around protons and neutrons."
    },
    {
      id: 6,
      name: "Photosynthesis Leaf Model 🍃",
      subject: "Class 7 Biology",
      category: "Class 7",
      views: 178,
      icon: <Leaf />,
      color: "emerald",
      shapes: defaultCellShapes,
      sketchfabUid: "06c34533b4f441569bfa207aff7c8a19",
      description: "Interactive 3D representation of stomata, chlorophyll, and leaf tissue exchange during photosynthesis."
    },
    {
      id: 7,
      name: "Water Cycle & Evaporation 🌧️",
      subject: "Class 6 Science",
      category: "Class 6",
      views: 142,
      icon: <Globe2 />,
      color: "sky",
      shapes: defaultWaterShapes,
      sketchfabUid: null,
      description: "Visualizing evaporation, condensation, and precipitation in the natural water cycle."
    },
    {
      id: 8,
      name: "DNA Double Helix Structure 🧬",
      subject: "Class 11 Biology",
      category: "Class 11",
      views: 295,
      icon: <Box />,
      color: "purple",
      shapes: defaultDnaShapes,
      sketchfabUid: null,
      description: "3D model of DNA showing double helical sugar-phosphate backbone and nitrogenous base pairing."
    },
    {
      id: 9,
      name: "Human Brain & Functional Lobes 🧠",
      subject: "Class 12 Biology",
      category: "Class 12",
      views: 340,
      icon: <Heart />,
      color: "rose",
      shapes: defaultBrainShapes,
      sketchfabUid: null,
      description: "Explore the cerebrum, cerebellum, brainstem, and major sensory and motor processing regions."
    }
  ];

  const [models, setModels] = useState(initialModels);
  const [activeModel, setActiveModel] = useState(initialModels[0]);
  const [viewMode, setViewMode] = useState<"real" | "hologram">("real");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("My Grade");

  // Fetch logged-in student profile dynamically from backend
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let url = API_BASE;
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    fetch(`${url}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const matched = myStudent || json.data[0];
          setStudent(matched);

          let parsedGrade = "";
          if (matched?.class) {
            parsedGrade = String(matched.class).replace(/[^0-9]/g, "");
          } else if ((session?.user as any)?.class) {
            parsedGrade = String((session?.user as any)?.class).replace(/[^0-9]/g, "");
          }

          if (parsedGrade) {
            setStudentGrade(parsedGrade);
            const gradeCategory = `Class ${parsedGrade}`;
            const gradeModels = initialModels.filter((m) => m.category === gradeCategory);
            if (gradeModels.length > 0) {
              setActiveModel(gradeModels[0]);
            }
          }
        }
      })
      .catch((err) => console.error("Failed to load student grade profile:", err))
      .finally(() => setLoadingStudent(false));
  }, [session]);

  const categories = [
    { id: "My Grade", label: `My Grade (Class ${studentGrade})` },
    { id: "All", label: "All Models" },
    { id: "Class 6", label: "Class 6" },
    { id: "Class 7", label: "Class 7" },
    { id: "Class 8", label: "Class 8" },
    { id: "Class 9", label: "Class 9" },
    { id: "Class 10", label: "Class 10" },
    { id: "Class 11", label: "Class 11" },
    { id: "Class 12", label: "Class 12" },
  ];

  const filteredModels = models.filter((m) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "My Grade") return m.category === `Class ${studentGrade}`;
    return m.category === activeCategory;
  });

  // Set default view mode based on Sketchfab UID availability
  useEffect(() => {
    if (activeModel.sketchfabUid) {
      setViewMode("real");
    } else {
      setViewMode("hologram");
    }
  }, [activeModel]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const triggerGenerate3D = async (topic: string, subject: string) => {
    if (!topic.trim()) return;
    setCustomLoading(true);
    showToast(`AI is crafting 3D ${topic} for Class ${studentGrade}... 🔮`);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/generate-3d`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: `${topic} (Class ${studentGrade} level)`,
          subject: `${subject} - Class ${studentGrade}`
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const generated = result.data;
        const colors = ["rose", "indigo", "emerald", "amber", "sky", "purple"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newModel = {
          id: Date.now(),
          name: generated.name || (topic + " ✨"),
          subject: generated.subject || subject,
          category: `Class ${studentGrade}`,
          views: 1,
          icon: <Box />,
          color: generated.color || randomColor,
          shapes: generated.shapes || [],
          sketchfabUid: generated.sketchfabUid || null,
          description: generated.description || `Custom generated Class ${studentGrade} 3D visual explanation of ${topic}.`
        };

        setModels((prev) => [newModel, ...prev]);
        setActiveModel(newModel);
        showToast(`Class ${studentGrade} 3D ${topic} generated! 🚀`);
      } else {
        throw new Error(result.error || "Failed to generate 3D model");
      }
    } catch (error) {
      console.error(error);
      showToast("Oh no! Failed to build 3D model. 😢");
    } finally {
      setCustomLoading(false);
    }
  };

  const handleLoadModel = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;

    triggerGenerate3D(name, subject);
    setModalOpen(false);
  };

  const handleFloatingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const topic = formData.get("customTopic") as string;
    if (!topic.trim()) return;

    triggerGenerate3D(topic, "Science");
    (e.target as HTMLFormElement).reset();
  };

  const userName = session?.user?.name || student?.user?.name || "Student";
  const subtitle = student
    ? `Personalized 3D Learning Hub for ${userName} · Class ${studentGrade} Curriculum · Interactive Holograms & Real 3D Models`
    : `Spin, zoom, and explore interactive 3D models curated for Class ${studentGrade}!`;

  return (
    <PortalLayout
      title={`Magic 3D Viewer — Class ${studentGrade} 👓`}
      subtitle={subtitle}
    >
      <div className="flex flex-col xl:flex-row gap-8 h-auto xl:h-[calc(100vh-140px)]">

        {/* Main Viewer Area */}
        <div className="w-full h-[480px] sm:h-[580px] xl:h-full rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-700 overflow-hidden flex flex-col relative bg-slate-900">

          {/* Top Control Bar */}
          <div className="h-auto min-h-20 lg:h-20 flex flex-col lg:flex-row justify-between items-center py-3 px-4 lg:px-6 absolute top-0 w-full z-20 gap-3" style={{ backgroundColor: "rgba(9, 13, 22, 0.95)", borderBottom: "2px solid rgba(255, 255, 255, 0.15)", color: "#ffffff" }}>
            <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto justify-between lg:justify-start">
              <span className={`px-3 py-1.5 lg:px-4 lg:py-2 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md rotate-[-3deg] ${modelColorStyles[activeModel.color]?.subjectBadge || "bg-indigo-500"}`}>
                {activeModel.subject}
              </span>
              <div className="text-lg lg:text-2xl font-black truncate max-w-[180px] lg:max-w-none" style={{ color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.9)", fontWeight: 900 }}>{activeModel.name}</div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto justify-center lg:justify-end">
              {/* Toggle view mode between Real 3D and Sci-Fi Hologram */}
              {activeModel.sketchfabUid && (
                <div className="bg-slate-950/80 p-1 rounded-xl lg:rounded-2xl border border-white/10 flex gap-1 shadow-md">
                  <button
                    onClick={() => { setViewMode("real"); showToast("Viewing realistic 3D model! 🎨"); }}
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black transition-all flex items-center gap-1 lg:gap-1.5 ${viewMode === "real" ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Layers className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Real 3D
                  </button>
                  <button
                    onClick={() => { setViewMode("hologram"); showToast("Switching to Sci-Fi Hologram! ⚡"); }}
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black transition-all flex items-center gap-1 lg:gap-1.5 ${viewMode === "hologram" ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Sparkle className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> Hologram
                  </button>
                </div>
              )}

              {viewMode === "hologram" && (
                <button onClick={() => { setAutoRotate(!autoRotate); showToast(autoRotate ? "Holding still! 🛑" : "Spinning around! 🌪️"); }} className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${autoRotate ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-105 lg:scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Spin!">
                  <Rotate3D className={`w-5 h-5 lg:w-6 lg:h-6 ${autoRotate ? 'animate-spin-slow' : ''}`} />
                </button>
              )}
              <button onClick={() => showToast("Going BIG! 📺")} className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95" title="Big Screen">
                <Maximize2 className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>

          {/* Floating Search Input for any topic */}
          <div className="absolute top-36 lg:top-24 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-full max-w-md px-2 sm:px-4">
            <form onSubmit={handleFloatingSearchSubmit} className="flex gap-2 bg-slate-950/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-indigo-500/50 shadow-2xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  name="customTopic"
                  placeholder="Type any topic (e.g. DNA Helix, Eye)..."
                  className="w-full bg-transparent text-sm font-bold text-white placeholder-slate-400 focus:outline-none"
                  required
                  disabled={customLoading}
                />
              </div>
              <button
                type="submit"
                disabled={customLoading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                {customLoading ? "Building..." : "Generate 3D 🚀"}
              </button>
            </form>
          </div>

          {/* Playful 3D Viewer Area */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-indigo-950 flex items-center justify-center overflow-hidden">

            {/* Twinkling stars background (shown behind translucent canvas/iframe) */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-200 rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
            </div>

            {/* Grid Floor */}
            <div className="absolute inset-0 z-0 opacity-20" style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 2px, transparent 2px)`,
              backgroundSize: '60px 60px',
              transform: 'perspective(600px) rotateX(70deg) translateY(200px) scale(4)',
              transformOrigin: 'bottom center'
            }}></div>

            {/* Renderer or Loading State */}
            {customLoading ? (
              <div className="flex flex-col items-center gap-4 text-center z-10 p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10">
                <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-lg font-black tracking-widest animate-pulse">SEARCHING & BUILDING 3D MODEL...</p>
                <p className="text-xs text-indigo-300">Fetching original 3D geometry and rendering annotations</p>
              </div>
            ) : viewMode === "real" && activeModel.sketchfabUid ? (
              /* Embed high-fidelity fully-textured original 3D model */
              /* Custom parameter settings hide the creator name (ui_infos=0) and the VCR video/timeline player controls (ui_animations=0) */
              /* ui_annotations=1 enables clickable numbered annotation pins that display explanations of different parts */
              <div className="w-full h-full pt-20 z-10">
                <iframe
                  src={`https://sketchfab.com/models/${activeModel.sketchfabUid}/embed?autostart=1&ui_theme=dark&ui_ar=1&ui_vr=0&ui_infos=0&ui_help=0&ui_settings=0&ui_annotations=1&ui_animations=0&double_click=0`}
                  title={activeModel.name}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                />
              </div>
            ) : activeModel.shapes ? (
              /* Beautiful retro-holographic scientific 3D canvas viewer */
              <ThreeDModelViewer
                key={activeModel.id}
                shapes={activeModel.shapes as any}
                name={activeModel.name}
                description={activeModel.description}
                colorTheme={activeModel.color}
                autoRotate={autoRotate}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center z-10">
                <p className="text-white font-bold">No shapes or 3D model found.</p>
              </div>
            )}

            {/* Interaction Hint (hidden in real 3D iframe since it has native controls, and during loading) */}
            {!customLoading && viewMode !== "real" && (
              <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 items-center gap-3 px-6 py-3 rounded-full bg-indigo-900/80 backdrop-blur-md border-4 border-indigo-500/50 text-sm font-black text-indigo-100 z-20 shadow-xl">
                <MousePointer2 className="w-5 h-5 text-indigo-300 animate-bounce" /> Click & Drag to explore!
              </div>
            )}
          </div>

        </div>

        {/* Playful Sidebar - Model Library */}
        <div className="w-full xl:w-96 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 py-4 sm:py-6 px-3 sm:px-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 h-full flex flex-col">
            <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-4 sm:mb-6 flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl rotate-12">
                <Box className="w-6 h-6" />
              </div>
              Cool 3D Stuff
            </h3>

            <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar px-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    activeCategory === cat.id
                      ? "bg-indigo-500 text-white shadow-md scale-105"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-row xl:flex-col gap-4 overflow-x-auto xl:overflow-y-auto hide-scrollbar flex-1 pb-4 px-2.5 flex-nowrap xl:flex-wrap">
              {filteredModels.map(model => (
                <div
                  key={model.id}
                  onClick={() => { setActiveModel(model); showToast(`Loaded ${model.name}!`); }}
                  className={`p-3 sm:p-4 rounded-2xl border-4 cursor-pointer transition-all group shrink-0 min-w-[260px] sm:min-w-[300px] xl:min-w-0 xl:w-full ${activeModel.id === model.id
                    ? (modelColorStyles[model.color]?.activeWrapper || "border-indigo-300 shadow-md scale-[1.02] xl:scale-105")
                    : (modelColorStyles[model.color]?.inactiveWrapper || "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700")
                    }`}
                >
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex text-white items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12 ${activeModel.id === model.id
                      ? (modelColorStyles[model.color]?.activeIcon || "bg-indigo-500 text-white")
                      : (modelColorStyles[model.color]?.inactiveIcon || "bg-indigo-100 text-indigo-500")
                      }`}>
                      {model.id <= 4 ? React.cloneElement(model.icon as React.ReactElement, { className: "w-6 h-6 sm:w-7 sm:h-7" }) : <Box className="w-6 h-6 sm:w-7 sm:h-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm sm:text-base font-black mb-1 leading-tight truncate ${activeModel.id === model.id
                        ? (modelColorStyles[model.color]?.activeTitle || "text-indigo-700")
                        : "text-slate-700 dark:text-slate-200"
                        }`}>
                        {model.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-650 dark:text-slate-300`}>{model.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {model.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Horizontal scroll add button for mobile/tablet */}
              <button onClick={() => setModalOpen(true)} className="xl:hidden shrink-0 min-w-[150px] sm:min-w-[180px] py-4 px-6 rounded-2xl border-4 border-dashed border-indigo-200 text-sm font-black text-indigo-500 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                + Add More
              </button>
            </div>

            {/* Vertical block add button for desktop */}
            <button onClick={() => setModalOpen(true)} className="hidden xl:block mt-4 w-full py-4 rounded-2xl border-4 border-dashed border-indigo-200 text-sm font-black text-indigo-500 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-95 shadow-sm">
              + Find More Magic!
            </button>
          </div>
        </div>

      </div>

      {/* Playful Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-900 !text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/40 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-indigo-500/50">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          {toastMsg}
        </div>
      )}

      {/* Load Model Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-[92%] max-w-md shadow-2xl border-4 border-indigo-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-5 sm:p-6 bg-indigo-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">Bring in something cool!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLoadModel} className="p-3 sm:p-4 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What is it? 🦖</label>
                <input required name="name" type="text" placeholder="e.g., T-Rex Skeleton" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What subject? 📚</label>
                <select required name="subject" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
                  <option value="Biology">Biology 🌿</option>
                  <option value="Physics">Physics ⚙️</option>
                  <option value="Chemistry">Chemistry 🧪</option>
                  <option value="Geography">Geography 🌍</option>
                </select>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="w-full sm:flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Nevermind
                </button>
                <button type="submit" className="w-full sm:flex-1 py-3 rounded-2xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
                  Load It Up! 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
