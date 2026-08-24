import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroSymbol } from "./HeroSymbol";
import { HeroSearch } from "./HeroSearch";
import { agent } from "../data/agent";

const headline = ["Encontre um lugar", "que já parece seu."];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};
const word = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-grafite-noite pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(39,82,127,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(239,240,241,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(239,240,241,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-sinal"
          >
            {agent.creci} · {agent.city}
          </motion.p>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="visible"
            className="mt-5 max-w-xl font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-cinza-papel sm:text-6xl"
          >
            {headline.map((line) => (
              <span key={line} className="block overflow-hidden">
                <motion.span variants={word} className="inline-block">
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-6 max-w-md font-display text-base leading-relaxed text-papel-muted"
          >
            Corretor de bairro, não de portal. Eu visito antes de anunciar, mostro a planta toda e
            respondo pessoalmente cada mensagem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-10"
          >
            <HeroSearch />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="hidden justify-self-center lg:block lg:justify-self-end"
        >
          <HeroSymbol className="h-72 w-72 xl:h-80 xl:w-80" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative mx-auto mb-8 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-papel-muted sm:flex"
      >
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
        Role para ver os imóveis
      </motion.div>
    </section>
  );
}
