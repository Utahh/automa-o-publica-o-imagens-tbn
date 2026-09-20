// Cálculos do painel de estatísticas a partir dos eventos anônimos (ver
// src/lib/analytics.ts). Puro (sem Firestore nem React) pra ficar fácil
// de testar e de reaproveitar.
import type { AnalyticsEvent } from "../hooks/useAnalyticsEvents";
import type { Property } from "../types";

export const PRICE_LABELS: Record<string, string> = {
  "ate-400": "Até R$ 400 mil",
  "ate-700": "Até R$ 700 mil",
  "acima-700": "Acima de R$ 700 mil",
};

export const SOURCE_LABELS: Record<string, string> = {
  home_destaque: "Destaque na home",
  listagem: "Listagem de imóveis",
  relacionado: "Sugestão \"pode te interessar\"",
  direto: "Link direto",
  outro: "Outro",
};

export interface DayPoint {
  key: string;
  label: string;
  value: number;
}

export interface RankedProperty {
  id: string;
  title: string;
  code: string;
  neighborhood: string;
  cover: string;
  views: number;
  contacts: number;
}

export interface OriginRow {
  origin: string;
  visitors: number;
  contacts: number;
}

export interface RankRow {
  label: string;
  count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayLabel(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Uma entrada por dia do período (dias sem visita entram com 0, senão o
 *  gráfico "espremeria" os dias vazios). */
function buildDays(events: AnalyticsEvent[], rangeDays: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let first: Date;
  if (rangeDays > 0) {
    first = new Date(today.getTime() - (rangeDays - 1) * DAY_MS);
  } else {
    const times = events.map((e) => e.timestamp?.getTime()).filter((t): t is number => typeof t === "number");
    first = times.length ? new Date(Math.min(...times)) : today;
    first.setHours(0, 0, 0, 0);
  }

  const days: Date[] = [];
  for (let d = new Date(first); d <= today; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function rank(values: (string | undefined)[], labelFor: (v: string) => string, top = 8): RankRow[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ label: labelFor(value), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

export function computeStats(events: AnalyticsEvent[], properties: Property[], rangeDays: number) {
  const pageViews = events.filter((e) => e.type === "page_view");
  const propertyViews = events.filter((e) => e.type === "property_view");
  const searches = events.filter((e) => e.type === "search");
  const contacts = events.filter((e) => e.type === "whatsapp_click");

  const visitors = new Set(events.map((e) => e.sessionId));
  const searchers = new Set(searches.map((e) => e.sessionId));
  const viewers = new Set(propertyViews.map((e) => e.sessionId));
  const contacted = new Set(contacts.map((e) => e.sessionId));

  // Cada barra conta visitantes que fizeram aquela ação; não precisa ser em
  // sequência (dá pra chamar no WhatsApp direto da home, sem abrir imóvel).
  const funnel = [
    { label: "Visitaram o site", count: visitors.size },
    { label: "Usaram a busca", count: searchers.size },
    { label: "Abriram um imóvel", count: viewers.size },
    { label: "Chamaram no WhatsApp", count: contacted.size },
  ];

  // Série por dia: visitantes distintos e contatos.
  const days = buildDays(events, rangeDays);
  const visitorsByDay = new Map<string, Set<string>>();
  const contactsByDay = new Map<string, number>();
  for (const e of events) {
    if (!e.timestamp) continue;
    const key = dayKey(e.timestamp);
    if (!visitorsByDay.has(key)) visitorsByDay.set(key, new Set());
    visitorsByDay.get(key)!.add(e.sessionId);
    if (e.type === "whatsapp_click") contactsByDay.set(key, (contactsByDay.get(key) ?? 0) + 1);
  }
  const visitorsSeries: DayPoint[] = days.map((d) => ({
    key: dayKey(d),
    label: dayLabel(d),
    value: visitorsByDay.get(dayKey(d))?.size ?? 0,
  }));
  const contactsSeries: DayPoint[] = days.map((d) => ({
    key: dayKey(d),
    label: dayLabel(d),
    value: contactsByDay.get(dayKey(d)) ?? 0,
  }));

  // Ranking de imóveis: visualizações pelo id, contatos pelo slug da URL
  // (/imoveis/:slug) de onde a pessoa clicou no WhatsApp.
  const byId = new Map(properties.map((p) => [p.id, p]));
  const bySlug = new Map(properties.map((p) => [p.slug, p]));
  const ranked = new Map<string, RankedProperty>();
  function entry(id: string, fallbackTitle = "", fallbackCode = ""): RankedProperty {
    let row = ranked.get(id);
    if (!row) {
      const p = byId.get(id);
      row = {
        id,
        title: p?.title ?? fallbackTitle ?? id,
        code: p?.code ?? fallbackCode,
        neighborhood: p?.neighborhood ?? "",
        cover: p?.cover ?? "",
        views: 0,
        contacts: 0,
      };
      ranked.set(id, row);
    }
    return row;
  }
  for (const e of propertyViews) {
    if (e.propertyId) entry(e.propertyId, e.propertyTitle, e.propertyCode).views++;
  }
  for (const e of contacts) {
    const slug = e.path.match(/^\/imoveis\/([^/]+)/)?.[1];
    const p = slug ? bySlug.get(slug) : undefined;
    if (p) entry(p.id).contacts++;
  }
  const topProperties = Array.from(ranked.values())
    .sort((a, b) => b.views - a.views || b.contacts - a.contacts)
    .slice(0, 10);

  // Origem: uma por visita (a primeira que aparecer nos eventos dela).
  const originBySession = new Map<string, string>();
  for (const e of events) {
    if (e.origin && !originBySession.has(e.sessionId)) originBySession.set(e.sessionId, e.origin);
  }
  const origins = new Map<string, OriginRow>();
  for (const id of visitors) {
    const origin = originBySession.get(id) ?? "Não identificada";
    const row = origins.get(origin) ?? { origin, visitors: 0, contacts: 0 };
    row.visitors++;
    if (contacted.has(id)) row.contacts++;
    origins.set(origin, row);
  }
  const originRows = Array.from(origins.values())
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 8);

  const filtersBy = (pick: (f: NonNullable<AnalyticsEvent["filters"]>) => string | undefined) =>
    searches.map((e) => (e.filters ? pick(e.filters) : undefined));

  // Buscas que não acharam nada: é demanda que o site ainda não atende.
  const emptySearches = rank(
    searches
      .filter((e) => e.resultsCount === 0 && e.filters)
      .map((e) =>
        [
          e.filters!.bairro,
          e.filters!.tipo,
          e.filters!.negocio,
          e.filters!.preco ? PRICE_LABELS[e.filters!.preco] ?? e.filters!.preco : "",
        ]
          .filter(Boolean)
          .join(" · "),
      ),
    (v) => v,
  );

  return {
    pageViews: pageViews.length,
    visitors: visitors.size,
    propertyViews: propertyViews.length,
    searches: searches.length,
    contacts: contacts.length,
    contactRate: visitors.size ? contacted.size / visitors.size : 0,
    funnel,
    visitorsSeries,
    contactsSeries,
    topProperties,
    originRows,
    emptySearches,
    sources: rank(
      propertyViews.map((e) => e.source ?? "outro"),
      (v) => SOURCE_LABELS[v] ?? v,
    ),
    filters: {
      bairro: rank(filtersBy((f) => f.bairro), (v) => v),
      tipo: rank(filtersBy((f) => f.tipo), (v) => v),
      negocio: rank(filtersBy((f) => f.negocio), (v) => v),
      preco: rank(filtersBy((f) => f.preco), (v) => PRICE_LABELS[v] ?? v),
    },
  };
}

export type Stats = ReturnType<typeof computeStats>;
