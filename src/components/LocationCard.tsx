import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { Property } from "../types";

// Raio do círculo no mapa — não é a localização exata do imóvel (o
// geocode já usa só bairro/cidade, nunca rua/CEP), então o círculo reforça
// visualmente que a área mostrada é aproximada, nunca um pino exato.
const APPROXIMATE_RADIUS_METERS = 350;

function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.circle([lat, lng], {
      radius: APPROXIMATE_RADIUS_METERS,
      color: "#27527F",
      weight: 1.5,
      fillColor: "#27527F",
      fillOpacity: 0.18,
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="h-40 w-full" aria-label="Localização aproximada do imóvel no mapa" />;
}

function LocationPlaceholder() {
  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-grafite-noite">
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#EFF0F1" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-azul-escritura shadow-[0_0_0_8px_rgba(39,82,127,0.25)]">
        <MapPin className="h-5 w-5 text-cinza-papel" strokeWidth={2.2} fill="none" />
      </div>
    </div>
  );
}

export function LocationCard({ property }: { property: Property }) {
  const hasCoords = typeof property.lat === "number" && typeof property.lng === "number";

  return (
    <div className="overflow-hidden rounded-2xl border border-grafite/8">
      {hasCoords ? <LocationMap lat={property.lat as number} lng={property.lng as number} /> : <LocationPlaceholder />}
      <div className="space-y-3 p-5">
        <div>
          <p className="font-display text-[15px] font-semibold text-grafite">
            {property.neighborhood}
          </p>
          <p className="font-display text-sm text-grafite-muted">
            {property.city} · {property.state}
          </p>
        </div>
        <p className="rounded-lg bg-cinza-papel px-3.5 py-3 font-display text-[13px] leading-relaxed text-grafite-muted">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-azul-escritura">
            O que só quem mora perto sabe
          </span>
          <br />
          {property.neighborhoodFact}
        </p>
      </div>
    </div>
  );
}
