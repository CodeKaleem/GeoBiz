export default function Header() {
  return (
    <header
      style={{
        background: "rgba(15,15,26,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px rgba(99,102,241,0.5)",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background: "linear-gradient(90deg, #e2e8f0 0%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.2,
              }}
            >
              GeoBiz Scraper
            </h1>
            <p
              style={{
                fontSize: "0.68rem",
                color: "var(--color-muted)",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              Powered by OpenStreetMap
            </p>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {[
            { label: "Free & Open", color: "#4ade80" },
            { label: "No Login", color: "#818cf8" },
            { label: "OSM Data", color: "#60a5fa" },
          ].map(({ label, color }) => (
            <span
              key={label}
              style={{
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color,
                borderRadius: "999px",
                padding: "0.25rem 0.7rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
