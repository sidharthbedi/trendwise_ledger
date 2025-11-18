import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PeriodType } from '@/types';
import { useExpenseStore } from '@/store';

interface TopbarProps {
  onUploadClick: () => void;
}

export function Topbar({ onUploadClick }: TopbarProps) {
  const selectedPeriod = useExpenseStore((state) => state.selectedPeriod);
  const setSelectedPeriod = useExpenseStore((state) => state.setSelectedPeriod);

  const periods: PeriodType[] = ['Last 12 Months', '2025', '2024', '2023', '2022', 'Custom'];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as PeriodType)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={onUploadClick} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
