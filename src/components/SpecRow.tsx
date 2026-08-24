import { BedDouble, Bath, Car, Ruler } from "lucide-react";
import clsx from "clsx";
import type { Property } from "../types";
import { formatArea } from "../lib/format";

export function SpecRow({ property, className }: { property: Property; className?: string }) {
  const items = [
    { icon: BedDouble, value: property.bedrooms, label: property.bedrooms === 1 ? "Quarto" : "Quartos" },
    { icon: Bath, value: property.bathrooms, label: property.bathrooms === 1 ? "Banheiro" : "Banheiros" },
    { icon: Car, value: property.parking, label: property.parking === 1 ? "Vaga" : "Vagas" },
    { icon: Ruler, value: formatArea(property.areaM2), label: "" },
  ];

  return (
    <div className={clsx("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map(({ icon: Icon, value, label }, i) => (
        <div key={i} className="flex items-center gap-1.5 text-grafite-muted">
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="font-mono-tabular font-mono text-[13px]">
            {value} {label}
          </span>
        </div>
      ))}
    </div>
  );
}
