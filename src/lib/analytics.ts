// Rastreio anônimo de comportamento (cliques em imóvel, buscas, visitas de
// página) — sem nome, telefone, e-mail ou qualquer dado pessoal do
// visitante, só pra entender tendência (quais imóveis mais chamam
// atenção, quais filtros mais se usa). `sessionId` é um UUID gerado no
// navegador e guardado só na aba (sessionStorage) — não identifica
// ninguém, só agrupa eventos da mesma visita. Gravado direto no
// Firestore pelo cliente (sem passar pela API), com regras que só
// permitem `create` com o formato certo e leitura restrita a quem tem a
// claim de admin (ver firestore.rules) — condizente com o painel de
// estatísticas em /admin/estatisticas.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const SESSION_KEY = "tbn_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "sem-sessao";
  }
}

type TrackEvent =
  | { type: "page_view"; path: string }
  | {
      type: "property_view";
      path: string;
      propertyId: string;
      propertyCode: string;
      propertyTitle: string;
      source: string;
    }
  | {
      type: "search";
      path: string;
      filters: { bairro: string; tipo: string; negocio: string; preco: string };
      resultsCount: number;
    };

/** Dispara e esquece — analytics nunca deve travar ou quebrar a navegação
 *  do visitante, então qualquer erro (offline, regra recusando etc.) só
 *  some em silêncio. */
export function trackEvent(event: TrackEvent) {
  addDoc(collection(db, "analytics_events"), {
    ...event,
    sessionId: getSessionId(),
    timestamp: serverTimestamp(),
  }).catch(() => {});
}
