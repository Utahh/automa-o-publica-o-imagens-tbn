import { MapPin, MessageCircle, LayoutGrid, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";

const values = [
  {
    icon: MapPin,
    title: "Curadoria de bairro",
    text: "Cada imóvel eu visito antes de anunciar. Conheço o síndico, testo o sinal de internet e sei o horário do sol.",
    highlight: false,
  },
  {
    icon: MessageCircle,
    title: "Conversa direta",
    text: "Você fala comigo, não com um call center. Uma dúvida, uma mensagem no WhatsApp — sem script.",
    highlight: false,
  },
  {
    icon: LayoutGrid,
    title: "Planta aberta",
    text: "Laudo, condomínio, prazo e defeito: mostro tudo antes da visita. Nada escondido no meio do processo.",
    highlight: true,
  },
  {
    icon: TrendingUp,
    title: "Dados de mercado",
    text: "Preço justo com base em quem realmente vendeu na região nos últimos meses — não em promessa.",
    highlight: false,
  },
];

export function ValuesSection() {
  return (
    <section className="bg-cinza-papel py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-escritura">
            Por que trabalhar comigo
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-grafite sm:text-4xl">
            A mesma planta, sem parede escondida.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-[2px] overflow-hidden rounded-2xl bg-grafite/10 sm:grid-cols-2">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08} y={20}>
              <div
                className={`flex h-full flex-col gap-4 p-8 sm:p-10 ${
                  value.highlight ? "bg-azul-escritura text-cinza-papel" : "bg-white text-grafite"
                }`}
              >
                <value.icon
                  className={`h-7 w-7 ${value.highlight ? "text-azul-sinal" : "text-azul-escritura"}`}
                  strokeWidth={1.75}
                />
                <h3 className="font-display text-lg font-semibold tracking-tight">{value.title}</h3>
                <p
                  className={`font-display text-[14.5px] leading-relaxed ${
                    value.highlight ? "text-cinza-papel/85" : "text-grafite-muted"
                  }`}
                >
                  {value.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
