export type ColumnType =
  | "datetime"
  | "category"
  | "status"
  | "boolean"
  | "numeric"
  | "email"
  | "url"
  | "longtext"
  | "freetext";

export interface ColumnMeta {
  index: number;
  label: string;
  key: string;
  type: ColumnType;
  uniqueValues: string[];
}

const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[\s T]\d{2}:\d{2}/;
const NUMERIC_RE = /^-?\d+(\.\d+)?$/;
const EMAIL_RE = /<[^@]+@[^>]+>/;
const URL_RE = /^https?:\/\//;

function sampleValues(rows: string[][], colIdx: number): string[] {
  return rows
    .map((r) => (r[colIdx] ?? "").trim())
    .filter(Boolean)
    .slice(0, 100);
}

function unique(vals: string[]): string[] {
  return [...new Set(vals)];
}

function inferType(label: string, vals: string[]): ColumnType {
  if (vals.length === 0) return "freetext";

  const nonEmpty = vals.filter(Boolean);
  if (nonEmpty.length === 0) return "freetext";

  const datetimeCount = nonEmpty.filter((v) => DATETIME_RE.test(v)).length;
  if (datetimeCount / nonEmpty.length > 0.8) return "datetime";

  const numericCount = nonEmpty.filter((v) => NUMERIC_RE.test(v)).length;
  if (numericCount / nonEmpty.length > 0.8) return "numeric";

  const urlCount = nonEmpty.filter((v) => URL_RE.test(v)).length;
  if (urlCount / nonEmpty.length > 0.7) return "url";

  const emailCount = nonEmpty.filter((v) => EMAIL_RE.test(v)).length;
  if (emailCount / nonEmpty.length > 0.5) return "email";

  const avgLen = nonEmpty.reduce((s, v) => s + v.length, 0) / nonEmpty.length;
  if (avgLen > 80) return "longtext";

  const uniq = unique(nonEmpty);

  if (uniq.length <= 2 && nonEmpty.length > 5) return "boolean";

  if (uniq.length <= 8) return "status";

  if (uniq.length <= 30) return "category";

  return "freetext";
}

export function inferColumnTypes(
  headers: string[],
  rows: string[][]
): ColumnMeta[] {
  return headers.map((label, i) => {
    const vals = sampleValues(rows, i);
    const uniq = unique(vals);
    const type = inferType(label, vals);
    const key = label.replace(/[^가-힣a-zA-Z0-9_]/g, "_").toLowerCase();
    return { index: i, label, key, type, uniqueValues: uniq };
  });
}
