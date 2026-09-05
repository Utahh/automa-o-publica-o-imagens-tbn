// Verifica o ID token do Firebase Auth em cada chamada às funções de
// escrita e confere se o e-mail está na lista de contas autorizadas.
// Este é o limite de segurança real do painel — as regras do Firestore
// negam escrita de qualquer cliente (write: if false, ver
// firestore.rules), então só quem passa por aqui consegue gravar algo.
import { getAuth } from "firebase-admin/auth";
import { initFirebase } from "../../scripts/lib/pipeline.mjs";

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  return undefined;
}

function allowedEmails() {
  return (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Devolve o token decodificado se autorizado, ou responde 401/403 e
// devolve null (o handler chamador deve `return` assim que receber null).
export async function requireAdmin(req, res) {
  initFirebase(loadServiceAccount());

  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    res.status(401).json({ error: "Não autenticado." });
    return null;
  }

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(match[1]);
  } catch {
    res.status(401).json({ error: "Sessão inválida ou expirada. Faça login de novo." });
    return null;
  }

  const email = (decoded.email || "").toLowerCase();
  if (!email || !allowedEmails().includes(email)) {
    res.status(403).json({ error: "Sua conta não tem acesso ao painel de cadastro." });
    return null;
  }

  return decoded;
}
