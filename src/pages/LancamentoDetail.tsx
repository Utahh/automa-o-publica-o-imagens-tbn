import { useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { LaunchForm } from "../components/launch/LaunchForm";
import { LaunchConfirmation } from "../components/launch/LaunchConfirmation";
import { getLaunchBySlug } from "../data/launches";
import {
  buildLaunchMessage,
  buildLaunchWhatsappLink,
  emptyLaunchFormValues,
  type LaunchFormValues,
} from "../lib/launchMessage";

type View = "pagina" | "form" | "confirmacao";

export function LancamentoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const launch = slug ? getLaunchBySlug(slug) : undefined;

  const [view, setView] = useState<View>("pagina");
  const [values, setValues] = useState<LaunchFormValues>(emptyLaunchFormValues);
  const [aceito, setAceito] = useState(false);
  const [dataAceite, setDataAceite] = useState("");

  if (!launch) return <Navigate to="/lancamentos" replace />;

  const paletteVars = {
    "--launch-primary": launch.palette.primary,
    "--launch-primary-light": launch.palette.primaryLight,
    "--launch-accent": launch.palette.accent,
    "--launch-accent-dark": launch.palette.accentDark,
    "--launch-cream": launch.palette.cream,
  } as CSSProperties;

  function handleFieldChange(name: keyof LaunchFormValues, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleToggleAceite(checked: boolean) {
    setAceito(checked);
    setDataAceite(checked ? new Date().toLocaleString("pt-BR") : "");
  }

  function handleConfirmar() {
    if (!aceito || !launch) return;
    const aceiteEm = dataAceite || new Date().toLocaleString("pt-BR");
    const mensagem = buildLaunchMessage(launch, values, aceiteEm);
    setView("confirmacao");
    window.scrollTo(0, 0);
    window.open(buildLaunchWhatsappLink(launch, mensagem), "_blank", "noreferrer");
  }

  return (
    <div style={paletteVars} className="font-launch-body min-h-screen">
      {view === "form" && (
        <div style={{ background: launch.palette.cream }}>
          <LaunchForm
            launch={launch}
            values={values}
            onChange={handleFieldChange}
            aceito={aceito}
            onToggleAceite={handleToggleAceite}
            onSubmit={handleConfirmar}
            onVoltar={() => setView("pagina")}
          />
        </div>
      )}

      {view === "confirmacao" && (
        <div style={{ background: launch.palette.cream }}>
          <LaunchConfirmation
            launch={launch}
            values={values}
            dataAceite={dataAceite}
            onCorrigir={() => setView("form")}
          />
        </div>
      )}

      {view === "pagina" && (
        <>
          {/* Capa */}
          <div style={{ background: launch.palette.primary }} className="pt-9">
            <div className="mx-auto max-w-5xl px-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-4 border-b border-white/15 pb-7">
                <Link
                  to="/lancamentos"
                  className="ml-auto flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.3} aria-hidden="true" />
                  Lançamentos
                </Link>
              </div>

              <Reveal className="grid grid-cols-1 items-center gap-10 py-14 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-3">
                    <img src={launch.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
                    <span
                      style={{ background: launch.palette.accent, color: launch.palette.primary }}
                      className="inline-block px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.3em]"
                    >
                      Lançamento
                    </span>
                  </div>
                  <h1 className="font-launch-serif mt-6 text-[2.6rem] font-semibold leading-none text-white sm:text-6xl">
                    {launch.name}
                  </h1>
                  <p style={{ color: launch.palette.accent }} className="mt-2 font-mono text-xs tracking-[0.5em]">
                    {launch.suffix}
                  </p>
                  {launch.taglineLines.map((line, i) => (
                    <p
                      key={line}
                      style={i === launch.taglineLines.length - 1 ? { color: launch.palette.accent } : undefined}
                      className={`font-launch-serif mt-2 text-xl font-medium text-white sm:text-2xl ${
                        i === launch.taglineLines.length - 1 ? "italic" : ""
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setView("form");
                      window.scrollTo(0, 0);
                    }}
                    style={{ background: launch.palette.accent, color: launch.palette.primary }}
                    className="mt-9 px-9 py-4 font-display text-[13px] font-bold uppercase tracking-[0.2em] transition-[filter] hover:brightness-105"
                  >
                    Tenho interesse
                  </button>
                </div>
                <img
                  src={launch.art}
                  alt={`Arte de divulgação do lançamento ${launch.builderName}`}
                  className="mx-auto h-[280px] w-auto object-contain sm:mx-0 sm:h-[380px]"
                />
              </Reveal>
            </div>
          </div>

          {/* Ficha técnica */}
          <div className="border-b border-grafite/10 bg-white py-12">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-grafite/10 px-6 sm:grid-cols-3 sm:px-8">
              {launch.features.map((f) => (
                <div key={f.titulo} className="bg-white px-6 py-6">
                  <p style={{ color: launch.palette.accentDark }} className="font-launch-serif text-[26px] font-semibold">
                    {f.valor}
                  </p>
                  <p style={{ color: launch.palette.primary }} className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                    {f.titulo}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-grafite-muted">{f.nota}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sobre + tipologias/local */}
          <div style={{ background: launch.palette.cream }} className="py-16">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-2">
              <Reveal>
                <p style={{ color: launch.palette.accentDark }} className="font-mono text-[11px] uppercase tracking-[0.3em]">
                  O empreendimento
                </p>
                <h2
                  style={{ color: launch.palette.primary }}
                  className="font-launch-serif mt-5 text-balance text-[1.7rem] font-semibold leading-tight sm:text-[2rem]"
                >
                  Um lugar pensado para o dia a dia da sua família.
                </h2>
                {launch.descriptionParagraphs.map((p) => (
                  <p key={p} className="mt-4 text-[14.5px] leading-[1.85] text-grafite">
                    {p}
                  </p>
                ))}
              </Reveal>

              <Reveal delay={0.08}>
                <div style={{ background: launch.palette.primary }} className="p-8 text-white">
                  <p style={{ color: launch.palette.accent }} className="font-mono text-[11px] uppercase tracking-[0.3em]">
                    Tipologias
                  </p>
                  {launch.tipologias.map((t) => (
                    <div key={t.nome} className="mt-5 border-t border-white/15 py-4">
                      <p className="font-launch-serif text-[22px]">{t.nome}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/80">{t.detalhe}</p>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-white/15 pt-5">
                    <p style={{ color: launch.palette.accent }} className="text-xs font-semibold uppercase tracking-[0.14em]">
                      Local
                    </p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-white/90">{launch.locationText}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* CTA final */}
          <div style={{ background: launch.palette.primary }} className="py-16">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-7 px-6 sm:px-8">
              <div>
                <h2 className="font-launch-serif text-[1.7rem] font-semibold text-white sm:text-[2rem]">
                  Quer garantir a sua unidade?
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                  Preencha a ficha de cadastro do lançamento e o corretor recebe seus dados na hora pelo WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setView("form");
                  window.scrollTo(0, 0);
                }}
                style={{ background: launch.palette.accent, color: launch.palette.primary }}
                className="px-10 py-5 font-display text-[13px] font-bold uppercase tracking-[0.2em] transition-[filter] hover:brightness-105"
              >
                Tenho interesse
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
