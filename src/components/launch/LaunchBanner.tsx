import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../Reveal";
import { getActiveLaunch } from "../../data/launches";

/** Bloco único de destaque na Home, logo abaixo da busca. A arte é vertical,
 *  por isso entra pequena e com altura fixa — o bloco nunca cresce pra
 *  acompanhar a imagem, pra não pesar a rolagem no mobile. Some sozinho
 *  quando não há lançamento ativo. */
export function LaunchBanner() {
  const launch = getActiveLaunch();
  if (!launch) return null;

  return (
    <section className="bg-grafite-noite py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-cinza-papel sm:text-[1.75rem]">
            Lançamento em destaque
          </h2>
          <Link
            to="/lancamentos"
            className="group flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-azul-sinal"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.3} />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <Link
            to={`/lancamentos/${launch.slug}`}
            className="group mt-6 flex flex-col gap-6 rounded-2xl border-l-4 border-azul-escritura bg-grafite p-7 transition-colors duration-300 hover:border-azul-sinal sm:flex-row sm:items-center sm:gap-9 sm:p-9"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <img src={launch.logo} alt="" className="h-9 w-9 shrink-0 object-contain" />
                <span className="inline-block rounded-full bg-azul-escritura px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-cinza-papel">
                  Lançamento
                </span>
              </div>
              <h3 className="mt-5 max-w-xl text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-cinza-papel sm:text-3xl">
                {launch.builderName}
              </h3>
              <p className="mt-3 max-w-2xl font-display text-sm leading-relaxed text-papel-muted sm:text-[15px]">
                {launch.shortDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {launch.attributes.map((attr) => (
                  <span
                    key={attr}
                    className="rounded-full border border-cinza-papel/15 px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-papel-muted"
                  >
                    {attr}
                  </span>
                ))}
              </div>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-azul-escritura px-6 py-3 font-display text-sm font-semibold text-cinza-papel transition-colors group-hover:bg-azul-escritura-forte">
                Conheça o empreendimento
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.3} />
              </span>
            </div>
            {/* Arte é vertical (2:3) — altura sempre limitada pra não pesar a rolagem, principalmente no mobile. */}
            <img
              src={launch.art}
              alt={`Arte de divulgação — ${launch.builderName}`}
              className="mx-auto h-[180px] w-auto shrink-0 rounded-lg object-contain sm:mx-0 sm:h-[240px]"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
