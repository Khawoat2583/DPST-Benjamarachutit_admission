/**
 * Prevent CSV/XLSX Formula Injection by prefixing values starting with =, +, -, @ with a single quote
 */
export function escapeExcelFormula<T>(value: T): T | string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      trimmed.startsWith("=") ||
      trimmed.startsWith("+") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("@")
    ) {
      return `'${value}`;
    }
  }
  return value;
}
