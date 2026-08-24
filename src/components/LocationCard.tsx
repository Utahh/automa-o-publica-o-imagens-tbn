import { MapPin } from "lucide-react";
import type { Property } from "../types";

export function LocationCard({ property }: { property: Property }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-grafite/8">
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
