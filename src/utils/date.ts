// Shared month-name tables and helpers for the canonical "YYYY-MM" date
// format used on ResumeData fields. mapParsedResume parses display strings
// into the canonical form; newPdfGenerator renders the canonical form back
// to display strings — both must agree on month names.

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/**
 * Case-insensitive month name/abbreviation → "01".."12".
 * Accepts full names, three-letter abbreviations, and common variants
 * like "sept". Returns null when the name is not recognized.
 */
export function monthNumberFromName(name: string): string | null {
  const cleaned = name.trim().toLowerCase().replace(/\.$/, '');
  if (cleaned === 'sept') return '09';
  const index = MONTH_FULL.findIndex(
    (full, i) => full.toLowerCase() === cleaned || MONTH_SHORT[i].toLowerCase() === cleaned
  );
  return index === -1 ? null : String(index + 1).padStart(2, '0');
}

/** 0-based month index → short display name ("May"). */
export function shortMonthName(monthIndex: number): string | null {
  return MONTH_SHORT[monthIndex] ?? null;
}
