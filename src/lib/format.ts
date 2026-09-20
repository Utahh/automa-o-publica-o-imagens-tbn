export function formatPrice(value: number, dealType?: "Venda" | "Aluguel") {
  const formatted = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
  return dealType === "Aluguel" ? `${formatted}/mês` : formatted;
}

export function formatArea(m2: number) {
  return `${m2.toLocaleString("pt-BR")} m²`;
}

/** Título de card: tira o bairro em CAIXA ALTA que os portais colam no fim
 *  ("... - VILA CARMELO"), já mostrado na linha de localização do card. */
export function shortTitle(title: string) {
  const cleaned = title.replace(/\s+[-–]\s+[A-ZÀ-Ý][A-ZÀ-Ý0-9\s.'’]{2,}$/, "").trim();
  return cleaned.length >= 12 ? cleaned : title;
}
