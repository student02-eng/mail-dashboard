import { execFileSync } from "child_process";
import path from "path";
import { google } from "googleapis";

function readViaGws(sheetId: string, tabName: string): string[][] {
  const gwsPath =
    process.env.GWS_PATH ??
    path.resolve(process.cwd(), "..", "gws.exe");

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

async function readViaServiceAccount(
  sheetId: string,
  tabName: string
): Promise<string[][]> {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const credentials = JSON.parse(credJson);
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

export async function readSheet(
  sheetId: string,
  tabName: string
): Promise<string[][]> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      !process.env.GOOGLE_SERVICE_ACCOUNT_JSON.startsWith("여기에")) {
    return readViaServiceAccount(sheetId, tabName);
  }
  return readViaGws(sheetId, tabName);
}
