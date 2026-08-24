import { Home, FileCheck, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { WhatsAppButton } from "./WhatsAppButton";
import { BrandMark } from "./BrandMark";
import { agent } from "../data/agent";

const senses = [
  {
    icon: Home,
    title: "Imóvel",
    text: "Planta aberta é o tipo de espaço que todo mundo quer hoje: integrado, sem parede desnecessária.",
  },
  {
    icon: FileCheck,
    title: "Negócio",
    text: "Mostro a planta toda: laudo, condomínio, defeito, prazo. Nada escondido no meio do processo.",
  },
  {
    icon: Users,
    title: "Gente",
    text: "Casa de porta aberta, onde entra visita. Conheço a rua antes de te mostrar o imóvel.",
  },
];

export function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:px-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
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

        <div>
          <Reveal>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-escritura">
              Assinatura verbal
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-grafite sm:text-3xl">
              "Planta aberta."
            </h3>
          </Reveal>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {senses.map((sense, i) => (
              <Reveal key={sense.title} delay={i * 0.1} y={18}>
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-grafite/8 p-6">
                  <sense.icon className="h-6 w-6 text-azul-escritura" strokeWidth={1.75} />
                  <h4 className="font-display text-[15px] font-semibold text-grafite">{sense.title}</h4>
                  <p className="font-display text-sm leading-relaxed text-grafite-muted">{sense.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
