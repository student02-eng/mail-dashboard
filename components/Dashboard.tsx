"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import type { ColumnMeta } from "@/lib/columnMapper";
import KPIBand from "./KPIBand";
import SummaryBar from "./SummaryBar";
import InsightsSection from "./InsightsSection";
import CollapsibleSection from "./CollapsibleSection";
import DatetimeSection from "./DatetimeSection";
import CategorySection from "./CategorySection";
import EmailSection from "./EmailSection";
import ReviewSection from "./ReviewSection";
import DataTable from "./DataTable";

interface SheetData {
  columns: ColumnMeta[];
  data: string[][];
  headers: string[];
}

interface Props {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export default function Dashboard({ user }: Props) {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sheet");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSheetData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cols = sheetData?.columns ?? [];
  const rows = sheetData?.data ?? [];

  const datetimeCols = cols.filter((c) => c.type === "datetime");
  const categoryCols = cols.filter((c) => c.type === "category" || c.type === "status");
  const emailCols = cols.filter((c) => c.type === "email");
  const longtextCols = cols.filter((c) => c.type === "longtext");
  const booleanCols = cols.filter((c) => c.type === "boolean");
  const urlCols = cols.filter((c) => c.type === "url");

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>✉️</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>
              Mail Dashboard
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-mute)" }}>
              {lastRefresh
                ? `마지막 갱신: ${lastRefresh.toLocaleTimeString("ko-KR")}`
                : "Google Sheets 연동"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn"
            onClick={() => setAllOpen((p) => !p)}
            style={{ fontSize: 12 }}
          >
            {allOpen ? "모두 닫기" : "모두 펼치기"}
          </button>
          <button
            className="btn btn-accent"
            onClick={fetchData}
            disabled={loading}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {loading ? "로딩 중…" : "↻ 리프레시"}
          </button>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-mute)" }}>
                {user.email}
              </span>
              <button
                className="btn"
                style={{ fontSize: 11, padding: "5px 10px" }}
                onClick={() => signOut({ callbackUrl: "/signin" })}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            marginBottom: 20,
            borderColor: "color-mix(in oklch, var(--accent-2) 40%, transparent)",
            color: "var(--accent-2)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {!loading && sheetData && (
        <>
          {/* KPI 밴드 */}
          <KPIBand columns={cols} rows={rows} />

          <div style={{ height: 16 }} />

          {/* 처리상태 스택바 */}
          <SummaryBar columns={cols} rows={rows} />

          {/* 인사이트 섹션 */}
          <CollapsibleSection title="주요 지표 인사이트" forceOpen={allOpen} defaultOpen={true} style={{ marginBottom: 12 }}>
            <InsightsSection columns={cols} rows={rows} />
          </CollapsibleSection>

          <div style={{ height: 4 }} />

          {/* Datetime 섹션 */}
          {datetimeCols.length > 0 && (
            <CollapsibleSection
              title="시간 분포"
              forceOpen={allOpen}
              style={{ marginBottom: 12 }}
            >
              <DatetimeSection columns={datetimeCols} rows={rows} />
            </CollapsibleSection>
          )}

          {/* Category 섹션 */}
          {categoryCols.length > 0 && (
            <CollapsibleSection
              title="분류 분석"
              forceOpen={allOpen}
              style={{ marginBottom: 12 }}
            >
              <CategorySection columns={categoryCols} rows={rows} />
            </CollapsibleSection>
          )}

          {/* Email 섹션 */}
          {emailCols.length > 0 && (
            <CollapsibleSection
              title="발신자 랭킹"
              forceOpen={allOpen}
              style={{ marginBottom: 12 }}
            >
              <EmailSection columns={emailCols} rows={rows} />
            </CollapsibleSection>
          )}

          {/* Review 섹션 */}
          {longtextCols.length > 0 && (
            <CollapsibleSection
              title="검토 뷰"
              forceOpen={allOpen}
              style={{ marginBottom: 12 }}
            >
              <ReviewSection
                longtextCols={longtextCols}
                booleanCols={booleanCols}
                urlCols={urlCols}
                statusCols={cols.filter((c) => c.type === "status")}
                rows={rows}
              />
            </CollapsibleSection>
          )}

          {/* 전체 테이블 */}
          <CollapsibleSection
            title="전체 데이터"
            forceOpen={allOpen}
            style={{ marginBottom: 12 }}
          >
            <DataTable columns={cols} rows={rows} />
          </CollapsibleSection>
        </>
      )}

      {loading && !sheetData && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-mute)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
          <p>데이터를 불러오는 중…</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
