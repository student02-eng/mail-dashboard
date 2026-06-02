"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

function parseDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val.replace(" ", "T"));
  return isNaN(d.getTime()) ? null : d;
}

function buildSparkline(
  rows: string[][],
  col: ColumnMeta
): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const v = r[col.index] ?? "";
    const d = parseDate(v);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));
}

function buildHeatmap(
  rows: string[][],
  col: ColumnMeta
): { week: number; dow: number; count: number }[] {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const v = r[col.index] ?? "";
    const d = parseDate(v);
    if (!d) return;
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const week = Math.floor(
      (d.getTime() - startOfYear.getTime()) / (7 * 86400000)
    );
    const dow = d.getDay();
    const key = `${week}_${dow}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const cells: { week: number; dow: number; count: number }[] = [];
  Object.entries(counts).forEach(([key, count]) => {
    const [week, dow] = key.split("_").map(Number);
    cells.push({ week, dow, count });
  });
  return cells;
}

const ACCENT = "var(--accent)";
const DOW_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function DatetimeSection({ columns, rows }: Props) {
  const mainCol = columns[0];
  const sparkData = useMemo(() => buildSparkline(rows, mainCol), [rows, mainCol]);
  const heatCells = useMemo(() => buildHeatmap(rows, mainCol), [rows, mainCol]);

  const maxCount = Math.max(...heatCells.map((c) => c.count), 1);
  const maxWeek = Math.max(...heatCells.map((c) => c.week), 1);
  const weeks = Array.from({ length: maxWeek + 1 }, (_, i) => i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sparkline */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 10 }}>
          {mainCol.label} 일별 건수
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--text-mute)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--text)",
              }}
              cursor={{ stroke: "var(--border)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 10 }}>
          요일·주차 히트맵
        </p>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          {/* DOW labels */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              paddingTop: 4,
            }}
          >
            {DOW_LABELS.map((d) => (
              <div
                key={d}
                style={{
                  fontSize: 9,
                  color: "var(--text-mute)",
                  width: 14,
                  textAlign: "right",
                  height: 14,
                  lineHeight: "14px",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
            {weeks.map((w) => (
              <div
                key={w}
                style={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                {DOW_LABELS.map((_, dow) => {
                  const cell = heatCells.find(
                    (c) => c.week === w && c.dow === dow
                  );
                  const intensity = cell ? cell.count / maxCount : 0;
                  const alpha = intensity > 0 ? 0.15 + intensity * 0.85 : 0.05;
                  return (
                    <div
                      key={dow}
                      className="heatmap-cell"
                      title={cell ? `${cell.count}건` : "0건"}
                      style={{
                        width: 14,
                        height: 14,
                        background: `color-mix(in oklch, var(--accent) ${Math.round(alpha * 100)}%, var(--surface))`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "var(--text-mute)" }}>적음</span>
          {[0.1, 0.3, 0.5, 0.7, 1].map((v) => (
            <div
              key={v}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: `color-mix(in oklch, var(--accent) ${Math.round((0.15 + v * 0.85) * 100)}%, var(--surface))`,
              }}
            />
          ))}
          <span style={{ fontSize: 10, color: "var(--text-mute)" }}>많음</span>
        </div>
      </div>
    </div>
  );
}
