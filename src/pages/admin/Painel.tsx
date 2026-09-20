import { useMemo, useState, type ReactNode } from "react";
import { Eye, MessageCircle, Search, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { BarChart } from "../../components/admin/BarChart";
import { SafeImage } from "../../components/SafeImage";
import { MAX_EVENTS, useAnalyticsEvents } from "../../hooks/useAnalyticsEvents";
import { useAllProperties } from "../../hooks/useProperties";
import { computeStats, type RankRow, type Stats } from "../../lib/stats";

const RANGES = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: 0, label: "Tudo" },
] as const;

const CARD = "rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5";

function Card({ title, hint, children, className = "" }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${CARD} ${className}`}>
      <h3 className="font-display text-sm font-semibold text-grafite">{title}</h3>
      {hint && <p className="mt-1 font-display text-[12.5px] leading-relaxed text-grafite-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="font-display text-sm text-grafite-muted">Sem dados nesse período.</p>;
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2 text-grafite-muted">
        <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-grafite">{value}</p>
    </div>
  );
}

function RankedList({ title, rows }: { title: string; rows: RankRow[] }) {
  const max = rows[0]?.count ?? 1;
  return (
    <Card title={title}>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-3 font-display text-sm text-grafite">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 font-mono text-xs text-grafite-muted">{row.count}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-grafite/8">
                <div className="h-full rounded-full bg-azul-escritura" style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Funnel({ steps }: { steps: Stats["funnel"] }) {
  const base = steps[0]?.count ?? 0;
  return (
    <Card
      title="Funil da visita"
      hint="Cada barra conta visitantes que fizeram aquela ação. Não precisa ser em sequência."
    >
      {base === 0 ? (
        <Empty />
      ) : (
        <ul className="space-y-4">
          {steps.map((step, i) => {
            const pct = base ? (step.count / base) * 100 : 0;
            return (
              <li key={step.label}>
                <div className="flex items-baseline justify-between gap-3 font-display text-sm text-grafite">
                  <span>{step.label}</span>
                  <span className="shrink-0 font-mono text-xs text-grafite-muted">
                    {step.count.toLocaleString("pt-BR")}
                    {i > 0 && <span className="ml-2 text-azul-escritura">{pct.toFixed(pct < 10 ? 1 : 0).replace(".", ",")}%</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-grafite/8">
                  <div
                    className="h-full rounded-full bg-azul-escritura"
                    style={{ width: `${Math.max(step.count > 0 ? 3 : 0, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function PropertyRanking({ rows }: { rows: Stats["topProperties"] }) {
  const max = rows[0]?.views ?? 1;
  return (
    <Card title="Imóveis mais vistos" hint="Ranking por visualizações no período, com os contatos feitos a partir de cada imóvel.">
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ol className="divide-y divide-grafite/8">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4">
              <span className="w-5 shrink-0 text-center font-mono text-sm font-semibold text-grafite-muted">{i + 1}</span>
              <SafeImage
                src={row.cover || "/sem-foto"}
                alt=""
                wrapperClassName="h-14 w-20 shrink-0 rounded-lg"
                className="h-14 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-grafite">{row.title}</p>
                <p className="truncate font-mono text-[11px] text-grafite-muted">
                  {[row.code, row.neighborhood].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-grafite/8">
                  <div className="h-full rounded-full bg-azul-escritura" style={{ width: `${Math.max(4, (row.views / max) * 100)}%` }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-base font-semibold text-grafite">{row.views}</p>
                <p className="font-mono text-[10.5px] text-grafite-muted">vistas</p>
              </div>
              <div className="hidden w-16 shrink-0 text-right sm:block">
                <p className="font-display text-base font-semibold text-grafite">{row.contacts}</p>
                <p className="font-mono text-[10.5px] text-grafite-muted">contatos</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function OriginTable({ rows }: { rows: Stats["originRows"] }) {
  return (
    <Card
      title="De onde vêm os visitantes"
      hint="Use links com ?utm_source=instagram&utm_campaign=nome nos anúncios e na bio pra separar cada campanha."
    >
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <table className="w-full font-display text-sm text-grafite">
          <thead>
            <tr className="text-left font-mono text-[10.5px] uppercase tracking-wider text-grafite-muted">
              <th className="pb-2 font-medium">Origem</th>
              <th className="pb-2 text-right font-medium">Visitantes</th>
              <th className="pb-2 text-right font-medium">Contatos</th>
              <th className="pb-2 text-right font-medium">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.origin} className="border-t border-grafite/8">
                <td className="max-w-[10rem] truncate py-2 pr-2">{r.origin}</td>
                <td className="py-2 text-right font-mono text-xs">{r.visitors}</td>
                <td className="py-2 text-right font-mono text-xs">{r.contacts}</td>
                <td className="py-2 text-right font-mono text-xs text-azul-escritura">
                  {r.visitors ? `${Math.round((r.contacts / r.visitors) * 100)}%` : "0%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

/** Parte visual do painel: recebe os números prontos, sem buscar nada. */
export function PainelView({ stats, rangeDays, onRangeChange, truncated }: {
  stats: Stats;
  rangeDays: number;
  onRangeChange: (days: number) => void;
  truncated: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-grafite">Painel</h1>
          <p className="mt-1 font-display text-sm text-grafite-muted">
            O que os visitantes procuram e como chegam até você. Tudo anônimo, sem nome, telefone ou e-mail.
          </p>
        </div>
        <div className="flex gap-1.5 rounded-full bg-white p-1 ring-1 ring-grafite/10">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => onRangeChange(r.value)}
              className={`rounded-full px-3.5 py-1.5 font-display text-[13px] font-medium transition-colors [touch-action:manipulation] ${
                rangeDays === r.value ? "bg-azul-escritura text-cinza-papel" : "text-grafite-muted hover:text-grafite"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {truncated && (
        <p className="mt-4 rounded-xl bg-amber-700/10 px-4 py-3 font-display text-[13px] text-amber-800">
          Esse período tem mais de {MAX_EVENTS.toLocaleString("pt-BR")} eventos. Os números abaixo cobrem só os mais
          recentes. Escolha um período menor para ver tudo.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Visitantes" value={stats.visitors.toLocaleString("pt-BR")} />
        <StatCard icon={Eye} label="Imóveis abertos" value={stats.propertyViews.toLocaleString("pt-BR")} />
        <StatCard icon={Search} label="Buscas" value={stats.searches.toLocaleString("pt-BR")} />
        <StatCard icon={MessageCircle} label="Contatos" value={stats.contacts.toLocaleString("pt-BR")} />
        <StatCard
          icon={TrendingUp}
          label="Taxa de contato"
          value={`${(stats.contactRate * 100).toFixed(1).replace(".", ",")}%`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart title="Visitantes por dia" unit="visitantes" data={stats.visitorsSeries} />
        <BarChart title="Contatos por dia" unit="contatos" data={stats.contactsSeries} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertyRanking rows={stats.topProperties} />
        </div>
        <Funnel steps={stats.funnel} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OriginTable rows={stats.originRows} />
        <RankedList title="Buscas sem resultado (demanda que falta atender)" rows={stats.emptySearches} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <RankedList title="Bairros mais buscados" rows={stats.filters.bairro} />
        <RankedList title="Tipos mais buscados" rows={stats.filters.tipo} />
        <RankedList title="Venda vs. Aluguel" rows={stats.filters.negocio} />
        <RankedList title="Faixa de preço" rows={stats.filters.preco} />
      </div>

      <div className="mt-6">
        <RankedList title="De onde vieram os cliques nos imóveis" rows={stats.sources} />
      </div>
    </div>
  );
}

export function Painel() {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const { events, loading, error, truncated } = useAnalyticsEvents(rangeDays);
  const { properties } = useAllProperties();

  const stats = useMemo(() => computeStats(events, properties, rangeDays), [events, properties, rangeDays]);

  if (error) {
    return <p className="font-display text-sm text-amber-700">Erro ao carregar o painel: {error.message}</p>;
  }

  return (
    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading}>
      <PainelView stats={stats} rangeDays={rangeDays} onRangeChange={setRangeDays} truncated={truncated} />
    </div>
  );
}
