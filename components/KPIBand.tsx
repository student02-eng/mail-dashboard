"use client";

import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

function getVal(rows: string[][], col: ColumnMeta): string[] {
  return rows.map((r) => r[col.index] ?? "").filter(Boolean);
}

export default function KPIBand({ columns, rows }: Props) {
  const totalRows = rows.length;

  // 상태 컬럼에서 "미회신" 카운트
  const replyCol = columns.find(
    (c) => c.label.includes("회신여부") || c.label.includes("회신")
  );
  const pendingCount = replyCol
    ? getVal(rows, replyCol).filter((v) => v.includes("미회신")).length
    : null;

  // 지연 컬럼
  const delayCol = columns.find(
    (c) => c.label.includes("지연") || c.type === "boolean"
  );
  const delayCount = delayCol
    ? getVal(rows, delayCol).filter((v) => v.trim() !== "").length
    : null;

  // 검토필요
  const reviewCol = columns.find((c) => c.label.includes("검토필요"));
  const reviewCount = reviewCol
    ? getVal(rows, reviewCol).filter((v) => v.trim() !== "").length
    : null;

  // 처리완료
  const statusCol = columns.find((c) => c.label.includes("처리상태"));
  const doneCount = statusCol
    ? getVal(rows, statusCol).filter((v) => v.includes("완료")).length
    : null;

  const kpis = [
    {
      label: "총 메일",
      value: totalRows.toLocaleString(),
      color: "var(--accent-3)",
      icon: "✉",
    },
    pendingCount !== null && {
      label: "미회신",
      value: pendingCount.toLocaleString(),
      color: "var(--accent-2)",
      icon: "⏳",
    },
    delayCount !== null && {
      label: "SLA 지연",
      value: delayCount.toLocaleString(),
      color: "var(--accent-2)",
      icon: "⚠",
    },
    reviewCount !== null && {
      label: "검토 필요",
      value: reviewCount.toLocaleString(),
      color: "var(--accent-4)",
      icon: "🔍",
    },
    doneCount !== null && {
      label: "처리 완료",
      value: doneCount.toLocaleString(),
      color: "var(--accent)",
      icon: "✓",
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    color: string;
    icon: string;
  }[];

  // 최대 4개
  const shown = kpis.slice(0, 4);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${shown.length}, 1fr)`,
        gap: 12,
      }}
    >
      {shown.map((kpi) => (
        <div
          key={kpi.label}
          className="card"
          style={{ padding: "20px 24px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="section-title">{kpi.label}</span>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: `color-mix(in oklch, ${kpi.color} 12%, transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}>
              {kpi.icon}
            </div>
          </div>
          <div className="kpi-number font-mono" style={{ color: kpi.color }}>
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}
