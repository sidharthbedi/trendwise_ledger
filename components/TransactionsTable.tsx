import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useExpenseStore } from '@/store';
import { useState, useMemo } from 'react';
import { formatCurrencyINR } from '@/lib/currency';
import { getAllCategories, getCategoryColor } from '@/lib/categorization';
import { Search, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

interface TransactionsTableProps {
  onRulesClick: () => void;
}

export function TransactionsTable({ onRulesClick }: TransactionsTableProps) {
  const transactions = useExpenseStore((state) => state.getFilteredTransactions());
  const accounts = useExpenseStore((state) => state.accounts);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const pageSize = 10;
  const categories = getAllCategories();

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        txn =>
          txn.description.toLowerCase().includes(query) ||
          txn.account.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(txn => txn.category === categoryFilter);
    }

    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(txn => txn.account === accountFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = dayjs(a.date).diff(dayjs(b.date));
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.amount - b.amount;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [transactions, searchQuery, categoryFilter, accountFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / pageSize);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (column: 'date' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
        <Button onClick={onRulesClick} variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Rules
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountFilter}
          onValueChange={(value) => {
            setAccountFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(acc => (
              <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Category</TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort('amount')}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">
                  {dayjs(txn.date).format('MMM D, YYYY')}
                </TableCell>
                <TableCell>{txn.description}</TableCell>
                <TableCell className="text-sm text-gray-600">{txn.account}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: getCategoryColor(txn.category) + '20',
                      color: getCategoryColor(txn.category),
                      borderColor: getCategoryColor(txn.category),
                    }}
                    className="border"
                  >
                    {txn.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrencyINR(txn.amount)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredAndSortedTransactions.length)} of{' '}
            {filteredAndSortedTransactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
