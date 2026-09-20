// Busca os eventos de rastreio anônimo (ver src/lib/analytics.ts) pro
// painel — leitura restrita pela claim de admin (ver firestore.rules).
// Busca só o período pedido (e não tudo) pra não ler o histórico inteiro
// a cada abertura; `truncated` avisa quando o limite de eventos foi
// atingido e os números do período ficaram incompletos.
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export interface AnalyticsEvent {
  id: string;
  type: "page_view" | "property_view" | "search" | "whatsapp_click";
  path: string;
  sessionId: string;
  timestamp: Date | null;
  origin?: string;
  propertyId?: string;
  propertyCode?: string;
  propertyTitle?: string;
  source?: string;
  filters?: { bairro?: string; tipo?: string; negocio?: string; preco?: string };
  resultsCount?: number;
}

export const MAX_EVENTS = 5000;

/** `rangeDays` 0 = sem limite de período. */
export function useAnalyticsEvents(rangeDays: number) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const base = collection(db, "analytics_events");
        const q =
          rangeDays > 0
            ? query(
                base,
                where("timestamp", ">=", Timestamp.fromMillis(Date.now() - rangeDays * 24 * 60 * 60 * 1000)),
                orderBy("timestamp", "desc"),
                limit(MAX_EVENTS),
              )
            : query(base, orderBy("timestamp", "desc"), limit(MAX_EVENTS));
        const snapshot = await getDocs(q);
        if (cancelled) return;
        setEvents(
          snapshot.docs.map((doc) => {
            const data = doc.data() as Record<string, unknown>;
            const timestamp = data.timestamp as Timestamp | undefined;
            return { ...data, id: doc.id, timestamp: timestamp?.toDate?.() ?? null } as AnalyticsEvent;
          }),
        );
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [rangeDays]);

  return { events, loading, error, truncated: events.length >= MAX_EVENTS };
}
