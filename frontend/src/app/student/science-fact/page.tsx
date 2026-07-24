"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Waves,
  Globe,
  FlaskConical,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Brain,
  Award,
  ArrowRight,
  CheckSquare,
  Volume2,
  VolumeX,
  BookOpen,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  Sun,
  Bookmark,
  Search,
  Share2,
  Check,
  Atom,
  Dna,
  Trophy,
  Star,
  Filter,
  Clock,
  Compass
} from "lucide-react";

interface FactTopic {
  id: string;
  title: string;
  category: "Physics & Waves" | "Space & Astronomy" | "Biology & Nature" | "Chemistry & Fluids" | "Quantum & Energy";
  accentGradient: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  scienceFact: string;
  whyItHappens: string;
  didYouKnow: string;
  tryItSteps: string[];
  thinkAboutIt: string;
  thinkHint: string;
  quiz: {
    id: number;
    question: string;
    options: { key: string; text: string }[];
    correct: string;
    explanation: string;
  }[];
}

const FACT_TOPICS: FactTopic[] = [
  {
    id: "sound-water",
    title: "Sound Travels Four Times Faster In Water",
    category: "Physics & Waves",
    accentGradient: "from-cyan-600 via-teal-600 to-indigo-700",
    badgeBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    icon: Waves,
    scienceFact:
      "Have you ever tried calling out to a friend across a swimming pool versus shouting through the air? In air, sound moves fast, but in water, it travels nearly four times faster! When you speak in air, sound waves bump into gas molecules spread far apart. Water is a liquid, so its molecules are packed much closer together. Because of this tight molecular packing, water molecules quickly pass sound energy to their neighbors like a lightning-fast game of tag. This allows sound waves to travel through oceans at over 1,480 meters per second, enabling whales and marine life to communicate across hundreds of miles underwater.",
    whyItHappens:
      "Sound is a mechanical wave of energy that relies on physical particles to propagate. Since particles in liquids like water are much closer together than gas particles in air, vibration energy transfers from one particle to the next much more rapidly. Higher material density and elasticity significantly boost the speed of acoustic waves.",
    didYouKnow:
      "In solid materials like steel, where atoms are locked tightly in a rigid grid, sound travels at nearly 5,960 meters per second—almost fifteen times faster than in open air!",
    tryItSteps: [
      "Tap two plastic spoons together in open air and listen carefully to the loudness and pitch.",
      "Fill a large transparent bowl or basin with clean tap water.",
      "Place your ear gently against the outside wall of the bowl, submerge both spoons completely, and tap them together underwater.",
      "Observe how much louder, sharper, and clearer the sound energy feels when transmitted through water molecules compared to open air."
    ],
    thinkAboutIt:
      "If sound travels so effectively through ocean water, how do marine animals like dolphins use sound waves to map out dark undersea environments and locate moving prey?",
    thinkHint:
      "Dolphins utilize echolocation! They send out ultra-fast sound clicks that bounce off fish and underwater terrain. Because sound moves rapid underwater, the returning echoes build an instant 3D acoustic map in their brain.",
    quiz: [
      {
        id: 1,
        question: "How much faster does sound travel in water compared to air?",
        options: [
          { key: "A", text: "Two times faster" },
          { key: "B", text: "Four times faster" },
          { key: "C", text: "Ten times faster" },
          { key: "D", text: "It travels at the exact same speed" }
        ],
        correct: "B",
        explanation: "Sound travels at roughly 1,480 m/s in liquid water—nearly four times faster than its 343 m/s speed in air."
      },
      {
        id: 2,
        question: "Why does sound propagate faster in liquids than in gases?",
        options: [
          { key: "A", text: "Water is colder than air" },
          { key: "B", text: "Molecules in liquids are packed much closer together" },
          { key: "C", text: "Air molecules are heavier than liquid molecules" },
          { key: "D", text: "Water eliminates all friction" }
        ],
        correct: "B",
        explanation: "Tighter molecular arrangement allows kinetic energy from vibration to pass swiftly to adjacent molecules."
      },
      {
        id: 3,
        question: "In which state of matter does sound travel at the highest speed?",
        options: [
          { key: "A", text: "Gas" },
          { key: "B", text: "Liquid" },
          { key: "C", text: "Solid" },
          { key: "D", text: "Vacuum" }
        ],
        correct: "C",
        explanation: "Solids possess the densest molecular structures, allowing acoustic waves to travel faster than in liquids or gases."
      }
    ]
  },
  {
    id: "venus-heat",
    title: "Venus Is Hotter Than Mercury Despite Being Further From The Sun",
    category: "Space & Astronomy",
    accentGradient: "from-amber-600 via-orange-600 to-rose-700",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    icon: Sun,
    scienceFact:
      "Mercury is the closest planet to the Sun, so logic suggests it should be the hottest planet in our solar system. However, Venus holds the title as the hottest planet, reaching a scorching 465°C—even though it is nearly twice as far from the Sun as Mercury! Why? Mercury has almost no atmosphere to hold heat, causing its night side to freeze down to -180°C. Venus is wrapped in an ultra-thick, heavy atmosphere composed of 96% carbon dioxide and clouds of sulfuric acid. This creates an extreme runaway greenhouse effect that permanently traps solar heat like a closed oven.",
    whyItHappens:
      "Solar light penetrates Venus's cloud layer and heats the rocky surface. The surface radiates heat back as infrared energy, but dense carbon dioxide molecules absorb and re-emit this energy down to the surface, creating a heat trap that never cools down.",
    didYouKnow:
      "A single day on Venus (one full rotation on its axis) lasts 243 Earth days—which is actually longer than one Venusian year (225 Earth days to orbit the Sun)!",
    tryItSteps: [
      "Place two identical small bowls filled with room-temperature water on a sunny windowsill.",
      "Cover one bowl tightly with clear plastic wrap or a transparent glass jar, while leaving the second bowl completely uncovered.",
      "Wait 25 minutes, then measure or feel the temperature difference in both bowls.",
      "Notice how the covered bowl traps thermal radiation inside, perfectly simulating the atmospheric greenhouse effect of Venus!"
    ],
    thinkAboutIt:
      "How does studying the intense atmospheric heat trapping on Venus help environmental scientists better understand and protect Earth's climate balance?",
    thinkHint:
      "Venus serves as a natural laboratory! By studying its runaway greenhouse effect, scientists learn how atmospheric carbon dioxide concentrations directly regulate planetary thermal equilibrium.",
    quiz: [
      {
        id: 1,
        question: "Which planet is the hottest in our solar system?",
        options: [
          { key: "A", text: "Mercury" },
          { key: "B", text: "Venus" },
          { key: "C", text: "Mars" },
          { key: "D", text: "Jupiter" }
        ],
        correct: "B",
        explanation: "Venus is the hottest planet in our solar system with surface temperatures exceeding 465°C."
      },
      {
        id: 2,
        question: "Why is Venus hotter than Mercury despite being further from the Sun?",
        options: [
          { key: "A", text: "Venus is closer to the Earth" },
          { key: "B", text: "Venus has a thick carbon dioxide atmosphere that traps heat" },
          { key: "C", text: "Mercury is made entirely of solid ice" },
          { key: "D", text: "Venus generates heat through nuclear fission" }
        ],
        correct: "B",
        explanation: "Venus's dense carbon dioxide atmosphere traps thermal radiation, producing an intense greenhouse effect."
      },
      {
        id: 3,
        question: "What is the primary gas in the atmosphere of Venus?",
        options: [
          { key: "A", text: "Oxygen" },
          { key: "B", text: "Nitrogen" },
          { key: "C", text: "Carbon Dioxide" },
          { key: "D", text: "Helium" }
        ],
        correct: "C",
        explanation: "Carbon dioxide makes up roughly 96.5% of Venus's atmosphere, acting as an insulating blanket."
      }
    ]
  },
  {
    id: "bioluminescence",
    title: "Bioluminescence: Nature’s Living Cold Light",
    category: "Biology & Nature",
    accentGradient: "from-emerald-600 via-teal-600 to-cyan-700",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    icon: Dna,
    scienceFact:
      "Fireflies, jellyfish, deep-sea anglerfish, and certain mushrooms can produce their own brilliant light without creating heat! This phenomenon is called bioluminescence. Unlike a lightbulb which wastes 90% of its energy as heat, bioluminescence is almost 100% efficient—producing 'cold light.' Creatures combine a light-emitting compound called luciferin with oxygen and an enzyme called luciferase. This chemical reaction releases glowing light photons, used by organisms to attract mates, lure prey, or startle ocean predators in pitch darkness.",
    whyItHappens:
      "Bioluminescence is an oxidation reaction inside an organism's cells. When luciferin reacts with oxygen in the presence of luciferase, energy is converted directly into light waves rather than thermal energy, ensuring the creature doesn't burn itself.",
    didYouKnow:
      "Over 76% of deep-sea creatures possess bioluminescent capabilities, turning the pitch-black ocean depths into a glowing sea of biological light shows!",
    tryItSteps: [
      "In a darkened room, break open a standard glowstick (chemiluminescence experiment).",
      "Observe how two chemical solutions mix inside to produce vivid light without emitting heat.",
      "Place one activated glowstick in ice water and another in warm water.",
      "Compare the glow intensity: cold water slows the chemical reaction down, making it last longer, while heat speeds it up!"
    ],
    thinkAboutIt:
      "Why do you think deep-ocean creatures evolved blue and green bioluminescent light instead of red or yellow light?",
    thinkHint:
      "Blue-green light waves have shorter wavelengths that travel much further through water than red light! Most ocean animals are only sensitive to blue light.",
    quiz: [
      {
        id: 1,
        question: "What is bioluminescence?",
        options: [
          { key: "A", text: "Light reflected from the Sun" },
          { key: "B", text: "Light produced by chemical reactions inside living organisms" },
          { key: "C", text: "Heat generated by muscular movement" },
          { key: "D", text: "Static electricity stored in fur" }
        ],
        correct: "B",
        explanation: "Bioluminescence is biological light generated through internal biochemical reactions."
      },
      {
        id: 2,
        question: "Why is bioluminescent light described as 'cold light'?",
        options: [
          { key: "A", text: "It only occurs in freezing ice" },
          { key: "B", text: "Nearly 100% of the energy is converted into light rather than heat" },
          { key: "C", text: "It cools down the organism when activated" },
          { key: "D", text: "It turns blue when exposed to air" }
        ],
        correct: "B",
        explanation: "Bioluminescent chemical reactions generate minimal thermal energy, conserving thermal balance."
      },
      {
        id: 3,
        question: "Which enzyme facilitates the light-producing chemical reaction in fireflies?",
        options: [
          { key: "A", text: "Amylase" },
          { key: "B", text: "Luciferase" },
          { key: "C", text: "Hemoglobin" },
          { key: "D", text: "Insulin" }
        ],
        correct: "B",
        explanation: "Luciferase acts as the biological catalyst that speeds up the oxidation of luciferin."
      }
    ]
  },
  {
    id: "surface-tension",
    title: "Surface Tension: How Insects Walk On Water",
    category: "Chemistry & Fluids",
    accentGradient: "from-blue-600 via-indigo-600 to-violet-700",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    icon: FlaskConical,
    scienceFact:
      "Water strider insects can walk effortlessly across the surface of a pond without sinking! This is made possible by a property called surface tension. Water molecules (H₂O) are cohesive—they love to stick together. Below the surface, water molecules are pulled equally in all directions by neighboring molecules. However, molecules at the top surface have no water molecules above them, so they cling extra tightly to their neighbors alongside and below. This creates an invisible, elastic 'skin' on top of the water that supports lightweight objects.",
    whyItHappens:
      "Hydrogen bonding creates strong cohesive forces between water molecules. At the liquid-air interface, the unbalanced inward attraction forces create a tense surface layer that behaves like a stretched flexible membrane.",
    didYouKnow:
      "Adding a tiny drop of dish soap to water disrupts hydrogen bonding between water molecules, causing surface tension to instantly collapse!",
    tryItSteps: [
      "Fill a clean glass tumbler right up to the brim with water.",
      "Gently place a small steel paperclip flat onto a piece of tissue paper resting on the water surface.",
      "Use a pencil tip to carefully push the tissue paper down so it sinks, leaving the paperclip floating on top of the water skin!",
      "Touch a drop of soap on a toothpick to the edge of the glass and watch the paperclip immediately plummet to the bottom."
    ],
    thinkAboutIt:
      "How do water striders use hydrophobic (water-repelling) hairs on their legs to maximize the effect of surface tension?",
    thinkHint:
      "Thousands of microscopic hairs coated with natural wax trap tiny air bubbles around their legs, preventing water from wetting their limbs and distributing their body weight across the surface skin!",
    quiz: [
      {
        id: 1,
        question: "What physical property allows water striders to walk on water?",
        options: [
          { key: "A", text: "Density reversal" },
          { key: "B", text: "Surface tension" },
          { key: "C", text: "Thermal expansion" },
          { key: "D", text: "Magnetic levitation" }
        ],
        correct: "B",
        explanation: "Surface tension creates a flexible, cohesive skin on liquid water that supports tiny forces."
      },
      {
        id: 2,
        question: "What type of intermolecular bonding causes water's high surface tension?",
        options: [
          { key: "A", text: "Covalent bonding" },
          { key: "B", text: "Hydrogen bonding" },
          { key: "C", text: "Ionic bonding" },
          { key: "D", text: "Metallic bonding" }
        ],
        correct: "B",
        explanation: "Hydrogen bonds between polar H₂O molecules create strong cohesive forces."
      },
      {
        id: 3,
        question: "What happens to water surface tension when soap is added?",
        options: [
          { key: "A", text: "It increases dramatically" },
          { key: "B", text: "It breaks down and weakens" },
          { key: "C", text: "It freezes into solid ice" },
          { key: "D", text: "It turns into gas instantly" }
        ],
        correct: "B",
        explanation: "Soap acts as a surfactant, breaking apart hydrogen bonds and lowering surface tension."
      }
    ]
  },
  {
    id: "quantum-sun",
    title: "Quantum Tunneling: How The Sun Powers Our World",
    category: "Quantum & Energy",
    accentGradient: "from-purple-600 via-fuchsia-600 to-rose-700",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    icon: Atom,
    scienceFact:
      "The Sun's core burns at 15 million degrees Celsius, fusing hydrogen protons into helium and releasing sunshine. But according to classical physics, the Sun isn't hot enough! Protons have positive electrical charges, so they repel each other with immense electrostatic force. Classical physics says they shouldn't collide often enough to keep the Sun shining. The secret is Quantum Tunneling! In the quantum realm, subatomic particles behave like waves of probability. A proton can magically 'tunnel' straight through the electrical energy barrier, allowing fusion to happen continuously and power life on Earth.",
    whyItHappens:
      "Because subatomic particles display wave-particle duality, their position is defined by a probability wave. Even if a particle lacks enough energy to surmount a barrier, there is a finite probability that its wave function extends through the barrier, allowing it to appear on the other side.",
    didYouKnow:
      "Without quantum tunneling, the Sun would have burned out billions of years ago, and life on Earth would never have existed!",
    tryItSteps: [
      "Roll a small marble up a steep cardboard hill without pushing it hard enough to reach the top.",
      "Notice how in classical physics, the marble always rolls back down because it lacks energy to clear the peak.",
      "Now imagine the cardboard hill has a secret tunnel through the middle—the marble pops through to the other side!",
      "This mental model illustrates how subatomic quantum particles pass through energy walls without climbing them."
    ],
    thinkAboutIt:
      "Modern microprocessors in smartphones use transistors so small (3 nanometers) that electrons start quantum tunneling through insulation walls. How do computer engineers handle this physics challenge?",
    thinkHint:
      "As chip components shrink, unwanted quantum tunneling causes electrical leakage. Engineers design novel 3D transistor gates (like FinFET & GAAFET) to trap quantum electrons!",
    quiz: [
      {
        id: 1,
        question: "What quantum phenomenon enables nuclear fusion inside the Sun?",
        options: [
          { key: "A", text: "Quantum entanglement" },
          { key: "B", text: "Quantum tunneling" },
          { key: "C", text: "Quantum teleportation" },
          { key: "D", text: "Superconductivity" }
        ],
        correct: "B",
        explanation: "Quantum tunneling permits protons to overcome electrostatic repulsion and fuse together in the Sun."
      },
      {
        id: 2,
        question: "Why do positively charged protons naturally repel each other?",
        options: [
          { key: "A", text: "Gravitational pull" },
          { key: "B", text: "Like electrostatic charges repel" },
          { key: "C", text: "Magnetic alignment" },
          { key: "D", text: "Nuclear decay" }
        ],
        correct: "B",
        explanation: "Coulomb's Law states that particles carrying identical electrical charges repel one another."
      },
      {
        id: 3,
        question: "Which property of subatomic particles allows quantum tunneling to occur?",
        options: [
          { key: "A", text: "Particle weight" },
          { key: "B", text: "Wave-particle duality" },
          { key: "C", text: "Color charge" },
          { key: "D", text: "Thermal conductivity" }
        ],
        correct: "B",
        explanation: "Quantum objects exhibit wave properties described by probability distribution functions."
      }
    ]
  }
];

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function ScienceFactPage() {
  const { data: session } = useSession();
  const studentClassStr = (session?.user as any)?.class || "7";
  const studentSection = (session?.user as any)?.section || "B";
  const studentFullClass = `Class ${studentClassStr}-${studentSection}`;

  const [topics, setTopics] = useState<FactTopic[]>(FACT_TOPICS);
  const [activeTopicId, setActiveTopicId] = useState<string>("sound-water");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [publishedByInfo, setPublishedByInfo] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Load Bookmarks from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tn_science_fact_bookmarks");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Could not load bookmarks", e);
    }
  }, []);

  // Sync Bookmarks to LocalStorage
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem("tn_science_fact_bookmarks", JSON.stringify(updated));
      } catch (e) {
        console.error("Could not save bookmark", e);
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchTodayFact();
  }, [studentFullClass, studentClassStr]);

  const fetchTodayFact = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/teacher/science-fact/today?targetClass=${encodeURIComponent(studentFullClass)}&classNum=${studentClassStr}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        const publishedFact = json.data;
        const formattedFact: FactTopic = {
          id: publishedFact.id || "published-today",
          title: publishedFact.title,
          category: (publishedFact.category as any) || "Physics & Waves",
          accentGradient: "from-teal-600 via-emerald-600 to-indigo-700",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          icon: Sparkles,
          scienceFact: publishedFact.scienceFact,
          whyItHappens: publishedFact.whyItHappens,
          didYouKnow: publishedFact.didYouKnow,
          tryItSteps: publishedFact.tryItSteps || [],
          thinkAboutIt: publishedFact.thinkAboutIt,
          thinkHint: publishedFact.thinkHint || "",
          quiz: publishedFact.quiz || []
        };

        setTopics((prev) => {
          const exists = prev.some((t) => t.title === formattedFact.title);
          if (exists) return prev;
          return [formattedFact, ...prev];
        });

        setActiveTopicId(formattedFact.id);
        if (publishedFact.generatedBy) {
          setPublishedByInfo(`Published by ${publishedFact.generatedBy} (${publishedFact.targetClass || studentFullClass})`);
        }
      }
    } catch (e) {
      console.error("Could not fetch today's published science fact", e);
    }
  };

  // Filter topics based on search & category
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.scienceFact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryFilter === "All" || t.category === selectedCategoryFilter;
    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(t.id);

    return matchesSearch && matchesCategory && matchesBookmark;
  });

  const currentTopic = topics.find((t) => t.id === activeTopicId) || filteredTopics[0] || topics[0];
  const TopicIcon = currentTopic.icon || Waves;
  const isCurrentBookmarked = bookmarkedIds.includes(currentTopic.id);

  // Audio Speech Handler
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in your browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const textToRead = `${currentTopic.title}. ${currentTopic.scienceFact}. Why it happens: ${currentTopic.whyItHappens}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Stop speech when topic switches
  const handleTopicSwitch = (topicId: string) => {
    if (isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    setActiveTopicId(topicId);
    setSelectedAnswers({});
    setShowResults(false);
    setCompletedSteps({});
    setShowHint(false);
  };

  const handleSelectOption = (qId: number, optionKey: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const calculateScore = () => {
    let score = 0;
    currentTopic.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) score++;
    });
    return score;
  };

  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = currentTopic.tryItSteps.length || 1;
  const activityProgressPct = Math.round((completedStepsCount / totalSteps) * 100);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const categoriesList = ["All", "Physics & Waves", "Space & Astronomy", "Biology & Nature", "Chemistry & Fluids", "Quantum & Energy"];

  return (
    <PortalLayout title="Science Fact & Discoveries" subtitle="Explore fascinating scientific phenomena through everyday observations, experiments, and interactive quizzes">
      <div className="w-full space-y-8 animate-in fade-in duration-300 pb-16">
        
        {/* Top Gamification & Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
              <div className="text-lg font-black text-slate-800 dark:text-white">5 Days 🔥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Curious Topics</div>
              <div className="text-lg font-black text-slate-800 dark:text-white">{topics.length} Available</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Quiz Mastery</div>
              <div className="text-lg font-black text-slate-800 dark:text-white">100 XP</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Saved Facts</div>
              <div className="text-lg font-black text-slate-800 dark:text-white">{bookmarkedIds.length} Saved</div>
            </div>
          </div>
        </div>

        {/* Hero Banner (Full Width Premium Styling) */}
        <div className={`hero-band w-full bg-gradient-to-br ${currentTopic.accentGradient} !text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden group`}>
          <div className="absolute right-4 top-4 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110">
            <TopicIcon className="w-72 h-72 text-white" />
          </div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-sm !text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Middle School Science (Classes 6–8)
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/30 backdrop-blur-md shadow-sm !text-white">
                {currentTopic.category}
              </span>
              {publishedByInfo && (
                <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md border border-emerald-300 shadow-sm flex items-center gap-1 !text-white">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  {publishedByInfo}
                </span>
              )}
            </div>

            <style>{`
              .hero-banner-title {
                color: #ffffff !important;
                -webkit-text-fill-color: #ffffff !important;
              }
            `}</style>
            <h1 className="hero-banner-title text-2xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-md !text-white" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
              {currentTopic.title}
            </h1>

            <p className="text-sm sm:text-base leading-relaxed max-w-3xl font-medium drop-shadow-sm !text-white/95" style={{ color: "rgba(255, 255, 255, 0.95)", WebkitTextFillColor: "rgba(255, 255, 255, 0.95)" }}>
              Discover real-world scientific phenomena explained through everyday observations, simple experiments, and interactive knowledge checks.
            </p>

            {/* Hero Quick Controls: Audio Reader, Bookmark, Share */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md backdrop-blur-md ${
                  isPlayingAudio
                    ? "bg-amber-400 !text-slate-900 shadow-amber-500/30 animate-pulse"
                    : "bg-white/20 hover:bg-white/30 !text-white border border-white/40"
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 !text-white" />}
                <span className={isPlayingAudio ? "!text-slate-900" : "!text-white"}>{isPlayingAudio ? "Pause Audio Reader" : "Listen to Science Fact"}</span>
              </button>

              <button
                onClick={() => toggleBookmark(currentTopic.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md backdrop-blur-md ${
                  isCurrentBookmarked
                    ? "bg-amber-400 !text-slate-900 border border-amber-300"
                    : "bg-white/20 hover:bg-white/30 !text-white border border-white/40"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? "fill-slate-900" : "!text-white"}`} />
                <span className={isCurrentBookmarked ? "!text-slate-900" : "!text-white"}>{isCurrentBookmarked ? "Bookmarked" : "Bookmark Fact"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-white/20 hover:bg-white/30 !text-white border border-white/40 transition-all shadow-md backdrop-blur-md"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 !text-white" />}
                <span className="!text-white">{copiedLink ? "Link Copied!" : "Share Fact"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation & Search Filter Toolbar */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search science facts..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
              {categoriesList.map((cat) => {
                const isActiveCat = selectedCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                      isActiveCat
                        ? "shadow-md scale-105"
                        : "hover:opacity-80"
                    }`}
                    style={
                      isActiveCat
                        ? { backgroundColor: "#0f766e", color: "#ffffff", borderColor: "#0d9488" }
                        : { backgroundColor: "#f1f5f9", color: "#334155", borderColor: "#e2e8f0" }
                    }
                  >
                    {cat}
                  </button>
                );
              })}

              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                  showBookmarksOnly
                    ? "shadow-md scale-105"
                    : "hover:opacity-80"
                }`}
                style={
                  showBookmarksOnly
                    ? { backgroundColor: "#d97706", color: "#ffffff", borderColor: "#f59e0b" }
                    : { backgroundColor: "#f1f5f9", color: "#334155", borderColor: "#e2e8f0" }
                }
              >
                <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? "fill-white" : ""}`} />
                <span>Saved ({bookmarkedIds.length})</span>
              </button>
            </div>

          </div>

          {/* Topic Selectors Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-teal-500" />
              <span>Select Science Discovery Topic ({filteredTopics.length}):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filteredTopics.map((topic) => {
                const isActive = topic.id === activeTopicId;
                const IconComp = topic.icon || Waves;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSwitch(topic.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all border ${
                      isActive
                        ? "shadow-lg scale-[1.03] font-black"
                        : "font-bold hover:opacity-80"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#0f766e", color: "#ffffff", borderColor: "#0d9488" }
                        : { backgroundColor: "#f1f5f9", color: "#334155", borderColor: "#e2e8f0" }
                    }
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-teal-600"}`} />
                    <span style={{ color: isActive ? "#ffffff" : "#334155" }}>{topic.title}</span>
                  </button>
                );
              })}

              {filteredTopics.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">
                  No science facts match your search or filter. Try clearing filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main Section: Core Science Fact & Explanation */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Fact Explanation (Takes 2 Columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Science Fact</h2>
                    <p className="text-xs text-slate-400 font-medium">Core scientific phenomenon explained</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleSpeech}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-all"
                  title="Read Aloud"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                {currentTopic.scienceFact}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-normal">
                <strong className="text-slate-900 dark:text-white">Key Takeaway: </strong>
                Scientific principles explain how molecular interactions, atmospheric composition, and kinetic energy create the world around us.
              </div>
            </div>
          </div>

          {/* Side Column: Why It Happens & Did You Know */}
          <div className="space-y-6 flex flex-col">
            
            {/* Why It Happens Card */}
            <div className="bg-gradient-to-br from-cyan-50/80 to-teal-50/50 dark:from-slate-900 dark:to-slate-900 border border-cyan-200/70 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm flex-1 space-y-3">
              <div className="flex items-center gap-2 text-cyan-950 dark:text-cyan-300 font-extrabold text-lg">
                <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3>Why It Happens</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {currentTopic.whyItHappens}
              </p>
            </div>

            {/* Did You Know? Card */}
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-slate-900 dark:to-slate-900 border border-amber-200/70 dark:border-amber-900/60 rounded-3xl p-6 shadow-sm flex-1 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-extrabold text-lg">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3>Did You Know?</h3>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {currentTopic.didYouKnow}
              </p>
            </div>

          </div>
        </div>

        {/* 2-Column Grid: Hands-On Experiment & Reflection */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Try It Yourself Card (Interactive Checklist) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Try It Yourself</h2>
                  <p className="text-xs text-slate-400 font-medium">Safe hands-on home observation</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activityProgressPct}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${activityProgressPct}%` }}
              />
            </div>

            <div className="space-y-3">
              {currentTopic.tryItSteps.map((stepText, idx) => {
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isDone
                        ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    <CheckSquare className={`w-5 h-5 shrink-0 mt-0.5 ${isDone ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    <div className="text-xs sm:text-sm font-medium leading-relaxed">
                      <span className="font-extrabold mr-1.5 text-slate-900 dark:text-slate-100">Step {idx + 1}:</span>
                      {stepText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Think About It Reflection Card */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-slate-900 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-950 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-200">Think About It</h2>
                  <p className="text-xs text-indigo-500/80 font-medium">Curiosity discussion question</p>
                </div>
              </div>

              <p className="text-slate-800 dark:text-slate-200 text-base sm:text-lg font-semibold leading-relaxed">
                {currentTopic.thinkAboutIt}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-xs font-black text-indigo-700 dark:text-indigo-300 hover:underline"
              >
                {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showHint ? "Hide Curiosity Hint" : "Reveal Curiosity Hint"}</span>
              </button>

              {showHint && (
                <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200 shadow-sm">
                  <strong className="text-indigo-600 dark:text-indigo-400">Hint: </strong>
                  {currentTopic.thinkHint}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Fun Quiz Section (Full Width Card) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Fun Knowledge Quiz</h2>
                <p className="text-xs text-slate-400 font-medium">Test your understanding (3 Questions)</p>
              </div>
            </div>

            <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Classes 6–8 Science Check
            </span>
          </div>

          {/* Quiz Questions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {currentTopic.quiz.map((q) => {
              const selectedOpt = selectedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 leading-snug">
                      {q.id}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedOpt === opt.key;
                        const isCorrect = opt.key === q.correct;

                        let btnStyle = "w-full text-left text-xs sm:text-sm p-3 rounded-xl border transition-all font-medium flex items-center justify-between ";

                        if (showResults) {
                          if (isCorrect) {
                            btnStyle += "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-black";
                          } else if (isSelected && !isCorrect) {
                            btnStyle += "bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-200 font-bold";
                          } else {
                            btnStyle += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
                          }
                        } else {
                          if (isSelected) {
                            btnStyle += "bg-teal-600 border-teal-600 text-white shadow-sm font-bold";
                          } else {
                            btnStyle += "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400";
                          }
                        }

                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={btnStyle}
                          >
                            <span>
                              <strong className="mr-2">{opt.key})</strong> {opt.text}
                            </span>
                            {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {showResults && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-700 dark:text-slate-300">Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Action Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(selectedAnswers).length < currentTopic.quiz.length}
                className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Submit & Check Answers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-teal-50 dark:bg-teal-950/40 p-4 rounded-2xl border border-teal-200 dark:border-teal-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-sm">
                    {calculateScore()}/{currentTopic.quiz.length}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-teal-900 dark:text-teal-200">
                      {calculateScore() === currentTopic.quiz.length ? "Excellent Work! 100% Score!" : "Good Effort! Review the answers above."}
                    </div>
                    <div className="text-xs text-teal-700 dark:text-teal-400">
                      You answered {calculateScore()} out of {currentTopic.quiz.length} questions correctly.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowResults(false);
                    setSelectedAnswers({});
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black hover:bg-teal-700 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            )}

            {/* Answer Key Footer */}
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span className="font-bold text-slate-600 dark:text-slate-400">Answer Key:</span>
              {currentTopic.quiz.map((q) => (
                <span key={q.id}>
                  {q.id}. <strong className="text-slate-700 dark:text-slate-300">{q.correct}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
