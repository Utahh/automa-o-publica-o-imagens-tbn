import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { useProperties } from "../hooks/useProperties";

export function HeroSearch() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const neighborhoods = Array.from(new Set(properties.map((p) => p.neighborhood).filter(Boolean))).sort();
  const types = Array.from(new Set(properties.map((p) => p.type).filter(Boolean))).sort();
  const [neighborhood, setNeighborhood] = useState("");
  const [type, setType] = useState("");
  const [dealType, setDealType] = useState("");
  const [price, setPrice] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (neighborhood) params.set("bairro", neighborhood);
    if (type) params.set("tipo", type);
    if (dealType) params.set("negocio", dealType);
    if (price) params.set("preco", price);
    navigate(`/imoveis${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 divide-y divide-grafite/8 overflow-hidden rounded-2xl bg-cinza-papel shadow-[0_24px_60px_-20px_rgba(15,18,20,0.45)] sm:grid-cols-[1fr_1fr_1fr_1.15fr_auto] sm:divide-x sm:divide-y-0"
    >
      <Field label="Bairro">
        <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="field-select">
          <option value="">Todos os bairros</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </Field>

      <Field label="Tipo de imóvel">
        <select value={type} onChange={(e) => setType(e.target.value)} className="field-select">
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Negócio">
        <select value={dealType} onChange={(e) => setDealType(e.target.value)} className="field-select">
          <option value="">Venda ou aluguel</option>
          <option value="Venda">Venda</option>
          <option value="Aluguel">Aluguel</option>
        </select>
      </Field>

      <Field label="Faixa de preço">
        <select value={price} onChange={(e) => setPrice(e.target.value)} className="field-select">
          <option value="">Qualquer valor</option>
          <option value="ate-400">Até R$ 400 mil</option>
          <option value="ate-700">Até R$ 700 mil</option>
          <option value="acima-700">Acima de R$ 700 mil</option>
        </select>
      </Field>

      <div className="flex items-center p-2.5 sm:pl-2">
        <button
          type="submit"
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-azul-escritura px-6 py-3.5 font-display text-sm font-semibold text-cinza-papel transition-colors hover:bg-azul-escritura-forte"
        >
          <Search className="h-4 w-4" strokeWidth={2.3} />
          Buscar
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 p-4">
      <span className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-grafite-muted">
        {label}
      </span>
      <span className="relative flex items-center">
        {children}
        <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 shrink-0 text-grafite-muted" strokeWidth={2.2} />
      </span>
    </label>
  );
}
