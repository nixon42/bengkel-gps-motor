/**
 * RFC-4180 Compliant CSV Export Utilities (E18)
 * Handles commas, double-quotes, newlines, and proper delimiter escaping.
 */

export function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatCsvRow(fields = []) {
  return fields.map(escapeCsvField).join(',');
}

export function generateCsv(headers = [], rows = []) {
  const lines = [formatCsvRow(headers)];
  for (const row of rows) {
    lines.push(formatCsvRow(row));
  }
  return lines.join('\r\n') + '\r\n';
}

export default {
  escapeCsvField,
  formatCsvRow,
  generateCsv
};
