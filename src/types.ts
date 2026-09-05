export type PropertyType =
  | "Casa"
  | "Apartamento"
  | "Sobrado"
  | "Kitnet"
  | "Fazenda"
  | "Galpão"
  | "Terreno";

/** Lista canônica usada no seletor de Tipo do painel de cadastro. */
export const PROPERTY_TYPES: PropertyType[] = [
  "Casa",
  "Apartamento",
  "Sobrado",
  "Kitnet",
  "Fazenda",
  "Galpão",
  "Terreno",
];

export type DealType = "Venda" | "Aluguel";
export type PropertyStatus = "Disponível" | "Em negociação";

export interface Property {
  id: string;
  slug: string;
  /** Código curto e imutável (ex: "TB-0042"), gerado na criação — referência pro corretor/cliente por telefone. */
  code: string;
  title: string;
  type: PropertyType;
  dealType: DealType;
  status: PropertyStatus;
  /** Controla se o imóvel aparece no site público (Rascunho/Publicado). */
  published: boolean;
  neighborhood: string;
  city: string;
  state: string;
  /** Endereço completo — salvo mas não exibido publicamente (ver PropertyDetail). */
  street: string;
  /** CEP, salvo mas não exibido publicamente — mesmo tratamento do endereço completo. */
  zipCode?: string;
  price: number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  featured: boolean;
  /** informação de bairro que só o corretor saberia — regra do checklist de marca */
  neighborhoodFact: string;
  description: string[];
  cover: string;
  gallery: string[];
  /** URL do vídeo do imóvel no Cloudinary (resource_type: video) — opcional. */
  video?: string;
  updatedAt: string;
}
