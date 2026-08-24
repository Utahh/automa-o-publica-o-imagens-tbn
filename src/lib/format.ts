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
