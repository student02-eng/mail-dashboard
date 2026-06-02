"use client";

import { useMemo } from "react";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

const EMAIL_ADDR_RE = /<([^@>]+@[^>]+)>/;
const EMAIL_ONLY_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractEmail(val: string): string | null {
  const m = val.match(EMAIL_ADDR_RE);
  if (m) return m[1].toLowerCase();
  if (EMAIL_ONLY_RE.test(val.trim())) return val.trim().toLowerCase();
  return null;
}

function extractName(val: string): string {
  const m = val.match(/^(.+?)\s*</);
  if (m) return m[1].trim();
  return val.split("@")[0] ?? val;
}

function extractDomain(email: string): string {
  return email.split("@")[1] ?? email;
}

export default function EmailSection({ columns, rows }: Props) {
  const col = columns[0];

  const { senderRanking, domainRanking } = useMemo(() => {
    const senderCounts: Record<string, { name: string; email: string; count: number }> = {};
    const domainCounts: Record<string, number> = {};

    rows.forEach((r) => {
      const raw = (r[col.index] ?? "").trim();
      if (!raw) return;
      const email = extractEmail(raw);
      if (!email) return;
      const name = extractName(raw);
      const domain = extractDomain(email);

      if (!senderCounts[email]) {
        senderCounts[email] = { name, email, count: 0 };
      }
      senderCounts[email].count++;
      domainCounts[domain] = (domainCounts[domain] ?? 0) + 1;
    });

    const senderRanking = Object.values(senderCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const domainRanking = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([domain, count]) => ({ domain, count }));

    return { senderRanking, domainRanking };
  }, [rows, col]);

  const maxSender = senderRanking[0]?.count ?? 1;
  const maxDomain = domainRanking[0]?.count ?? 1;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, flexWrap: "wrap" }}>
      {/* Sender ranking */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 12 }}>
          Top 발신자
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {senderRanking.map((s, i) => (
            <div key={s.email} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="font-mono"
                style={{ fontSize: 10, color: "var(--text-mute)", width: 16, flexShrink: 0 }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={s.email}
                  >
                    {s.name}
                    <span style={{ color: "var(--text-mute)", marginLeft: 4, fontSize: 10 }}>
                      {s.email}
                    </span>
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--accent-3)", flexShrink: 0, marginLeft: 8 }}
                  >
                    {s.count}
                  </span>
                </div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(s.count / maxSender) * 100}%`,
                      background: "var(--accent-3)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain ranking */}
      <div>
        <p style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 12 }}>
          Top 도메인
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {domainRanking.map((d, i) => (
            <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="font-mono"
                style={{ fontSize: 10, color: "var(--text-mute)", width: 16, flexShrink: 0 }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{d.domain}</span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 11, color: "var(--accent-4)", flexShrink: 0 }}
                  >
                    {d.count}
                  </span>
                </div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(d.count / maxDomain) * 100}%`,
                      background: "var(--accent-4)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
