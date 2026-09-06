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
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
