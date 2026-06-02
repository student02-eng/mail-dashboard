import { execFileSync } from "child_process";
import path from "path";
import { google } from "googleapis";

/* ── gws CLI (로컬 개발) ── */
function readViaGws(sheetId: string, tabName: string): string[][] {
  const gwsPath =
    process.env.GWS_PATH ?? path.resolve(process.cwd(), "..", "gws.exe");

  const params = JSON.stringify({
    spreadsheetId: sheetId,
    range: `${tabName}!A:R`,
  });

  const output = execFileSync(
    gwsPath,
    ["sheets", "spreadsheets", "values", "get", "--params", params, "--format", "json"],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );

  const parsed = JSON.parse(output);
  if (parsed.error) throw new Error(parsed.error.message);
  return (parsed.values ?? []) as string[][];
}

/* ── 서비스 계정 (Vercel + 서비스계정 JSON 있을 때) ── */
async function readViaServiceAccount(
  sheetId: string,
  tabName: string
): Promise<string[][]> {
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

/* ── 사용자 OAuth 토큰 (Vercel, 서비스계정 없을 때) ── */
async function readViaAccessToken(
  sheetId: string,
  tabName: string,
  accessToken: string
): Promise<string[][]> {
  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: "v4", auth: oauth2 });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!A:ZZ`,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  return (res.data.values ?? []) as string[][];
}

/* ── 자동 선택 ── */
export async function readSheet(
  sheetId: string,
  tabName: string,
  accessToken?: string
): Promise<string[][]> {
  // 1순위: 서비스 계정
  const svcJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "";
  if (svcJson && !svcJson.startsWith("여기에")) {
    return readViaServiceAccount(sheetId, tabName);
  }
  // 2순위: OAuth 토큰 (로그인한 사용자)
  if (accessToken) {
    return readViaAccessToken(sheetId, tabName, accessToken);
  }
  // 3순위: gws CLI (로컬)
  return readViaGws(sheetId, tabName);
}
