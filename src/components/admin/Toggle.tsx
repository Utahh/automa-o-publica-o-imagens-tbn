/** Interruptor on/off reutilizado no painel (destaque, comodidades...).
 *  O "conhecinho" (knob) tem uma posição base explícita (left-[3px]) em vez
 *  de depender só do transform pra se posicionar — sem isso, sem um `left`
 *  definido, o navegador podia calcular a posição de repouso errado e o
 *  conhecinho aparecia deslocado pra fora da trilha. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className="flex items-center gap-3 [touch-action:manipulation] disabled:opacity-60"
    >
      <span
        className={`relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors ${
          checked ? "bg-azul-escritura" : "bg-grafite/20"
        }`}
      >
        <span
          className={`absolute left-[3px] top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </span>
      {label && <span className="font-display text-sm text-grafite">{label}</span>}
    </button>
  );
}
