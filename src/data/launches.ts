import luizTargaLogo from "../assets/launches/luiz-targa-logo.png";
import luizTargaArte from "../assets/launches/luiz-targa-teaser.jpg";

export type LaunchStatus = "lancamento" | "em-breve";

export interface LaunchFeature {
  valor: string;
  titulo: string;
  nota: string;
}

export interface LaunchTipologia {
  nome: string;
  detalhe: string;
}

export interface LaunchPalette {
  primary: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  cream: string;
}

export interface Launch {
  slug: string;
  status: LaunchStatus;
  builderName: string;
  name: string;
  suffix: string;
  taglineLines: string[];
  shortDescription: string;
  addressShort: string;
  attributes: string[];
  descriptionParagraphs: string[];
  features: LaunchFeature[];
  tipologias: LaunchTipologia[];
  locationText: string;
  /** Marca (ícone) da construtora — usada pequena, ao lado do texto. */
  logo: string;
  /** Arte de divulgação do lançamento — sempre exibida com altura limitada, qualquer que seja a proporção. */
  art: string;
  /** Sobrescreve o WhatsApp padrão do corretor (agent.whatsappNumber), caso um lançamento use outro número. */
  whatsappNumber?: string;
  palette: LaunchPalette;
}

export const launches: Launch[] = [
  {
    slug: "luiz-targa-engenharia",
    status: "lancamento",
    builderName: "Luiz Targa Engenharia",
    name: "Luiz Targa",
    suffix: "ENGENHARIA",
    taglineLines: ["Qualidade que se vê.", "Conforto que se vive."],
    shortDescription:
      "Apartamentos de 1 e 2 dormitórios com varanda, entre 40 e 60 m², em duas torres de 14 andares com área de lazer completa.",
    addressShort: "Rua João de Campos · próx. Residencial Splendour",
    attributes: ["2 TORRES", "40 A 60 M²", "LAZER COMPLETO"],
    descriptionParagraphs: [
      "Duas torres de 14 andares em um terreno de 6.275 m², com apartamentos de 2 dormitórios (sendo 1 suíte) de 55 a 60 m² e opções compactas de 1 dormitório com 40 m², todos com varanda.",
      "As vagas ficam em um edifício garagem independente no térreo, com quatro níveis, elevador e duas escadas: nada de subsolo embaixo das torres, mais conforto e segurança na chegada em casa.",
      "A área de lazer é completa, nos moldes do Move (sem rooftop), e o padrão de acabamento é médio: a combinação certa entre qualidade e uma parcela que cabe no seu planejamento.",
    ],
    features: [
      { valor: "2", titulo: "Dormitórios", nota: "Sendo 1 suíte, com varanda" },
      { valor: "40 a 60", titulo: "Metragem (m²)", nota: "1 e 2 dormitórios" },
      { valor: "1 a 2", titulo: "Vagas cobertas", nota: "Edifício garagem independente" },
      { valor: "2", titulo: "Torres", nota: "14 andares cada" },
      { valor: "6.275", titulo: "Terreno (m²)", nota: "Área de lazer completa" },
      { valor: "Médio", titulo: "Padrão", nota: "Lazer nos moldes do Move" },
    ],
    tipologias: [
      { nome: "2 dormitórios · 55 a 60 m²", detalhe: "Sendo 1 suíte, varanda, 1 a 2 vagas cobertas." },
      { nome: "1 dormitório · 40 m²", detalhe: "Com varanda e 1 vaga coberta." },
    ],
    locationText:
      "Rua João de Campos (portaria do condomínio) e Rua Manoel Fernandes Cardoso, próximo ao Residencial Splendour.",
    logo: luizTargaLogo,
    art: luizTargaArte,
    palette: {
      primary: "#021d3b",
      primaryLight: "#0a3260",
      accent: "#d8b575",
      accentDark: "#b78c49",
      cream: "#f6efe5",
    },
  },
];

export function getActiveLaunch(): Launch | undefined {
  return launches.find((l) => l.status === "lancamento");
}

export function getLaunchBySlug(slug: string): Launch | undefined {
  return launches.find((l) => l.slug === slug);
}

export function getUpcomingLaunches(): Launch[] {
  return launches.filter((l) => l.status === "em-breve");
}
