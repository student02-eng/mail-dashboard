"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

const COLORS = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--accent-3)",
  "var(--accent-4)",
  "oklch(70% 0.12 320)",
  "oklch(75% 0.1 180)",
  "oklch(65% 0.15 60)",
  "oklch(80% 0.1 200)",
];

function countValues(
  rows: string[][],
  col: ColumnMeta
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const v = (r[col.index] ?? "").trim();
    if (!v) return;
    counts[v] = (counts[v] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));
}

function DonutChart({
  data,
  total,
}: {
  data: { name: string; count: number }[];
  total: number;
}) {
  return (
    <ResponsiveContainer width={160} height={160}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          dataKey="count"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--text)",
          }}
          formatter={(v: number) => [`${v}건 (${((v / total) * 100).toFixed(1)}%)`, ""]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function CategorySection({ columns, rows }: Props) {
  const [activeCol, setActiveCol] = useState(0);
  const col = columns[activeCol] ?? columns[0];
  const data = useMemo(() => countValues(rows, col), [rows, col]);
  const total = rows.length;

  return (
    <div>
      {/* Tab selector */}
      {columns.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {columns.map((c, i) => (
            <button
              key={c.index}
              className={`btn ${i === activeCol ? "btn-accent" : ""}`}
              style={{ fontSize: 11, padding: "4px 10px" }}
              onClick={() => setActiveCol(i)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
        {/* Donut */}
        <div style={{ flexShrink: 0 }}>
          <DonutChart data={data} total={total} />
        </div>

        {/* Ratio list */}
        <div style={{ flex: 1, minWidth: 200 }}>
          {data.map((item, i) => {
            const pct = ((item.count / total) * 100).toFixed(1);
            const color = COLORS[i % COLORS.length];
            return (
              <div key={item.name} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    {item.name}
                  </span>
                  <span className="font-mono" style={{ color, fontSize: 11 }}>
                    {item.count} <span style={{ color: "var(--text-mute)" }}>({pct}%)</span>
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--border)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 2,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
