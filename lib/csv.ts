/**
 * Simple CSV parser that handles quoted fields and commas inside quotes
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Check for escaped quote
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Detects likely column mappings based on header names
 */
export function detectColumnMappings(headers: string[]): {
  date: string | null;
  description: string | null;
  amount: string | null;
  account: string | null;
  category: string | null;
} {
  const lowerHeaders = headers.map(h => h.toLowerCase());

  const findHeader = (keywords: string[]): string | null => {
    for (const keyword of keywords) {
      const index = lowerHeaders.findIndex(h => h.includes(keyword));
      if (index !== -1) return headers[index];
    }
    return null;
  };

  return {
    date: findHeader(['date', 'transaction date', 'posted date', 'datetime']),
    description: findHeader(['description', 'memo', 'narrative', 'details', 'merchant']),
    amount: findHeader(['amount', 'debit', 'credit', 'value', 'transaction amount']),
    account: findHeader(['account', 'card', 'bank']),
    category: findHeader(['category', 'type', 'classification']),
  };
}
