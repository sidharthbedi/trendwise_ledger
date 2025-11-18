import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, Receipt } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/currency';
import { useExpenseStore } from '@/store';
import { useMemo } from 'react';
import dayjs from 'dayjs';

export function KpiCards() {
  const transactions = useExpenseStore((state) => state.getFilteredTransactions());
  const dateRange = useExpenseStore((state) => state.getDateRange());

  const kpis = useMemo(() => {
    // Total expenses
    const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    // Monthly average
    const startMonth = dayjs(dateRange.start).startOf('month');
    const endMonth = dayjs(dateRange.end).startOf('month');
    const monthsCount = endMonth.diff(startMonth, 'month') + 1;
    const monthlyAvg = monthsCount > 0 ? total / monthsCount : 0;

    // Highest category
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(txn => {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
    });
    const highestCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];

    // Transaction count
    const txnCount = transactions.length;

    // Calculate percentage change (mock for now)
    const previousPeriodTotal = total * 1.055; // Mock: 5.5% higher
    const percentChange = ((previousPeriodTotal - total) / previousPeriodTotal) * 100;

    return {
      total,
      monthlyAvg,
      highestCategory: highestCategory ? highestCategory[0] : 'N/A',
      txnCount,
      percentChange,
    };
  }, [transactions, dateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Expenses Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrencyINR(kpis.total)}</p>
            <p className="text-green-600 text-xs mt-2">
              ↓ {kpis.percentChange.toFixed(1)}% from previous period
            </p>
          </div>
          <div className="bg-red-100 rounded-full p-3">
            <DollarSign className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>

      {/* Monthly Average Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Monthly Average</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrencyINR(kpis.monthlyAvg)}</p>
            <p className="text-blue-600 text-xs mt-2">Across all months</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Highest Category Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Highest Category</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.highestCategory}</p>
            <p className="text-purple-600 text-xs mt-2">Top spending area</p>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>

      {/* Transaction Count Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{kpis.txnCount}</p>
            <p className="text-orange-600 text-xs mt-2">Total count</p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <Receipt className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
