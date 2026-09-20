import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { PropertyCard } from "./PropertyCard";
import { CarouselArrows, CarouselTrack, useCarousel } from "./Carousel";
import { getFeaturedProperties } from "../data/properties";
import { useProperties } from "../hooks/useProperties";

export function FeaturedSection() {
  const { properties } = useProperties();
  const { scrollerRef, scrollByCards } = useCarousel();
  const featured = getFeaturedProperties(properties);

  if (featured.length === 0) return null;

  return (
    <section className="overflow-hidden bg-cinza-papel pb-4 pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-grafite sm:text-4xl">
              Imóveis em destaque
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/imoveis"
              className="group hidden min-h-11 items-center gap-1.5 font-display text-sm font-semibold text-azul-escritura sm:flex"
            >
              Ver todos os imóveis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} aria-hidden="true" />
            </Link>
            <CarouselArrows onScroll={scrollByCards} />
          </div>
        </Reveal>

        <div className="mt-10">
          <CarouselTrack scrollerRef={scrollerRef}>
            {featured.map((property, i) => (
              <div key={property.id} data-card className="w-[300px] shrink-0 snap-start sm:w-[360px]">
                <PropertyCard property={property} index={i} source="home_destaque" />
              </div>
            ))}
          </CarouselTrack>
        </div>

        <Link
          to="/imoveis"
          className="group mt-4 flex min-h-11 items-center justify-center gap-1.5 font-display text-sm font-semibold text-azul-escritura sm:hidden"
        >
          Ver todos os imóveis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
