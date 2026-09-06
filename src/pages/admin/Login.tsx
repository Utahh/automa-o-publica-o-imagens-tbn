import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "../../components/BrandMark";
import { HeroSymbol } from "../../components/HeroSymbol";
import { useAuth } from "../../hooks/useAuth";

// Web Client ID do provedor Google já configurado no Firebase Auth deste
// projeto (não é segredo — client ID é público por natureza no OAuth do
// Google, é o client SECRET que nunca aparece aqui).
const GOOGLE_CLIENT_ID = "442425683386-3g7or2jg9eo0u5oi04m2h497fhove86l.apps.googleusercontent.com";

interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleGIS {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
}

export function Login() {
  const { user, isAdmin, loading, googleError, signIn, signInWithGoogleIdToken, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const displayError = error || googleError;

  const state = location.state as { from?: { pathname?: string }; denied?: boolean } | null;

  // Alguém autenticou (e-mail/senha ou Google) mas não tem acesso ao
  // painel — desloga pra não ficar preso numa sessão sem claim, e avisa.
  useEffect(() => {
    if (state?.denied && user) {
      signOut();
      setError("Essa conta não tem acesso ao painel de cadastro.");
    }
  }, [state?.denied, user, signOut]);

  // Google Identity Services: o botão é desenhado pelo próprio script do
  // Google direto nesta página — não depende de pop-up nem de cookie
  // entre o domínio do site e o do Firebase, ao contrário de
  // signInWithPopup/signInWithRedirect (que falhavam em silêncio com
  // cookie de terceiros bloqueado, cada vez mais o padrão no Chrome).
  useEffect(() => {
    let cancelled = false;

    function tryRender() {
      if (cancelled) return;
      const google = (window as unknown as { google?: GoogleGIS }).google;
      if (!google?.accounts?.id) {
        setTimeout(tryRender, 100);
        return;
      }
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError(null);
          try {
            await signInWithGoogleIdToken(response.credential);
            navigate("/admin", { replace: true });
          } catch {
            // erro específico já fica em googleError (useAuth)
          }
        },
      });
      if (googleButtonRef.current) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 320,
        });
      }
    }

    tryRender();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loading && user && isAdmin) {
    return <Navigate to={state?.from?.pathname || "/admin"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grafite-noite px-6">
      {/* Mesmo tratamento de fundo do Hero da home: gradiente radial + grade sutil */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(39,82,127,0.35),transparent_55%)]"
        animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(239,240,241,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(239,240,241,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      {/* Linha de varredura estilo scanner de planta, cruzando a tela devagar
          — anima translateY (compositor), não `top` */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(rgba(121,162,208,0)_0%,rgba(121,162,208,0.09)_50%,rgba(121,162,208,0)_100%)]"
          initial={{ transform: "translateY(-130%)" }}
          animate={{ transform: "translateY(730%)" }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
        />
      )}

      {/* A planta do símbolo se desenhando ao fundo, em loop, à deriva bem devagar
          — parado (sem loop nem deriva) se o usuário preferir menos movimento */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 opacity-[0.16] blur-[0.5px] sm:-bottom-32 sm:-right-32"
        animate={reduceMotion ? undefined : { x: [0, -18, 0], y: [0, 14, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeroSymbol loop={!reduceMotion} className="h-[420px] w-[420px] sm:h-[560px] sm:w-[560px]" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-28 opacity-[0.09] blur-[0.5px] sm:-left-36 sm:-top-36"
        animate={reduceMotion ? undefined : { x: [0, 16, 0], y: [0, -12, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        <HeroSymbol loop={!reduceMotion} className="h-[340px] w-[340px] sm:h-[440px] sm:w-[440px]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_24px_60px_-20px_rgba(15,18,20,0.6)] ring-1 ring-cinza-papel/10"
      >
        <BrandMark mode="symbol" className="h-11 w-11" />
        <h1 className="mt-5 text-balance font-display text-xl font-semibold text-grafite">Painel de cadastro</h1>
        <p className="mt-1 font-display text-sm text-grafite-muted">Acesso restrito ao corretor e à administração.</p>

        {displayError && (
          <p aria-live="polite" className="mt-4 font-display text-[13px] text-amber-700">
            {displayError}
          </p>
        )}

        <div className="mt-6 flex justify-center" ref={googleButtonRef} />

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-grafite/10" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-grafite-muted">ou</span>
          <span className="h-px flex-1 bg-grafite/10" />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
              E-mail
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
            />
          </label>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
              Senha
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
            />
          </label>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full rounded-xl bg-azul-escritura py-3 font-display text-sm font-semibold text-cinza-papel [touch-action:manipulation] transition-colors hover:bg-azul-escritura-forte disabled:opacity-60"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
