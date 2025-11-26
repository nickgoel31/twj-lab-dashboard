export function parseDealValue(dealValue: string): number | null {
  if (typeof dealValue !== 'string' || !dealValue.trim()) {
    return null;
  }
  
  // 1. Remove common thousand separators (space and comma) and convert to lowercase for currency symbols.
  const cleanedString = dealValue.trim().toLowerCase().replace(/[, ]/g, ''); 

  // 2. Remove any remaining non-digit/non-decimal characters (e.g., 'rs', 'usd', '€').
  // This regex keeps only digits and the dot (.) for decimal separation.
  const numericPart = cleanedString.replace(/[^0-9.]/g, ''); 
  
  // 3. Parse the float value
  const value = parseFloat(numericPart);

  // 4. Check if parsing was successful (i.e., not NaN)
  if (isNaN(value)) {
    return null;
  }

  return value;
}