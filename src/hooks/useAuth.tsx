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
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
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
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/network-request-failed":
      return "Falha de conexão durante o login. Confira a internet e tente de novo.";
    case "auth/invalid-credential":
      return "O Google não confirmou sua identidade a tempo. Tente de novo.";
    default:
      return code ? `Não deu pra entrar com o Google (${code}). Tente de novo.` : "Não deu pra entrar com o Google. Tente de novo.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);

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

  // Recebe o ID token do Google Identity Services (botão renderizado
  // direto na página, ver Login.tsx) e troca por uma sessão do Firebase.
  // Não usa signInWithPopup/signInWithRedirect — os dois dependem de um
  // relay entre o domínio do site e o authDomain do Firebase
  // (tbn-imoveis-site.firebaseapp.com), e cookie de terceiros bloqueado
  // (padrão cada vez mais comum no Chrome/Safari) faz esse relay falhar
  // em silêncio, sem nem lançar erro. O GIS entrega o token direto nesta
  // página, sem esse salto entre domínios.
  async function signInWithGoogleIdToken(idToken: string) {
    setGoogleError(null);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (err) {
      console.error("Erro no login com Google:", err);
      setGoogleError(describeAuthError(err));
      throw err;
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, googleError, signIn, signInWithGoogleIdToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
