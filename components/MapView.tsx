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
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = leaflet.default
          .map(mapRef.current, { zoomControl: true, attributionControl: true })
          .setView([30.0, 70.0], 2);

        leaflet.default
          .tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
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

  // Rebuild markers whenever businesses list changes
  useEffect(() => {
    if (!mapInstance.current || !L.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validBusinesses = businesses.filter((b) => b.lat !== 0 || b.lon !== 0);
    if (validBusinesses.length === 0) return;

    const bounds: [number, number][] = [];

    validBusinesses.forEach((b) => {
      const isSelected = b.id === selectedId;

      // Create custom divIcon for selected state
      const icon = L.current.divIcon({
        className: "",
        html: `<div style="
          width: ${isSelected ? 18 : 12}px;
          height: ${isSelected ? 18 : 12}px;
          border-radius: 50%;
          background: ${isSelected ? "#818cf8" : "#6366f1"};
          border: ${isSelected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)"};
          box-shadow: 0 0 ${isSelected ? 14 : 6}px ${isSelected ? "rgba(99,102,241,0.9)" : "rgba(99,102,241,0.4)"};
          cursor: pointer;
          transition: all 0.2s;
        "></div>`,
        iconSize: [isSelected ? 18 : 12, isSelected ? 18 : 12],
        iconAnchor: [isSelected ? 9 : 6, isSelected ? 9 : 6],
      });

      const marker = L.current
        .marker([b.lat, b.lon], { icon })
        .addTo(mapInstance.current)
        .bindPopup(
          `<div style="font-family: system-ui, sans-serif; min-width: 200px">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #e2e8f0">${b.name}</div>
            <div style="font-size: 12px; color: #818cf8; margin-bottom: 8px; text-transform: capitalize">${b.category}</div>
            ${b.phone ? `<div style="font-size: 12px; color: #94a3b8; margin-bottom: 3px">📞 ${b.phone}</div>` : ""}
            ${b.email ? `<div style="font-size: 12px; color: #94a3b8; margin-bottom: 3px">✉️ ${b.email}</div>` : ""}
            ${b.address ? `<div style="font-size: 12px; color: #94a3b8">${b.address}</div>` : ""}
          </div>`,
          { maxWidth: 280 }
        )
        .on("click", () => onSelectBusiness(b));

      markersRef.current.push(marker);
      bounds.push([b.lat, b.lon]);
    });

    // Fly to fit all markers
    if (bounds.length > 0) {
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [businesses, selectedId, onSelectBusiness]);

  // Pan to selected marker
  useEffect(() => {
    if (!mapInstance.current || !selectedId) return;
    const business = businesses.find((b) => b.id === selectedId);
    if (business && (business.lat || business.lon)) {
      mapInstance.current.flyTo([business.lat, business.lon], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedId, businesses]);

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Required Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

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
            background: "var(--color-surface-2)",
            color: "var(--color-muted)",
            gap: "0.75rem",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.4}>
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
          </svg>
          <span style={{ fontSize: "0.9rem" }}>Search for businesses to see them on the map</span>
        </div>
      )}

      <div ref={mapRef} style={{ height: "500px", width: "100%", zIndex: 1 }} />
    </div>
  );
}
