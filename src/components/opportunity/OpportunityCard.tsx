import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { SafeImage } from "../SafeImage";
import type { Opportunity } from "../../data/opportunities";

export function OpportunityCard({ opportunity, index = 0 }: { opportunity: Opportunity; index?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: "easeOut" }}
    >
      <Link
        to={`/oportunidades/${opportunity.slug}`}
        className="group flex flex-col gap-6 rounded-2xl border border-azul-sinal/40 bg-grafite p-7 transition-colors duration-300 hover:border-azul-escritura sm:flex-row sm:items-center sm:gap-8 sm:p-9"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold italic tracking-tight text-cinza-papel">
              {opportunity.builderLabel}
            </span>
            <span className="inline-block rounded-full bg-azul-escritura px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.25em] text-cinza-papel">
              {opportunity.badgeLabel}
            </span>
          </div>
          <h2 className="mt-5 text-balance font-display text-2xl font-semibold tracking-tight text-cinza-papel sm:text-3xl">
            {opportunity.name}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-xs tracking-wide text-azul-sinal">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
            {opportunity.addressShort}
          </p>
          <p className="mt-4 max-w-2xl font-display text-sm leading-relaxed text-papel-muted sm:text-[15px]">
            {opportunity.shortDescription}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 border-b border-azul-escritura pb-1 font-mono text-xs uppercase tracking-[0.2em] text-cinza-papel">
            Ver empreendimento
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.3} />
          </span>
        </div>
        <SafeImage
          src={opportunity.photo || "/sem-foto"}
          alt={`Foto do empreendimento ${opportunity.name}`}
          wrapperClassName="mx-auto h-[160px] w-[220px] shrink-0 rounded-lg sm:mx-0"
          className="mx-auto h-[160px] w-[220px] shrink-0 rounded-lg object-cover sm:mx-0"
        />
      </Link>
    </motion.div>
  );
}
