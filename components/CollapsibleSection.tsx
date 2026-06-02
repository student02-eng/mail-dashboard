"use client";

import { useState, useEffect, CSSProperties } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  style?: CSSProperties;
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  forceOpen,
  style,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen !== undefined) setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <div className="card" style={style}>
      <button
        className="collapsible-trigger"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span className="section-title">{title}</span>
        <svg
          className={`chevron ${open ? "open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`collapsible-content ${open ? "open" : "closed"}`}>
        <div style={{ padding: "0 20px 20px" }}>{children}</div>
      </div>
    </div>
  );
}
