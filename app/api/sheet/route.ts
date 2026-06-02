import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readSheet } from "@/lib/sheets";
import { inferColumnTypes } from "@/lib/columnMapper";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const tabName = process.env.GOOGLE_SHEET_TAB;
  if (!sheetId || !tabName) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_ID or GOOGLE_SHEET_TAB not configured" },
      { status: 500 }
    );
  }

  const rows = await readSheet(sheetId, tabName);
  if (rows.length === 0) {
    return NextResponse.json({ columns: [], data: [], headers: [] });
  }

  const headers = rows[0] as string[];
  const dataRows = rows.slice(1) as string[][];
  const columns = inferColumnTypes(headers, dataRows);

  return NextResponse.json({ columns, data: dataRows, headers });
}
