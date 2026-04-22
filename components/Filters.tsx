"use client";

import { Business } from "@/lib/types";

interface FiltersProps {
  businesses: Business[];
  onFilter: (filtered: Business[]) => void;
  filterPhone: boolean;
  filterEmail: boolean;
  filterCategory: string;
  setFilterPhone: (v: boolean) => void;
  setFilterEmail: (v: boolean) => void;
  setFilterCategory: (v: string) => void;
  total: number;
  shown: number;
}

export default function Filters({
  businesses,
  filterPhone,
  filterEmail,
  filterCategory,
  setFilterPhone,
  setFilterEmail,
  setFilterCategory,
  total,
  shown,
}: FiltersProps) {
  const categories = Array.from(new Set(businesses.map((b) => b.category))).sort();

  const chipStyle = (active: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    border: `1px solid ${active ? "var(--color-brand-500)" : "var(--color-border)"}`,
    background: active ? "rgba(99,102,241,0.18)" : "var(--color-surface-3)",
    color: active ? "var(--color-brand-200)" : "var(--color-muted)",
    fontSize: "0.82rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.18s",
  } as React.CSSProperties);

  return (
    <div
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "1rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Results count */}
      <span style={{ color: "var(--color-muted)", fontSize: "0.82rem", marginRight: "auto" }}>
        Showing{" "}
        <strong style={{ color: "var(--color-brand-400)" }}>{shown}</strong>{" "}
        of{" "}
        <strong style={{ color: "var(--color-text)" }}>{total}</strong> results
      </span>

      <button
        type="button"
        style={chipStyle(filterPhone)}
        onClick={() => setFilterPhone(!filterPhone)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 6.11 19.79 19.79 0 0 1 1.08 2.18C1 1.09 1.9.09 3 .09h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 14.92z" />
        </svg>
        Has Phone
      </button>

      <button
        type="button"
        style={chipStyle(filterEmail)}
        onClick={() => setFilterEmail(!filterEmail)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Has Email
      </button>

      {categories.length > 1 && (
        <select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            background: "var(--color-surface-3)",
            border: `1px solid ${filterCategory ? "var(--color-brand-500)" : "var(--color-border)"}`,
            borderRadius: "999px",
            color: filterCategory ? "var(--color-brand-200)" : "var(--color-muted)",
            padding: "0.4rem 0.9rem",
            fontSize: "0.82rem",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {(filterPhone || filterEmail || filterCategory) && (
        <button
          type="button"
          onClick={() => {
            setFilterPhone(false);
            setFilterEmail(false);
            setFilterCategory("");
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#f87171",
            fontSize: "0.78rem",
            cursor: "pointer",
            padding: "0.2rem 0.4rem",
          }}
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}
