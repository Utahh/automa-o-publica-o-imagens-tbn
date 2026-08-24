import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { PropertyCard } from "./PropertyCard";
import { getFeaturedProperties } from "../data/properties";
import { useProperties } from "../hooks/useProperties";

export function FeaturedSection() {
  const { properties } = useProperties();
  const featured = getFeaturedProperties(properties);

  if (featured.length === 0) return null;

  return (
    <section className="bg-cinza-papel pb-4 pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-escritura">
              Selecionados por mim
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-grafite sm:text-4xl">
              Imóveis em destaque
            </h2>
          </div>
          <Link
            to="/imoveis"
            className="group flex items-center gap-1.5 font-display text-sm font-semibold text-azul-escritura"
          >
            Ver todos os imóveis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
