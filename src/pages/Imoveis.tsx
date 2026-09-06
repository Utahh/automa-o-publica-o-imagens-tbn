import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { FilterSelect } from "../components/FilterSelect";
import { Reveal } from "../components/Reveal";
import { useProperties } from "../hooks/useProperties";

const priceRanges: Record<string, (price: number) => boolean> = {
  "ate-400": (p) => p <= 400000,
  "ate-700": (p) => p <= 700000,
  "acima-700": (p) => p > 700000,
};

export function Imoveis() {
  const { properties } = useProperties();
  const neighborhoods = Array.from(new Set(properties.map((p) => p.neighborhood).filter(Boolean))).sort();
  const types = Array.from(new Set(properties.map((p) => p.type).filter(Boolean))).sort();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const neighborhood = searchParams.get("bairro") ?? "";
  const type = searchParams.get("tipo") ?? "";
  const dealType = searchParams.get("negocio") ?? "";
  const price = searchParams.get("preco") ?? "";

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (neighborhood && p.neighborhood !== neighborhood) return false;
      if (type && p.type !== type) return false;
      if (dealType && p.dealType !== dealType) return false;
      if (price && priceRanges[price] && !priceRanges[price](p.price)) return false;
      return true;
    });
  }, [properties, neighborhood, type, dealType, price]);

  const hasFilters = Boolean(neighborhood || type || dealType || price);
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-cinza-papel pb-16 pt-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p aria-live="polite" className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-escritura">
            {filtered.length} {filtered.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-grafite sm:text-4xl">
              Todos os imóveis
            </h1>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="flex items-center gap-2 rounded-full border border-grafite/15 px-4 py-2.5 font-display text-sm font-medium text-grafite [touch-action:manipulation] md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              Filtros
            </button>
          </div>
        </Reveal>

        <div
          className={`mt-6 flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5 sm:flex-row sm:items-center sm:gap-6 md:flex ${
            filtersOpen ? "flex" : "hidden"
          }`}
        >
          <FilterSelect label="Bairro" value={neighborhood} onChange={(v) => updateParam("bairro", v)} options={neighborhoods} placeholder="Todos os bairros" />
          <FilterSelect label="Tipo" value={type} onChange={(v) => updateParam("tipo", v)} options={types} placeholder="Todos os tipos" />
          <FilterSelect
            label="Negócio"
            value={dealType}
            onChange={(v) => updateParam("negocio", v)}
            options={["Venda", "Aluguel"]}
            placeholder="Venda ou aluguel"
          />
          <FilterSelect
            label="Preço"
            value={price}
            onChange={(v) => updateParam("preco", v)}
            options={[
              { value: "ate-400", label: "Até R$ 400 mil" },
              { value: "ate-700", label: "Até R$ 700 mil" },
              { value: "acima-700", label: "Acima de R$ 700 mil" },
            ]}
            placeholder="Qualquer valor"
          />
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="flex items-center gap-1.5 font-display text-sm font-medium text-azul-escritura [touch-action:manipulation] sm:ml-auto"
            >
              <X className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <motion.div layout={!reduceMotion} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-display text-lg font-semibold text-grafite">Nenhum imóvel com esses filtros.</p>
            <p className="font-display text-sm text-grafite-muted">Tente ampliar a busca — ou me chame que eu procuro para você.</p>
          </div>
        )}
      </div>
    </div>
  );
}
