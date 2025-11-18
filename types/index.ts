export type AccountType = 'Bank' | 'Credit Card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  account: string;
  category: string;
}

export type PatternType = 'contains' | 'startsWith' | 'regex';

export interface CategorizationRule {
  id: string;
  name: string;
  patternType: PatternType;
  patterns: string[]; // Can have multiple patterns
  targetCategory: string;
  priority: number;
}

export type PeriodType = 'Last 12 Months' | '2025' | '2024' | '2023' | '2022' | 'Custom';

export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

export interface ImportMappingState {
  headers: string[];
  mappings: {
    date: string | null;
    description: string | null;
    amount: string | null;
    account: string | null;
    category: string | null;
  };
  previewData: Record<string, string>[];
}

export interface CategoryTotal {
  category: string;
  total: number;
  color: string;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  byCategory: Record<string, number>;
}
