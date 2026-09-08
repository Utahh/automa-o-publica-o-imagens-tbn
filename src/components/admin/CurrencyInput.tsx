import type { ChangeEvent } from "react";

// Máscara de valor em reais — digita só números, o cursor sempre no fim,
// formatando como centavos (padrão de app de banco: "1" -> 0,01, "100" ->
// 1,00, "100000" -> 1.000,00). `value`/`onChange` continuam em reais como
// string decimal (ex: "1000.5"), pra não mexer no resto do formulário.
function centsToReais(cents: number) {
  return cents / 100;
}

function formatBRL(reais: number) {
  return reais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CurrencyInput({
  value,
  onChange,
  name,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
}) {
  const reais = Number(value) || 0;
  const display = reais > 0 ? formatBRL(reais) : "";

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      onChange("");
      return;
    }
    onChange(String(centsToReais(parseInt(digits, 10))));
  }

  return (
    <span className="relative flex items-center">
      <span className="pointer-events-none absolute left-3.5 font-display text-sm text-grafite-muted">R$</span>
      <input
        type="text"
        name={name}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder || "0,00"}
        value={display}
        onChange={handleChange}
        className="w-full rounded-xl border border-grafite/15 bg-white py-2.5 pl-9 pr-3.5 text-right font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
      />
    </span>
  );
}
