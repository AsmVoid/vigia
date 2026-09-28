"use client";

import * as React from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "next-themes";
import { ExternalLink } from "lucide-react";

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  height?: string;
  mapsUrl?: string | null;
}

// Custom DivIcon with SVG pin to prevent default Leaflet asset path resolution bugs
const customMarkerIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      transform: translate(-16px, -32px);
    ">
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(225, 48, 108, 0.5);
        border: 2px solid #ffffff;
      "></div>
      <div style="
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ffffff;
        border-radius: 50%;
        top: 8px;
        left: 11px;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function LeafletMap({
  latitude,
  longitude,
  label,
  zoom = 15,
  height = "380px",
  mapsUrl,
}: LeafletMapProps) {
  const position: [number, number] = [latitude, longitude];
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;

  const targetMapsUrl =
    mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  // If user configured a Carto API key, use official Dark Matter / Positron
  // Otherwise use OpenStreetMap standard tiles (100% free, zero key required)
  const tileUrl = cartoApiKey
    ? isDark
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
      : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = cartoApiKey
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

  return (
    <div
      style={{ height, width: "100%" }}
      className="relative rounded-2xl overflow-hidden border border-border/50 shadow-inner z-0 group/map"
    >
      {/* Botão flutuante para abrir diretamente no Google Maps */}
      <a
        href={targetMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 z-[400] flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold rounded-lg bg-background/90 hover:bg-background border border-border/70 shadow-md text-foreground transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
        title="Abrir no Google Maps (visão completa, satélite, rotas)"
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Maps</span>
        <ExternalLink className="size-2.5 text-muted-foreground" />
      </a>

      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          key={`${tileUrl}-${isDark}`}
          attribution={attribution}
          url={tileUrl}
          className={!cartoApiKey && isDark ? "map-tiles-osm-dark" : ""}
          maxZoom={19}
        />
        <Marker position={position} icon={customMarkerIcon}>
          {label && (
            <Popup className="custom-leaflet-popup">
              <div className="p-1 text-xs font-sans text-neutral-900 font-medium space-y-1.5">
                <div>{label}</div>
                <a
                  href={targetMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 underline font-semibold"
                >
                  <span>Ver no Google Maps</span>
                  <ExternalLink className="size-2.5" />
                </a>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}
