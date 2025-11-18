import { Card } from '@/components/ui/card';
import { useExpenseStore } from '@/store';
import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrencyINR } from '@/lib/currency';
import { getCategoryColor } from '@/lib/categorization';

export function CategoryDonut() {
  const transactions = useExpenseStore((state) => state.getFilteredTransactions());

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(txn => {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        name: category,
        value: total,
        color: getCategoryColor(category),
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Expense Categories</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrencyINR(value)}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>

      {/* Category list */}
      <div className="mt-6 space-y-3">
        {chartData.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 font-medium text-sm">{item.name}</span>
            </div>
            <span className="text-gray-900 font-semibold text-sm">
              {formatCurrencyINR(item.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
