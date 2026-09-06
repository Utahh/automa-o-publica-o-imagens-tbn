/** Interruptor on/off reutilizado no painel (destaque, comodidades...).
 *  Redesenhado pra usar flexbox puro (justify-content) em vez de
 *  posição absoluta + transform — a versão anterior calculava a
 *  posição de repouso do "conhecinho" a partir do transform sem um
 *  `left` de verdade, e em alguns navegadores ele aparecia fora da
 *  trilha. Com flex, o filho nunca sai da caixa do pai: é a própria
 *  disposição do layout, não um cálculo de posição. */
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
        className={`flex h-[22px] w-[40px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 ${
          checked ? "justify-end bg-azul-escritura" : "justify-start bg-grafite/20"
        }`}
      >
        <span className="h-[16px] w-[16px] shrink-0 rounded-full bg-white shadow" />
      </span>
      {label && <span className="font-display text-sm text-grafite">{label}</span>}
    </button>
  );
}
