"use client";

import { Business } from "@/lib/types";

interface FiltersProps {
  businesses: Business[];
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
    gap: "0.5rem",
    padding: "0.4rem 1rem",
    background: active ? "rgba(232, 168, 50, 0.1)" : "var(--surface)",
    border: `1px solid ${active ? "var(--amber)" : "var(--border)"}`,
    color: active ? "var(--amber)" : "var(--dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.12s",
  } as React.CSSProperties);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <button
        type="button"
        style={chipStyle(filterPhone)}
        onClick={() => setFilterPhone(!filterPhone)}
      >
        <div style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%" }} />
        Phone
      </button>

      <button
        type="button"
        style={chipStyle(filterEmail)}
        onClick={() => setFilterEmail(!filterEmail)}
      >
        <div style={{ width: 4, height: 4, background: "currentColor", borderRadius: "50%" }} />
        Email
      </button>

      {categories.length > 1 && (
        <select
          id="category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            background: "var(--surface)",
            border: `1px solid ${filterCategory ? "var(--amber)" : "var(--border)"}`,
            color: filterCategory ? "var(--amber)" : "var(--dim)",
            padding: "0.4rem 1rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
            outline: "none",
            textTransform: "uppercase",
            letterSpacing: "0.06em"
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
            color: "var(--red)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginLeft: "0.5rem"
          }}
        >
          ✕ Purge Filters
        </button>
      )}
    </div>
  );
}
