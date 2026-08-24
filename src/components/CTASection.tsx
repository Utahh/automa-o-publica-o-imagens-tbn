import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-grafite-noite py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-16 top-1/2 hidden h-64 w-64 -translate-y-1/2 opacity-[0.06] sm:block">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <rect x="8" y="8" width="55.15" height="39.18" fill="#EFF0F1" />
          <rect x="71.15" y="8" width="40.85" height="39.18" fill="#EFF0F1" />
          <rect x="8" y="55.18" width="55.15" height="56.82" fill="#EFF0F1" />
          <rect x="71.15" y="55.18" width="40.85" height="56.82" fill="#EFF0F1" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-cinza-papel sm:text-4xl">
            Pronto para ver a planta toda?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-display text-[15px] leading-relaxed text-papel-muted">
            Me conta o que você procura e eu separo os imóveis que fazem sentido — sem enrolação.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <WhatsAppButton />
            <Link
              to="/imoveis"
              className="inline-flex items-center gap-2 rounded-full border border-cinza-papel/25 px-6 py-3.5 font-display text-sm font-semibold text-cinza-papel transition-colors hover:border-cinza-papel/50"
            >
              Ver imóveis
              <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
