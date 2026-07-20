export interface SamacheerFormula {
  id: number;
  standard: string;
  term: string;
  category: string;
  categoryName: {
    en: string;
    ta: string;
  };
  title: {
    en: string;
    ta: string;
  };
  formula: string;
  description?: {
    en: string;
    ta: string;
  };
  variables?: any[];
  [key: string]: any;
}

export const samacheerFormulas: SamacheerFormula[] = [
  {
    id: 1,
    standard: "6",
    term: "1",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Area of a Rectangle", ta: "செவ்வகத்தின் பரப்பளவு" },
    formula: "A = l × w",
    bg: "from-emerald-400 to-emerald-600",
    popular: true,
    mnemonicText: "A Lengthy Walk",
    mnemonicPrompt: "A Lengthy Walk mnemonic",
    variables: []
  },
  {
    id: 2,
    standard: "6",
    term: "2",
    category: "geometry",
    categoryName: { en: "Geometry", ta: "வடிவியல்" },
    title: { en: "Area of a Square", ta: "சதுரத்தின் பரப்பளவு" },
    formula: "A = a²",
    bg: "from-blue-400 to-blue-600",
    popular: false,
    mnemonicText: "A square area",
    mnemonicPrompt: "A square area mnemonic",
    variables: []
  },
  {
    id: 3,
    standard: "7",
    term: "1",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Area of a Parallelogram", ta: "இணைகரத்தின் பரப்பளவு" },
    formula: "A = b × h",
    bg: "from-purple-400 to-purple-600",
    popular: true,
    mnemonicText: "Base height parallelogram",
    mnemonicPrompt: "A parallelogram area mnemonic",
    variables: []
  },
  {
    id: 4,
    standard: "7",
    term: "3",
    category: "algebra",
    categoryName: { en: "Algebra", ta: "இயற்கணிதம்" },
    title: { en: "Simple Interest", ta: "தனி வட்டி" },
    formula: "I = (P × N × R) / 100",
    bg: "from-amber-400 to-amber-600",
    popular: true,
    mnemonicText: "PNR divide by 100",
    mnemonicPrompt: "Simple interest mnemonic PNR",
    variables: []
  },
  {
    id: 5,
    standard: "8",
    term: "1",
    category: "geometry",
    categoryName: { en: "Geometry", ta: "வடிவியல்" },
    title: { en: "Area of a Circle", ta: "வட்டத்தின் பரப்பளவு" },
    formula: "A = π × r²",
    bg: "from-rose-400 to-rose-600",
    popular: true,
    mnemonicText: "Pie are square",
    mnemonicPrompt: "Area of circle mnemonic pie square",
    variables: []
  },
  {
    id: 6,
    standard: "8",
    term: "2",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Volume of a Cube", ta: "கனசதுரத்தின் கனஅளவு" },
    formula: "V = a³",
    bg: "from-cyan-400 to-cyan-600",
    popular: false,
    mnemonicText: "Cube side three times",
    mnemonicPrompt: "Volume of a cube mnemonic",
    variables: []
  },
  {
    id: 7,
    standard: "6",
    term: "1",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Perimeter of a Rectangle", ta: "செவ்வகத்தின் சுற்றளவு" },
    formula: "P = 2(l + w)",
    bg: "from-teal-400 to-teal-600",
    popular: true,
    mnemonicText: "Two lengths, two widths",
    mnemonicPrompt: "Perimeter of a rectangle mnemonic",
    variables: []
  },
  {
    id: 8,
    standard: "6",
    term: "2",
    category: "geometry",
    categoryName: { en: "Geometry", ta: "வடிவியல்" },
    title: { en: "Perimeter of a Square", ta: "சதுரத்தின் சுற்றளவு" },
    formula: "P = 4a",
    bg: "from-sky-400 to-sky-600",
    popular: true,
    mnemonicText: "Four equal sides",
    mnemonicPrompt: "Perimeter of a square mnemonic",
    variables: []
  },
  {
    id: 9,
    standard: "7",
    term: "1",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Area of a Triangle", ta: "முக்கோணத்தின் பரப்பளவு" },
    formula: "A = ½ × b × h",
    bg: "from-indigo-400 to-indigo-600",
    popular: true,
    mnemonicText: "Half base height",
    mnemonicPrompt: "Area of a triangle mnemonic",
    variables: []
  },
  {
    id: 10,
    standard: "7",
    term: "2",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Area of a Rhombus", ta: "சாய் சதுரத்தின் பரப்பளவு" },
    formula: "A = ½ × d₁ × d₂",
    bg: "from-violet-400 to-violet-600",
    popular: false,
    mnemonicText: "Half product of diagonals",
    mnemonicPrompt: "Area of a rhombus mnemonic",
    variables: []
  },
  {
    id: 11,
    standard: "8",
    term: "1",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவீடுகள்" },
    title: { en: "Circumference of a Circle", ta: "வட்டத்தின் சுற்றளவு" },
    formula: "C = 2πr",
    bg: "from-fuchsia-400 to-fuchsia-600",
    popular: true,
    mnemonicText: "Two pies round",
    mnemonicPrompt: "Circumference of a circle mnemonic",
    variables: []
  },
  {
    id: 12,
    standard: "8",
    term: "3",
    category: "algebra",
    categoryName: { en: "Algebra", ta: "இயற்கணிதம்" },
    title: { en: "Algebraic Identity 1", ta: "இயற்கணித முற்றுரிமை 1" },
    formula: "(a + b)² = a² + 2ab + b²",
    bg: "from-orange-400 to-orange-600",
    popular: true,
    mnemonicText: "Square of sum",
    mnemonicPrompt: "Algebraic identity square of sum mnemonic",
    variables: []
  },
  {
    id: 13,
    standard: "8",
    term: "3",
    category: "algebra",
    categoryName: { en: "Algebra", ta: "இயற்கணிதம்" },
    title: { en: "Algebraic Identity 2", ta: "இயற்கணித முற்றுரிமை 2" },
    formula: "(a - b)² = a² - 2ab + b²",
    bg: "from-red-400 to-red-600",
    popular: true,
    mnemonicText: "Square of difference",
    mnemonicPrompt: "Algebraic identity square of difference mnemonic",
    variables: []
  }
];
