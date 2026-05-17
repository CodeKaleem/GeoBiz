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
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "var(--amber)",
    color: "#0e100f",
    border: "none",
    fontFamily: "var(--font-mono)",
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <button
        id="export-excel-btn"
        type="button"
        onClick={handleExcel}
        style={btnBase}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        XLSX
      </button>

      <button
        id="export-csv-btn"
        type="button"
        onClick={handleCSV}
        style={{ ...btnBase, background: "var(--surface)", color: "var(--amber)", border: "1px solid var(--amber)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232, 168, 50, 0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        CSV
      </button>

      <button
        id="export-json-btn"
        type="button"
        onClick={handleJSON}
        style={{ ...btnBase, background: "var(--surface)", color: "var(--dim)", border: "1px solid var(--border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dim)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        JSON
      </button>
    </div>
  );
}
