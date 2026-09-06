import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

export interface LocationValue {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

/** Localização: digite o CEP pra preencher endereço/bairro/cidade/estado
 *  sozinho (via ViaCEP), ou preencha os campos direto — os dois jeitos
 *  continuam editáveis depois. Número/complemento entram no próprio
 *  campo de endereço, já que o CEP não os traz. */
export function LocationField({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (patch: Partial<LocationValue>) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "not-found" | "error">("idle");

  async function lookupCep(rawCep: string) {
    const digits = rawCep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setStatus("not-found");
        return;
      }
      onChange({
        zipCode: rawCep,
        street: data.logradouro || value.street,
        neighborhood: data.bairro || value.neighborhood,
        city: data.localidade || value.city,
        state: data.uf || value.state,
      });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
          CEP
        </span>
        <span className="relative flex items-center">
          <input
            type="text"
            name="zipCode"
            autoComplete="postal-code"
            inputMode="numeric"
            spellCheck={false}
            placeholder="18600-000"
            value={value.zipCode}
            onChange={(e) => onChange({ zipCode: e.target.value })}
            onBlur={(e) => lookupCep(e.target.value)}
            className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
          />
          {status === "loading" && (
            <Loader2 aria-hidden="true" className="absolute right-3 h-4 w-4 animate-spin text-grafite-muted" />
          )}
        </span>
        <span aria-live="polite">
          {status === "not-found" && (
            <span className="font-display text-[12px] text-amber-700">CEP não encontrado — preencha à mão.</span>
          )}
          {status === "error" && (
            <span className="font-display text-[12px] text-amber-700">Não deu pra buscar o CEP agora — preencha à mão.</span>
          )}
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
          Endereço (rua, número, complemento)
        </span>
        <span className="relative flex items-center">
          <MapPin aria-hidden="true" className="absolute left-3 h-4 w-4 text-azul-escritura" strokeWidth={2.2} />
          <input
            type="text"
            name="street"
            autoComplete="street-address"
            placeholder="Rua das Flores, 123"
            value={value.street}
            onChange={(e) => onChange({ street: e.target.value })}
            className="w-full rounded-xl border border-grafite/15 bg-white py-2.5 pl-9 pr-3.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
          />
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
          Bairro
        </span>
        <input
          type="text"
          name="neighborhood"
          autoComplete="address-line2"
          value={value.neighborhood}
          onChange={(e) => onChange({ neighborhood: e.target.value })}
          className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
        />
      </label>

      <div className="grid grid-cols-[1fr_90px] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
            Cidade
          </span>
          <input
            type="text"
            name="city"
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
            UF
          </span>
          <input
            type="text"
            name="state"
            autoComplete="address-level1"
            spellCheck={false}
            maxLength={2}
            value={value.state}
            onChange={(e) => onChange({ state: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 text-center font-display text-sm uppercase text-grafite transition-colors focus:border-azul-escritura"
          />
        </label>
      </div>
    </div>
  );
}
