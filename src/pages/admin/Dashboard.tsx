import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";
import { Toggle } from "../../components/admin/Toggle";
import { useAllProperties } from "../../hooks/useProperties";
import { updateProperty, deleteProperty } from "../../lib/adminApi";
import { formatPrice } from "../../lib/format";
import type { Property } from "../../types";

interface JustSavedState {
  justSaved?: { title: string; published: boolean };
}

export function Dashboard() {
  const { properties, loading, error, refresh } = useAllProperties();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as JustSavedState | null;
    if (!state?.justSaved) return;
    const { title, published } = state.justSaved;
    setSuccessMessage(`"${title}" cadastrado com sucesso${published ? "" : " como rascunho"}.`);
    // Limpa o state da navegação pra um F5 na página não repetir o aviso.
    navigate(location.pathname, { replace: true, state: null });
    const timer = setTimeout(() => setSuccessMessage(null), 6000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const publishedCount = properties.filter((p) => p.published).length;
  const draftCount = properties.length - publishedCount;

  async function toggleFeatured(p: Property) {
    setBusyId(p.id);
    try {
      await updateProperty(p.id, { featured: !p.featured });
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublished(p: Property) {
    setBusyId(p.id);
    try {
      await updateProperty(p.id, { published: !p.published });
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(p: Property) {
    if (!confirm(`Excluir "${p.title}" (${p.code})? Isso também apaga as fotos/vídeo dele. Não dá pra desfazer.`)) return;
    setBusyId(p.id);
    try {
      await deleteProperty(p.id);
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-grafite">Imóveis</h1>
          <p className="mt-1 font-display text-sm text-grafite-muted">
            {publishedCount} publicado{publishedCount === 1 ? "" : "s"} · {draftCount} rascunho{draftCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          to="/admin/imoveis/novo"
          className="rounded-xl bg-azul-escritura px-5 py-2.5 font-display text-sm font-semibold text-cinza-papel transition-colors hover:bg-azul-escritura-forte"
        >
          + Novo imóvel
        </Link>
      </div>

      {successMessage && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl bg-emerald-700/10 px-4 py-3 font-display text-sm font-medium text-emerald-800"
        >
          {successMessage}
        </p>
      )}

      {error && <p className="mt-6 font-display text-sm text-amber-700">Erro ao carregar imóveis: {error.message}</p>}
      {loading && <p className="mt-6 font-display text-sm text-grafite-muted">Carregando…</p>}

      {!loading && properties.length === 0 && (
        <p className="mt-10 font-display text-sm text-grafite-muted">Nenhum imóvel cadastrado ainda.</p>
      )}

      {properties.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5">
          <div className="grid grid-cols-[52px_1fr_110px_140px_100px] items-center gap-4 border-b border-grafite/8 px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-wider text-grafite-muted">
            <span />
            <span>Imóvel</span>
            <span>Status</span>
            <span>Destaque</span>
            <span className="text-right">Ações</span>
          </div>

          {properties.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[52px_1fr_110px_140px_100px] items-center gap-4 border-b border-grafite/8 px-5 py-3 last:border-b-0"
            >
              <SafeImage src={p.cover} alt="" wrapperClassName="h-11 w-11 shrink-0 rounded-lg" className="h-full w-full rounded-lg object-cover" />

              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-grafite">{p.title}</p>
                <p className="font-mono text-[11px] text-grafite-muted">
                  {p.code} · {formatPrice(p.price, p.dealType)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => togglePublished(p)}
                disabled={busyId === p.id}
                className={`w-fit rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold ${
                  p.published ? "bg-emerald-700/10 text-emerald-800" : "bg-grafite/10 text-grafite-muted"
                }`}
              >
                {p.published ? "Publicado" : "Rascunho"}
              </button>

              <Toggle
                checked={p.featured}
                onChange={() => toggleFeatured(p)}
                disabled={busyId === p.id}
                label="Destaque"
              />

              <div className="flex items-center justify-end gap-1.5">
                <Link
                  to={`/admin/imoveis/${p.id}`}
                  aria-label="Editar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-grafite-muted transition-colors hover:bg-grafite/5 hover:text-azul-escritura"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  disabled={busyId === p.id}
                  aria-label="Excluir"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-grafite-muted transition-colors hover:bg-amber-700/10 hover:text-amber-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
