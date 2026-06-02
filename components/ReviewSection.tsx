"use client";

import { useState } from "react";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  longtextCols: ColumnMeta[];
  booleanCols: ColumnMeta[];
  urlCols: ColumnMeta[];
  statusCols: ColumnMeta[];
  rows: string[][];
}

function getStatusPillClass(val: string): string {
  if (val.includes("완료")) return "pill pill-green";
  if (val.includes("지연") || val.includes("미회신") || val.includes("조치")) return "pill pill-red";
  if (val.includes("대기") || val.includes("신규")) return "pill pill-amber";
  if (val.includes("분류") || val.includes("자동")) return "pill pill-blue";
  return "pill pill-muted";
}

export default function ReviewSection({
  longtextCols,
  booleanCols,
  urlCols,
  statusCols,
  rows,
}: Props) {
  const [filter, setFilter] = useState<"all" | "review">("review");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 6;

  const textCol = longtextCols[0];
  const boolCol = booleanCols[0];
  const urlCol = urlCols[0];

  // Filter rows
  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (boolCol) return (r[boolCol.index] ?? "").trim() !== "";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Find ID column (freetext, first col usually)
  const idCol = { index: 0, label: "ID" };

  return (
    <div>
      {/* Filter controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${filter === "review" ? "btn-accent" : ""}`}
          style={{ fontSize: 11, padding: "4px 10px" }}
          onClick={() => { setFilter("review"); setPage(0); }}
        >
          검토 필요만
        </button>
        <button
          className={`btn ${filter === "all" ? "btn-accent" : ""}`}
          style={{ fontSize: 11, padding: "4px 10px" }}
          onClick={() => { setFilter("all"); setPage(0); }}
        >
          전체
        </button>
        <span style={{ fontSize: 12, color: "var(--text-mute)", alignSelf: "center" }}>
          {filtered.length}건
        </span>
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 12,
        }}
      >
        {pageRows.map((r, idx) => {
          const id = (r[idCol.index] ?? "").slice(0, 12);
          const text = r[textCol?.index ?? 0] ?? "";
          const url = urlCol ? r[urlCol.index] ?? "" : "";
          const isFlagged = boolCol ? (r[boolCol.index] ?? "").trim() !== "" : false;

          return (
            <div
              key={idx}
              className="card"
              style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--text-mute)" }}>
                  #{id}
                </span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {isFlagged && (
                    <span className="pill pill-amber" style={{ fontSize: 10 }}>
                      검토필요
                    </span>
                  )}
                  {statusCols.slice(0, 2).map((sc) => {
                    const v = (r[sc.index] ?? "").trim();
                    if (!v) return null;
                    return (
                      <span key={sc.index} className={getStatusPillClass(v)} style={{ fontSize: 10 }}>
                        {v}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Text */}
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {text || <span style={{ color: "var(--text-mute)" }}>내용 없음</span>}
              </p>

              {/* URL */}
              {url && url.startsWith("http") && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 11,
                    color: "var(--accent-3)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Gmail 원본 열기
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 16, justifyContent: "center" }}>
          <button
            className="btn"
            style={{ fontSize: 11, padding: "4px 10px" }}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ 이전
          </button>
          <span style={{ fontSize: 12, color: "var(--text-mute)", alignSelf: "center" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            className="btn"
            style={{ fontSize: 11, padding: "4px 10px" }}
            disabled={page === totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            다음 ›
          </button>
        </div>
      )}
    </div>
  );
}
