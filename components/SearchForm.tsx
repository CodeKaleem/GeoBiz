"use client";
 
import { useState, useEffect, useMemo } from "react";
import { SearchParams, SearchHistoryEntry } from "@/lib/types";
 
const COUNTRY_CITY_MAP: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  "United Kingdom": ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Bristol", "Leicester"],
  "Pakistan": ["Islamabad", "Karachi", "Lahore", "Rawalpindi", "Faisalabad", "Multan", "Gujranwala", "Peshawar", "Quetta", "Sialkot"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"],
  "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
};
 
const COMMON_TYPES = [
  "restaurant", "hospital", "hotel", "school", "pharmacy",
  "bank", "cafe", "supermarket", "mosque", "church",
  "fuel", "parking", "park", "clinic", "gym", "dentist",
  "university", "bar", "museum", "library", "laundry",
  "car_repair", "atm", "cinema", "beauty_salon"
];
 
const QUICK_TYPES = ["restaurant", "hospital", "bank", "hotel", "pharmacy"];
 
interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}
 
export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
 
  useEffect(() => {
    try {
      const raw = localStorage.getItem("geobiz_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
 
  const cities = useMemo(() => (country ? COUNTRY_CITY_MAP[country] || [] : []), [country]);
 
  const saveHistory = (params: SearchParams) => {
    const entry: SearchHistoryEntry = { ...params, timestamp: Date.now() };
    const updated = [entry, ...history.filter(
      (h) => !(h.city === params.city && h.type === params.type)
    )].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("geobiz_history", JSON.stringify(updated));
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !type.trim()) return;
    saveHistory({ city, type });
    setShowHistory(false);
    onSearch({ city: city.trim(), type: type.trim() });
  };
 
  const applyHistory = (entry: SearchHistoryEntry) => {
    setCity(entry.city);
    setType(entry.type);
    setShowHistory(false);
    onSearch({ city: entry.city, type: entry.type });
  };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@300;400;500&display=swap');
 
        .sf-root {
          position: relative;
          font-family: 'Barlow', sans-serif;
        }
 
        /* ── FIELD ROWS ── */
        .sf-fields {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2px;
          background: #2a3028;
          border: 1px solid #2a3028;
        }
 
        @media (max-width: 768px) {
          .sf-fields { grid-template-columns: 1fr; }
        }
 
        .sf-field {
          background: #161a17;
          padding: 0;
          display: flex;
          flex-direction: column;
          position: relative;
        }
 
        .sf-field-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e8a832;
          padding: 12px 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
 
        .sf-field-label::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 3px;
          background: #e8a832;
          border-radius: 50%;
        }
 
        .sf-field-index {
          margin-left: auto;
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          color: #3d4a3a;
          letter-spacing: 0.1em;
        }
 
        .sf-input,
        .sf-select {
          background: transparent;
          border: none;
          outline: none;
          color: #d8dfd4;
          font-family: 'Barlow', sans-serif;
          font-size: 15px;
          font-weight: 400;
          padding: 8px 16px 14px;
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          transition: color 0.15s;
        }
 
        .sf-input::placeholder {
          color: #3d4a3a;
        }
 
        .sf-input:focus,
        .sf-select:focus {
          color: #f0f2ee;
        }
 
        .sf-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a8c74' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }
 
        .sf-select option {
          background: #1d2320;
          color: #d8dfd4;
        }
 
        /* active field highlight */
        .sf-field:focus-within {
          background: #1d2320;
        }
 
        .sf-field:focus-within .sf-field-label {
          color: #f0c060;
        }
 
        /* ── BOTTOM BAR ── */
        .sf-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 2px;
          flex-wrap: wrap;
        }
 
        /* ── QUICK TYPES ── */
        .sf-quick {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #2a3028;
          padding: 2px;
          flex-wrap: wrap;
        }
 
        .sf-quick-btn {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 12px;
          background: #161a17;
          border: none;
          color: #7a8c74;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }
 
        .sf-quick-btn:hover {
          background: #1d2320;
          color: #d8dfd4;
        }
 
        .sf-quick-btn.active {
          background: #e8a832;
          color: #0e100f;
          font-weight: 700;
        }
 
        /* ── ACTIONS ── */
        .sf-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
 
        .sf-history-btn {
          width: 38px;
          height: 38px;
          background: #161a17;
          border: 1px solid #2a3028;
          color: #7a8c74;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          position: relative;
        }
 
        .sf-history-btn:hover {
          border-color: #e8a832;
          color: #e8a832;
        }
 
        .sf-history-btn.open {
          border-color: #e8a832;
          color: #e8a832;
          background: rgba(232,168,50,0.06);
        }
 
        .sf-history-count {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 14px;
          height: 14px;
          background: #e8a832;
          color: #0e100f;
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
 
        .sf-submit {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 24px;
          height: 38px;
          background: #e8a832;
          border: none;
          color: #0e100f;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
 
        .sf-submit:hover:not(:disabled) {
          opacity: 0.88;
        }
 
        .sf-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
 
        .sf-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(14,16,15,0.3);
          border-top-color: #0e100f;
          border-radius: 50%;
          animation: sf-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
 
        @keyframes sf-spin { to { transform: rotate(360deg); } }
 
        /* ── HISTORY DROPDOWN ── */
        .sf-history-panel {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: #161a17;
          border: 1px solid #2a3028;
          border-top: 2px solid #e8a832;
          z-index: 50;
          overflow: hidden;
        }
 
        .sf-history-header {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e8a832;
          padding: 10px 14px 8px;
          border-bottom: 1px solid #2a3028;
        }
 
        .sf-history-list {
          max-height: 220px;
          overflow-y: auto;
        }
 
        .sf-history-item {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #2a3028;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.12s;
        }
 
        .sf-history-item:last-child {
          border-bottom: none;
        }
 
        .sf-history-item:hover {
          background: #1d2320;
        }
 
        .sf-history-dot {
          width: 4px;
          height: 4px;
          background: #e8a832;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.5;
        }
 
        .sf-history-item:hover .sf-history-dot {
          opacity: 1;
        }
 
        .sf-history-city {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.04em;
          color: #d8dfd4;
          text-transform: uppercase;
        }
 
        .sf-history-type {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: #7a8c74;
          letter-spacing: 0.06em;
          margin-top: 1px;
        }
 
        .sf-divider {
          height: 1px;
          background: #2a3028;
          margin: 12px 0 0;
        }
      `}</style>
 
      <form className="sf-root" onSubmit={handleSubmit}>
 
        {/* ── INPUTS ── */}
        <div className="sf-fields">
 
          {/* Country */}
          <div className="sf-field">
            <span className="sf-field-label">
              Country
              <span className="sf-field-index">01 / 03</span>
            </span>
            <select
              className="sf-select"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setCity(""); }}
            >
              <option value="">All countries</option>
              {Object.keys(COUNTRY_CITY_MAP).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Other">Other (type manually)</option>
            </select>
          </div>
 
          {/* City */}
          <div className="sf-field">
            <span className="sf-field-label">
              City / Region
              <span className="sf-field-index">02 / 03</span>
            </span>
            <input
              className="sf-input"
              type="text"
              placeholder={!country || country === "Other" ? "Type any city…" : "Select or type…"}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="sf-city-list"
              required
              autoComplete="off"
            />
            <datalist id="sf-city-list">
              {cities.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
 
          {/* Category */}
          <div className="sf-field">
            <span className="sf-field-label">
              Category
              <span className="sf-field-index">03 / 03</span>
            </span>
            <input
              className="sf-input"
              type="text"
              placeholder="e.g. restaurant, bank…"
              value={type}
              onChange={(e) => setType(e.target.value)}
              list="sf-type-list"
              required
              autoComplete="off"
            />
            <datalist id="sf-type-list">
              {COMMON_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
 
        </div>
 
        <div className="sf-divider" />
 
        {/* ── BOTTOM BAR ── */}
        <div className="sf-bottom" style={{ paddingTop: 12 }}>
 
          {/* Quick-select type chips */}
          <div className="sf-quick">
            {QUICK_TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`sf-quick-btn ${type === t ? 'active' : ''}`}
                onClick={() => setType(t === type ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>
 
          {/* History + Submit */}
          <div className="sf-actions" style={{ position: 'relative' }}>
 
            {history.length > 0 && (
              <button
                type="button"
                className={`sf-history-btn ${showHistory ? 'open' : ''}`}
                onClick={() => setShowHistory(v => !v)}
                title="Recent searches"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="sf-history-count">{Math.min(history.length, 9)}</span>
              </button>
            )}
 
            <button type="submit" className="sf-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="sf-spinner" />
                  Scanning…
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Run Query
                </>
              )}
            </button>
 
            {/* History dropdown */}
            {showHistory && history.length > 0 && (
              <div className="sf-history-panel">
                <div className="sf-history-header">Recent Queries</div>
                <div className="sf-history-list">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      className="sf-history-item"
                      onClick={() => applyHistory(h)}
                    >
                      <span className="sf-history-dot" />
                      <div>
                        <div className="sf-history-city">{h.city}</div>
                        <div className="sf-history-type">{h.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
 
        </div>
      </form>
    </>
  );
}
 