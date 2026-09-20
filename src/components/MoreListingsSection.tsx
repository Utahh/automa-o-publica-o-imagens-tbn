import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { CarouselArrows, CarouselTrack, useCarousel } from "./Carousel";
import { SafeImage } from "./SafeImage";
import { getNonFeaturedProperties } from "../data/properties";
import { useProperties } from "../hooks/useProperties";
import { formatPrice } from "../lib/format";
import type { Property } from "../types";

/**
 * O resto dos imóveis publicados — sem "Destaque" ativado no cadastro.
 * Em vez do card completo da vitrine (FeaturedSection), aqui é um
 * carrossel de fotos enxuto: capa, uma flag de Venda/Aluguel no canto e
 * o valor — passa rápido, sem disputar atenção com os destaques, mas
 * sem virar uma lista seca de "estoque".
 */
export function MoreListingsSection() {
  const { properties } = useProperties();
  const { scrollerRef, scrollByCards } = useCarousel();
  const rest = getNonFeaturedProperties(properties);

  if (rest.length === 0) return null;

  return (
    <section className="overflow-hidden bg-cinza-papel pb-20 pt-14 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 border-t border-grafite/8 pt-10">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-grafite sm:text-3xl">
              Outros imóveis disponíveis
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/imoveis"
              className="group hidden min-h-11 items-center gap-1.5 font-display text-sm font-semibold text-azul-escritura sm:flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} aria-hidden="true" />
            </Link>
            <CarouselArrows onScroll={scrollByCards} />
          </div>
        </Reveal>

        <div className="mt-8">
          <CarouselTrack scrollerRef={scrollerRef}>
            {rest.map((property) => (
              <CarouselCard key={property.id} property={property} />
            ))}
          </CarouselTrack>
        </div>

        <Link
          to="/imoveis"
          className="group mt-6 flex min-h-11 items-center justify-center gap-1.5 font-display text-sm font-semibold text-azul-escritura sm:hidden"
        >
          Ver todos os imóveis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function CarouselCard({ property }: { property: Property }) {
  return (
    <Link
      data-card
      to={`/imoveis/${property.slug}`}
      className="group relative block w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-grafite shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5 sm:w-[260px]"
    >
      <div className="aspect-[4/5] w-full overflow-hidden">
        <SafeImage
          src={property.cover}
          alt={property.title}
          displayWidth={260}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>

      <span className="absolute right-3 top-3 rounded-full bg-grafite-noite/85 px-3 py-1 font-mono text-xs font-medium tracking-wide text-cinza-papel backdrop-blur-sm">
        {property.dealType}
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-grafite-noite/95 via-grafite-noite/55 to-transparent px-4 pb-4 pt-12">
        {(property.neighborhood || property.city) && (
          <p className="truncate font-display text-[12.5px] text-papel-muted">
            {[property.neighborhood, property.city].filter(Boolean).join(", ")}
          </p>
        )}
        <p className="mt-0.5 font-mono-tabular font-mono text-[17px] font-semibold text-cinza-papel">
          {formatPrice(property.price, property.dealType)}
        </p>
      </div>
    </Link>
  );
}
