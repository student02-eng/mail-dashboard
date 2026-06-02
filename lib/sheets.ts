import { execFileSync } from "child_process";
import path from "path";
import { google } from "googleapis";

/* ── CSV 파서 (공개 시트) ── */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  const lines = csv.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let inQuote = false;
    let cell = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (c === "," && !inQuote) {
        cells.push(cell); cell = "";
      } else {
        cell += c;
      }
    }
    cells.push(cell);
    rows.push(cells);
  }
  return rows;
}

/* ── 공개 시트 CSV (API Key 불필요) ── */
async function readViaPublicCsv(sheetId: string, gid: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  return parseCsv(text);
}

/* ── Google Sheets API Key ── */
async function readViaApiKey(sheetId: string, tabName: string, apiKey: string): Promise<string[][]> {
  const range = encodeURIComponent(`${tabName}!A:ZZ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (data.error) throw new Error(`Sheets API: ${data.error.message}`);
  return (data.values ?? []) as string[][];
}

/* ── 서비스 계정 ── */
async function readViaServiceAccount(sheetId: string, tabName: string): Promise<string[][]> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!A:ZZ`,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  return (res.data.values ?? []) as string[][];
}

/* ── gws CLI (로컬 전용) ── */
function readViaGws(sheetId: string, tabName: string): string[][] {
  const gwsPath = process.env.GWS_PATH ?? path.resolve(process.cwd(), "..", "gws.exe");
  const params = JSON.stringify({ spreadsheetId: sheetId, range: `${tabName}!A:R` });
  const output = execFileSync(
    gwsPath,
    ["sheets", "spreadsheets", "values", "get", "--params", params, "--format", "json"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );
  const parsed = JSON.parse(output);
  if (parsed.error) throw new Error(parsed.error.message);
  return (parsed.values ?? []) as string[][];
}

/* ── 자동 선택 ── */
export async function readSheet(sheetId: string, tabName: string): Promise<string[][]> {
  // 1순위: API 키
  const apiKey = process.env.GOOGLE_API_KEY;
  if (apiKey) return readViaApiKey(sheetId, tabName, apiKey);

  // 2순위: 서비스 계정
  const svcJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "";
  if (svcJson && !svcJson.startsWith("여기에")) return readViaServiceAccount(sheetId, tabName);

  // 3순위: 공개 CSV (GOOGLE_SHEET_GID 필요)
  const gid = process.env.GOOGLE_SHEET_GID;
  if (gid) return readViaPublicCsv(sheetId, gid);

  // 4순위: gws CLI (로컬)
  return readViaGws(sheetId, tabName);
}
