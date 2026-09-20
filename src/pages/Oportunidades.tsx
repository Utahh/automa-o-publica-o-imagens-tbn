import { Reveal } from "../components/Reveal";
import { OpportunityCard } from "../components/opportunity/OpportunityCard";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { opportunities } from "../data/opportunities";
import { useSeo } from "../hooks/useSeo";

export function Oportunidades() {
  useSeo({
    title: "Oportunidades em Botucatu",
    description: "Últimas unidades e oportunidades de empreendimentos prontos para morar em Botucatu/SP.",
  });
  return (
    <div className="min-h-screen bg-grafite-noite pb-20 pt-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-cinza-papel sm:text-4xl">
            Oportunidades
          </h1>
          <p className="mt-3 max-w-2xl font-display text-sm leading-relaxed text-papel-muted sm:text-[15px]">
            Empreendimentos já lançados, prontos ou em fase final, com poucas unidades disponíveis. Boa escolha para
            quem quer morar logo ou investir com valorização já em curso.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5">
          {opportunities.map((opportunity, i) => (
            <OpportunityCard key={opportunity.slug} opportunity={opportunity} index={i} />
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-grafite p-7 sm:p-9">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-azul-sinal">
                Não achou o seu?
              </p>
              <p className="mt-2 font-display text-lg font-semibold text-cinza-papel">
                Me diga o que você procura e eu busco na cidade.
              </p>
            </div>
            <WhatsAppButton
              message="Olá, Toninho! Não achei o que procurava nas oportunidades do site, pode me ajudar?"
              label="Falar no WhatsApp"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
