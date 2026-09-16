import { agent } from "../../data/agent";
import type { Launch } from "../../data/launches";
import { pagamentoLinhas, type LaunchFormValues } from "../../lib/launchMessage";

const linhasFichaConfig: [string, keyof LaunchFormValues][] = [
  ["Nome", "nome"],
  ["CPF / CNPJ", "cpf"],
  ["RG", "rg"],
  ["Órgão expedidor", "orgao"],
  ["Endereço", "endereco"],
  ["Nº", "numero"],
  ["Bairro", "bairro"],
  ["Cidade", "cidade"],
  ["CEP", "cep"],
  ["Telefone", "telefone"],
  ["Celular", "celular"],
  ["Comercial", "comercial"],
  ["E-mail", "email"],
];

interface LaunchConfirmationProps {
  launch: Launch;
  values: LaunchFormValues;
  dataAceite: string;
  onCorrigir: () => void;
}

export function LaunchConfirmation({ launch, values, dataAceite, onCorrigir }: LaunchConfirmationProps) {
  const numero = launch.whatsappNumber ?? agent.whatsappNumber;

  return (
    <div className="px-5 py-9 sm:px-6">
      <div className="mx-auto mb-5 flex max-w-3xl flex-wrap items-center gap-4 bg-[var(--launch-primary)] px-6 py-5 text-white print:hidden">
        <div>
          <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--launch-accent)]">
            Enviado ao corretor
          </p>
          <p className="text-[13.5px] leading-relaxed">
            A ficha abaixo foi entregue no WhatsApp de {agent.name} com os seus dados.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-white/30 px-5 py-3 font-display text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/10"
          >
            Imprimir / PDF
          </button>
          <button
            type="button"
            onClick={onCorrigir}
            className="bg-[var(--launch-accent)] px-5 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--launch-primary)] transition-colors hover:brightness-105"
          >
            Corrigir dados
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl border border-[var(--launch-cream)] bg-white p-9 shadow-[0_30px_70px_-40px_rgba(2,29,59,0.4)]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-grafite-muted">
              Ficha de cadastro
            </p>
            <h1 className="font-launch-serif text-[30px] font-semibold tracking-wide text-[var(--launch-primary)]">
              LANÇAMENTO
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--launch-accent-dark)]">{launch.builderName}</p>
          </div>
          <img src={launch.logo} alt={launch.builderName} className="h-[52px] w-auto object-contain" />
        </div>

        <div className="bg-[var(--launch-primary)] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-white">
          Dados do cliente
        </div>
        <div className="grid grid-cols-12 gap-x-5 pb-1 pt-6">
          {linhasFichaConfig.map(([rotulo, chave]) => (
            <div
              key={chave}
              className="col-span-12 flex items-baseline gap-2.5 border-b border-[var(--launch-primary)] px-0.5 py-2.5"
            >
              <span className="w-[132px] shrink-0 text-xs text-grafite-muted">{rotulo}</span>
              <span className="min-w-0 flex-1 break-words font-medium text-[var(--launch-primary)]">
                {values[chave].trim() || "não informado"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 bg-[#dbe7f5] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-[var(--launch-primary)]">
          Sugestão de pagamento
        </div>
        <div className="mt-5 grid grid-cols-3 border border-[var(--launch-primary)]">
          <div className="border-b border-r border-[var(--launch-primary)] py-2.5 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
            Entrada
          </div>
          <div className="border-b border-r border-[var(--launch-primary)] py-2.5 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
            Parcelas
          </div>
          <div className="border-b border-[var(--launch-primary)] py-2.5 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
            Semestrais
          </div>
          {pagamentoLinhas(values).map(([entrada, parcelas, semestrais], i) => (
            <div key={i} className="col-span-3 grid grid-cols-3 border-b border-[var(--launch-primary)] last:border-b-0">
              <div className="border-r border-[var(--launch-primary)] py-3.5 text-center text-sm">{entrada.trim() || " "}</div>
              <div className="border-r border-[var(--launch-primary)] py-3.5 text-center text-sm">{parcelas.trim() || " "}</div>
              <div className="py-3.5 text-center text-sm">{semestrais.trim() || " "}</div>
            </div>
          ))}
        </div>

        <div className="mt-7 bg-[#dbe7f5] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-[var(--launch-primary)]">
          Observações
        </div>
        <p className="mt-6 min-h-[70px] border-b border-[var(--launch-primary)] pb-2.5 text-sm leading-relaxed text-[var(--launch-primary)]">
          {values.obs.trim() || "Sem observações."}
        </p>

        <div className="mt-7 border-l-4 border-[var(--launch-accent)] bg-[var(--launch-cream)] px-5 py-4">
          <p className="text-xs leading-relaxed text-grafite-muted">
            Consentimento LGPD aceito pelo cliente em {dataAceite}. Autorização para tratamento dos dados com
            finalidade de atendimento comercial do lançamento {launch.builderName} (Lei nº 13.709/2018).
          </p>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-4 border-t-2 border-[var(--launch-primary)] pt-5">
          <div>
            <p className="text-[12.5px] font-semibold text-[var(--launch-primary)]">
              {agent.name} · {agent.role}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-grafite-muted">
              {agent.phone} · wa.me/{numero}
            </p>
          </div>
          <p className="font-mono text-[11px] text-grafite-muted">{agent.creci}</p>
        </div>
      </div>
    </div>
  );
}
