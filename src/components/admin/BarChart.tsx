import { useState } from "react";
import type { DayPoint } from "../../lib/stats";

const W = 640;
const H = 200;
const PAD = { top: 12, right: 8, bottom: 28, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Máximo "redondo" pro eixo (1, 2, 5 × 10^k), pra os números do eixo Y
 *  ficarem inteiros e fáceis de ler. */
function niceMax(max: number) {
  if (max <= 4) return Math.max(max, 1);
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 5, 10]) {
    if (max <= step * pow) return step * pow;
  }
  return max;
}

interface BarChartProps {
  title: string;
  unit: string;
  data: DayPoint[];
}

/** Barras finas por dia, um só eixo, grade discreta. O tooltip é HTML por
 *  cima do SVG; a tabela embaixo é a alternativa pra quem não usa o gráfico. */
export function BarChart({ title, unit, data }: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const top = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const slot = data.length ? PLOT_W / data.length : PLOT_W;
  const barW = Math.max(1, slot - (slot > 5 ? 2 : 0));
  const ticks = top <= 4 ? Array.from({ length: top + 1 }, (_, i) => i) : [0, top / 2, top];
  const xLabels = data.length > 2 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : data.map((_, i) => i);

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-grafite">{title}</h3>
        <span className="font-mono text-xs text-grafite-muted">{total.toLocaleString("pt-BR")} no período</span>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${title}: ${total} ${unit} no período`}
          className="block h-auto w-full"
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((t) => {
            const y = PAD.top + PLOT_H - (t / top) * PLOT_H;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#14181b" strokeOpacity={0.08} />
                <text x={PAD.left - 8} y={y + 5} textAnchor="end" fontSize={16} fill="#5b6167" fontFamily="IBM Plex Mono, monospace">
                  {t}
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const h = (d.value / top) * PLOT_H;
            const x = PAD.left + i * slot + (slot - barW) / 2;
            return (
              <g key={d.key}>
                {d.value > 0 && (
                  <rect
                    x={x}
                    y={PAD.top + PLOT_H - h}
                    width={barW}
                    height={h}
                    rx={Math.min(3, barW / 2)}
                    fill={hover === i ? "#1c3d5f" : "#27527f"}
                  />
                )}
                {/* área de toque bem maior que a barra, cobrindo a coluna inteira */}
                <rect
                  x={PAD.left + i * slot}
                  y={PAD.top}
                  width={slot}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onTouchStart={() => setHover(i)}
                />
              </g>
            );
          })}

          {xLabels.map((i, n) => (
            <text
              key={i}
              x={PAD.left + i * slot + slot / 2}
              y={H - 7}
              textAnchor={n === 0 ? "start" : n === xLabels.length - 1 ? "end" : "middle"}
              fontSize={16}
              fill="#5b6167"
              fontFamily="IBM Plex Mono, monospace"
            >
              {data[i]?.label}
            </text>
          ))}
        </svg>

        {hovered && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-grafite px-2.5 py-1.5 font-mono text-[11px] text-cinza-papel shadow-lg"
            style={{ left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%` }}
          >
            {hovered.label}: <strong>{hovered.value}</strong> {unit}
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-grafite-muted hover:text-azul-escritura">
          Ver como tabela
        </summary>
        <div className="mt-2 max-h-40 overflow-auto rounded-lg ring-1 ring-grafite/8">
          <table className="w-full font-mono text-xs text-grafite">
            <thead className="sticky top-0 bg-cinza-papel text-left text-grafite-muted">
              <tr>
                <th className="px-3 py-1.5 font-medium">Dia</th>
                <th className="px-3 py-1.5 text-right font-medium capitalize">{unit}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key} className="border-t border-grafite/8">
                  <td className="px-3 py-1">{d.label}</td>
                  <td className="px-3 py-1 text-right">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
