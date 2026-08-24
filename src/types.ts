export type PropertyType = "Casa" | "Apartamento" | "Cobertura" | "Sobrado";
export type DealType = "Venda" | "Aluguel";
export type PropertyStatus = "Disponível" | "Em negociação";

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  dealType: DealType;
  status: PropertyStatus;
  neighborhood: string;
  city: string;
  state: string;
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
}
