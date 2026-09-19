import logo from "../assets/opportunities/edificio-move/move-logo.png";
import fachada from "../assets/opportunities/edificio-move/move-fachada.jpeg";
import piscina from "../assets/opportunities/edificio-move/move-piscina.jpeg";
import piscina2 from "../assets/opportunities/edificio-move/move-piscina-2.jpeg";
import rooftop from "../assets/opportunities/edificio-move/move-rooftop.jpeg";
import hall from "../assets/opportunities/edificio-move/move-hall.jpeg";
import hall2 from "../assets/opportunities/edificio-move/move-hall-2.jpeg";
import frente from "../assets/opportunities/edificio-move/move-frente.jpeg";
import entrada from "../assets/opportunities/edificio-move/move-entrada.jpeg";
import gourmet from "../assets/opportunities/edificio-move/move-gourmet.jpeg";
import academia from "../assets/opportunities/edificio-move/move-academia.jpeg";
import pilates from "../assets/opportunities/edificio-move/move-pilates.jpeg";
import play from "../assets/opportunities/edificio-move/move-play.jpeg";
import cinema from "../assets/opportunities/edificio-move/move-cinema.jpeg";
import brinquedoteca from "../assets/opportunities/edificio-move/move-brinquedoteca.jpeg";
import playground from "../assets/opportunities/edificio-move/move-playground.jpeg";
import massagem from "../assets/opportunities/edificio-move/move-massagem.jpeg";
import beleza from "../assets/opportunities/edificio-move/move-beleza.jpeg";
import apSala from "../assets/opportunities/edificio-move/move-ap-sala.jpeg";
import apVaranda from "../assets/opportunities/edificio-move/move-ap-varanda.jpeg";
import apQuarto1 from "../assets/opportunities/edificio-move/move-ap-quarto-1.jpeg";
import apQuarto2 from "../assets/opportunities/edificio-move/move-ap-quarto-2.jpeg";
import apBanheiro from "../assets/opportunities/edificio-move/move-ap-banheiro.jpeg";

export interface OpportunityFeature {
  valor: string;
  titulo: string;
  nota: string;
}

export interface OpportunityTipologia {
  nome: string;
  detalhe: string;
}

export interface OpportunityPhoto {
  src: string;
  label: string;
}

export interface OpportunityPalette {
  primary: string;
  accent: string;
  accentDark: string;
  cream: string;
}

export interface Opportunity {
  slug: string;
  active: boolean;
  builderLabel: string;
  badgeLabel: string;
  name: string;
  suffix: string;
  taglineLines: string[];
  addressShort: string;
  shortDescription: string;
  attributes: string[];
  /** Foto usada nos cards da Home e da listagem. */
  photo?: string;
  /** Marca do empreendimento, exibida no topo da página de detalhe. */
  logo?: string;
  /** Fotos que se alternam na capa da página de detalhe. */
  cover: string[];
  descriptionHeading: string;
  descriptionParagraphs: string[];
  features: OpportunityFeature[];
  tipologias: OpportunityTipologia[];
  locationText: string;
  commonAreas: OpportunityPhoto[];
  unitPhotos: OpportunityPhoto[];
  ctaText: string;
  palette: OpportunityPalette;
  whatsappMessage: string;
}

export const opportunities: Opportunity[] = [
  {
    slug: "edificio-move",
    active: true,
    builderLabel: "MOVE!",
    badgeLabel: "Últimas unidades",
    name: "Edifício Move",
    suffix: "BOTUCATU",
    taglineLines: ["Você perto de tudo.", "Pronto para morar."],
    addressShort: "R. Gal. Júlio Marcondes Salgado, 819 · Centro",
    shortDescription:
      "Pronto para morar, a cinco minutos do centro. Apartamentos de 1, 2 e 3 dormitórios a partir de 107 m², com lazer completo, rooftop e vista panorâmica.",
    attributes: ["PRONTO PARA MORAR", "107 M² OU MAIS", "ROOFTOP"],
    photo: fachada,
    logo,
    cover: [fachada, piscina, rooftop, hall, apVaranda, frente],
    descriptionHeading: "Segurança, conforto e qualidade de vida.",
    descriptionParagraphs: [
      "O MOVE foi planejado para oferecer a você e sua família a oportunidade de morar em um ambiente seguro, moderno e com comodidade completa, no bairro mais tranquilo de Botucatu e a cinco minutos do centro.",
      "A área externa tem paisagismo diferenciado e piscinas privativas com vista panorâmica da cidade. No térreo e no rooftop, a infraestrutura de lazer reúne espaço gourmet, academia, pilates, sala de jogos, brinquedoteca, playground e quadra.",
      "O conforto acústico foi tratado na estrutura: a laje entre os andares recebeu manta de atenuação, e as áreas comuns já saíram preparadas para som e imagem.",
    ],
    features: [
      { valor: "1, 2 e 3", titulo: "Dormitórios", nota: "Opções com suíte e varanda" },
      { valor: "107", titulo: "Metragem (m²)", nota: "Área inicial das unidades" },
      { valor: "1 a 2", titulo: "Vagas", nota: "Por apartamento" },
      { valor: "5 min", titulo: "Do centro", nota: "Rua tranquila, no Centro" },
      { valor: "Rooftop", titulo: "Lazer completo", nota: "Piscina com vista e gourmet" },
      { valor: "Entregue", titulo: "Situação", nota: "Pronto para morar, à venda" },
    ],
    tipologias: [
      { nome: "3 dormitórios · a partir de 107 m²", detalhe: "Com suíte, varanda e 1 ou 2 vagas cobertas." },
      { nome: "1 e 2 dormitórios", detalhe: "Plantas compactas com varanda, consulte a disponibilidade." },
    ],
    locationText: "Rua Gal. Júlio Marcondes Salgado, 819, Centro, Botucatu/SP. A cinco minutos do centro da cidade.",
    commonAreas: [
      { src: piscina, label: "PISCINA COM VISTA" },
      { src: rooftop, label: "LOUNGE ROOFTOP" },
      { src: piscina2, label: "DECK E SOLÁRIO" },
      { src: gourmet, label: "ESPAÇO GOURMET" },
      { src: academia, label: "ACADEMIA" },
      { src: pilates, label: "PILATES E CARDIO" },
      { src: hall, label: "HALL PÉ DIREITO DUPLO" },
      { src: hall2, label: "LOUNGE DE ENTRADA" },
      { src: play, label: "SALA DE JOGOS" },
      { src: cinema, label: "ESPAÇO TV" },
      { src: brinquedoteca, label: "BRINQUEDOTECA" },
      { src: playground, label: "PLAYGROUND E QUADRA" },
      { src: massagem, label: "SALA DE MASSAGEM" },
      { src: beleza, label: "ESPAÇO BELEZA" },
      { src: frente, label: "ENTRADA E PAISAGISMO" },
      { src: entrada, label: "PÁTIO DE CONVIVÊNCIA" },
      { src: fachada, label: "FACHADA" },
    ],
    unitPhotos: [
      { src: apSala, label: "SALA" },
      { src: apVaranda, label: "VARANDA COM VISTA" },
      { src: apQuarto1, label: "DORMITÓRIO 1" },
      { src: apQuarto2, label: "DORMITÓRIO 2" },
      { src: apBanheiro, label: "BANHEIRO" },
    ],
    ctaText: "São as últimas unidades do Move. Fale com o corretor para valores, plantas e condições de pagamento.",
    palette: { primary: "#1C2B33", accent: "#C79A5B", accentDark: "#A87C3F", cream: "#F4F0E9" },
    whatsappMessage: "Olá, Toninho! Vi a oportunidade do Edifício Move no site e queria saber mais.",
  },
];

export function getActiveOpportunity(): Opportunity | undefined {
  return opportunities.find((o) => o.active);
}

export function getOpportunityBySlug(slug: string): Opportunity | undefined {
  return opportunities.find((o) => o.slug === slug);
}
