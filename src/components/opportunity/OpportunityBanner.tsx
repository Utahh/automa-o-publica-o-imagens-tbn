import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "../Reveal";
import { SafeImage } from "../SafeImage";
import { getActiveOpportunity } from "../../data/opportunities";

/** Bloco de destaque na Home, logo abaixo do lançamento — mesma linguagem visual
 *  do LaunchBanner. O card leva à página da oportunidade; "Ver todas" à listagem. */
export function OpportunityBanner() {
  const opportunity = getActiveOpportunity();
  if (!opportunity) return null;

  return (
    <section className="bg-grafite-noite pb-14 sm:pb-16">
      <div className="mx-auto mb-14 max-w-7xl px-6 sm:mb-16 sm:px-8">
        <div className="border-t border-cinza-papel/10" />
      </div>
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-cinza-papel sm:text-[1.75rem]">
            Oportunidade em destaque
          </h2>
          <Link
            to="/oportunidades"
            className="group flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-azul-sinal"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.3} />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <Link
            to={`/oportunidades/${opportunity.slug}`}
            className="group mt-6 flex flex-col gap-6 rounded-2xl border-l-4 border-azul-sinal bg-grafite p-7 transition-colors duration-300 hover:border-azul-escritura sm:flex-row sm:items-center sm:gap-9 sm:p-9"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold italic tracking-tight text-cinza-papel">
                  {opportunity.builderLabel}
                </span>
                <span className="inline-block rounded-full bg-azul-escritura px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-cinza-papel">
                  {opportunity.badgeLabel}
                </span>
              </div>
              <h3 className="mt-5 max-w-xl text-balance font-display text-2xl font-semibold leading-tight tracking-tight text-cinza-papel sm:text-3xl">
                {opportunity.name}
              </h3>
              <p className="mt-3 max-w-2xl font-display text-sm leading-relaxed text-papel-muted sm:text-[15px]">
                {opportunity.shortDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {opportunity.attributes.map((attr) => (
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
            <SafeImage
              src={opportunity.photo || "/sem-foto"}
              alt={`Foto do empreendimento ${opportunity.name}`}
              wrapperClassName="mx-auto h-[180px] w-[240px] shrink-0 rounded-lg sm:mx-0 sm:h-[240px] sm:w-[300px]"
              className="mx-auto h-[180px] w-[240px] shrink-0 rounded-lg object-cover sm:mx-0 sm:h-[240px] sm:w-[300px]"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
