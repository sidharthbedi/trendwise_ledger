import { Transaction, CategorizationRule } from '@/types';

// Category color mapping
export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#ef4444', // red-500
  'Food & Groceries': '#f97316', // orange-500
  Transportation: '#eab308', // yellow-500
  Entertainment: '#22c55e', // green-500
  Utilities: '#a855f7', // purple-500
  Shopping: '#ec4899', // pink-500
  Dining: '#f59e0b', // amber-500
  Healthcare: '#06b6d4', // cyan-500
  Education: '#3b82f6', // blue-500
  Travel: '#8b5cf6', // violet-500
  Other: '#6b7280', // gray-500
};

// Built-in categorization rules
export const BUILTIN_RULES: CategorizationRule[] = [
  {
    id: 'rule-netflix',
    name: 'Entertainment - Streaming',
    patternType: 'contains',
    patterns: ['netflix', 'prime video', 'disney', 'spotify', 'apple music'],
    targetCategory: 'Entertainment',
    priority: 10,
  },
  {
    id: 'rule-groceries',
    name: 'Food & Groceries - Supermarkets',
    patternType: 'contains',
    patterns: ['whole foods', 'walmart', 'target', 'reliance fresh', 'big bazaar', 'd-mart'],
    targetCategory: 'Food & Groceries',
    priority: 10,
  },
  {
    id: 'rule-transport',
    name: 'Transportation - Ride Share',
    patternType: 'contains',
    patterns: ['uber', 'lyft', 'ola', 'rapido'],
    targetCategory: 'Transportation',
    priority: 10,
  },
  {
    id: 'rule-dining',
    name: 'Dining - Food Delivery',
    patternType: 'contains',
    patterns: ['swiggy', 'zomato', 'ubereats', 'doordash', 'grubhub'],
    targetCategory: 'Dining',
    priority: 10,
  },
  {
    id: 'rule-shopping',
    name: 'Shopping - Online',
    patternType: 'contains',
    patterns: ['amazon', 'flipkart', 'myntra', 'ajio'],
    targetCategory: 'Shopping',
    priority: 5,
  },
  {
    id: 'rule-rent',
    name: 'Housing - Rent',
    patternType: 'contains',
    patterns: ['rent', 'lease', 'property'],
    targetCategory: 'Housing',
    priority: 10,
  },
  {
    id: 'rule-utilities',
    name: 'Utilities - Bills',
    patternType: 'contains',
    patterns: ['electricity', 'water', 'gas', 'internet', 'broadband', 'airtel', 'jio', 'vodafone'],
    targetCategory: 'Utilities',
    priority: 10,
  },
];

// MCC code to category mapping (simplified)
export const MCC_CATEGORIES: Record<string, string> = {
  '5411': 'Food & Groceries', // Grocery stores
  '5812': 'Dining', // Restaurants
  '5814': 'Dining', // Fast food
  '5541': 'Transportation', // Gas stations
  '5542': 'Transportation', // Automated fuel dispensers
  '4121': 'Transportation', // Taxicabs
  '4131': 'Transportation', // Bus lines
  '5311': 'Shopping', // Department stores
  '5399': 'Shopping', // Misc. general merchandise
  '5733': 'Entertainment', // Music stores
  '5735': 'Entertainment', // Record shops
  '7832': 'Entertainment', // Motion picture theaters
  '7991': 'Entertainment', // Tourist attractions
};

/**
 * Apply categorization rules to a transaction
 */
export function applyCategorizationRules(
  transaction: Transaction,
  customRules: CategorizationRule[] = []
): string {
  // If already has a category, keep it
  if (transaction.category && transaction.category !== 'Other') {
    return transaction.category;
  }

  const allRules = [...customRules, ...BUILTIN_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of allRules) {
    if (matchesRule(transaction.description, rule)) {
      return rule.targetCategory;
    }
  }

  // Try MCC code matching
  const mccCategory = getMCCCategory(transaction.description);
  if (mccCategory) {
    return mccCategory;
  }

  return 'Other';
}

/**
 * Check if a description matches a rule
 */
function matchesRule(description: string, rule: CategorizationRule): boolean {
  const lowerDesc = description.toLowerCase();

  for (const pattern of rule.patterns) {
    const lowerPattern = pattern.toLowerCase();

    switch (rule.patternType) {
      case 'contains':
        if (lowerDesc.includes(lowerPattern)) {
          return true;
        }
        break;
      case 'startsWith':
        if (lowerDesc.startsWith(lowerPattern)) {
          return true;
        }
        break;
      case 'regex':
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(description)) {
            return true;
          }
        } catch (e) {
          // Invalid regex, skip
        }
        break;
    }
  }

  return false;
}

/**
 * Extract MCC code from description and return category
 */
function getMCCCategory(description: string): string | null {
  // Look for 4-digit numbers in description
  const mccMatch = description.match(/\b(\d{4})\b/);
  if (mccMatch) {
    const mcc = mccMatch[1];
    return MCC_CATEGORIES[mcc] || null;
  }
  return null;
}

/**
 * Get color for a category
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_COLORS);
}
