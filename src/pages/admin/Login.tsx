import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "../../components/BrandMark";
import { HeroSymbol } from "../../components/HeroSymbol";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
  const { user, isAdmin, loading, googleError, signIn, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();
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

  async function handleGoogle() {
    setError(null);
    setGoogleSubmitting(true);
    try {
      // Navega pro Google e volta — se der certo, a sessão aparece via
      // onAuthStateChanged depois do redirect de volta (ver useAuth), não
      // como retorno desta chamada.
      await signInWithGoogle();
    } catch {
      setError("Não deu pra entrar com o Google. Tente de novo.");
      setGoogleSubmitting(false);
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

        <motion.button
          type="button"
          onClick={handleGoogle}
          disabled={googleSubmitting}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-grafite/15 py-3 font-display text-sm font-semibold text-grafite [touch-action:manipulation] transition-colors hover:bg-grafite/5 disabled:opacity-60"
        >
          <GoogleIcon className="h-4 w-4" />
          {googleSubmitting ? "Entrando…" : "Entrar com o Google"}
        </motion.button>

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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}
