"use client";

import { Business } from "@/lib/types";

interface ExportButtonProps {
  businesses: Business[];
  city: string;
  type: string;
}

export default function ExportButton({ businesses, city, type }: ExportButtonProps) {
  const handleExcel = async () => {
    const { utils, writeFile } = await import("xlsx");
    const rows = businesses.map((b) => ({
      Name: b.name,
      Category: b.category,
      Phone: b.phone || "N/A",
      Email: b.email || "N/A",
      Website: b.website || "N/A",
      Address: b.address || "N/A",
      Latitude: b.lat,
      Longitude: b.lon,
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Businesses");
    const filename = `geobiz_${city}_${type}_${Date.now()}.xlsx`;
    writeFile(wb, filename);
  };

  const handleCSV = () => {
    const headers = ["Name", "Category", "Phone", "Email", "Website", "Address", "Latitude", "Longitude"];
    const rows = businesses.map((b) =>
      [
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.category}"`,
        `"${b.phone || "N/A"}"`,
        `"${b.email || "N/A"}"`,
        `"${b.website || "N/A"}"`,
        `"${b.address.replace(/"/g, '""') || "N/A"}"`,
        b.lat,
        b.lon,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geobiz_${city}_${type}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJSON = () => {
    const data = JSON.stringify(businesses, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `geobiz_${city}_${type}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (businesses.length === 0) return null;

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.6rem 1.2rem",
    borderRadius: "var(--radius-lg)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid var(--color-border)",
    transition: "all 0.18s",
  };

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
      <button
        id="export-excel-btn"
        type="button"
        onClick={handleExcel}
        style={{
          ...btnBase,
          background: "rgba(34, 197, 94, 0.12)",
          color: "#4ade80",
          borderColor: "rgba(34,197,94,0.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,197,94,0.22)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(34,197,94,0.12)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Excel
      </button>

      <button
        id="export-csv-btn"
        type="button"
        onClick={handleCSV}
        style={{
          ...btnBase,
          background: "rgba(251, 191, 36, 0.1)",
          color: "#fbbf24",
          borderColor: "rgba(251,191,36,0.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(251,191,36,0.1)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download CSV
      </button>

      <button
        id="export-json-btn"
        type="button"
        onClick={handleJSON}
        style={{
          ...btnBase,
          background: "rgba(99, 102, 241, 0.1)",
          color: "var(--color-brand-400)",
          borderColor: "rgba(99,102,241,0.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download JSON
      </button>
    </div>
  );
}
