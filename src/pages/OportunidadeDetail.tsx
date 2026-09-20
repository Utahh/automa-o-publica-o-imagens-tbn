import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { agent, buildWhatsappLink } from "../data/agent";
import { getOpportunityBySlug, type OpportunityPhoto } from "../data/opportunities";
import simboloNegativo from "../assets/brand/simbolo-negativo.svg";
import { useSeo } from "../hooks/useSeo";
import { useLaunchFonts } from "../hooks/useLaunchFonts";

const SLIDE_INTERVAL_MS = 4200;

export function OportunidadeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const opportunity = slug ? getOpportunityBySlug(slug) : undefined;
  useLaunchFonts();
  useSeo({
    title: opportunity ? `${opportunity.name} ${opportunity.suffix}`.trim() : undefined,
    description: opportunity?.shortDescription,
  });

  const [slide, setSlide] = useState(0);
  const [opened, setOpened] = useState<OpportunityPhoto | null>(null);

  const coverCount = opportunity?.cover.length ?? 0;

  useEffect(() => {
    if (coverCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % coverCount), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [coverCount]);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpened(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened]);

  if (!opportunity || !opportunity.active) return <Navigate to="/oportunidades" replace />;

  const { palette } = opportunity;
  const whatsappHref = buildWhatsappLink(opportunity.whatsappMessage);

  function renderGallery(photos: OpportunityPhoto[]) {
    return (
      <div className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {photos.map((photo) => (
          <button
            key={photo.label}
            type="button"
            onClick={() => setOpened(photo)}
            className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-areia outline-0 outline-offset-2 hover:outline-2"
            style={{ outlineColor: palette.accent }}
          >
            <img
              src={photo.src}
              alt={photo.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span
              className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-7 text-left font-mono text-xs tracking-[0.16em] text-white"
              style={{ background: `linear-gradient(180deg, transparent 0%, ${palette.primary}d9 100%)` }}
            >
              {photo.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="font-launch-body min-h-screen">
      {/* Capa */}
      <div style={{ background: palette.primary }} className="pt-24">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-4 border-b border-white/15 pb-7">
            {opportunity.logo && <img src={opportunity.logo} alt={opportunity.name} className="h-[26px] w-auto" />}
            <Link
              to="/oportunidades"
              className="ml-auto flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.3} aria-hidden="true" />
              Oportunidades
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2">
            <div className="min-w-0">
              <span
                style={{ background: palette.accent, color: palette.primary }}
                className="inline-block px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.3em]"
              >
                {opportunity.badgeLabel}
              </span>
              <h1 className="font-launch-serif mt-6 text-[2.6rem] font-semibold leading-none text-white sm:text-6xl">
                {opportunity.name.replace(/^Edifício\s+/, "")}
              </h1>
              <p style={{ color: palette.accent }} className="mt-2 font-mono text-xs tracking-[0.5em]">
                {opportunity.suffix}
              </p>
              {opportunity.taglineLines.map((line, i) => (
                <p
                  key={line}
                  style={i === opportunity.taglineLines.length - 1 ? { color: palette.accent } : undefined}
                  className={`font-launch-serif mt-2 text-xl font-medium text-white sm:text-2xl ${
                    i === opportunity.taglineLines.length - 1 ? "italic" : ""
                  } ${i === 0 ? "mt-5" : ""}`}
                >
                  {line}
                </p>
              ))}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                style={{ background: palette.accent, color: palette.primary }}
                className="mt-9 inline-block px-9 py-4 font-display text-[13px] font-bold uppercase tracking-[0.2em] transition-[filter] hover:brightness-105"
              >
                Tenho interesse
              </a>
            </div>

            <div className="relative h-[280px] w-full overflow-hidden bg-grafite-noite sm:h-[380px]">
              {opportunity.cover.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden={i !== slide}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out"
                  style={{ objectPosition: "50% 45%", opacity: i === slide ? 1 : 0 }}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Ficha técnica */}
      <div className="border-b border-grafite/10 bg-white py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-grafite/10 px-6 sm:grid-cols-3 sm:px-8">
          {opportunity.features.map((f) => (
            <div key={f.titulo} className="bg-white px-6 py-6">
              <p style={{ color: palette.accentDark }} className="font-launch-serif text-[26px] font-semibold">
                {f.valor}
              </p>
              <p style={{ color: palette.primary }} className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                {f.titulo}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-grafite-muted">{f.nota}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sobre + tipologias/local */}
      <div style={{ background: palette.cream }} className="py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <p style={{ color: palette.accentDark }} className="font-mono text-xs uppercase tracking-[0.3em]">
              O empreendimento
            </p>
            <h2
              style={{ color: palette.primary }}
              className="font-launch-serif mt-5 text-balance text-[1.7rem] font-semibold leading-tight sm:text-[2rem]"
            >
              {opportunity.descriptionHeading}
            </h2>
            {opportunity.descriptionParagraphs.map((p) => (
              <p key={p} className="mt-4 text-[14.5px] leading-[1.85] text-grafite">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.08}>
            <div style={{ background: palette.primary }} className="p-8 text-white">
              <p style={{ color: palette.accent }} className="font-mono text-xs uppercase tracking-[0.3em]">
                Tipologias
              </p>
              {opportunity.tipologias.map((t) => (
                <div key={t.nome} className="mt-5 border-t border-white/15 py-4">
                  <p className="font-launch-serif text-[22px]">{t.nome}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/80">{t.detalhe}</p>
                </div>
              ))}
              <div className="mt-2 border-t border-white/15 pt-5">
                <p style={{ color: palette.accent }} className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Local
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/90">{opportunity.locationText}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Galeria: áreas comuns */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p style={{ color: palette.accentDark }} className="font-mono text-xs uppercase tracking-[0.3em]">
                Áreas comuns
              </p>
              <h2
                style={{ color: palette.primary }}
                className="font-launch-serif mt-4 text-[1.5rem] font-semibold sm:text-[1.85rem]"
              >
                Um clube dentro de casa
              </h2>
            </div>
            <span className="font-mono text-xs tracking-[0.12em] text-grafite-muted">CLIQUE PARA AMPLIAR</span>
          </div>
          {renderGallery(opportunity.commonAreas)}
        </div>
      </div>

      {/* Galeria: apartamento */}
      <div style={{ background: palette.cream }} className="py-16">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <p style={{ color: palette.accentDark }} className="font-mono text-xs uppercase tracking-[0.3em]">
            Unidade
          </p>
          <h2
            style={{ color: palette.primary }}
            className="font-launch-serif mt-4 text-[1.5rem] font-semibold sm:text-[1.85rem]"
          >
            Por dentro do apartamento
          </h2>
          {renderGallery(opportunity.unitPhotos)}
        </div>
      </div>

      {/* CTA final */}
      <div style={{ background: palette.primary }} className="py-16">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-7 px-6 sm:px-8">
          <div>
            <h2 className="font-launch-serif text-[1.7rem] font-semibold text-white sm:text-[2rem]">
              Quer garantir a sua unidade?
            </h2>
            <p className="mt-2.5 max-w-[30rem] text-sm leading-[1.7] text-white/80">{opportunity.ctaText}</p>
            <div className="mt-5 flex items-center gap-3.5">
              <img src={simboloNegativo} alt="" className="w-[42px]" />
              <div>
                <p className="text-sm font-semibold text-white">{agent.name}</p>
                <p className="mt-0.5 font-mono text-xs tracking-[0.14em] text-white/70">
                  {agent.creci} · {agent.phone}
                </p>
              </div>
            </div>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            style={{ background: palette.accent, color: palette.primary }}
            className="px-10 py-5 font-display text-[13px] font-bold uppercase tracking-[0.2em] transition-[filter] hover:brightness-105"
          >
            Tenho interesse
          </a>
        </div>
      </div>

      {opened && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={opened.label}
          onClick={() => setOpened(null)}
          className="fixed inset-0 z-[90] flex cursor-zoom-out flex-col items-center justify-center gap-4 bg-grafite-noite/95 p-6"
        >
          <img src={opened.src} alt={opened.label} className="max-h-[80vh] max-w-[94vw] object-contain" />
          <span className="font-mono text-xs tracking-[0.2em] text-white/80">{opened.label}</span>
        </div>
      )}
    </div>
  );
}
