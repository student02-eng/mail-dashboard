"use client";

import { useState, useMemo } from "react";
import type { ColumnMeta } from "@/lib/columnMapper";

interface Props {
  columns: ColumnMeta[];
  rows: string[][];
}

function getStatusPillClass(val: string): string {
  if (val.includes("완료") || val.includes("회신완료")) return "pill pill-green";
  if (val.includes("지연") || val.includes("미회신") || val.includes("조치필요")) return "pill pill-red";
  if (val.includes("대기") || val.includes("신규")) return "pill pill-amber";
  if (val.includes("자동") || val.includes("분류")) return "pill pill-blue";
  if (val.includes("생성됨")) return "pill pill-muted";
  return "pill pill-muted";
}

const PAGE_SIZE = 20;

export default function DataTable({ columns, rows }: Props) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.some((cell) => (cell ?? "").toLowerCase().includes(q)));
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (sortCol === null) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      const cmp = av.localeCompare(bv, "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(idx: number) {
    if (sortCol === idx) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(idx);
      setSortDir("asc");
    }
    setPage(0);
  }

  function renderCell(col: ColumnMeta, val: string) {
    if (!val) return <span style={{ color: "var(--text-mute)" }}>—</span>;

    if (col.type === "url") {
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent-3)", textDecoration: "none", fontSize: 11 }}
        >
          ↗ 열기
        </a>
      );
    }

    if (col.type === "status" || col.type === "boolean") {
      return <span className={getStatusPillClass(val)}>{val}</span>;
    }

    if (col.type === "numeric") {
      return (
        <span className="font-mono" style={{ color: "var(--accent-4)" }}>
          {val}
        </span>
      );
    }

    if (col.type === "longtext") {
      return (
        <span title={val} style={{ color: "var(--text-dim)" }}>
          {val.slice(0, 50)}{val.length > 50 ? "…" : ""}
        </span>
      );
    }

    return <span style={{ color: "var(--text-dim)" }}>{val}</span>;
  }

  // Decide which columns to show (skip pure-constant cols like 언어)
  const visibleCols = columns.filter((c) => c.uniqueValues.length > 1 || c.type !== "category");

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <input
          className="search-input"
          style={{ width: 260 }}
          placeholder="검색…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <span style={{ fontSize: 12, color: "var(--text-mute)" }}>
          {filtered.length.toLocaleString()}건 / 전체 {rows.length.toLocaleString()}건
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {visibleCols.map((c) => (
                <th key={c.index} onClick={() => handleSort(c.index)}>
                  {c.label}
                  {sortCol === c.index && (
                    <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={i}>
                {visibleCols.map((c) => (
                  <td key={c.index}>{renderCell(c, r[c.index] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 14, alignItems: "center" }}>
          <button
            className="btn"
            style={{ fontSize: 11, padding: "4px 10px" }}
            disabled={page === 0}
            onClick={() => setPage(0)}
          >
            ««
          </button>
          <button
            className="btn"
            style={{ fontSize: 11, padding: "4px 10px" }}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ 이전
          </button>
          <span style={{ fontSize: 12, color: "var(--text-mute)" }}>
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
          <button
            className="btn"
            style={{ fontSize: 11, padding: "4px 10px" }}
            disabled={page === totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          >
            »»
          </button>
        </div>
      )}
    </div>
  );
}
