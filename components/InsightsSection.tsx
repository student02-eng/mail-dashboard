"use client";

import { useMemo } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

/* ─── 토큰 ─── */
const C_INDIGO = "var(--accent)";
const C_CORAL  = "var(--accent-2)";
const C_SKY    = "var(--accent-3)";
const C_GREEN  = "oklch(54% 0.17 155)";
const C_AMBER  = "var(--accent-4)";

/* ─── 헬퍼 ─── */
function col(columns: ColumnMeta[], keyword: string) {
  return columns.find((c) => c.label.includes(keyword));
}
function vals(rows: string[][], c: ColumnMeta | undefined) {
  return c ? rows.map((r) => (r[c.index] ?? "").trim()) : [];
}

/* ══════════════════════════════════════════
   Card A — SLA 준수율 게이지
══════════════════════════════════════════ */
function SlaCard({ rows, columns }: { rows: string[][]; columns: ColumnMeta[] }) {
  const delayCol = col(columns, "지연");
  const delayed  = delayCol ? vals(rows, delayCol).filter(Boolean).length : 0;
  const total    = rows.length || 1;
  const pct      = Math.round(((total - delayed) / total) * 100);
  const color    = pct >= 80 ? C_GREEN : pct >= 60 ? C_AMBER : C_CORAL;

  return (
    <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <p className="section-title" style={{ marginBottom: 16, alignSelf: "flex-start" }}>SLA 준수율</p>

      {/* 게이지 */}
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <ResponsiveContainer width={130} height={130}>
          <RadialBarChart cx={65} cy={65} innerRadius={44} outerRadius={60}
            startAngle={210} endAngle={-30}
            data={[{ value: pct, fill: color }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6}
              background={{ fill: "var(--bg-2)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span className="font-mono" style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 10, color: "var(--text-mute)", marginTop: 2 }}>정시 처리</span>
        </div>
      </div>

      {/* 수치 요약 */}
      <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
        <div style={{ textAlign: "center" }}>
          <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: C_CORAL }}>{delayed}</div>
          <div style={{ fontSize: 10, color: "var(--text-mute)" }}>지연</div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ textAlign: "center" }}>
          <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: C_GREEN }}>{total - delayed}</div>
          <div style={{ fontSize: 10, color: "var(--text-mute)" }}>준수</div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ textAlign: "center" }}>
          <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dim)" }}>{total}</div>
          <div style={{ fontSize: 10, color: "var(--text-mute)" }}>전체</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Card B — 미회신 현황
══════════════════════════════════════════ */
function ReplyCard({ rows, columns }: { rows: string[][]; columns: ColumnMeta[] }) {
  const replyCol   = col(columns, "회신여부");
  const values     = vals(rows, replyCol);
  const unanswered = values.filter((v) => v.includes("미회신")).length;
  const answered   = values.filter((v) => v.includes("완료")).length;
  const total      = rows.length || 1;
  const uPct       = Math.round((unanswered / total) * 100);

  return (
    <div className="card" style={{ padding: "24px" }}>
      <p className="section-title" style={{ marginBottom: 20 }}>회신 현황</p>

      {/* 큰 숫자 */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
        <span className="font-mono" style={{ fontSize: 40, fontWeight: 700, color: C_CORAL, lineHeight: 1 }}>
          {unanswered}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-mute)", paddingBottom: 4 }}>미회신 건</span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ height: 8, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
        <div style={{
          height: "100%", width: `${uPct}%`,
          background: `linear-gradient(90deg, ${C_CORAL}, oklch(65% 0.18 28))`,
          borderRadius: 4, transition: "width 0.6s ease",
        }} />
      </div>

      {/* 범례 */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: C_CORAL }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>미회신</span>
          <span className="font-mono" style={{ fontSize: 12, color: C_CORAL, fontWeight: 600 }}>
            {uPct}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: C_GREEN }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>회신완료</span>
          <span className="font-mono" style={{ fontSize: 12, color: C_GREEN, fontWeight: 600 }}>
            {answered}건
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Card C — 처리 요약 (검토필요 / 완료 / 평균경과일)
══════════════════════════════════════════ */
function SummaryCard({ rows, columns }: { rows: string[][]; columns: ColumnMeta[] }) {
  const reviewCol  = col(columns, "검토필요");
  const statusCol  = col(columns, "처리상태");
  const elapsedCol = col(columns, "경과");

  const reviewCnt = reviewCol ? vals(rows, reviewCol).filter(Boolean).length : 0;
  const doneCnt   = statusCol ? vals(rows, statusCol).filter((v) => v.includes("완료")).length : 0;
  const newCnt    = statusCol ? vals(rows, statusCol).filter((v) => v.includes("신규") || v.includes("대기")).length : 0;

  const avgElapsed = useMemo(() => {
    if (!elapsedCol) return null;
    const nums = vals(rows, elapsedCol).map(parseFloat).filter((n) => !isNaN(n));
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : null;
  }, [rows, elapsedCol]);

  const stats = [
    { label: "검토 필요",   value: reviewCnt, unit: "건", color: C_AMBER,  icon: "🔍" },
    { label: "처리 완료",   value: doneCnt,   unit: "건", color: C_GREEN,  icon: "✓" },
    { label: "대기 중",     value: newCnt,    unit: "건", color: C_SKY,    icon: "⏸" },
    avgElapsed ? { label: "평균 경과일", value: avgElapsed, unit: "일", color: C_INDIGO, icon: "📅" } : null,
  ].filter(Boolean) as { label: string; value: string | number; unit: string; color: string; icon: string }[];

  return (
    <div className="card" style={{ padding: "24px" }}>
      <p className="section-title" style={{ marginBottom: 20 }}>처리 요약</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            padding: "14px",
            background: "var(--bg)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
              <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-mute)", marginLeft: 2 }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Card D — 부서별 응답률
══════════════════════════════════════════ */
function DeptCard({ rows, columns }: { rows: string[][]; columns: ColumnMeta[] }) {
  const deptCol   = col(columns, "담당부서");
  const replyCol  = col(columns, "회신여부");

  const data = useMemo(() => {
    if (!deptCol || !replyCol) return [];
    const map: Record<string, { total: number; done: number }> = {};
    rows.forEach((r) => {
      const dept   = (r[deptCol.index] ?? "").trim();
      const reply  = (r[replyCol.index] ?? "").trim();
      if (!dept || dept.includes("자동분류")) return;
      if (!map[dept]) map[dept] = { total: 0, done: 0 };
      map[dept].total++;
      if (reply.includes("완료")) map[dept].done++;
    });
    return Object.entries(map)
      .map(([dept, v]) => ({ dept, ...v, rate: Math.round((v.done / v.total) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [rows, deptCol, replyCol]);

  return (
    <div className="card" style={{ padding: "24px" }}>
      <p className="section-title" style={{ marginBottom: 20 }}>부서별 회신율</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((d) => (
          <div key={d.dept}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 500 }}>{d.dept}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--text-mute)" }}>{d.done}/{d.total}건</span>
                <span className="font-mono" style={{
                  fontSize: 13, fontWeight: 700,
                  color: d.rate >= 60 ? C_GREEN : d.rate >= 40 ? C_AMBER : C_CORAL,
                  minWidth: 38, textAlign: "right",
                }}>
                  {d.rate}%
                </span>
              </div>
            </div>
            <div style={{ height: 7, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${d.rate}%`,
                background: d.rate >= 60 ? C_GREEN : d.rate >= 40 ? C_AMBER : C_CORAL,
                borderRadius: 4,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Card E — 처리상태 퍼널
══════════════════════════════════════════ */
const FUNNEL_ORDER = ["신규(대기)", "조치필요", "자동분류", "회신완료"];
const FUNNEL_COLOR: Record<string, string> = {
  "신규(대기)": C_SKY,
  "조치필요":   C_CORAL,
  "자동분류":   C_INDIGO,
  "회신완료":   C_GREEN,
};

function FunnelCard({ rows, columns }: { rows: string[][]; columns: ColumnMeta[] }) {
  const statusCol = col(columns, "처리상태");
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    vals(rows, statusCol).forEach((v) => { if (v) map[v] = (map[v] ?? 0) + 1; });
    const ordered = FUNNEL_ORDER.filter((k) => map[k]).map((k) => ({ name: k, count: map[k] }));
    const rest = Object.entries(map).filter(([k]) => !FUNNEL_ORDER.includes(k)).map(([name, count]) => ({ name, count }));
    return [...ordered, ...rest];
  }, [rows, statusCol]);

  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="card" style={{ padding: "24px" }}>
      <p className="section-title" style={{ marginBottom: 20 }}>처리상태 분포</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((d) => {
          const color = FUNNEL_COLOR[d.name] ?? C_INDIGO;
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* 상태명 */}
              <div style={{ width: 86, flexShrink: 0 }}>
                <span className="pill" style={{
                  fontSize: 11, padding: "3px 10px",
                  background: `color-mix(in oklch, ${color} 12%, transparent)`,
                  color,
                  border: `1px solid color-mix(in oklch, ${color} 25%, transparent)`,
                  borderRadius: 999,
                }}>
                  {d.name}
                </span>
              </div>
              {/* 바 */}
              <div style={{ flex: 1, height: 8, background: "var(--bg-2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(d.count / max) * 100}%`,
                  background: color,
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }} />
              </div>
              {/* 수치 */}
              <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, width: 70, justifyContent: "flex-end" }}>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color }}>{d.count}</span>
                <span style={{ fontSize: 10, color: "var(--text-mute)" }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   메인
══════════════════════════════════════════ */
export default function InsightsSection({ columns, rows }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1 — 3등분 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <SlaCard   rows={rows} columns={columns} />
        <ReplyCard rows={rows} columns={columns} />
        <SummaryCard rows={rows} columns={columns} />
      </div>
      {/* Row 2 — 2등분 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DeptCard   rows={rows} columns={columns} />
        <FunnelCard rows={rows} columns={columns} />
      </div>
    </div>
  );
}
