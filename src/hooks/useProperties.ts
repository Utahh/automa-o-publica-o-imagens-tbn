// Busca os imóveis do Firestore em tempo real, com fallback para o JSON
// local (vazio por padrão) se o Firestore estiver inacessível no momento
// do carregamento. Os imóveis chegam aqui já publicados pelo pipeline de
// automação (ver scripts/lib/pipeline.mjs) — nenhum dado é fixo no código.
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import type { Property } from "../types";
import fallbackProperties from "../data/properties.json";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(fallbackProperties as Property[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFromFirestore() {
      try {
        const q = query(collection(db, "imoveis"), orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);

        if (cancelled) return;

        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        const fetched = snapshot.docs.map((doc) => doc.data() as Property);
        setProperties(fetched);
      } catch (err) {
        if (cancelled) return;
        console.warn("Firestore indisponível, usando dados locais:", (err as Error).message);
        setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFromFirestore();
    return () => {
      cancelled = true;
    };
  }, []);

  return { properties, loading, error };
}
