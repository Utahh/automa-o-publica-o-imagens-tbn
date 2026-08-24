import { Link } from "react-router-dom";
import { HeroSymbol } from "../components/HeroSymbol";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-grafite-noite px-6 text-center">
      <HeroSymbol className="h-32 w-32" />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-azul-sinal">Página 404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-cinza-papel">
          Essa planta não existe.
        </h1>
        <p className="mt-2 font-display text-sm text-papel-muted">
          O endereço mudou ou o imóvel já saiu do mapa.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-full bg-azul-escritura px-6 py-3 font-display text-sm font-semibold text-cinza-papel transition-colors hover:bg-azul-escritura-forte"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
