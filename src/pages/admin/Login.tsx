import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "../../components/BrandMark";
import { HeroSymbol } from "../../components/HeroSymbol";
import { useAuth } from "../../hooks/useAuth";

const MAX_ATTEMPTS = 4;
const LOCKOUT_MS = 15 * 60 * 1000;
const ATTEMPTS_KEY = "admin_login_attempts";

interface AttemptState {
  count: number;
  lockUntil: number | null;
}

function readAttempts(): AttemptState {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockUntil: null };
    const parsed = JSON.parse(raw) as AttemptState;
    // Trava expirada — volta a contar do zero.
    if (parsed.lockUntil && parsed.lockUntil <= Date.now()) return { count: 0, lockUntil: null };
    return parsed;
  } catch {
    return { count: 0, lockUntil: null };
  }
}

function writeAttempts(state: AttemptState) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível (modo privado etc.) — só não persiste entre reloads.
  }
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Login() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(() => readAttempts().lockUntil);
  const [now, setNow] = useState(() => Date.now());
  const reduceMotion = useReducedMotion();

  const state = location.state as { from?: { pathname?: string }; denied?: boolean; expired?: boolean } | null;

  // Alguém autenticou mas não tem acesso ao painel — desloga pra não
  // ficar preso numa sessão sem claim, e avisa.
  useEffect(() => {
    if (state?.denied && user) {
      signOut();
      setError("Essa conta não tem acesso ao painel de cadastro.");
    }
  }, [state?.denied, user, signOut]);

  useEffect(() => {
    if (state?.expired) setError("Sessão encerrada automaticamente por inatividade.");
  }, [state?.expired]);

  // Atualiza a contagem regressiva do bloqueio enquanto ele durar.
  useEffect(() => {
    if (!lockUntil) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockUntil) {
        setLockUntil(null);
        writeAttempts({ count: 0, lockUntil: null });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  if (!loading && user && isAdmin) {
    return <Navigate to={state?.from?.pathname || "/admin"} replace />;
  }

  const locked = lockUntil !== null && lockUntil > now;
  const lockRemaining = locked ? formatRemaining(lockUntil! - now) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      writeAttempts({ count: 0, lockUntil: null });
      navigate("/admin", { replace: true });
    } catch {
      const attempts = readAttempts();
      const count = attempts.count + 1;
      if (count >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        writeAttempts({ count, lockUntil: until });
        setLockUntil(until);
        setNow(Date.now());
        setError(`Muitas tentativas. Acesso bloqueado por ${formatRemaining(LOCKOUT_MS)} minutos.`);
      } else {
        writeAttempts({ count, lockUntil: null });
        setError(`E-mail ou senha incorretos. Tentativa ${count} de ${MAX_ATTEMPTS}.`);
      }
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

        {error && (
          <p aria-live="polite" className="mt-4 font-display text-[13px] text-amber-700">
            {locked ? `Muitas tentativas. Tente de novo em ${lockRemaining}.` : error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
              E-mail
            </span>
            <input
              type="email"
              name="email"
              required
              disabled={locked}
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura disabled:opacity-60"
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
              disabled={locked}
              autoComplete="current-password"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura disabled:opacity-60"
            />
          </label>

          <motion.button
            type="submit"
            disabled={submitting || locked}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full rounded-xl bg-azul-escritura py-3 font-display text-sm font-semibold text-cinza-papel [touch-action:manipulation] transition-colors hover:bg-azul-escritura-forte disabled:opacity-60"
          >
            {locked ? `Bloqueado (${lockRemaining})` : submitting ? "Entrando…" : "Entrar"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
