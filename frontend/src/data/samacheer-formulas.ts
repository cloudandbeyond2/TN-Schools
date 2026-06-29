export interface SamacheerFormula {
  id: number;
  title: {
    en: string;
    ta: string;
  };
  formula: string;
  category: string; // Internal chapter ID (e.g., "measurements", "profit-loss")
  categoryName: {
    en: string;
    ta: string;
  };
  standard: "6" | "7" | "8" | "9" | "10" | "11" | "12";
  term?: "1" | "2" | "3"; // Mostly for middle school
  popular: boolean;
  bg: string;
  mnemonicPrompt: string;
  mnemonicText: string;
}

export const samacheerFormulas: SamacheerFormula[] = [
  // 6TH STANDARD - TERM 3 (Measurements / Perimeter and Area)
  {
    id: 101,
    title: { en: "Area of a Rectangle", ta: "செவ்வகத்தின் பரப்பளவு" },
    formula: "A = l × w",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: true,
    bg: "from-yellow-400 to-amber-500",
    mnemonicPrompt: "A glowing golden rectangle box with mathematical dimensions. Educational 3d style.",
    mnemonicText: "Just multiply the length by the width to find how many squares fit inside!"
  },
  {
    id: 102,
    title: { en: "Perimeter of a Rectangle", ta: "செவ்வகத்தின் சுற்றளவு" },
    formula: "P = 2(l + w)",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: true,
    bg: "from-emerald-400 to-teal-500",
    mnemonicPrompt: "A person walking along the bright glowing borders of a giant rectangular field. 3d educational style.",
    mnemonicText: "Walk the length, walk the width, do it again and you've walked the whole perimeter!"
  },
  {
    id: 103,
    title: { en: "Area of a Square", ta: "சதுரத்தின் பரப்பளவு" },
    formula: "A = a × a",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: false,
    bg: "from-sky-400 to-cyan-500",
    mnemonicPrompt: "A glowing neon perfect square. Educational 3d style.",
    mnemonicText: "A square has equal sides, so just multiply the side by itself!"
  },
  {
    id: 104,
    title: { en: "Perimeter of a Square", ta: "சதுரத்தின் சுற்றளவு" },
    formula: "P = 4a",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: false,
    bg: "from-indigo-400 to-violet-500",
    mnemonicPrompt: "Four identical neon sticks forming a perfect square border. Educational 3d illustration.",
    mnemonicText: "All four sides are equal! Just multiply the side by 4 to get the total border."
  },

  // 6TH STANDARD - TERM 2 (Profit and Loss)
  {
    id: 105,
    title: { en: "Profit", ta: "இலாபம்" },
    formula: "Profit = SP - CP",
    category: "profit-loss",
    categoryName: { en: "Profit and Loss", ta: "இலாபம் மற்றும் நட்டம்" },
    standard: "6",
    term: "2",
    popular: true,
    bg: "from-green-400 to-emerald-600",
    mnemonicPrompt: "A happy merchant character counting shiny gold coins, trading in a medieval market. Educational 3d style.",
    mnemonicText: "If the Selling Price (SP) is higher than the Cost Price (CP), you made money! That's a Profit."
  },
  {
    id: 106,
    title: { en: "Loss", ta: "நட்டம்" },
    formula: "Loss = CP - SP",
    category: "profit-loss",
    categoryName: { en: "Profit and Loss", ta: "இலாபம் மற்றும் நட்டம்" },
    standard: "6",
    term: "2",
    popular: true,
    bg: "from-red-400 to-rose-600",
    mnemonicPrompt: "A sad merchant dropping coins out of a hole in a sack. Educational 3d style.",
    mnemonicText: "If you bought it for more (CP) than you sold it (SP), you lost money! That's a Loss."
  },
  {
    id: 107,
    title: { en: "Discount", ta: "தள்ளுபடி" },
    formula: "Discount = MP - SP",
    category: "profit-loss",
    categoryName: { en: "Profit and Loss", ta: "இலாபம் மற்றும் நட்டம்" },
    standard: "6",
    term: "2",
    popular: true,
    bg: "from-pink-400 to-rose-500",
    mnemonicPrompt: "A giant glowing red sale tag in a store. Educational 3d style.",
    mnemonicText: "Discount is what the shopkeeper takes off the Marked Price (MP) before selling it to you!"
  },
  {
    id: 108,
    title: { en: "Selling Price (with Discount)", ta: "விற்பனை விலை" },
    formula: "SP = MP - Discount",
    category: "profit-loss",
    categoryName: { en: "Profit and Loss", ta: "இலாபம் மற்றும் நட்டம்" },
    standard: "6",
    term: "2",
    popular: false,
    bg: "from-purple-400 to-fuchsia-500",
    mnemonicPrompt: "A glowing cash register showing the final price after a discount. Educational 3d style.",
    mnemonicText: "The final price you pay (SP) is the Marked Price minus the Discount."
  },
  {
    id: 109,
    title: { en: "Metric Length", ta: "நீள அளவைகள்" },
    formula: "1 km = 1000 m",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "2",
    popular: true,
    bg: "from-cyan-400 to-blue-500",
    mnemonicPrompt: "A glowing road stretching far with a kilometer marker. Educational 3d style.",
    mnemonicText: "Kilo means thousand! One kilometer is one thousand meters."
  },
  
  // 6TH STANDARD - TERM 1
  {
    id: 110,
    title: { en: "Order of Operations", ta: "செயல்பாடுகளின் வரிசை" },
    formula: "BIDMAS",
    category: "numbers",
    categoryName: { en: "Numbers", ta: "எண்கள்" },
    standard: "6",
    term: "1",
    popular: true,
    bg: "from-amber-400 to-orange-500",
    mnemonicPrompt: "Large glowing 3d letters spelling BIDMAS with math symbols around them.",
    mnemonicText: "Brackets, Indices, Division, Multiplication, Addition, Subtraction! Always solve in this order."
  },
  {
    id: 111,
    title: { en: "Ratio Format", ta: "விகிதம்" },
    formula: "a : b = a / b",
    category: "ratio",
    categoryName: { en: "Ratio & Proportion", ta: "விகிதம் மற்றும் விகிதச்சமன்பாடு" },
    standard: "6",
    term: "1",
    popular: true,
    bg: "from-lime-400 to-green-500",
    mnemonicPrompt: "Two distinct groups of colorful glowing balls separated by a colon. Educational 3d style.",
    mnemonicText: "A ratio compares two quantities and can always be written as a fraction!"
  },
  {
    id: 112,
    title: { en: "Proportion Law", ta: "விகிதச்சமன்பாடு" },
    formula: "a:b :: c:d ⇒ ad = bc",
    category: "ratio",
    categoryName: { en: "Ratio & Proportion", ta: "விகிதம் மற்றும் விகிதச்சமன்பாடு" },
    standard: "6",
    term: "1",
    popular: false,
    bg: "from-indigo-400 to-blue-500",
    mnemonicPrompt: "A balancing scale holding four mathematical variables a, b, c, d in perfect equilibrium.",
    mnemonicText: "Product of extremes (a and d) equals the product of means (b and c)!"
  },

  // 6TH STANDARD - TERM 3 (Additional)
  {
    id: 113,
    title: { en: "Fractions", ta: "பின்னங்கள்" },
    formula: "Fraction = Numerator / Denominator",
    category: "fractions",
    categoryName: { en: "Fractions", ta: "பின்னங்கள்" },
    standard: "6",
    term: "3",
    popular: true,
    bg: "from-rose-400 to-pink-600",
    mnemonicPrompt: "A delicious pizza with one slice taken out, showing a fraction. Educational 3d illustration.",
    mnemonicText: "Numerator is the part you have, Denominator is the total parts down below!"
  },
  {
    id: 114,
    title: { en: "Perimeter of Right Triangle", ta: "செங்கோண முக்கோணத்தின் சுற்றளவு" },
    formula: "P = a + b + c",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: false,
    bg: "from-teal-400 to-emerald-500",
    mnemonicPrompt: "A glowing right-angled triangle with three distinct sides labeled a, b, c.",
    mnemonicText: "Just add up all three sides of the triangle to find its boundary length!"
  },
  {
    id: 115,
    title: { en: "Area of Right Triangle", ta: "செங்கோண முக்கோணத்தின் பரப்பளவு" },
    formula: "A = 1/2 × b × h",
    category: "measurements",
    categoryName: { en: "Measurements", ta: "அளவைகள்" },
    standard: "6",
    term: "3",
    popular: true,
    bg: "from-blue-400 to-indigo-500",
    mnemonicPrompt: "A glowing right-angled triangle fitting perfectly inside half of a rectangle.",
    mnemonicText: "A right triangle is just half a rectangle! So it's half of base times height."
  }
];
