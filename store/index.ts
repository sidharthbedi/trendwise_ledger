import { create } from 'zustand';
import {
  Transaction,
  Account,
  CategorizationRule,
  PeriodType,
  DateRange,
  ImportMappingState,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { applyCategorizationRules, BUILTIN_RULES } from '@/lib/categorization';
import { getDateRangeForPeriod, isDateInRange } from '@/lib/dates';
import { parseDate } from '@/lib/dates';

interface ExpenseStore {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  customRules: CategorizationRule[];

  // UI State
  selectedPeriod: PeriodType;
  customDateRange: DateRange | null;
  importMappingState: ImportMappingState | null;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;

  addRule: (rule: Omit<CategorizationRule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<CategorizationRule>) => void;
  deleteRule: (id: string) => void;

  setSelectedPeriod: (period: PeriodType) => void;
  setCustomDateRange: (range: DateRange) => void;

  setImportMappingState: (state: ImportMappingState | null) => void;

  recategorizeTransactions: () => void;

  // Selectors
  getFilteredTransactions: () => Transaction[];
  getDateRange: () => DateRange;
}

// Generate seed data
function generateSeedData(): { accounts: Account[]; transactions: Transaction[] } {
  const accounts: Account[] = [
    { id: 'acc-1', name: 'HDFC Bank Savings', type: 'Bank' },
    { id: 'acc-2', name: 'ICICI Credit Card', type: 'Credit Card' },
  ];

  const seedTransactions: Omit<Transaction, 'id'>[] = [
    // 2022
    { date: '2022-01-15', description: 'Rent Payment', amount: 25000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2022-02-10', description: 'Swiggy Order', amount: 450, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-03-20', description: 'Uber Ride', amount: 280, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-04-05', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-05-12', description: 'Big Bazaar Shopping', amount: 3200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2022-06-18', description: 'Electricity Bill', amount: 1200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2022-07-22', description: 'Amazon Purchase', amount: 2800, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-08-08', description: 'Ola Cab', amount: 350, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-09-14', description: 'Zomato Food', amount: 680, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2022-10-25', description: 'D-Mart Groceries', amount: 2500, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2022-11-11', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2022-12-30', description: 'Myntra Shopping', amount: 4500, account: 'ICICI Credit Card', category: 'Other' },

    // 2023
    { date: '2023-01-12', description: 'Rent Payment', amount: 26000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-01-20', description: 'Reliance Fresh', amount: 1800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-02-05', description: 'Swiggy Order', amount: 520, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-02-18', description: 'Water Bill', amount: 400, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-03-10', description: 'Uber Ride', amount: 310, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-03-25', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-04-07', description: 'Amazon Purchase 5411', amount: 3500, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-04-22', description: 'Electricity Bill', amount: 1450, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-05-15', description: 'Flipkart Order', amount: 2200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-05-28', description: 'Big Bazaar Shopping', amount: 4100, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-06-10', description: 'Ola Cab', amount: 280, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-06-20', description: 'Zomato Food 5812', amount: 750, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-07-05', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-07-18', description: 'Rent Payment', amount: 26000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-08-12', description: 'D-Mart Groceries', amount: 3800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-08-25', description: 'Myntra Shopping', amount: 5200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-09-08', description: 'Swiggy Order', amount: 480, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-09-22', description: 'Electricity Bill', amount: 1300, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-10-10', description: 'Uber Ride', amount: 420, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-10-28', description: 'Amazon Purchase', amount: 6800, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-11-15', description: 'Reliance Fresh', amount: 2100, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-11-30', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2023-12-12', description: 'Rent Payment', amount: 26000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2023-12-28', description: 'Flipkart Order', amount: 8900, account: 'ICICI Credit Card', category: 'Other' },

    // 2024
    { date: '2024-01-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-01-18', description: 'Big Bazaar Shopping', amount: 4500, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-01-25', description: 'Swiggy Order', amount: 620, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-02-05', description: 'Electricity Bill', amount: 1650, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-02-15', description: 'Uber Ride', amount: 380, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-02-28', description: 'Amazon Purchase', amount: 5400, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-03-10', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-03-20', description: 'D-Mart Groceries', amount: 3900, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-03-28', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-04-05', description: 'Zomato Food', amount: 890, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-04-15', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-04-25', description: 'Myntra Shopping', amount: 7200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-05-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-05-18', description: 'Reliance Fresh', amount: 2800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-05-28', description: 'Ola Cab', amount: 320, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-06-10', description: 'Electricity Bill', amount: 1800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-06-20', description: 'Swiggy Order', amount: 540, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-06-30', description: 'Amazon Purchase', amount: 4200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-07-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-07-18', description: 'Big Bazaar Shopping', amount: 5100, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-07-28', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-08-05', description: 'Uber Ride', amount: 450, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-08-15', description: 'D-Mart Groceries', amount: 4200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-08-25', description: 'Zomato Food', amount: 780, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-09-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-09-18', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-09-28', description: 'Flipkart Order', amount: 6500, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-10-10', description: 'Electricity Bill', amount: 1900, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-10-20', description: 'Reliance Fresh', amount: 3200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-10-30', description: 'Swiggy Order', amount: 690, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-11-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-11-18', description: 'Amazon Purchase', amount: 5800, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-11-28', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2024-12-08', description: 'Rent Payment', amount: 28000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-12-18', description: 'Big Bazaar Shopping', amount: 6200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2024-12-28', description: 'Myntra Shopping', amount: 9800, account: 'ICICI Credit Card', category: 'Other' },

    // 2025 (January - November)
    { date: '2025-01-10', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-01-20', description: 'D-Mart Groceries', amount: 4800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-01-28', description: 'Swiggy Order', amount: 720, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-02-05', description: 'Electricity Bill', amount: 2100, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-02-15', description: 'Uber Ride', amount: 480, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-02-25', description: 'Amazon Purchase', amount: 7200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-03-08', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-03-18', description: 'Reliance Fresh', amount: 3800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-03-28', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-04-05', description: 'Zomato Food', amount: 850, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-04-15', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-04-25', description: 'Flipkart Order', amount: 5600, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-05-10', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-05-20', description: 'Big Bazaar Shopping', amount: 5400, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-05-30', description: 'Ola Cab', amount: 410, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-06-08', description: 'Electricity Bill', amount: 2200, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-06-18', description: 'Swiggy Order', amount: 680, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-06-28', description: 'Amazon Purchase', amount: 6800, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-07-10', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-07-20', description: 'D-Mart Groceries', amount: 4900, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-07-30', description: 'Netflix Subscription', amount: 649, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-08-08', description: 'Uber Ride', amount: 520, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-08-18', description: 'Reliance Fresh', amount: 3600, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-08-28', description: 'Zomato Food', amount: 920, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-09-10', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-09-20', description: 'Airtel Broadband', amount: 999, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-09-30', description: 'Myntra Shopping', amount: 8200, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-10-10', description: 'Electricity Bill', amount: 2300, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-10-20', description: 'Big Bazaar Shopping', amount: 5800, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-10-30', description: 'Swiggy Order', amount: 780, account: 'ICICI Credit Card', category: 'Other' },
    { date: '2025-11-10', description: 'Rent Payment', amount: 30000, account: 'HDFC Bank Savings', category: 'Other' },
    { date: '2025-11-20', description: 'Amazon Purchase', amount: 7800, account: 'ICICI Credit Card', category: 'Other' },
  ];

  // Apply categorization to seed transactions
  const categorizedTransactions: Transaction[] = seedTransactions.map(txn => ({
    ...txn,
    id: uuidv4(),
    category: applyCategorizationRules({ ...txn, id: 'temp' }, []),
  }));

  return { accounts, transactions: categorizedTransactions };
}

const { accounts: seedAccounts, transactions: seedTransactions } = generateSeedData();

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  accounts: seedAccounts,
  transactions: seedTransactions,
  customRules: [],
  selectedPeriod: 'Last 12 Months',
  customDateRange: null,
  importMappingState: null,

  // Actions
  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      date: parseDate(transaction.date),
      category: applyCategorizationRules(
        { ...transaction, id: 'temp' },
        get().customRules
      ),
    };
    set((state) => ({
      transactions: [...state.transactions, newTransaction],
    }));
  },

  addTransactions: (transactions) => {
    const newTransactions: Transaction[] = transactions.map(txn => ({
      ...txn,
      id: uuidv4(),
      date: parseDate(txn.date),
      category: applyCategorizationRules(
        { ...txn, id: 'temp' },
        get().customRules
      ),
    }));
    set((state) => ({
      transactions: [...state.transactions, ...newTransactions],
    }));
  },

  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  addAccount: (account) => {
    const newAccount: Account = { ...account, id: uuidv4() };
    set((state) => ({
      accounts: [...state.accounts, newAccount],
    }));
  },

  addRule: (rule) => {
    const newRule: CategorizationRule = { ...rule, id: uuidv4() };
    set((state) => ({
      customRules: [...state.customRules, newRule],
    }));
  },

  updateRule: (id, updates) => {
    set((state) => ({
      customRules: state.customRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  deleteRule: (id) => {
    set((state) => ({
      customRules: state.customRules.filter((r) => r.id !== id),
    }));
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
  },

  setCustomDateRange: (range) => {
    set({ customDateRange: range, selectedPeriod: 'Custom' });
  },

  setImportMappingState: (state) => {
    set({ importMappingState: state });
  },

  recategorizeTransactions: () => {
    const { transactions, customRules } = get();
    const recategorized = transactions.map(txn => ({
      ...txn,
      category: applyCategorizationRules(txn, customRules),
    }));
    set({ transactions: recategorized });
  },

  getFilteredTransactions: () => {
    const { transactions, selectedPeriod, customDateRange } = get();
    const dateRange = customDateRange || getDateRangeForPeriod(selectedPeriod);
    return transactions.filter(txn => isDateInRange(txn.date, dateRange));
  },

  getDateRange: () => {
    const { selectedPeriod, customDateRange } = get();
    return customDateRange || getDateRangeForPeriod(selectedPeriod);
  },
}));
