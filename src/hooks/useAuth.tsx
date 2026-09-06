// Contexto de autenticação do painel — só duas contas têm acesso
// (Cauan e o corretor Toninho), cada uma podendo entrar com e-mail/senha
// ou com a conta do Google. Autenticar não basta: só é considerado
// "admin" (isAdmin) quem tem a custom claim `admin: true`, concedida uma
// vez via `npm run set-admin-claims` (ver docs/ARQUITETURA.md) — sem
// isso, qualquer conta do Google conseguiria logar. A checagem de
// escrita de verdade continua no backend (ALLOWED_ADMIN_EMAILS, em
// api/_lib/auth.mjs); a claim aqui só existe pra decidir o que a
// coleção `imoveis` deixa esse usuário LER no Firestore (rascunhos) e
// pra dar um aviso decente na tela de login.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  googleError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mensagens mais úteis que "não deu certo" pros erros mais comuns do
// login por Google — o texto genérico não ajudava a descobrir se era
// bloqueio de pop-up, cookie de terceiros ou domínio não autorizado.
function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google. Permita pop-ups pra este site e tente de novo.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "A janela do Google foi fechada antes de concluir. Tente de novo.";
    case "auth/unauthorized-domain":
      return "Este endereço não está autorizado a usar o login do Google. Acesse pelo link oficial do site.";
    case "auth/network-request-failed":
      return "Falha de conexão durante o login. Confira a internet e tente de novo.";
    case "auth/web-storage-unsupported":
    case "auth/operation-not-supported-in-this-environment":
      return "O navegador está bloqueando cookies de terceiros, o que impede o login do Google aqui. Tente em outro navegador ou desative o bloqueio de cookies pra este site.";
    default:
      return code ? `Não deu pra entrar com o Google (${code}). Tente de novo.` : "Não deu pra entrar com o Google. Tente de novo.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // signInWithRedirect navega pro Google e volta — o resultado (ou erro)
  // só chega aqui, depois do redirect de volta, nunca na chamada original.
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Erro no login com Google:", err);
      setGoogleError(describeAuthError(err));
    });
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // força buscar o token de novo (não usar o cache local) — sem
        // isso, uma claim recém-concedida só apareceria depois de 1h.
        const result = await u.getIdTokenResult(true);
        setIsAdmin(result.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    setGoogleError(null);
    // Redirect em vez de popup: funciona em navegadores que bloqueiam
    // pop-up ou cookie de terceiros (cada vez mais comum) e é o padrão
    // mais robusto do próprio Firebase, principalmente no celular.
    await signInWithRedirect(auth, new GoogleAuthProvider());
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, googleError, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
