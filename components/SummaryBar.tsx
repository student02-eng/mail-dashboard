"use client";

import { useMemo } from "react";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

const STATUS_COLORS: Record<string, string> = {
  "회신완료":        "var(--accent-5, oklch(56% 0.18 155))",
  "자동분류":        "var(--accent-3)",
  "신규(대기)":      "var(--accent-4)",
  "조치필요":        "var(--accent-2)",
};

const DEFAULT_COLOR = "var(--border)";

export default function SummaryBar({ columns, rows }: Props) {
  const statusCol = columns.find((c) => c.label.includes("처리상태"));
  if (!statusCol) return null;

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      const v = (r[statusCol.index] ?? "").trim();
      if (v) map[v] = (map[v] ?? 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [rows, statusCol]);

  const total = rows.length || 1;

  return (
    <div className="card" style={{ padding: "18px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span className="section-title">처리상태 전체 현황</span>
        <span style={{ fontSize: 11, color: "var(--text-mute)" }}>{total.toLocaleString()}건</span>
      </div>

      {/* Stacked bar */}
      <div style={{
        display: "flex", height: 28, borderRadius: 8, overflow: "hidden", gap: 2, marginBottom: 12,
      }}>
        {counts.map(([name, count]) => (
          <div
            key={name}
            title={`${name}: ${count}건 (${((count / total) * 100).toFixed(1)}%)`}
            style={{
              flex: count,
              background: STATUS_COLORS[name] ?? DEFAULT_COLOR,
              transition: "flex 0.5s ease",
              minWidth: count / total > 0.03 ? undefined : 4,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
        {counts.map(([name, count]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3, flexShrink: 0,
              background: STATUS_COLORS[name] ?? DEFAULT_COLOR,
            }} />
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{name}</span>
            <span className="font-mono" style={{ fontSize: 11, color: STATUS_COLORS[name] ?? "var(--text-mute)" }}>
              {count}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-mute)" }}>
              ({((count / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
