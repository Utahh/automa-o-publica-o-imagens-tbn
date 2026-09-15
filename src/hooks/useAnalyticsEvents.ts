// Busca os eventos de rastreio anônimo (ver src/lib/analytics.ts) pro
// painel de estatísticas — leitura restrita pela claim de admin (ver
// firestore.rules). Um limite alto (5000) evita paginação nessa
// primeira versão; pra um site desse porte cobre meses de tráfego.
import { collection, getDocs, limit, orderBy, query, type Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export interface AnalyticsEvent {
  id: string;
  type: "page_view" | "property_view" | "search";
  path: string;
  sessionId: string;
  timestamp: Date | null;
  propertyId?: string;
  propertyCode?: string;
  propertyTitle?: string;
  source?: string;
  filters?: { bairro?: string; tipo?: string; negocio?: string; preco?: string };
  resultsCount?: number;
}

const MAX_EVENTS = 5000;

export function useAnalyticsEvents() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const q = query(collection(db, "analytics_events"), orderBy("timestamp", "desc"), limit(MAX_EVENTS));
      const snapshot = await getDocs(q);
      setEvents(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Record<string, unknown>;
          const timestamp = data.timestamp as Timestamp | undefined;
          return {
            ...data,
            id: doc.id,
            timestamp: timestamp?.toDate?.() ?? null,
          } as AnalyticsEvent;
        }),
      );
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { events, loading, error, refresh };
}
