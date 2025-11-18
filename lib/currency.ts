/**
 * Formats a number as Indian Rupees with Indian numbering system
 * Examples: ₹3,76,900 or ₹15,67,890
 */
export function formatCurrencyINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Round to 2 decimal places but display as integer for whole numbers
  const rounded = Math.round(absAmount);

  // Convert to string and split into parts
  const numStr = rounded.toString();

  // Indian numbering: last 3 digits, then groups of 2
  let result = '';
  let count = 0;

  for (let i = numStr.length - 1; i >= 0; i--) {
    if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
      result = ',' + result;
    }
    result = numStr[i] + result;
    count++;
  }

  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Formats a number as compact Indian Rupees (e.g., ₹1.5L, ₹2.3Cr)
 */
export function formatCompactINR(amount: number): string {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;

  if (absAmount >= 10000000) { // 1 Crore
    return `${isNegative ? '-' : ''}₹${(absAmount / 10000000).toFixed(1)}Cr`;
  } else if (absAmount >= 100000) { // 1 Lakh
    return `${isNegative ? '-' : ''}₹${(absAmount / 100000).toFixed(1)}L`;
  } else if (absAmount >= 1000) {
    return `${isNegative ? '-' : ''}₹${(absAmount / 1000).toFixed(1)}K`;
  }

  return formatCurrencyINR(amount);
}
