export interface SamacheerFormula {
  id: string | number;
  standard: string;
  term: string;
  category: string;
  categoryName: string;
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

export const samacheerFormulas: SamacheerFormula[] = [];
