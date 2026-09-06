import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BedDouble, Car, Ruler } from "lucide-react";
import { Reveal } from "./Reveal";
import { SafeImage } from "./SafeImage";
import { getNonFeaturedProperties } from "../data/properties";
import { useProperties } from "../hooks/useProperties";
import { formatPrice, formatArea } from "../lib/format";
import type { Property } from "../types";

const PREVIEW_LIMIT = 6;

/**
 * O resto do estoque — imóveis sem "Destaque" ativado no cadastro. Mesma
 * planta, tratamento diferente de propósito: em vez do card fotográfico
 * grande da vitrine (FeaturedSection), aqui é uma lista enxuta tipo
 * "legenda de planta" — numerada, compacta, sem disputar atenção com os
 * destaques. Existe pra ninguém ficar de fora da home, não pra brilhar.
 */
export function MoreListingsSection() {
  const { properties } = useProperties();
  const reduceMotion = useReducedMotion();
  const rest = getNonFeaturedProperties(properties);

  if (rest.length === 0) return null;

  const visible = rest.slice(0, PREVIEW_LIMIT);
  const remaining = rest.length - visible.length;

  return (
    <section className="bg-cinza-papel pb-20 pt-14 sm:pb-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-3 border-t border-grafite/8 pt-10">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-grafite-muted">
              Também no estoque
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-grafite-muted">
              Mais imóveis, sem frescura
            </h2>
          </div>
          <Link
            to="/imoveis"
            className="group flex items-center gap-1.5 font-display text-[13px] font-medium text-grafite-muted transition-colors hover:text-azul-escritura"
          >
            Ver lista completa
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.3} aria-hidden="true" />
          </Link>
        </Reveal>

        <ul className="mt-2 divide-y divide-grafite/8 border-b border-grafite/8">
          {visible.map((property, i) => (
            <ListingRow key={property.id} property={property} index={i} reduceMotion={!!reduceMotion} />
          ))}
        </ul>

        {remaining > 0 && (
          <Reveal delay={0.1} className="mt-5 text-center">
            <Link
              to="/imoveis"
              className="font-display text-[13px] font-medium text-grafite-muted underline decoration-grafite/25 underline-offset-4 transition-colors hover:text-azul-escritura hover:decoration-azul-escritura"
            >
              + {remaining} {remaining === 1 ? "imóvel" : "imóveis"} na lista completa
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function ListingRow({ property, index, reduceMotion }: { property: Property; index: number; reduceMotion: boolean }) {
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % PREVIEW_LIMIT) * 0.05, ease: "easeOut" }}
    >
      <Link
        to={`/imoveis/${property.slug}`}
        className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-white"
      >
        <span className="w-6 shrink-0 font-mono text-[11px] text-grafite-muted/70 sm:w-8" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-20">
          <SafeImage
            src={property.cover}
            alt=""
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[14.5px] font-medium text-grafite">{property.title}</p>
          <p className="mt-0.5 truncate font-display text-xs text-grafite-muted">
            {property.neighborhood}, {property.city} · {property.dealType}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 font-mono text-[11.5px] text-grafite-muted sm:flex">
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Car className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {property.parking}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {formatArea(property.areaM2)}
          </span>
        </div>

        <p className="shrink-0 font-mono-tabular font-mono text-sm font-semibold text-grafite">
          {formatPrice(property.price, property.dealType)}
        </p>

        <ArrowRight
          className="hidden h-4 w-4 shrink-0 text-grafite-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-azul-escritura sm:block"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </Link>
    </motion.li>
  );
}
