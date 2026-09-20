import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";
import { BrandMark } from "./BrandMark";
import { agent } from "../data/agent";

export function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <Reveal className="flex flex-col items-start">
          <BrandMark mode="symbol" className="h-14 w-14" />
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-grafite">
            {agent.name}
          </h2>
          <p className="mt-1 font-mono text-xs tracking-[0.15em] text-grafite-muted">
            {agent.role.toUpperCase()} · {agent.creci}
          </p>
          <p className="mt-5 max-w-md font-display text-[15px] leading-relaxed text-grafite-muted">
            {agent.bio}
          </p>
          <WhatsAppButton
            className="mt-7"
            message="Olá, Toninho! Quero saber mais sobre como você trabalha."
            label="Conversar com o Toninho"
          />
        </Reveal>

      </div>
    </section>
  );
}
