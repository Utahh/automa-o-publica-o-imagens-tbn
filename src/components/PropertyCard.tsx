import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, BedDouble, Bath, Ruler } from "lucide-react";
import type { Property } from "../types";
import { formatPrice, formatArea } from "../lib/format";
import { SafeImage } from "./SafeImage";

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: "easeOut" }}
    >
      <Link
        to={`/imoveis/${property.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-16px_rgba(15,18,20,0.25)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-grafite">
          <SafeImage
            src={property.cover}
            alt={property.title}
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            <span className="rounded-full bg-grafite-noite/85 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-cinza-papel backdrop-blur-sm">
              {property.dealType}
            </span>
            <span className="rounded-full bg-cinza-papel/90 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-grafite backdrop-blur-sm">
              {property.type}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-balance font-display text-[17px] font-semibold leading-snug tracking-tight text-grafite">
              {property.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 truncate font-display text-[13px] text-grafite-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-azul-escritura" strokeWidth={2.2} aria-hidden="true" />
              <span className="truncate">
                {property.neighborhood}, {property.city} · {property.state}
              </span>
            </p>
          </div>

          <p className="font-mono-tabular font-mono text-xl font-semibold text-azul-escritura">
            {formatPrice(property.price, property.dealType)}
          </p>

          <div className="mt-auto flex items-center gap-4 border-t border-grafite/8 pt-3.5 text-grafite-muted">
            <span className="flex items-center gap-1.5 font-mono text-[12px]">
              <BedDouble className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> {property.bedrooms}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[12px]">
              <Bath className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[12px]">
              <Ruler className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> {formatArea(property.areaM2)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
