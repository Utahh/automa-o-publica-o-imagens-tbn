// Busca os imóveis publicados do Firestore em tempo real, com fallback
// para o JSON local (vazio por padrão) se o Firestore estiver
// inacessível no momento do carregamento. Os imóveis chegam aqui já
// publicados pelo painel de cadastro (ver api/properties/*.mjs) —
// nenhum dado é fixo no código.
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
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
        const q = query(
          collection(db, "imoveis"),
          where("published", "==", true),
          orderBy("updatedAt", "desc")
        );
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

// Busca TODOS os imóveis (publicados e rascunho) — uso exclusivo do
// dashboard do painel (rota protegida por login). A leitura em si
// continua liberada pelas regras do Firestore pra qualquer usuário
// autenticado (ver firestore.rules); quem garante que só Cauan/Toninho
// chegam a essa tela é o RequireAdmin + a checagem de e-mail no login.
export function useAllProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const q = query(collection(db, "imoveis"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      setProperties(snapshot.docs.map((doc) => doc.data() as Property));
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

  return { properties, loading, error, refresh };
}
