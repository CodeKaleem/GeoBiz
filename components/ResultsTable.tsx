"use client";

import { Business } from "@/lib/types";
import { useState } from "react";

const PAGE_SIZE = 25;

interface ResultsTableProps {
  businesses: Business[];
  onSelectBusiness: (b: Business) => void;
  selectedId: string | null;
}

export default function ResultsTable({
  businesses,
  onSelectBusiness,
  selectedId,
}: ResultsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(businesses.length / PAGE_SIZE);
  const visible = businesses.slice(0, page * PAGE_SIZE);

  const cell = (val: string | number | undefined | null) =>
    val ? String(val) : "N/A";

  const badge = (text: string) => (
    <span
      style={{
        background: "rgba(99,102,241,0.15)",
        color: "var(--color-brand-200)",
        borderRadius: "999px",
        padding: "0.2rem 0.6rem",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "capitalize",
      }}
    >
      {text}
    </span>
  );

  if (businesses.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        background: "var(--color-surface-2)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr
              style={{
                background: "var(--color-surface-3)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {["#", "Name", "Category", "Phone", "Email", "Website", "Address"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                      color: "var(--color-muted)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((b, i) => {
              const isSelected = b.id === selectedId;
              const hasFullContact = b.phone && (b.email || b.website);
              
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelectBusiness(b)}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    background: isSelected
                      ? "rgba(99,102,241,0.12)"
                      : hasFullContact ? "rgba(34,197,94,0.02)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = hasFullContact ? "rgba(34,197,94,0.02)" : "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      color: "var(--color-muted)",
                      fontSize: "0.78rem",
                      minWidth: "2.5rem",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      fontWeight: 600,
                      color: isSelected ? "var(--color-brand-200)" : "var(--color-text)",
                      minWidth: "160px",
                    }}
                  >
                    {b.name}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", minWidth: "100px" }}>
                    {badge(b.category)}
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      color: b.phone ? "#4ade80" : "var(--color-muted)",
                      minWidth: "130px",
                    }}
                  >
                    {b.phone ? (
                      <a
                        href={`tel:${b.phone}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.phone}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.4 }}>N/A</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      color: b.email ? "#60a5fa" : "var(--color-muted)",
                      minWidth: "140px",
                    }}
                  >
                    {b.email ? (
                      <a
                        href={`mailto:${b.email}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.email}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.4 }}>N/A</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      minWidth: "140px",
                    }}
                  >
                    {b.website ? (
                      <a
                        href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-brand-400)", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website ↗
                      </a>
                    ) : (
                      <span style={{ opacity: 0.4, color: "var(--color-muted)" }}>N/A</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.85rem 1rem",
                      color: b.address ? "var(--color-text)" : "var(--color-muted)",
                      maxWidth: "260px",
                      minWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={b.address || ""}
                  >
                    {cell(b.address)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {page < totalPages && (
        <div
          style={{
            padding: "1rem",
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            id="load-more-btn"
            type="button"
            onClick={() => setPage((p) => p + 1)}
            style={{
              background: "var(--color-surface-3)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color: "var(--color-brand-400)",
              padding: "0.6rem 1.8rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Load more ({businesses.length - page * PAGE_SIZE} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
