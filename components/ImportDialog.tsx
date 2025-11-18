import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { parseCSV, detectColumnMappings } from '@/lib/csv';
import { useExpenseStore } from '@/store';
import { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'upload' | 'mapping' | 'preview';

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<{
    date: string | null;
    description: string | null;
    amount: string | null;
    account: string | null;
    category: string | null;
  }>({
    date: null,
    description: null,
    amount: null,
    account: null,
    category: null,
  });

  const addTransactions = useExpenseStore((state) => state.addTransactions);
  const accounts = useExpenseStore((state) => state.accounts);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);

      if (parsed.length > 0) {
        const detectedHeaders = Object.keys(parsed[0]);
        const detectedMappings = detectColumnMappings(detectedHeaders);

        setHeaders(detectedHeaders);
        setParsedData(parsed);
        setMappings(detectedMappings);
        setStep('mapping');
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleMappingComplete = () => {
    if (!mappings.date || !mappings.description || !mappings.amount) {
      alert('Please map required fields: Date, Description, and Amount');
      return;
    }
    setStep('preview');
  };

  const handleImport = () => {
    if (!mappings.date || !mappings.description || !mappings.amount) {
      return;
    }

    const transactions: Omit<Transaction, 'id'>[] = parsedData.map(row => {
      // Determine account
      let account = accounts[0]?.name || 'Unknown';
      if (mappings.account && row[mappings.account]) {
        account = row[mappings.account];
      }

      // Parse amount - handle negative values and clean formatting
      const amountStr = row[mappings.amount!].replace(/[^0-9.-]/g, '');
      const amount = Math.abs(parseFloat(amountStr) || 0);

      return {
        date: row[mappings.date!],
        description: row[mappings.description!],
        amount,
        account,
        category: mappings.category && row[mappings.category] ? row[mappings.category] : 'Other',
      };
    });

    addTransactions(transactions);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setParsedData([]);
    setMappings({
      date: null,
      description: null,
      amount: null,
      account: null,
      category: null,
    });
    onOpenChange(false);
  };

  const previewData = parsedData.slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Upload Transaction File'}
            {step === 'mapping' && 'Map Columns'}
            {step === 'preview' && 'Preview & Import'}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV file here'}
              </p>
              <p className="text-sm text-gray-500">or click to select a file</p>
              <p className="text-xs text-gray-400 mt-4">
                Supported formats: CSV, XLSX (will be converted to CSV)
              </p>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{file.name}</p>
                  <p className="text-xs text-green-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Map the columns from your CSV file to the required fields. Fields marked with * are
              required.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Select
                  value={mappings.date || ''}
                  onValueChange={(value) => setMappings({ ...mappings, date: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description *</Label>
                <Select
                  value={mappings.description || ''}
                  onValueChange={(value) => setMappings({ ...mappings, description: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount *</Label>
                <Select
                  value={mappings.amount || ''}
                  onValueChange={(value) => setMappings({ ...mappings, amount: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Account (Optional)</Label>
                <Select
                  value={mappings.account || ''}
                  onValueChange={(value) => setMappings({ ...mappings, account: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category (Optional)</Label>
                <Select
                  value={mappings.category || ''}
                  onValueChange={(value) => setMappings({ ...mappings, category: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {headers.map(header => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Transactions will be automatically categorized using built-in rules after import.
              </p>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ready to import {parsedData.length} transactions
                </p>
                <p className="text-xs text-gray-600 mt-1">Preview of first 10 rows</p>
              </div>
              <Badge variant="outline">{parsedData.length} rows</Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Account</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">
                        {mappings.date ? row[mappings.date] : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mappings.description ? row[mappings.description] : '-'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {mappings.amount ? row[mappings.amount] : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mappings.account && row[mappings.account]
                          ? row[mappings.account]
                          : accounts[0]?.name || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleMappingComplete}>
                Continue to Preview
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {parsedData.length} Transactions
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
