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
      className="terminal-badge"
      style={{
        background: "rgba(232, 168, 50, 0.1)",
        color: "var(--amber)",
        border: "1px solid rgba(232, 168, 50, 0.2)",
        padding: "0.15rem 0.6rem",
        fontSize: "0.65rem",
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}
    >
      {text}
    </span>
  );

  if (businesses.length === 0) return null;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", color: "var(--text)" }}>
          <thead>
            <tr
              style={{
                background: "var(--raised)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["#", "Name", "Category", "Phone", "Email", "Website", "Address"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      color: "var(--dim)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
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
                    borderBottom: "1px solid var(--border)",
                    background: isSelected
                      ? "rgba(232, 168, 50, 0.08)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  className="terminal-row"
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      color: isSelected ? "var(--amber)" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: isSelected ? "var(--white)" : "var(--text)",
                      fontFamily: "var(--font-condensed)",
                      fontSize: "0.95rem",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase"
                    }}
                  >
                    {b.name}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {badge(b.category)}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      color: b.phone ? "var(--green)" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {b.phone || "---"}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      color: b.email ? "var(--amber)" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {b.email || "---"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {b.website ? (
                      <a
                        href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--amber)", textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        VIEW LINK ↗
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>---</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      color: isSelected ? "var(--text)" : "var(--dim)",
                      maxWidth: "240px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-sans)",
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
            padding: "1.5rem",
            display: "flex",
            justifyContent: "center",
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            style={{
              background: "var(--raised)",
              border: "1px solid var(--border)",
              color: "var(--amber)",
              padding: "0.5rem 2rem",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            Load Next Segment ({businesses.length - page * PAGE_SIZE})
          </button>
        </div>
      )}
    </div>
  );
}
