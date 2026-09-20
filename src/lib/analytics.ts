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

const ORIGIN_KEY = "tbn_origin";

const REFERRER_LABELS: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook|fb)\.com$/, "Facebook"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)youtube\.com$/, "YouTube"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
];

/** De onde a visita veio: `utm_source` (+ `utm_campaign`) quando o link
 *  tem, senão o site de referência. Calculado uma vez, na primeira
 *  chamada da visita, e guardado junto do ID da sessão — não identifica
 *  ninguém, só diz "Instagram", "Google", "direto" etc. */
function getOrigin(): string {
  try {
    const saved = sessionStorage.getItem(ORIGIN_KEY);
    if (saved) return saved;

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source")?.trim().toLowerCase();
    const campaign = params.get("utm_campaign")?.trim().toLowerCase();
    let origin = "Direto";

    if (source) {
      origin = campaign ? `${source} · ${campaign}` : source;
    } else if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname.replace(/^www\./, "")) {
        origin = REFERRER_LABELS.find(([re]) => re.test(host))?.[1] ?? host;
      }
    }

    sessionStorage.setItem(ORIGIN_KEY, origin);
    return origin;
  } catch {
    return "Direto";
  }
}

type TrackEvent =
  | { type: "page_view"; path: string }
  | { type: "whatsapp_click"; path: string }
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
    origin: getOrigin(),
    timestamp: serverTimestamp(),
  }).catch(() => {});
}
