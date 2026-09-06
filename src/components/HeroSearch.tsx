import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { FilterSelect } from "./FilterSelect";

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
      <div className="p-4">
        <FilterSelect label="Bairro" value={neighborhood} onChange={setNeighborhood} options={neighborhoods} placeholder="Todos os bairros" />
      </div>

      <div className="p-4">
        <FilterSelect label="Tipo de imóvel" value={type} onChange={setType} options={types} placeholder="Todos os tipos" />
      </div>

      <div className="p-4">
        <FilterSelect
          label="Negócio"
          value={dealType}
          onChange={setDealType}
          options={["Venda", "Aluguel"]}
          placeholder="Venda ou aluguel"
        />
      </div>

      <div className="p-4">
        <FilterSelect
          label="Faixa de preço"
          value={price}
          onChange={setPrice}
          options={[
            { value: "ate-400", label: "Até R$ 400 mil" },
            { value: "ate-700", label: "Até R$ 700 mil" },
            { value: "acima-700", label: "Acima de R$ 700 mil" },
          ]}
          placeholder="Qualquer valor"
        />
      </div>

      <div className="flex items-center p-2.5 sm:pl-2">
        <button
          type="submit"
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-azul-escritura px-6 py-3.5 font-display text-sm font-semibold text-cinza-papel [touch-action:manipulation] transition-colors hover:bg-azul-escritura-forte"
        >
          <Search className="h-4 w-4" strokeWidth={2.3} />
          Buscar
        </button>
      </div>
    </form>
  );
}
