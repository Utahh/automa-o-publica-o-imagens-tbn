import { useId } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

// Radix não aceita item com value="" (é o valor reservado pra "sem seleção").
// Usamos um valor-sentinela pro item "Todos os bairros"/"Qualquer valor" e
// convertemos de volta pra "" na saída — o resto do app continua usando ""
// como "sem filtro" (ex: na URL).
const ALL_VALUE = "__all__";

interface Option {
  value: string;
  label: string;
}

/**
 * Dropdown de filtro usado na busca da home e na listagem de imóveis.
 * Substitui o <select> nativo (aparência genérica do navegador e, em telas
 * pequenas, o menu podia abrir parcialmente fora da tela) por um listbox
 * acessível com posicionamento consciente da viewport (nunca sai da tela)
 * e visual consistente com a marca em qualquer navegador.
 *
 * O rótulo é um <span id=...> + aria-labelledby no gatilho, não um <label>
 * envolvendo tudo — um <label> nativo reenvia clique pro único controle de
 * formulário lá dentro, e isso duplicava o clique no gatilho (abria e
 * fechava de novo no mesmo toque).
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  triggerClassName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | Option)[];
  placeholder: string;
  triggerClassName?: string;
}) {
  const labelId = useId();
  const normalized: Option[] = options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt));

  return (
    <div className="flex flex-1 flex-col gap-1">
      <span id={labelId} className="whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-grafite-muted">
        {label}
      </span>
      <Select.Root value={value || ALL_VALUE} onValueChange={(v) => onChange(v === ALL_VALUE ? "" : v)}>
        <Select.Trigger
          aria-labelledby={labelId}
          className={clsx(
            // Select.Value não aceita className diretamente (Radix ignora),
            // então o truncamento é aplicado aqui via seletor de filho —
            // min-w-0 no span é o que permite ele encolher e reticenciar
            // em vez de quebrar linha dentro do flex.
            "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg bg-transparent text-left font-display text-[14.5px] font-semibold text-grafite outline-none [touch-action:manipulation] [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate focus-visible:ring-2 focus-visible:ring-azul-sinal focus-visible:ring-offset-2 data-[placeholder]:font-medium data-[placeholder]:text-grafite-muted",
            triggerClassName,
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon asChild>
            <ChevronDown className="h-4 w-4 shrink-0 text-grafite-muted" strokeWidth={2.2} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={8}
            collisionPadding={12}
            className="z-50 max-h-[min(320px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl bg-white shadow-[0_20px_45px_-12px_rgba(15,18,20,0.35)] ring-1 ring-grafite/10"
          >
            <Select.Viewport className="p-1.5">
              <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
              {normalized.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

function SelectItem({ value, children }: { value: string; children: string }) {
  return (
    <Select.Item
      value={value}
      className="relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2.5 pl-8 pr-3 font-display text-sm text-grafite outline-none data-[highlighted]:bg-azul-escritura/10 data-[highlighted]:text-azul-escritura"
    >
      <Select.ItemIndicator className="absolute left-2.5 flex items-center">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </Select.ItemIndicator>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}
