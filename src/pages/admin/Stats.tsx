import { useMemo, useState } from "react";
import { Eye, MousePointerClick, Search, Users } from "lucide-react";
import { useAnalyticsEvents } from "../../hooks/useAnalyticsEvents";

const RANGES = [
  { value: 7, label: "Últimos 7 dias" },
  { value: 30, label: "Últimos 30 dias" },
  { value: 90, label: "Últimos 90 dias" },
  { value: 0, label: "Tudo" },
] as const;

const PRICE_LABELS: Record<string, string> = {
  "ate-400": "Até R$ 400 mil",
  "ate-700": "Até R$ 700 mil",
  "acima-700": "Acima de R$ 700 mil",
};

const SOURCE_LABELS: Record<string, string> = {
  home_destaque: "Destaque na home",
  listagem: "Listagem de imóveis",
  relacionado: "Sugestão \"pode te interessar\"",
  direto: "Link direto",
  outro: "Outro",
};

function StatCard({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5">
      <div className="flex items-center gap-2 text-grafite-muted">
        <Icon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-grafite">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}

function RankedList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = rows[0]?.count ?? 1;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5">
      <h3 className="font-display text-sm font-semibold text-grafite">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 font-display text-sm text-grafite-muted">Sem dados nesse período.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-3 font-display text-sm text-grafite">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 font-mono text-xs text-grafite-muted">{row.count}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-grafite/8">
                <div
                  className="h-full rounded-full bg-azul-escritura"
                  style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Stats() {
  const { events, loading, error } = useAnalyticsEvents();
  const [rangeDays, setRangeDays] = useState<number>(30);

  const filtered = useMemo(() => {
    if (rangeDays === 0) return events;
    const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
    return events.filter((e) => (e.timestamp ? e.timestamp.getTime() >= cutoff : false));
  }, [events, rangeDays]);

  const pageViews = useMemo(() => filtered.filter((e) => e.type === "page_view"), [filtered]);
  const propertyViews = useMemo(() => filtered.filter((e) => e.type === "property_view"), [filtered]);
  const searches = useMemo(() => filtered.filter((e) => e.type === "search"), [filtered]);

  const uniqueSessions = useMemo(() => new Set(filtered.map((e) => e.sessionId)).size, [filtered]);

  const topProperties = useMemo(() => {
    const byId = new Map<string, { label: string; count: number }>();
    for (const e of propertyViews) {
      if (!e.propertyId) continue;
      const key = e.propertyId;
      const label = e.propertyTitle ? `${e.propertyTitle} (${e.propertyCode})` : key;
      const current = byId.get(key);
      byId.set(key, { label, count: (current?.count ?? 0) + 1 });
    }
    return Array.from(byId.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [propertyViews]);

  const topSources = useMemo(() => {
    const bySource = new Map<string, number>();
    for (const e of propertyViews) {
      const key = e.source ?? "outro";
      bySource.set(key, (bySource.get(key) ?? 0) + 1);
    }
    return Array.from(bySource.entries())
      .map(([key, count]) => ({ label: SOURCE_LABELS[key] ?? key, count }))
      .sort((a, b) => b.count - a.count);
  }, [propertyViews]);

  const topFilters = useMemo(() => {
    function rank(pick: (f: NonNullable<(typeof searches)[number]["filters"]>) => string | undefined, labelFor: (v: string) => string) {
      const byValue = new Map<string, number>();
      for (const e of searches) {
        const v = e.filters && pick(e.filters);
        if (!v) continue;
        byValue.set(v, (byValue.get(v) ?? 0) + 1);
      }
      return Array.from(byValue.entries())
        .map(([value, count]) => ({ label: labelFor(value), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }
    return {
      bairro: rank((f) => f.bairro, (v) => v),
      tipo: rank((f) => f.tipo, (v) => v),
      negocio: rank((f) => f.negocio, (v) => v),
      preco: rank((f) => f.preco, (v) => PRICE_LABELS[v] ?? v),
    };
  }, [searches]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-grafite">Estatísticas</h1>
          <p className="mt-1 font-display text-sm text-grafite-muted">
            Comportamento anônimo dos visitantes, sem nome, telefone ou e-mail de ninguém.
          </p>
        </div>
        <div className="flex gap-1.5 rounded-full bg-white p-1 ring-1 ring-grafite/10">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRangeDays(r.value)}
              className={`rounded-full px-3.5 py-1.5 font-display text-[13px] font-medium transition-colors [touch-action:manipulation] ${
                rangeDays === r.value ? "bg-azul-escritura text-cinza-papel" : "text-grafite-muted hover:text-grafite"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-6 font-display text-sm text-amber-700">Erro ao carregar estatísticas: {error.message}</p>}
      {loading && <p className="mt-6 font-display text-sm text-grafite-muted">Carregando…</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Eye} label="Visitas de página" value={pageViews.length} />
            <StatCard icon={Users} label="Visitantes (sessões)" value={uniqueSessions} />
            <StatCard icon={MousePointerClick} label="Cliques em imóvel" value={propertyViews.length} />
            <StatCard icon={Search} label="Buscas" value={searches.length} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RankedList title="Imóveis mais vistos" rows={topProperties} />
            <RankedList title="De onde vieram os cliques" rows={topSources} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <RankedList title="Bairros mais buscados" rows={topFilters.bairro} />
            <RankedList title="Tipos mais buscados" rows={topFilters.tipo} />
            <RankedList title="Venda vs. Aluguel" rows={topFilters.negocio} />
            <RankedList title="Faixa de preço" rows={topFilters.preco} />
          </div>
        </>
      )}
    </div>
  );
}
