import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { createProperty, updateProperty, type NewPropertyInput } from "../../lib/adminApi";
import { PhotoManager } from "../../components/admin/PhotoManager";
import { VideoUploader } from "../../components/admin/VideoUploader";
import { LocationField, type LocationValue } from "../../components/admin/LocationField";
import { Toggle } from "../../components/admin/Toggle";
import { CurrencyInput } from "../../components/admin/CurrencyInput";
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
  hasPool: boolean;
  hasBarbecue: boolean;
  hasSauna: boolean;
  hasSocialBathroom: boolean;
  hasSuite: boolean;
  hasCondo: boolean;
  condoFee: string;
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
  hasPool: false,
  hasBarbecue: false,
  hasSauna: false,
  hasSocialBathroom: false,
  hasSuite: false,
  hasCondo: false,
  condoFee: "",
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
    hasPool: p.hasPool ?? false,
    hasBarbecue: p.hasBarbecue ?? false,
    hasSauna: p.hasSauna ?? false,
    hasSocialBathroom: p.hasSocialBathroom ?? false,
    hasSuite: p.hasSuite ?? false,
    hasCondo: p.hasCondo ?? false,
    condoFee: String(p.condoFee || ""),
    neighborhoodFact: p.neighborhoodFact || "",
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

    // Só o essencial pra publicar bloqueia — o resto (localização, "o que
    // só quem mora perto sabe", vaga, comodidades...) é complementar e
    // pode ficar em branco sem travar o cadastro nem a edição de um
    // imóvel antigo que não tinha esses campos preenchidos.
    if (!form.title.trim()) {
      setError("Preencha o título do imóvel.");
      return;
    }
    if (!form.description.trim()) {
      setError("Preencha a descrição do imóvel.");
      return;
    }
    if (!form.price.trim() || Number(form.price) <= 0) {
      setError("Preencha o valor do imóvel.");
      return;
    }
    if (form.bedrooms.trim() === "" || form.bathrooms.trim() === "" || form.areaM2.trim() === "") {
      setError("Preencha quartos, banheiros e área (m²).");
      return;
    }
    if (form.gallery.length === 0) {
      setError("Adicione a foto de capa e as demais fotos antes de salvar.");
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
        hasPool: form.hasPool,
        hasBarbecue: form.hasBarbecue,
        hasSauna: form.hasSauna,
        hasSocialBathroom: form.hasSocialBathroom,
        hasSuite: form.hasSuite,
        hasCondo: form.hasCondo,
        condoFee: form.hasCondo ? Number(form.condoFee) || 0 : 0,
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
        // Volta pro painel com a lista — é ali que dá pra ver que o
        // imóvel novo realmente foi salvo (ficar no formulário sem
        // nenhum aviso passava a impressão de que nada tinha acontecido).
        // O aviso de sucesso propriamente dito é mostrado lá no Dashboard,
        // via router state (evita some se a página recarregar).
        navigate("/admin", {
          replace: true,
          state: { justSaved: { title: created.title, published: created.published } },
        });
        return;
      }

      if (id) {
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
          <Field label="Valor *">
            <CurrencyInput name="price" value={form.price} onChange={(v) => patch({ price: v })} />
          </Field>
        </Section>

        <Section title="Localização (opcional)">
          <div className="sm:col-span-2">
            <LocationField value={form} onChange={patch} />
          </div>
        </Section>

        <Section title="Características">
          <Field label="Quartos *">
            <Input name="bedrooms" type="number" value={form.bedrooms} onChange={(v) => patch({ bedrooms: v })} />
          </Field>
          <Field label="Banheiros *">
            <Input name="bathrooms" type="number" value={form.bathrooms} onChange={(v) => patch({ bathrooms: v })} />
          </Field>
          <Field label="Vagas (opcional)">
            <Input name="parking" type="number" value={form.parking} onChange={(v) => patch({ parking: v })} />
          </Field>
          <Field label="Área em m² *">
            <Input name="areaM2" type="number" value={form.areaM2} onChange={(v) => patch({ areaM2: v })} />
          </Field>
        </Section>

        <Section title="Condomínio (opcional)">
          <Toggle checked={form.hasCondo} onChange={() => patch({ hasCondo: !form.hasCondo })} label="Tem condomínio" />
          {form.hasCondo && (
            <Field label="Taxa do condomínio (opcional)">
              <CurrencyInput value={form.condoFee} onChange={(v) => patch({ condoFee: v })} />
            </Field>
          )}
        </Section>

        <Section title="Comodidades (opcional)">
          <Toggle checked={form.hasPool} onChange={() => patch({ hasPool: !form.hasPool })} label="Piscina" />
          <Toggle checked={form.hasBarbecue} onChange={() => patch({ hasBarbecue: !form.hasBarbecue })} label="Churrasqueira" />
          <Toggle checked={form.hasSauna} onChange={() => patch({ hasSauna: !form.hasSauna })} label="Sauna" />
          <Toggle
            checked={form.hasSocialBathroom}
            onChange={() => patch({ hasSocialBathroom: !form.hasSocialBathroom })}
            label="Banheiro social"
          />
          <Toggle checked={form.hasSuite} onChange={() => patch({ hasSuite: !form.hasSuite })} label="Suíte" />
        </Section>

        <Section title="Descrição">
          <Field label="Descrição (parágrafos separados por linha em branco) *" className="sm:col-span-2">
            <Textarea name="description" value={form.description} onChange={(v) => patch({ description: v })} rows={6} />
          </Field>
          <Field label="“O que só quem mora perto sabe” (opcional)" className="sm:col-span-2">
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
          <div className="sm:col-span-2">
            <Toggle checked={form.featured} onChange={() => patch({ featured: !form.featured })} label="Destacar na página inicial" />
          </div>
        </Section>

        {error && (
          <p aria-live="polite" className="font-display text-[13.5px] text-amber-700">
            {error}
          </p>
        )}

        <p className="-mt-4 font-display text-[12px] text-grafite-muted">* campo obrigatório</p>

        <div className="flex flex-wrap gap-3 border-t border-grafite/8 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="rounded-xl border border-grafite/15 px-5 py-2.5 font-display text-sm font-semibold text-grafite transition-colors hover:bg-grafite/5 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar rascunho"}
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
