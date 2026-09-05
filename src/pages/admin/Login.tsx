import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../../components/BrandMark";
import { useAuth } from "../../hooks/useAuth";

export function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const state = location.state as { from?: { pathname?: string } } | null;
    const from = state?.from?.pathname || "/admin";
    return <Navigate to={from} replace />;
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
    <div className="flex min-h-screen items-center justify-center bg-cinza-papel px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5">
        <BrandMark mode="symbol" className="h-11 w-11" />
        <h1 className="mt-5 font-display text-xl font-semibold text-grafite">Painel de cadastro</h1>
        <p className="mt-1 font-display text-sm text-grafite-muted">Acesso restrito ao corretor e à administração.</p>

        <label className="mt-6 flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
            E-mail
          </span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite outline-none focus:border-azul-escritura"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">
            Senha
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite outline-none focus:border-azul-escritura"
          />
        </label>

        {error && <p className="mt-3 font-display text-[13px] text-amber-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-azul-escritura py-3 font-display text-sm font-semibold text-cinza-papel transition-colors hover:bg-azul-escritura-forte disabled:opacity-60"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
