"use client";

import { useState, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import Filters from "@/components/Filters";
import ResultsTable from "@/components/ResultsTable";
import ExportButton from "@/components/ExportButton";
import MapView from "@/components/MapView";
import { Business, SearchParams } from "@/lib/types";

/* ─────────────────────────────────────────────
   DESIGN DIRECTION
   "Field Terminal" — looks like a satellite
   operations console. Dark olive + amber +
   off-white. Monospace data readouts, grid
   overlays, scan-line textures. Feels like a
   geospatial intelligence workstation, not a SaaS
   dashboard. Think: topographic map meets
   cold-war ops room meets modern data tool.
───────────────────────────────────────────── */

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<SearchParams | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterEmail, setFilterEmail] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setLastSearch(params);
    setBusinesses([]);
    setSelectedBusiness(null);
    try {
      const resp = await fetch(
        `/api/search?city=${encodeURIComponent(params.city)}&type=${encodeURIComponent(params.type)}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Search failed");
      setBusinesses(data.businesses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchPhone = !filterPhone || !!b.phone;
      const matchEmail = !filterEmail || !!b.email;
      const matchCategory = !filterCategory || b.category === filterCategory;
      return matchPhone && matchEmail && matchCategory;
    });
  }, [businesses, filterPhone, filterEmail, filterCategory]);

  const hasResults = businesses.length > 0 || loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500&display=swap');

        :root {
          --bg:       #0e100f;
          --surface:  #161a17;
          --raised:   #1d2320;
          --border:   #2a3028;
          --muted:    #3d4a3a;
          --text:     #d8dfd4;
          --dim:      #7a8c74;
          --amber:    #e8a832;
          --amber-dim:#7a5510;
          --green:    #4caf6e;
          --red:      #e05252;
          --white:    #f0f2ee;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Barlow', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Scanline texture overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.07) 2px,
            rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          z-index: 9999;
        }

        /* Grid bg */
        .page-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.35;
          pointer-events: none;
        }

        .page-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(72,90,60,0.25) 0%, transparent 70%);
        }

        /* ─── LAYOUT ─── */
        .app-shell {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px 80px;
        }

        /* ─── HEADER ─── */
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--border);
          background: rgba(14,16,15,0.92);
          backdrop-filter: blur(12px);
        }

        .header-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-mark {
          width: 28px;
          height: 28px;
          border: 2px solid var(--amber);
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-mark::after {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--amber);
        }

        .logo-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.12em;
          color: var(--white);
          text-transform: uppercase;
        }

        .logo-text span {
          color: var(--amber);
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--green);
          letter-spacing: 0.05em;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .header-tag {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--dim);
          letter-spacing: 0.08em;
        }

        /* ─── HERO ─── */
        .hero {
          padding: 72px 0 60px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 40px;
          position: relative;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eyebrow-line {
          width: 32px;
          height: 2px;
          background: var(--amber);
        }

        .eyebrow-text {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: var(--amber);
          text-transform: uppercase;
        }

        .hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: clamp(48px, 7vw, 88px);
          line-height: 0.95;
          letter-spacing: -0.01em;
          color: var(--white);
          text-transform: uppercase;
          max-width: 820px;
        }

        .hero-title .accent {
          color: var(--amber);
          font-style: italic;
        }

        .hero-title .stroke {
          -webkit-text-stroke: 1.5px var(--white);
          color: transparent;
        }

        .hero-sub {
          color: var(--dim);
          font-size: 16px;
          font-weight: 300;
          max-width: 480px;
          line-height: 1.7;
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          padding-top: 8px;
          border-top: 1px solid var(--border);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stat-value {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: var(--white);
        }

        .stat-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--dim);
        }

        /* ─── SEARCH PANEL ─── */
        .search-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 2px solid var(--amber);
          padding: 32px;
          position: relative;
          overflow: hidden;
        }

        .search-panel::before {
          content: 'INPUT PARAMETERS';
          position: absolute;
          top: 12px;
          right: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--amber-dim);
        }

        /* ─── ERROR ─── */
        .error-bar {
          background: rgba(224,82,82,0.08);
          border: 1px solid rgba(224,82,82,0.3);
          border-left: 3px solid var(--red);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f4a4a4;
          font-size: 14px;
          margin-top: 16px;
        }

        /* ─── RESULTS LAYOUT ─── */
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-top: 2px;
        }

        @media (max-width: 1024px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }

        .panel {
          background: var(--surface);
          padding: 0;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--raised);
          flex-shrink: 0;
        }

        .panel-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .panel-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--white);
        }

        .panel-subtitle {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--dim);
        }

        .panel-badge {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border: 1px solid var(--border);
          color: var(--dim);
          letter-spacing: 0.06em;
        }

        .panel-badge.active {
          border-color: var(--green);
          color: var(--green);
          background: rgba(76,175,110,0.06);
        }

        .panel-body {
          flex: 1;
          overflow: auto;
          position: relative;
        }

        /* ─── FILTERS STRIP ─── */
        .filters-strip {
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          background: var(--bg);
          flex-shrink: 0;
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--dim);
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.15s;
          text-transform: uppercase;
        }

        .filter-chip:hover {
          border-color: var(--muted);
          color: var(--text);
        }

        .filter-chip.on {
          border-color: var(--amber);
          color: var(--amber);
          background: rgba(232,168,50,0.06);
        }

        .filter-chip .chip-dot {
          width: 5px;
          height: 5px;
          background: currentColor;
          border-radius: 50%;
        }

        .count-tag {
          margin-left: auto;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--dim);
          flex-shrink: 0;
        }

        .count-tag strong {
          color: var(--amber);
        }

        /* ─── EMPTY + LOADING STATES ─── */
        .state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          gap: 20px;
          padding: 40px;
          text-align: center;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 2px solid var(--border);
          border-top-color: var(--amber);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--dim);
        }

        .loading-text::after {
          content: '';
          animation: dots 1.4s infinite;
        }

        @keyframes dots {
          0%   { content: ''; }
          33%  { content: '.'; }
          66%  { content: '..'; }
          100% { content: '...'; }
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          transform: rotate(45deg);
        }

        .empty-icon svg {
          transform: rotate(-45deg);
        }

        .empty-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 18px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text);
        }

        .empty-desc {
          font-size: 13px;
          color: var(--dim);
          max-width: 300px;
          line-height: 1.7;
        }

        /* ─── INITIAL PROMPT SECTION ─── */
        .prompt-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--border);
          border: 1px solid var(--border);
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .prompt-section {
            grid-template-columns: 1fr;
          }
        }

        .prompt-card {
          background: var(--surface);
          padding: 32px;
          position: relative;
          overflow: hidden;
        }

        .prompt-card::before {
          content: attr(data-num);
          position: absolute;
          bottom: -12px;
          right: 16px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 80px;
          color: var(--raised);
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }

        .prompt-icon {
          width: 40px;
          height: 40px;
          background: var(--raised);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--amber);
          margin-bottom: 20px;
        }

        .prompt-card-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 8px;
        }

        .prompt-card-desc {
          font-size: 13px;
          color: var(--dim);
          line-height: 1.7;
        }

        .example-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
        }

        .example-tag {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border: 1px solid var(--border);
          color: var(--dim);
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s;
        }

        .example-tag:hover {
          border-color: var(--amber);
          color: var(--amber);
        }

        /* ─── FOOTER ─── */
        .site-footer {
          border-top: 1px solid var(--border);
          padding: 28px 24px;
          background: var(--raised);
        }

        .footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .footer-left {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: var(--dim);
          letter-spacing: 0.06em;
          line-height: 1.8;
        }

        .footer-left strong {
          color: var(--text);
          display: block;
          margin-bottom: 2px;
        }

        .footer-links {
          display: flex;
          gap: 28px;
        }

        .footer-link {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--dim);
          text-decoration: none;
          transition: color 0.15s;
        }

        .footer-link:hover {
          color: var(--amber);
        }

        /* ─── EXPORT BUTTON ─── */
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--amber);
          color: #0e100f;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .export-btn:hover { opacity: 0.85; }

        /* ─── MISC ─── */
        .sep-line {
          height: 1px;
          background: var(--border);
          margin: 0;
        }

        .coord-display {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 0.06em;
        }

        .section-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--amber);
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-label::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 1px;
          background: var(--amber);
        }
      `}</style>

      <div className="app-shell">
        <div className="page-bg" aria-hidden />

        {/* ── HEADER ── */}
        <header className="site-header">
          <div className="header-inner">
            <a href="/" className="logo">
              <div className="logo-mark" />
              <span className="logo-text">Geo<span>Biz</span></span>
            </a>
            <div className="header-meta">
              <span className="status-pill">
                <span className="status-dot" />
                SYSTEMS ONLINE
              </span>
              <span className="header-tag">v2.4.1 · ODbL</span>
            </div>
          </div>
        </header>

        <main className="main-content">

          {/* ── HERO ── */}
          <section className="hero">
            <div className="hero-eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Geospatial Intelligence Platform</span>
            </div>

            <h1 className="hero-title">
              Extract<br />
              <span className="accent">Business</span>{" "}
              <span className="stroke">Data</span><br />
              Anywhere
            </h1>

            <p className="hero-sub">
              Query two global databases simultaneously. Pull verified leads—addresses, phones, emails—with geographic precision.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">195+</span>
                <span className="stat-label">Countries</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">Data Sources</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">CSV</span>
                <span className="stat-label">Export Format</span>
              </div>
            </div>
          </section>

          {/* ── SEARCH PANEL ── */}
          <div className="search-panel">
            <div className="section-label" style={{ marginBottom: 20 }}>
              Define Target Parameters
            </div>
            <SearchForm onSearch={handleSearch} loading={loading} />
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="error-bar">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── RESULTS ── */}
          {hasResults ? (
            <div className="results-grid">
              {/* MAP PANEL */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title-group">
                    <span className="panel-title">Spatial View</span>
                    <span className="panel-subtitle">GEOGRAPHIC POSITIONING · LIVE FEED</span>
                  </div>
                  <span className={`panel-badge ${!loading ? 'active' : ''}`}>
                    {loading ? 'LOADING' : `${filteredBusinesses.length} ENTITIES`}
                  </span>
                </div>
                <div className="panel-body">
                  {loading ? (
                    <div className="state-center">
                      <div className="spinner" />
                      <span className="loading-text">Scanning coordinates</span>
                    </div>
                  ) : (
                    <MapView
                      businesses={filteredBusinesses}
                      selectedId={selectedBusiness?.id ?? null}
                      onSelectBusiness={setSelectedBusiness}
                    />
                  )}
                </div>
              </div>

              {/* DATA PANEL */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title-group">
                    <span className="panel-title">Entity Records</span>
                    <span className="panel-subtitle">STRUCTURED DATA · FILTERABLE</span>
                  </div>
                  {lastSearch && (
                    <ExportButton
                      businesses={filteredBusinesses}
                      city={lastSearch.city}
                      type={lastSearch.type}
                    />
                  )}
                </div>

                <div className="filters-strip">
                  <button
                    className={`filter-chip ${filterPhone ? 'on' : ''}`}
                    onClick={() => setFilterPhone(v => !v)}
                  >
                    <span className="chip-dot" />
                    Phone
                  </button>
                  <button
                    className={`filter-chip ${filterEmail ? 'on' : ''}`}
                    onClick={() => setFilterEmail(v => !v)}
                  >
                    <span className="chip-dot" />
                    Email
                  </button>
                  <Filters
                    businesses={businesses}
                    filterPhone={filterPhone}
                    filterEmail={filterEmail}
                    filterCategory={filterCategory}
                    setFilterPhone={setFilterPhone}
                    setFilterEmail={setFilterEmail}
                    setFilterCategory={setFilterCategory}
                    total={businesses.length}
                    shown={filteredBusinesses.length}
                  />
                  <span className="count-tag">
                    <strong>{filteredBusinesses.length}</strong> / {businesses.length}
                  </span>
                </div>

                <div className="panel-body">
                  {loading ? (
                    <div className="state-center">
                      <div className="spinner" />
                      <span className="loading-text">Aggregating records</span>
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="state-center">
                      <div className="empty-icon">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="7" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <span className="empty-title">No Results</span>
                      <p className="empty-desc">No entities matched in this region. Adjust parameters and try again.</p>
                    </div>
                  ) : (
                    <ResultsTable
                      businesses={filteredBusinesses}
                      onSelectBusiness={setSelectedBusiness}
                      selectedId={selectedBusiness?.id ?? null}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── INITIAL STATE ── */
            !error && (
              <div className="prompt-section">
                <div className="prompt-card" data-num="01">
                  <div className="prompt-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="prompt-card-title">Set Location</div>
                  <p className="prompt-card-desc">Enter any city worldwide. The engine queries both OSM and business registries simultaneously.</p>
                  <div className="example-tags">
                    <span className="example-tag">London</span>
                    <span className="example-tag">Tokyo</span>
                    <span className="example-tag">New York</span>
                    <span className="example-tag">Dubai</span>
                  </div>
                </div>

                <div className="prompt-card" data-num="02">
                  <div className="prompt-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </div>
                  <div className="prompt-card-title">Choose Category</div>
                  <p className="prompt-card-desc">High-density categories return more complete data. Try hospitals or banks for maximum coverage.</p>
                  <div className="example-tags">
                    <span className="example-tag">Restaurant</span>
                    <span className="example-tag">Hospital</span>
                    <span className="example-tag">Bank</span>
                    <span className="example-tag">Hotel</span>
                  </div>
                </div>

                <div className="prompt-card" data-num="03">
                  <div className="prompt-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div className="prompt-card-title">Export Leads</div>
                  <p className="prompt-card-desc">Filter by phone or email availability. Export clean CSV with addresses, contacts, and coordinates.</p>
                  <div className="example-tags">
                    <span className="example-tag">CSV Export</span>
                    <span className="example-tag">Phone Filter</span>
                    <span className="example-tag">Email Filter</span>
                  </div>
                </div>
              </div>
            )
          )}

        </main>

        {/* ── FOOTER ── */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-left">
              <strong>© 2026 GeoBiz Global Intelligence</strong>
              Unified geospatial data harvesting · ODbL License
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">API</a>
              <a href="#" className="footer-link">Open Core</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}