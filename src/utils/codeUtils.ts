/**
 * Utility to calculate and auto-advance sampling point codes.
 * Supports manual entry of any pattern (e.g. "P-001", "PF-10", "MUE-05", "100")
 * and cleanly increments the trailing integer while preserving zero padding.
 */

export function incrementPointCode(code: string): string {
  const trimmed = (code || '').trim();
  if (!trimmed) return 'P-001';

  // Match optional prefix followed by digits
  const match = trimmed.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const digits = match[2];
    const nextNum = parseInt(digits, 10) + 1;
    const padded = String(nextNum).padStart(digits.length, '0');
    return `${prefix}${padded}`;
  }

  // If no digits at the end, append -1
  return `${trimmed}-1`;
}
