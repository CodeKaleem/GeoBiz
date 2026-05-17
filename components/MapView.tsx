"use client";

import { useEffect, useRef } from "react";
import { Business } from "@/lib/types";

interface MapViewProps {
  businesses: Business[];
  selectedId: string | null;
  onSelectBusiness: (b: Business) => void;
}

export default function MapView({
  businesses,
  selectedId,
  onSelectBusiness,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("leaflet").then((leaflet) => {
      L.current = leaflet.default;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = leaflet.default
          .map(mapRef.current, { zoomControl: true, attributionControl: true })
          .setView([30.0, 70.0], 2);

        leaflet.default
          .tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              attribution: '&copy; OSM &copy; CARTO',
              maxZoom: 19,
            }
          )
          .addTo(mapInstance.current);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !L.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validBusinesses = businesses.filter((b) => b.lat !== 0 || b.lon !== 0);
    if (validBusinesses.length === 0) return;

    const bounds: [number, number][] = [];

    validBusinesses.forEach((b) => {
      const isSelected = b.id === selectedId;

      const icon = L.current.divIcon({
        className: "",
        html: `<div style="
          width: ${isSelected ? 16 : 10}px;
          height: ${isSelected ? 16 : 10}px;
          background: ${isSelected ? "var(--amber)" : "var(--muted)"};
          border: 1px solid ${isSelected ? "var(--white)" : "rgba(255,255,255,0.3)"};
          box-shadow: 0 0 ${isSelected ? 12 : 4}px ${isSelected ? "rgba(232,168,50,0.6)" : "transparent"};
          transition: all 0.2s;
        "></div>`,
        iconSize: [isSelected ? 16 : 10],
        iconAnchor: [isSelected ? 8 : 5],
      });

      const marker = L.current
        .marker([b.lat, b.lon], { icon })
        .addTo(mapInstance.current)
        .bindPopup(
          `<div style="font-family: var(--font-sans); min-width: 200px; background: var(--surface); color: var(--text)">
            <div style="font-weight: 700; font-size: 13px; color: var(--white); margin-bottom: 4px; font-family: var(--font-condensed); text-transform: uppercase; letter-spacing: 0.05em">${b.name}</div>
            <div style="font-size: 10px; color: var(--amber); margin-bottom: 8px; font-family: var(--font-mono); text-transform: uppercase">${b.category}</div>
            ${b.phone ? `<div style="font-size: 11px; color: var(--dim); margin-bottom: 2px">TEL: ${b.phone}</div>` : ""}
            ${b.email ? `<div style="font-size: 11px; color: var(--dim); margin-bottom: 2px">EML: ${b.email}</div>` : ""}
            ${b.address ? `<div style="font-size: 11px; color: var(--dim); border-top: 1px solid var(--border); margin-top: 6px; pt: 4px">${b.address}</div>` : ""}
          </div>`,
          { maxWidth: 280 }
        )
        .on("click", () => onSelectBusiness(b));

      markersRef.current.push(marker);
      bounds.push([b.lat, b.lon]);
    });

    if (bounds.length > 0) {
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [businesses, selectedId, onSelectBusiness]);

  useEffect(() => {
    if (!mapInstance.current || !selectedId) return;
    const business = businesses.find((b) => b.id === selectedId);
    if (business && (business.lat || business.lon)) {
      mapInstance.current.flyTo([business.lat, business.lon], 15, { duration: 0.8 });
    }
  }, [selectedId, businesses]);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {businesses.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(14,16,15,0.85)",
            backdropFilter: "blur(4px)",
            color: "var(--dim)",
            gap: "1rem",
            textAlign: "center",
            padding: "2rem"
          }}
        >
          <div style={{ width: 40, height: 40, border: "1px solid var(--border)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', transform: 'rotate(45deg)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: 'rotate(-45deg)' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: 'uppercase' }}>Scanning coordinates for visualization...</span>
        </div>
      )}

      <div ref={mapRef} style={{ height: "600px", width: "100%", zIndex: 1 }} />
    </div>
  );
}
