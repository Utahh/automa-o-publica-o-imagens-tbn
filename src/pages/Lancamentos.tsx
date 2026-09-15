import { Reveal } from "../components/Reveal";
import { LaunchCard } from "../components/launch/LaunchCard";
import { launches } from "../data/launches";

export function Lancamentos() {
  const ativos = launches.filter((l) => l.status === "lancamento");

  return (
    <div className="min-h-screen bg-grafite-noite pb-20 pt-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-azul-sinal">
            Toninho Bomnome
          </p>
          <h1 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-cinza-papel sm:text-4xl">
            Lançamentos
          </h1>
          <p className="mt-3 max-w-2xl font-display text-sm leading-relaxed text-papel-muted sm:text-[15px]">
            Os empreendimentos que estamos lançando agora, com dados completos e atendimento direto com o corretor.
          </p>
        </Reveal>

        {ativos.length > 0 ? (
          <div className="mt-10 grid gap-5">
            {ativos.map((launch, i) => (
              <LaunchCard key={launch.slug} launch={launch} index={i} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-display text-lg font-semibold text-cinza-papel">Nenhum lançamento no momento.</p>
            <p className="font-display text-sm text-papel-muted">Fale com o corretor para saber dos próximos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
