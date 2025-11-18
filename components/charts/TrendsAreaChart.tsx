import { Card } from '@/components/ui/card';
import { useExpenseStore } from '@/store';
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatMonth, getMonthsBetween } from '@/lib/dates';
import { formatCurrencyINR } from '@/lib/currency';
import { getCategoryColor, getAllCategories } from '@/lib/categorization';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function TrendsAreaChart() {
  const transactions = useExpenseStore((state) => state.getFilteredTransactions());
  const dateRange = useExpenseStore((state) => state.getDateRange());

  const chartData = useMemo(() => {
    const months = getMonthsBetween(dateRange.start, dateRange.end);
    const categories = getAllCategories();

    const data = months.map(month => {
      const monthStart = dayjs(month).startOf('month');
      const monthEnd = dayjs(month).endOf('month');

      const monthTransactions = transactions.filter(txn => {
        const txnDate = dayjs(txn.date);
        return txnDate.isSameOrAfter(monthStart) && txnDate.isSameOrBefore(monthEnd);
      });

      const categoryTotals: Record<string, number> = {};
      categories.forEach(cat => {
        categoryTotals[cat] = 0;
      });

      monthTransactions.forEach(txn => {
        if (categoryTotals[txn.category] !== undefined) {
          categoryTotals[txn.category] += txn.amount;
        }
      });

      return {
        month: formatMonth(month),
        ...categoryTotals,
      };
    });

    return data;
  }, [transactions, dateRange]);

  const categories = getAllCategories();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Expense Trends</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => formatCurrencyINR(value)}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {categories.map(category => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId="1"
              stroke={getCategoryColor(category)}
              fill={getCategoryColor(category)}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
