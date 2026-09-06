import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { createProperty, updateProperty, type NewPropertyInput } from "../../lib/adminApi";
import { PhotoManager } from "../../components/admin/PhotoManager";
import { VideoUploader } from "../../components/admin/VideoUploader";
import { LocationField, type LocationValue } from "../../components/admin/LocationField";
import { PROPERTY_TYPES, type DealType, type Property, type PropertyStatus, type PropertyType } from "../../types";

interface FormState extends LocationValue {
  title: string;
  type: PropertyType;
  dealType: DealType;
  status: PropertyStatus;
  published: boolean;
  featured: boolean;
  price: string;
  areaM2: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  neighborhoodFact: string;
  description: string;
  gallery: string[];
  video: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  type: "Casa",
  dealType: "Venda",
  status: "Disponível",
  published: false,
  featured: false,
  zipCode: "",
  street: "",
  neighborhood: "",
  city: "Botucatu",
  state: "SP",
  price: "",
  areaM2: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  neighborhoodFact: "",
  description: "",
  gallery: [],
  video: "",
};

function toFormState(p: Property): FormState {
  return {
    title: p.title,
    type: p.type,
    dealType: p.dealType,
    status: p.status,
    published: p.published,
    featured: p.featured,
    zipCode: p.zipCode || "",
    street: p.street,
    neighborhood: p.neighborhood,
    city: p.city,
    state: p.state,
    price: String(p.price || ""),
    areaM2: String(p.areaM2 || ""),
    bedrooms: String(p.bedrooms || ""),
    bathrooms: String(p.bathrooms || ""),
    parking: String(p.parking || ""),
    neighborhoodFact: p.neighborhoodFact,
    description: p.description.join("\n\n"),
    gallery: p.gallery,
    video: p.video || "",
  };
}

export function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "novo";
  const navigate = useNavigate();

  const uploadFolder = useMemo(() => `imoveis/${isNew ? crypto.randomUUID() : id}`, [isNew, id]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    getDoc(doc(db, "imoveis", id)).then((snap) => {
      if (snap.exists()) setForm(toFormState(snap.data() as Property));
      setLoading(false);
    });
  }, [isNew, id]);

  // Avisa antes de fechar/recarregar a aba com edições não salvas — fotos já
  // subiram pro Cloudinary, perder o formulário nesse ponto é bem frustrante.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function patch(fields: Partial<FormState>) {
    setForm((f) => ({ ...f, ...fields }));
    setDirty(true);
  }

  async function handleSubmit(publish: boolean) {
    setError(null);

    if (!form.title.trim() || !form.neighborhood.trim() || !form.city.trim() || !form.state.trim() || !form.neighborhoodFact.trim()) {
      setError("Preencha título, bairro, cidade, estado e \"o que só quem mora perto sabe\".");
      return;
    }
    if (form.gallery.length === 0) {
      setError("Adicione pelo menos uma foto antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      const payload: NewPropertyInput = {
        title: form.title.trim(),
        type: form.type,
        dealType: form.dealType,
        status: form.status,
        published: publish,
        featured: form.featured,
        zipCode: form.zipCode,
        street: form.street,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        price: Number(form.price) || 0,
        areaM2: Number(form.areaM2) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        parking: Number(form.parking) || 0,
        neighborhoodFact: form.neighborhoodFact.trim(),
        description: form.description
          .split(/\n\s*\n/)
          .map((p) => p.replace(/\s+/g, " ").trim())
          .filter(Boolean),
        cover: form.gallery[0],
        gallery: form.gallery,
        video: form.video,
      };

      if (isNew) {
        const created = await createProperty(payload);
        navigate(`/admin/imoveis/${created.id}`, { replace: true });
      } else if (id) {
        await updateProperty(id, payload);
      }
      setForm((f) => ({ ...f, published: publish }));
      setDirty(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-display text-sm text-grafite-muted">Carregando…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-balance font-display text-2xl font-semibold text-grafite">
        {isNew ? "Novo imóvel" : `Editar imóvel — ${form.title}`}
      </h1>

      <div className="mt-6 space-y-8 rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,18,20,0.06)] ring-1 ring-grafite/5 sm:p-8">
        <Section title="Dados básicos">
          <Field label="Título" className="sm:col-span-2">
            <Input name="title" value={form.title} onChange={(v) => patch({ title: v })} placeholder="Casa térrea com fachada em pedra" />
          </Field>
          <Field label="Tipo">
            <Select value={form.type} onChange={(v) => patch({ type: v as PropertyType })} options={PROPERTY_TYPES} />
          </Field>
          <Field label="Negócio">
            <Select value={form.dealType} onChange={(v) => patch({ dealType: v as DealType })} options={["Venda", "Aluguel"]} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(v) => patch({ status: v as PropertyStatus })} options={["Disponível", "Em negociação"]} />
          </Field>
          <Field label="Valor (R$)">
            <Input name="price" type="number" value={form.price} onChange={(v) => patch({ price: v })} placeholder="480000" />
          </Field>
        </Section>

        <Section title="Localização">
          <div className="sm:col-span-2">
            <LocationField value={form} onChange={patch} />
          </div>
        </Section>

        <Section title="Características">
          <Field label="Quartos">
            <Input name="bedrooms" type="number" value={form.bedrooms} onChange={(v) => patch({ bedrooms: v })} />
          </Field>
          <Field label="Banheiros">
            <Input name="bathrooms" type="number" value={form.bathrooms} onChange={(v) => patch({ bathrooms: v })} />
          </Field>
          <Field label="Vagas">
            <Input name="parking" type="number" value={form.parking} onChange={(v) => patch({ parking: v })} />
          </Field>
          <Field label="Área (m²)">
            <Input name="areaM2" type="number" value={form.areaM2} onChange={(v) => patch({ areaM2: v })} />
          </Field>
        </Section>

        <Section title="Descrição">
          <Field label="Descrição (parágrafos separados por linha em branco)" className="sm:col-span-2">
            <Textarea name="description" value={form.description} onChange={(v) => patch({ description: v })} rows={6} />
          </Field>
          <Field label="“O que só quem mora perto sabe”" className="sm:col-span-2">
            <Textarea name="neighborhoodFact" value={form.neighborhoodFact} onChange={(v) => patch({ neighborhoodFact: v })} rows={3} />
          </Field>
        </Section>

        <Section title="Fotos e vídeo">
          <div className="sm:col-span-2">
            <PhotoManager value={form.gallery} onChange={(gallery) => patch({ gallery })} folder={uploadFolder} />
          </div>
          <div className="sm:col-span-2">
            <VideoUploader value={form.video} onChange={(video) => patch({ video })} folder={uploadFolder} />
          </div>
        </Section>

        <Section title="Visibilidade">
          <button
            type="button"
            role="switch"
            aria-checked={form.featured}
            onClick={() => patch({ featured: !form.featured })}
            className="flex items-center gap-3 [touch-action:manipulation] sm:col-span-2"
          >
            <ToggleTrack checked={form.featured} />
            <span className="font-display text-sm text-grafite">Destacar na página inicial</span>
          </button>
        </Section>

        {error && (
          <p aria-live="polite" className="font-display text-[13.5px] text-amber-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-grafite/8 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="rounded-xl border border-grafite/15 px-5 py-2.5 font-display text-sm font-semibold text-grafite transition-colors hover:bg-grafite/5 disabled:opacity-60"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="rounded-xl bg-azul-escritura px-5 py-2.5 font-display text-sm font-semibold text-cinza-papel transition-colors hover:bg-azul-escritura-forte disabled:opacity-60"
          >
            {saving ? "Salvando…" : form.published ? "Salvar" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-azul-escritura">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className || ""}`}>
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-grafite-muted">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  name,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  name?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  return (
    <input
      type={type}
      name={name}
      inputMode={inputMode ?? (type === "number" ? "numeric" : undefined)}
      autoComplete="off"
      spellCheck={false}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
  name?: string;
}) {
  return (
    <textarea
      value={value}
      name={name}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  name?: string;
}) {
  return (
    <select
      value={value}
      name={name}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-grafite/15 bg-white px-3.5 py-2.5 font-display text-sm text-grafite transition-colors focus:border-azul-escritura"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/** Só o visual do interruptor — o clique/estado ficam no <button role="switch">
 *  que envolve isto junto com o texto, pra área de toque única (rótulo + controle). */
function ToggleTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors ${checked ? "bg-azul-escritura" : "bg-grafite/20"}`}
    >
      <span
        className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[20px]" : "translate-x-[3px]"
        }`}
      />
    </span>
  );
}
