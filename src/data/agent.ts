export const agent = {
  name: "Toninho Bomnome",
  role: "Corretor de Imóveis",
  creci: "CRECI 247711-F",
  phone: "(14) 99718-6655",
  whatsappNumber: "5514997186655",
  email: "toninho@bomnomeimoveis.com.br",
  instagram: "@toninhobomnome",
  city: "Botucatu",
  tagline: "Planta aberta.",
  bio: "Corretor de bairro há mais de doze anos. Antes de anunciar qualquer imóvel, eu visito, converso com o síndico e testo o sinal de internet — porque a decisão é sua, e você decide melhor com a planta toda na mesa.",
} as const;

export function buildWhatsappLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${agent.whatsappNumber}?text=${encoded}`;
}
