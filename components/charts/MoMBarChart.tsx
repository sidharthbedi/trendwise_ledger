import { Card } from '@/components/ui/card';
import { useExpenseStore } from '@/store';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatMonth } from '@/lib/dates';
import { formatCurrencyINR } from '@/lib/currency';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function MoMBarChart() {
  const transactions = useExpenseStore((state) => state.getFilteredTransactions());

  const chartData = useMemo(() => {
    // Get last 6 months
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(dayjs().subtract(i, 'month').format('YYYY-MM-DD'));
    }

    const data = months.map(month => {
      const monthStart = dayjs(month).startOf('month');
      const monthEnd = dayjs(month).endOf('month');

      const monthTransactions = transactions.filter(txn => {
        const txnDate = dayjs(txn.date);
        return txnDate.isSameOrAfter(monthStart) && txnDate.isSameOrBefore(monthEnd);
      });

      const total = monthTransactions.reduce((sum, txn) => sum + txn.amount, 0);

      return {
        month: formatMonth(month),
        monthShort: dayjs(month).format('MMM'),
        total,
      };
    });

    return data;
  }, [transactions]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Month-over-Month Comparison</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthShort" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => formatCurrencyINR(value)}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Bar list with percentages */}
      <div className="mt-6 space-y-4">
        {chartData.map((item, index) => {
          const maxTotal = Math.max(...chartData.map(d => d.total));
          const percentage = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrencyINR(item.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
