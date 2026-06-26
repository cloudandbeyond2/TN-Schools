import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// ===========================================================================
// Rich Fallback Data Set (matching PostgreSQL schema structure)
// ===========================================================================
const fallbackSubjects = [
  {
    id: "sub-math-10",
    class: "10",
    name: "Mathematics",
    icon: "📐",
    color: "#6366f1",
  },
  {
    id: "sub-sci-10",
    class: "10",
    name: "Science",
    icon: "🔬",
    color: "#10b981",
  },
  {
    id: "sub-soc-10",
    class: "10",
    name: "Social Science",
    icon: "🌍",
    color: "#ec4899",
  },
  {
    id: "sub-phy-11",
    class: "11",
    name: "Physics",
    icon: "🔬",
    color: "#8b5cf6",
  },
  {
    id: "sub-comp-11",
    class: "11",
    name: "Computer Science",
    icon: "💻",
    color: "#3b82f6",
  }
];

const fallbackUnits: Record<string, any[]> = {
  "sub-math-10": [
    {
      id: "u1-math",
      name: "Relations and Functions",
      unitNumber: 1,
      topics: [
        { id: "t1-math", name: "Cartesian Product", topicNumber: 1 },
        { id: "t2-math", name: "Relations & Domain", topicNumber: 2 }
      ]
    },
    {
      id: "u2-math",
      name: "Algebra",
      unitNumber: 2,
      topics: [
        { id: "t3-math", name: "Quadratic Equations", topicNumber: 1 }
      ]
    }
  ],
  "sub-sci-10": [
    {
      id: "u1-sci",
      name: "Laws of Motion",
      unitNumber: 1,
      topics: [
        { id: "t1-sci", name: "Newton's First Law and Inertia", topicNumber: 1 }
      ]
    }
  ],
  "sub-soc-10": [
    {
      id: "u1-soc",
      name: "History: Outbreak of World War I",
      unitNumber: 1,
      topics: [
        { id: "t1-soc", name: "Causes of World War I", topicNumber: 1 }
      ]
    }
  ],
  "sub-phy-11": [
    {
      id: "u1-phy-11",
      name: "Nature of Physical World and Measurement",
      unitNumber: 1,
      topics: [
        { id: "t1-phy-11", name: "Errors in Measurement", topicNumber: 1 }
      ]
    }
  ],
  "sub-comp-11": [
    {
      id: "u1-comp-11",
      name: "Introduction to Computers",
      unitNumber: 1,
      topics: [
        { id: "t1-comp-11", name: "Generations of Computers11", topicNumber: 1 }
      ]
    }
  ]
};

const fallbackContents: Record<string, any[]> = {
  "t1-math": [
    {
      id: "c1-math",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Cartesian Product",
      fileContent: "The Cartesian product of two non-empty sets A and B is the set of all ordered pairs (a, b) such that a belongs to A and b belongs to B. It is denoted by A × B. Conceptually, it represents all possible pairings between two categories, akin to coordinates on a grid or matrix. The number of elements in A × B is the product of the number of elements in A and B (i.e., n(A × B) = n(A) × n(B))."
    },
    {
      id: "c2-math",
      contentType: "NOTES",
      title: "Revision Notes: Cartesian Product Rules",
      fileContent: "✏️ Key Formulas & Properties:\n\n1. Definition: A × B = { (a, b) | a ∈ A, b ∈ B }\n2. Non-Commutativity: In general, A × B ≠ B × A. They are equal if and only if A = B.\n3. Empty Set: If either A or B is empty (Ø), then A × B = Ø.\n4. Cardinality: If n(A) = p and n(B) = q, then n(A × B) = pq.\n5. Graphical representation: Can be plotted on a Cartesian coordinate plane as discrete points."
    },
    {
      id: "c3-math",
      contentType: "PDF",
      title: "Official TN Board Chapter Extract - Relations & Functions",
      fileUrl: "https://www.textbookcorp.tn.gov.in/pdf/10th-Maths-EM.pdf"
    },
    {
      id: "c4-math",
      contentType: "PPT",
      title: "Visual Guide: Interactive Cartesian Pairs",
      fileUrl: "https://www.slideshare.net/placeholder-tn-maths-cartesian"
    },
    {
      id: "c5-math",
      contentType: "MCQ",
      title: "Mastery Quiz: Cartesian Products",
      mcqs: [
        {
          question: "If A = {1, 2} and B = {a, b}, what is the set A × B?",
          options: [
            "A) {(1, a), (1, b), (2, a), (2, b)}",
            "B) {(a, 1), (b, 1), (a, 2), (b, 2)}",
            "C) {(1, 2), (a, b)}",
            "D) {(1, a), (2, b)}"
          ],
          answer: "A) {(1, a), (1, b), (2, a), (2, b)}",
          rationale: "By definition, A × B contains ordered pairs where the first element is from A and the second element is from B. Pairing 1 with a and b gives (1,a), (1,b). Pairing 2 with a and b gives (2,a), (2,b)."
        },
        {
          question: "If n(A × B) = 15 and n(A) = 3, then what is n(B)?",
          options: [
            "A) 3",
            "B) 5",
            "C) 12",
            "D) 45"
          ],
          answer: "B) 5",
          rationale: "We know that n(A × B) = n(A) × n(B). Given 15 = 3 × n(B), dividing both sides by 3 yields n(B) = 5."
        },
        {
          question: "If A × B = Ø, which of the following is true?",
          options: [
            "A) Both A and B must be non-empty",
            "B) Either A = Ø or B = Ø (or both)",
            "C) A = B",
            "D) A and B are equal to {0}"
          ],
          answer: "B) Either A = Ø or B = Ø (or both)",
          rationale: "The Cartesian product is empty if and only if there are no elements to pair. This happens if at least one of the sets is empty."
        }
      ]
    }
  ],
  "t2-math": [
    {
      id: "c6-math",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Relations & Functions",
      fileContent: "A relation R from a non-empty set A to a non-empty set B is a subset of the Cartesian product A × B. The relation is established by specifying a connection between the first element and the second element of the ordered pairs in A × B. The domain of R is the set of all first components, and the range is the set of all second components."
    },
    {
      id: "c7-math",
      contentType: "MCQ",
      title: "Mastery Quiz: Domain and Range",
      mcqs: [
        {
          question: "Let A = {1, 2, 3} and B = {4, 5}. If R = {(1, 4), (2, 5)}, what is the Domain of R?",
          options: [
            "A) {4, 5}",
            "B) {1, 2}",
            "C) {1, 2, 3}",
            "D) {1, 4}"
          ],
          answer: "B) {1, 2}",
          rationale: "The domain of a relation R is the set of all first components of the ordered pairs. Here, the first components are 1 and 2, so Domain(R) = {1, 2}."
        }
      ]
    }
  ],
  "t3-math": [
    {
      id: "c8-math",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Quadratic Equations",
      fileContent: "A quadratic equation is a second-degree polynomial equation in a single variable, written in the standard form: ax² + bx + c = 0, where a, b, and c are real constants and a ≠ 0. The solutions to a quadratic equation are called roots or zeros, and they can be found using the quadratic formula: x = [-b ± √(b² - 4ac)] / (2a)."
    },
    {
      id: "c9-math",
      contentType: "NOTES",
      title: "Revision Notes: Nature of Roots",
      fileContent: "🔍 Nature of Roots rules based on Discriminant Δ = b² - 4ac:\n\n1. If Δ > 0: Roots are real and unequal.\n2. If Δ = 0: Roots are real and equal.\n3. If Δ < 0: Roots are non-real/imaginary (no real roots exist)."
    },
    {
      id: "c10-math",
      contentType: "MCQ",
      title: "Mastery Quiz: Quadratic Equations",
      mcqs: [
        {
          question: "What is the discriminant of the quadratic equation 2x² - 5x + 3 = 0?",
          options: [
            "A) 1",
            "B) 49",
            "C) -1",
            "D) 25"
          ],
          answer: "A) 1",
          rationale: "Here, a=2, b=-5, c=3. The discriminant Δ = b² - 4ac = (-5)² - 4(2)(3) = 25 - 24 = 1."
        }
      ]
    }
  ],
  "t1-sci": [
    {
      id: "c1-sci",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Newton's First Law",
      fileContent: "Newton's First Law of Motion, also known as the Law of Inertia, states that every body continues in its state of rest or of uniform motion in a straight line unless it is compelled to change that state by forces impressed upon it."
    },
    {
      id: "c2-sci",
      contentType: "NOTES",
      title: "Revision Notes: Inertia",
      fileContent: "🏃‍♂️ Inertia can be classified into:\n1. Inertia of Rest (resists moving)\n2. Inertia of Motion (resists stopping)\n3. Inertia of Direction (resists turning)"
    },
    {
      id: "c3-sci",
      contentType: "MCQ",
      title: "Mastery Quiz: Inertia",
      mcqs: [
        {
          question: "Which physical quantity is a measure of inertia?",
          options: [
            "A) Velocity",
            "B) Acceleration",
            "C) Mass",
            "D) Force"
          ],
          answer: "C) Mass",
          rationale: "Mass is the quantitative measure of inertia. A heavier body has more inertia compared to a lighter body."
        }
      ]
    }
  ],
  "t1-soc": [
    {
      id: "c1-soc",
      contentType: "SUMMARY",
      title: "AI Concept Summary: World War I Origins",
      fileContent: "World War I (1914–1918) was a global conflict triggered by a complex network of alliances, imperial rivalry, militarism, and nationalism in Europe. The immediate cause of the war was the assassination of Archduke Franz Ferdinand of Austria-Hungary on June 28, 1914."
    },
    {
      id: "c2-soc",
      contentType: "MCQ",
      title: "Mastery Quiz: World War I",
      mcqs: [
        {
          question: "What was the immediate spark that triggered World War I?",
          options: [
            "A) Sinking of the Lusitania",
            "B) Assassination of Archduke Franz Ferdinand",
            "C) Treaty of Versailles",
            "D) Invasion of Belgium"
          ],
          answer: "B) Assassination of Archduke Franz Ferdinand",
          rationale: "The assassination of Archduke Franz Ferdinand of Austria-Hungary by a Serbian nationalist on June 28, 1914 set off a chain reaction of alliances leading to war."
        }
      ]
    }
  ],
  "t1-phy-11": [
    {
      id: "c1-phy-11",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Errors in Measurement",
      fileContent: "Error in measurement is the difference between the true value and the measured value of a physical quantity. Errors are broadly classified into:\n\n1. Systematic Errors: Instrumental, personal, external, or procedural errors which are reproducible and have a definite pattern.\n2. Random Errors: Irregular errors caused by unpredictable fluctuations in experimental conditions.\n3. Gross Errors: Caused by sheer carelessness of the observer.\n\nTo minimize errors, measurements should be repeated multiple times and the arithmetic mean should be calculated."
    },
    {
      id: "c2-phy-11",
      contentType: "NOTES",
      title: "Revision Notes: Errors Calculations",
      fileContent: "📐 Key Mathematical Formulas for Errors:\n\n1. Absolute Error: Δa_i = |a_mean - a_i|\n2. Mean Absolute Error: Δa_mean = (Σ|Δa_i|) / n\n3. Relative Error: (Δa_mean) / a_mean\n4. Percentage Error: (Δa_mean / a_mean) * 100%\n\n💡 Tip: Systemic errors are constant and can be eliminated by standardizing instruments, whereas random errors can only be minimized by taking a large number of readings and computing their average."
    },
    {
      id: "c3-phy-11",
      contentType: "PDF",
      title: "TN 11th Physics Book Extract - Measurement Chapter",
      fileUrl: "https://www.textbookcorp.tn.gov.in/pdf/11th-Physics-Vol1-EM.pdf"
    },
    {
      id: "c4-phy-11",
      contentType: "MCQ",
      title: "Mastery Quiz: Errors in Measurement",
      mcqs: [
        {
          question: "Which of the following errors can be eliminated by modifying instruments or calibration?",
          options: [
            "A) Random Error",
            "B) Systematic Error",
            "C) Gross Error",
            "D) Absolute Error"
          ],
          answer: "B) Systematic Error",
          rationale: "Systematic errors are reproducible and constant, occurring due to faults in instruments or experimental methods. Hence, recalibrating the instruments can completely eliminate them."
        },
        {
          question: "If a measurement is repeated multiple times, the average of all measurements helps minimize:",
          options: [
            "A) Systematic Error",
            "B) Random Error",
            "C) Personal Error",
            "D) Instrumental Error"
          ],
          answer: "B) Random Error",
          rationale: "Random errors are irregular and follow normal distribution. Taking the arithmetic mean of a large number of readings reduces the net random error."
        }
      ]
    }
  ],
  "t1-comp-11": [
    {
      id: "c1-comp-11",
      contentType: "SUMMARY",
      title: "AI Concept Summary: Generations of Computers",
      fileContent: "Computer history is divided into five generations, each marked by a key technological leap in component size, processing power, and software interfaces:\n\n- First Generation (1940-1956): Vacuum Tubes (ENIAC, UNIVAC)\n- Second Generation (1956-1963): Transistors (IBM 1401, COBOL/FORTRAN)\n- Third Generation (1963-1971): Integrated Circuits (ICs)\n- Fourth Generation (1971-Present): Microprocessors (VLSI/ULSI, Personal Computers)\n- Fifth Generation (Now/Future): Artificial Intelligence & Parallel Processing"
    },
    {
      id: "c2-comp-11",
      contentType: "NOTES",
      title: "Revision Notes: Computer Components Timeline",
      fileContent: "💻 Quick Tech Reference Map:\n\n- Vacuum Tubes (1st Gen): Generates intense heat, requires massive space.\n- Transistors (2nd Gen): Replaced vacuum tubes; smaller, faster, and more energy-efficient.\n- Integrated Circuits (3rd Gen): Placed multiple transistors on silicon chips, introducing keyboards, monitors, and OS.\n- Microprocessors (4th Gen): Placed millions of circuits on a single chip; birth of the Internet and PCs.\n- AI / ULSI (5th Gen): Voice activation, robotics, neural networks."
    },
    {
      id: "c3-comp-11",
      contentType: "MCQ",
      title: "Mastery Quiz: Computer Generations",
      mcqs: [
        {
          question: "Which electronic component characterizes the third generation of computers?",
          options: [
            "A) Vacuum Tubes",
            "B) Transistors",
            "C) Integrated Circuits",
            "D) Microprocessors"
          ],
          answer: "C) Integrated Circuits",
          rationale: "Integrated Circuits (ICs) were introduced in the third generation, placing multiple electrical components onto small silicon chips."
        }
      ]
    }
  ]
};

// ===========================================================================
// Routes with Database Fail-safe checks
// ===========================================================================

// GET /api/centralized-content/subjects — Get all centralized subjects for a class
router.get('/subjects', async (req: Request, res: Response) => {
  try {
    const { class: cls } = req.query;

    if (!cls) {
      return res.status(400).json({
        success: false,
        error: "class parameter is required (e.g., ?class=10)"
      });
    }

    // Try to query PostgreSQL
    const subjects = await prisma.centralSubject.findMany({
      where: {
        class: String(cls)
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: subjects
    });
  } catch (err: any) {
    console.warn("⚠️ Database query failed, falling back to local seed data. Error:", err.message || err);

    // Fail-safe: filter local mock data by class standard
    const filtered = fallbackSubjects.filter(sub => sub.class === String(req.query.class));
    res.json({
      success: true,
      isFallback: true,
      data: filtered
    });
  }
});

// GET /api/centralized-content/subjects/:id/units — Get all units and nested topics for a subject
router.get('/subjects/:id/units', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to query PostgreSQL
    const units = await prisma.centralUnit.findMany({
      where: {
        subjectId: id
      },
      include: {
        topics: {
          orderBy: {
            topicNumber: 'asc'
          }
        }
      },
      orderBy: {
        unitNumber: 'asc'
      }
    });

    res.json({
      success: true,
      data: units
    });
  } catch (err: any) {
    console.warn(`⚠️ Database query failed for units of subject ${req.params.id}, falling back. Error:`, err.message || err);

    // Fail-safe: retrieve from local mock map
    const subjectId = req.params.id;
    const units = fallbackUnits[subjectId] || [];
    res.json({
      success: true,
      isFallback: true,
      data: units
    });
  }
});

// GET /api/centralized-content/topics/:id/contents — Get all materials/summaries/MCQs for a topic
router.get('/topics/:id/contents', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to query PostgreSQL
    const contents = await prisma.centralContent.findMany({
      where: {
        topicId: id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      data: contents
    });
  } catch (err: any) {
    console.warn(`⚠️ Database query failed for topic ${req.params.id} contents, falling back. Error:`, err.message || err);

    // Fail-safe: retrieve from local mock map
    const topicId = req.params.id;
    const contents = fallbackContents[topicId] || [];
    res.json({
      success: true,
      isFallback: true,
      data: contents
    });
  }
});

export default router;
