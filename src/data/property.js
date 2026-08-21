// Dados fixos do site (agência, corretor, diferenciais) ficam aqui.
// Os imóveis são carregados do Firestore em tempo real. Em caso de falha
// (sem conexão, erro de rede), o site usa o properties.json local como fallback.
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import generatedProperties from "./properties.json";

export const agency = {
  name: "TBN Imóveis",
  logo: "/images/logo-tbn.png",
  tagline: "Cada imóvel, uma história. Cada negócio, uma experiência.",
};

export const broker = {
  name: "Toninho Bomnome",
  role: "Corretor de Imóveis",
  creci: "CRECI 247711-F",
  phone: "(14) 99718-6655",
  whatsapp: "5514997186655",
  instagram: "@toninho_bomnome",
  photo: "/images/corretor-toninho.webp",
  bio: "Corretor de imóveis apaixonado por transformar sonhos em realidade. Minha missão é ajudá-lo a encontrar o lar ideal ou a melhor oportunidade de investimento, sempre com transparência, profissionalismo e dedicação.",
  story: [
    "O TBN Imóveis nasceu da vontade de Toninho Bomnome de fazer diferente. Depois de anos atuando no mercado imobiliário e vendo negociações tratadas como simples números, ele decidiu criar este espaço para apresentar seus imóveis com mais cuidado, clareza e proximidade — colocando as pessoas no centro de cada negócio.",
    "Toninho acompanha cada cliente pessoalmente, entendendo suas necessidades antes de indicar qualquer imóvel. Para ele, vender ou alugar uma casa não é fechar mais um contrato — é ajudar alguém a começar um novo capítulo.",
  ],
  quote:
    "Aqui, comprar ou alugar um imóvel não é apenas mais uma venda. É uma experiência conduzida com cuidado, do primeiro "oi" até a entrega das chaves.",
  values: [
    {
      title: "Atendimento humano",
      text: "Cada cliente é acompanhado pessoalmente, do primeiro contato à entrega das chaves.",
      icon: "handshake",
    },
    {
      title: "Transparência total",
      text: "Preços, condições e documentação explicados com clareza, sem letras miúdas.",
      icon: "shield",
    },
    {
      title: "Cuidado nos detalhes",
      text: "Cada imóvel é avaliado e apresentado com atenção genuína — nunca como mais um número.",
      icon: "heart",
    },
  ],
};

// Hook para buscar imóveis do Firestore com fallback para o JSON local.
// Retorna { properties, loading, error }
export function useProperties() {
  const [properties, setProperties] = useState(generatedProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFromFirestore() {
      try {
        const q = query(collection(db, "imoveis"), orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);

        if (cancelled) return;

        if (snapshot.empty) {
          // Nenhum imóvel no Firestore ainda — usa o fallback local
          setLoading(false);
          return;
        }

        const fetched = snapshot.docs.map((doc) => doc.data());
        setProperties(fetched);
      } catch (err) {
        if (cancelled) return;
        console.warn("Firestore indisponível, usando dados locais:", err.message);
        setError(err);
        // Mantém o fallback local (já está no estado inicial)
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

// Exportação estática para componentes que não precisam de reatividade
// (ex.: SSG / builds estáticos). Usa o JSON local.
export const properties = generatedProperties;

export const serviceAreas = [
  { label: "Centro e região central", distance: "Atendimento prioritário" },
  { label: "Jardim das Acácias", distance: "Casas e sobrados" },
  { label: "Vila Progresso", distance: "Casas para locação" },
  { label: "Condomínios fechados", distance: "Apartamentos e casas em condomínio" },
];

export const highlights = [
  {
    title: "Consultoria sem compromisso",
    text: "Conte o que você procura e receba indicações reais, sem pressão de venda.",
    icon: "calendar",
  },
  {
    title: "Negociação transparente",
    text: "Condições claras de venda, aluguel e financiamento, explicadas em detalhes.",
    icon: "handshake",
  },
  {
    title: "Suporte até a entrega das chaves",
    text: "Acompanhamento completo da documentação até a assinatura do contrato.",
    icon: "key",
  },
];
