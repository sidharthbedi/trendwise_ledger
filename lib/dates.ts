import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DateRange, PeriodType } from '@/types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Gets date range for a given period type
 */
export function getDateRangeForPeriod(period: PeriodType): DateRange {
  const today = dayjs();

  switch (period) {
    case 'Last 12 Months':
      return {
        start: today.subtract(12, 'month').startOf('month').format('YYYY-MM-DD'),
        end: today.endOf('month').format('YYYY-MM-DD'),
      };
    case '2025':
      return {
        start: '2025-01-01',
        end: '2025-12-31',
      };
    case '2024':
      return {
        start: '2024-01-01',
        end: '2024-12-31',
      };
    case '2023':
      return {
        start: '2023-01-01',
        end: '2023-12-31',
      };
    case '2022':
      return {
        start: '2022-01-01',
        end: '2022-12-31',
      };
    case 'Custom':
      // Will be handled separately
      return {
        start: today.subtract(12, 'month').format('YYYY-MM-DD'),
        end: today.format('YYYY-MM-DD'),
      };
    default:
      return {
        start: today.subtract(12, 'month').format('YYYY-MM-DD'),
        end: today.format('YYYY-MM-DD'),
      };
  }
}

/**
 * Checks if a date falls within a date range
 */
export function isDateInRange(date: string, range: DateRange): boolean {
  const d = dayjs(date);
  return d.isSameOrAfter(dayjs(range.start)) && d.isSameOrBefore(dayjs(range.end));
}

/**
 * Formats a date as a readable month string (e.g., "Jan 2024")
 */
export function formatMonth(date: string): string {
  return dayjs(date).format('MMM YYYY');
}

/**
 * Formats a date as month name only (e.g., "January")
 */
export function formatMonthName(date: string): string {
  return dayjs(date).format('MMMM');
}

/**
 * Gets an array of months between start and end dates
 */
export function getMonthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  let current = dayjs(start).startOf('month');
  const endDate = dayjs(end).endOf('month');

  while (current.isSameOrBefore(endDate)) {
    months.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'month');
  }

  return months;
}

/**
 * Parses various date formats to ISO string
 */
export function parseDate(dateStr: string): string {
  // Try common formats
  const formats = [
    'YYYY-MM-DD',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'DD-MM-YYYY',
    'MM-DD-YYYY',
    'YYYY/MM/DD',
  ];

  for (const format of formats) {
    const parsed = dayjs(dateStr, format);
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD');
    }
  }

  // Fallback to dayjs default parsing
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : dateStr;
}
