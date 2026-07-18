import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial real data for library, guide, neet prep, and competitive exams...");

  // Clear existing entries to allow clean re-runs
  await prisma.digitalLibraryResource.deleteMany({});
  await prisma.personalGuide.deleteMany({});
  await prisma.nEETChapter.deleteMany({});
  await prisma.nEETMockTest.deleteMany({});
  await prisma.competitiveExam.deleteMany({});
  console.log("🧹 Cleared existing records from library, guide, neet prep, and competitive exams.");

  const school = await prisma.school.findFirst();
  const schoolId = school ? school.id : null;

  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  const teacherId = teacher ? teacher.id : null;

  // 1. Digital Library Resources
  const existingResources = await prisma.digitalLibraryResource.count();
  if (existingResources === 0) {
    await prisma.digitalLibraryResource.createMany({
      data: [
        {
          title: "Class 12 Physics – Wave Optics Notes",
          type: "PDF",
          subject: "Physics",
          class: "12",
          size: "2.4 MB",
          description: "Comprehensive notes covering interference, diffraction, polarization with solved examples.",
          tags: ["NEET", "Board Exam", "Optics"],
          schoolId,
          teacherId,
        },
        {
          title: "Organic Chemistry Reaction Mechanism",
          type: "Video",
          subject: "Chemistry",
          class: "11",
          size: "145 MB",
          description: "Step-by-step video explanation of all major organic reaction mechanisms for NEET & JEE.",
          tags: ["NEET", "JEE", "Organic"],
          schoolId,
          teacherId,
        },
        {
          title: "Genetics & Evolution Practice Worksheet",
          type: "Worksheet",
          subject: "Biology",
          class: "12",
          size: "1.1 MB",
          description: "Practice problems on Mendelian genetics, molecular biology and evolution theories.",
          tags: ["Biology", "NEET", "Genetics"],
          schoolId,
          teacherId,
        },
        {
          title: "Trigonometry Formulas Revision Sheet",
          type: "PDF",
          subject: "Mathematics",
          class: "10",
          size: "0.8 MB",
          description: "All key trigonometry formulas, identities and standard values compiled for quick revision.",
          tags: ["Board Exam", "Maths", "Revision"],
          schoolId,
          teacherId,
        },
      ]
    });
    console.log("✅ Seeded Digital Library Resources.");
  }

  // 2. Personal Guide Profiles
  const existingGuides = await prisma.personalGuide.count();
  if (existingGuides === 0) {
    const dbStudents = await prisma.student.findMany({
      include: { user: true },
      take: 6
    });

    const goals = [
      "NEET – Medical College",
      "JEE – Engineering",
      "UPSC / Civil Services",
      "Chartered Accountant (CA)",
      "Defence Services (NDA)",
      "Sports/Aptitude Career"
    ];

    const strengthsList = [
      ["Biology", "Chemistry"],
      ["Mathematics", "Physics"],
      ["English", "Social Science"],
      ["Tamil", "Accountancy"],
      ["Physics", "Chemistry"],
      ["Drawing", "Sports"]
    ];

    const weaknessesList = [
      ["Physics", "Mathematics"],
      ["English", "Chemistry"],
      ["Mathematics", "Science"],
      ["English", "Maths"],
      ["Biology", "Tamil"],
      ["Mathematics", "Science"]
    ];

    const guideStatus = ["On Track", "Needs Attention", "At Risk", "On Track", "Needs Attention", "On Track"];
    const notesList = [
      "Strong in science. Needs extra coaching in Physics. Attends all mock tests regularly.",
      "Good at quantitative subjects. Language skills need improvement. Parent meeting scheduled.",
      "Excellent in humanities. Interested in civil services. Referred to scholarship programs.",
      "Very dedicated to commerce stream. Needs guidance on foundation exams.",
      "Highly motivated for military career. Physical training is excellent, academic score needs improvement.",
      "Top talent in sports. Balancing academics and athletic career well."
    ];

    if (dbStudents.length > 0) {
      const guideData = dbStudents.map((s, idx) => ({
        studentName: s.user.name,
        studentId: s.id,
        class: s.class,
        section: s.section,
        academicScore: 60 + Math.floor(Math.random() * 35),
        attendance: 75 + Math.floor(Math.random() * 23),
        strengths: strengthsList[idx % strengthsList.length],
        weaknesses: weaknessesList[idx % weaknessesList.length],
        goal: goals[idx % goals.length],
        parentContact: s.parentMobile || "+91 98765 4321" + idx,
        guidanceStatus: guideStatus[idx % guideStatus.length],
        notes: notesList[idx % notesList.length],
        lastMeeting: new Date(Date.now() - (idx * 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        schoolId: s.schoolId || schoolId,
        teacherId,
      }));

      await prisma.personalGuide.createMany({
        data: guideData
      });
      console.log(`✅ Seeded ${guideData.length} Personal Guide Profiles using real students.`);
    } else {
      console.log("⚠️ No students found in the database to link guidance profiles.");
    }
  }

  // 3. NEET Prep Chapters
  await prisma.nEETChapter.createMany({
    data: [
      {
        subject: "Biology",
        chapter: "Cell Biology & Genetics",
        difficulty: "Hard",
        totalQuestions: 120,
        attempted: 120,
        correct: 97,
        status: "Completed",
        schoolId,
        teacherId,
      },
      {
        subject: "Biology",
        chapter: "Human Physiology",
        difficulty: "Medium",
        totalQuestions: 98,
        attempted: 72,
        correct: 54,
        status: "In Progress",
        schoolId,
        teacherId,
      },
      {
        subject: "Chemistry",
        chapter: "Organic Chemistry",
        difficulty: "Hard",
        totalQuestions: 145,
        attempted: 90,
        correct: 60,
        status: "In Progress",
        schoolId,
        teacherId,
      },
      {
        subject: "Physics",
        chapter: "Mechanics & Thermodynamics",
        difficulty: "Hard",
        totalQuestions: 110,
        attempted: 110,
        correct: 82,
        status: "Completed",
        schoolId,
        teacherId,
      },
    ]
  });
  console.log("✅ Seeded NEET Chapters.");

  // 4. NEET Mock Tests
  await prisma.nEETMockTest.createMany({
    data: [
      {
        title: "NEET Grand Mock #4",
        subject: "Full Syllabus",
        examDate: "2025-07-05",
        duration: "3 hrs 20 min",
        totalStudents: 48,
        avgScore: 512,
        topScore: 680,
        maxScore: 720,
        schoolId,
        teacherId,
      },
      {
        title: "Biology Booster Test",
        subject: "Biology",
        examDate: "2025-06-28",
        duration: "1 hr",
        totalStudents: 52,
        avgScore: 145,
        topScore: 180,
        maxScore: 180,
        schoolId,
        teacherId,
      },
    ]
  });
  console.log("✅ Seeded NEET Mock Tests.");

  // 5. Competitive Exams
  await prisma.competitiveExam.createMany({
    data: [
      {
        examName: "NEET UG 2026",
        category: "Medical",
        conductedBy: "NTA",
        registrationDeadline: "2026-02-15",
        examDate: "2026-05-03",
        status: "Registration Open",
        eligibility: "Class 12 with PCB (45%+)",
        website: "neet.nta.nic.in",
        studentsEnrolled: 48,
        studentsCleared: 12,
        schoolId,
        teacherId,
        syllabus: [
          {
            name: "Biology",
            icon: "🧬",
            color: "text-pink-500 bg-pink-500/10",
            chapters: [
              { id: "b1", name: "Genetics & Molecular Basis", concepts: ["Mendelian Monohybrid/Dihybrid Crosses", "DNA Double Helix Structure", "Replication Fork & Semi-conservative model", "mRNA Transcription Mechanism", "Ribosomal Translation & Codons Map", "Lac Operon Model", "DNA Fingerprinting technique"] },
              { id: "b2", name: "Human Physiology Systems", concepts: ["Breathing mechanics & Alveolar exchange", "Cardiac cycle & Double circulation", "Nephron Filtration & Urine formation", "Neuron action potential & Synapse transmission", "Endocrine Hormonal Feedback loops"] },
              { id: "b3", name: "Plant Physiology & Metabolism", concepts: ["Photosynthesis Light & Dark reactions", "C3 and C4 pathway comparative cycles", "Glycolysis & Krebs cellular respiration", "Plant hormones (Auxins, Gibberellins, ABA)"] },
              { id: "b4", name: "Cell Structure & Divisions", concepts: ["Prokaryotic vs Eukaryotic cellular matrix", "Cell cycle check points (G1, S, G2)", "Mitosis phases and Spindle assembly", "Meiosis I and II reductional divisions"] },
              { id: "b5", name: "Reproduction & Health", concepts: ["Spermatogenesis & Oogenesis steps", "Menstrual hormonal flow cycles", "In-Vitro Fertilization & Assisted reproduction", "Contraception mechanisms & STDs overview"] },
              { id: "b6", name: "Ecology & Environmental Biology", concepts: ["Food chains & trophic level dynamics", "Ecological pyramids of biomass & energy", "Biodiversity hot-spots and conservation", "Greenhouse effect and global warming parameters"] }
            ]
          },
          {
            name: "Chemistry",
            icon: "🧪",
            color: "text-emerald-500 bg-emerald-500/10",
            chapters: [
              { id: "c1", name: "Organic Reaction Mechanisms", concepts: ["Inductive, Electromeric & Resonance effects", "SN1 and SN2 nucleophilic substitutions", "Electrophilic aromatic substitutions", "Aldol condensation & Cannizzaro reactions", "Hoffmann bromamide degradation"] },
              { id: "c2", name: "Chemical Bonding & Atoms", concepts: ["Bohr atomic orbit model limitations", "Quantum numbers & configuration rules", "VSEPR molecular geometry layout", "Hybridization theory (sp, sp2, sp3, dsp2)", "Molecular Orbital configuration of O2 and N2"] },
              { id: "c3", name: "Physical Solutions & Kinetics", concepts: ["Raoult's law of ideal mixtures", "Colligative properties (Elevation/Depression)", "First-order kinetics & Half-life metrics", "Arrhenius equation & activation barrier"] },
              { id: "c4", name: "Coordination Chemistry", concepts: ["Werner's coordination hypothesis", "Unidentate & Polydentate ligand properties", "Crystal Field Splitting (Octahedral/Tetrahedral)", "d-block magnetic moment calculations"] }
            ]
          },
          {
            name: "Physics",
            icon: "⚛️",
            color: "text-blue-500 bg-blue-500/10",
            chapters: [
              { id: "p1", name: "Classical Mechanics", concepts: ["Kinematic equations of motion", "Newton's laws & Free-body diagrams", "Friction models (Static/Kinetic)", "Work-Energy theorem and conservative forces", "Rotational moment of inertia equations"] },
              { id: "p2", name: "Electrostatics & Circuits", concepts: ["Coulomb's electrostatic law", "Gauss flux theorem applications", "Capacitor energy storage formulas", "Ohm's law & drift velocity parameters", "Kirchhoff current/voltage junction loops", "Wheatstone bridge balanced criteria"] },
              { id: "p3", name: "Optics & Modern Physics", concepts: ["Reflection, Refraction & Lens makers formula", "Young's double slit interference", "Photoelectric threshold & Einstein equation", "Bohr Hydrogen spectrum lines", "PN Junction diode forward/reverse bias"] }
            ]
          }
        ]
      },
      {
        examName: "JEE Main 2026",
        category: "Engineering",
        conductedBy: "NTA",
        registrationDeadline: "2025-11-30",
        examDate: "2026-01-22",
        status: "Registration Open",
        eligibility: "Class 12 with PCM (75%+)",
        website: "jeemain.nta.nic.in",
        studentsEnrolled: 32,
        studentsCleared: 8,
        schoolId,
        teacherId,
        syllabus: [
          {
            name: "Mathematics",
            icon: "📐",
            color: "text-purple-500 bg-purple-500/10",
            chapters: [
              { id: "jm1", name: "Calculus", concepts: ["Limits, Continuity & Differentiability", "Integral Calculus", "Differential Equations"] },
              { id: "jm2", name: "Algebra", concepts: ["Matrices & Determinants", "Quadratic Equations", "Probability", "Complex Numbers"] }
            ]
          },
          {
            name: "Physics",
            icon: "⚛️",
            color: "text-blue-500 bg-blue-500/10",
            chapters: [
              { id: "jp1", name: "Mechanics", concepts: ["Kinematics", "Laws of Motion & Work", "Rotational Dynamics"] }
            ]
          }
        ]
      },
      {
        examName: "TNPSC Group IV",
        category: "Civil Services",
        conductedBy: "TNPSC",
        registrationDeadline: "2025-08-20",
        examDate: "2025-10-12",
        status: "Upcoming",
        eligibility: "Class 10 / +2 pass",
        website: "tnpsc.gov.in",
        studentsEnrolled: 18,
        studentsCleared: 0,
        schoolId,
        teacherId,
      },
    ]
  });
  console.log("✅ Seeded Competitive Exams.");

  console.log("🌱 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
