import type { Launch } from "../../data/launches";
import type { LaunchFormValues } from "../../lib/launchMessage";

/** Larguras usadas nos campos da ficha — Tailwind precisa das classes
 *  completas e literais aqui pra não sumirem no build (não dá pra montar
 *  "sm:col-span-" + n em runtime e esperar que funcione). */
const spanClasses: Record<number, string> = {
  3: "col-span-12 sm:col-span-3",
  4: "col-span-12 sm:col-span-4",
  5: "col-span-12 sm:col-span-5",
  9: "col-span-12 sm:col-span-9",
  12: "col-span-12",
};

interface FieldProps {
  label: string;
  name: keyof LaunchFormValues;
  span: 3 | 4 | 5 | 9 | 12;
  values: LaunchFormValues;
  onChange: (name: keyof LaunchFormValues, value: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({ label, name, span, values, onChange, placeholder, type = "text" }: FieldProps) {
  return (
    <label className={`block ${spanClasses[span]}`}>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-grafite-muted">
        {label}
      </span>
      <input
        type={type}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 border-b border-[var(--launch-primary)]/40 bg-transparent px-0.5 py-2.5 font-display text-[15px] text-[var(--launch-primary)] outline-none placeholder:text-grafite-muted/50 focus:border-[var(--launch-accent)]"
      />
    </label>
  );
}

interface PaymentInputProps {
  name: keyof LaunchFormValues;
  values: LaunchFormValues;
  onChange: (name: keyof LaunchFormValues, value: string) => void;
  placeholder?: string;
  border: string;
}

function PaymentInput({ name, values, onChange, placeholder, border }: PaymentInputProps) {
  return (
    <input
      value={values[name]}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className={`min-w-0 bg-transparent px-3 py-3.5 text-center font-display text-sm text-[var(--launch-primary)] outline-none focus:bg-[var(--launch-cream)] ${border}`}
    />
  );
}

interface LaunchFormProps {
  launch: Launch;
  values: LaunchFormValues;
  onChange: (name: keyof LaunchFormValues, value: string) => void;
  aceito: boolean;
  onToggleAceite: (checked: boolean) => void;
  onSubmit: () => void;
  onVoltar: () => void;
}

export function LaunchForm({ launch, values, onChange, aceito, onToggleAceite, onSubmit, onVoltar }: LaunchFormProps) {
  return (
    <div className="px-5 py-11 sm:px-6">
      <div className="mx-auto max-w-3xl border border-[var(--launch-cream)] bg-white shadow-[0_30px_70px_-40px_rgba(2,29,59,0.4)]">
        <div className="flex flex-wrap items-start justify-between gap-5 px-6 pb-6 pt-9 sm:px-10">
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-grafite-muted">
              Ficha de cadastro
            </p>
            <h1 className="font-launch-serif text-[32px] font-semibold tracking-wide text-[var(--launch-primary)]">
              LANÇAMENTO
            </h1>
            <p className="mt-1.5 text-[13px] text-[var(--launch-accent-dark)]">{launch.builderName}</p>
          </div>
          <img src={launch.logo} alt={launch.builderName} className="h-[52px] w-auto object-contain" />
        </div>

        <div className="px-6 pb-9 sm:px-10">
          <div className="bg-[var(--launch-primary)] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-white">
            Dados do cliente
          </div>

          <div className="grid grid-cols-12 gap-4 pb-1.5 pt-6">
            <Field label="Nome" name="nome" span={12} values={values} onChange={onChange} placeholder="Nome completo" />
            <Field label="CPF / CNPJ" name="cpf" span={5} values={values} onChange={onChange} placeholder="000.000.000-00" />
            <Field label="RG" name="rg" span={3} values={values} onChange={onChange} />
            <Field label="Órgão expedidor" name="orgao" span={4} values={values} onChange={onChange} />
            <Field label="Endereço" name="endereco" span={9} values={values} onChange={onChange} />
            <Field label="Nº" name="numero" span={3} values={values} onChange={onChange} />
            <Field label="Bairro" name="bairro" span={4} values={values} onChange={onChange} />
            <Field label="Cidade" name="cidade" span={5} values={values} onChange={onChange} />
            <Field label="CEP" name="cep" span={3} values={values} onChange={onChange} />
            <Field label="Telefone" name="telefone" span={4} values={values} onChange={onChange} />
            <Field label="Celular" name="celular" span={4} values={values} onChange={onChange} placeholder="(14) 90000-0000" />
            <Field label="Comercial" name="comercial" span={4} values={values} onChange={onChange} />
            <Field label="E-mail" name="email" span={12} values={values} onChange={onChange} placeholder="seu@email.com" type="email" />
          </div>

          <div className="mt-8 bg-[#dbe7f5] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-[var(--launch-primary)]">
            Sugestão de pagamento
          </div>
          <div className="mt-6 grid grid-cols-3 border border-[var(--launch-primary)]">
            <div className="border-b border-r border-[var(--launch-primary)] py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
              Entrada
            </div>
            <div className="border-b border-r border-[var(--launch-primary)] py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
              Parcelas
            </div>
            <div className="border-b border-[var(--launch-primary)] py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-[var(--launch-primary)]">
              Semestrais
            </div>
            <PaymentInput name="p0e" values={values} onChange={onChange} placeholder="R$" border="border-b border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p0p" values={values} onChange={onChange} placeholder="qtde x R$" border="border-b border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p0s" values={values} onChange={onChange} placeholder="qtde x R$" border="border-b border-[var(--launch-primary)]" />
            <PaymentInput name="p1e" values={values} onChange={onChange} border="border-b border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p1p" values={values} onChange={onChange} border="border-b border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p1s" values={values} onChange={onChange} border="border-b border-[var(--launch-primary)]" />
            <PaymentInput name="p2e" values={values} onChange={onChange} border="border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p2p" values={values} onChange={onChange} border="border-r border-[var(--launch-primary)]" />
            <PaymentInput name="p2s" values={values} onChange={onChange} border="" />
          </div>

          <div className="mt-8 bg-[#dbe7f5] py-2.5 text-center font-mono text-xs uppercase tracking-[0.3em] text-[var(--launch-primary)]">
            Observações
          </div>
          <textarea
            value={values.obs}
            onChange={(e) => onChange("obs", e.target.value)}
            placeholder="Preferência de torre, andar, prazo, forma de pagamento…"
            className="mt-6 min-h-[120px] w-full resize-y border border-[var(--launch-cream)] bg-[var(--launch-cream)] p-4 font-display text-sm leading-relaxed text-[var(--launch-primary)] outline-none focus:border-[var(--launch-accent)]"
          />

          <div className="mt-8 border border-[var(--launch-cream)] bg-[var(--launch-cream)] p-6">
            <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-[var(--launch-accent-dark)]">
              Termo de consentimento — LGPD
            </p>
            <p className="mb-4 text-[12.5px] leading-relaxed text-grafite-muted">
              Ao confirmar, autorizo o corretor e a {launch.builderName} a tratar os dados pessoais informados nesta
              ficha com a finalidade exclusiva de atendimento comercial e análise de crédito referentes ao
              lançamento {launch.builderName}, nos termos da Lei nº 13.709/2018 (LGPD). Os dados serão
              compartilhados apenas com o corretor responsável e a construtora, e podem ser corrigidos ou excluídos
              a qualquer momento por solicitação ao corretor.
            </p>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={aceito}
                onChange={(e) => onToggleAceite(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--launch-primary)]"
              />
              <span className="text-[13px] font-medium leading-relaxed text-[var(--launch-primary)]">
                Li e concordo com o termo de consentimento e autorizo o envio dos meus dados ao corretor.
              </span>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[var(--launch-cream)] pt-7">
            {aceito ? (
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-none bg-[var(--launch-primary)] px-9 py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--launch-primary-light)]"
              >
                Confirmar e enviar
              </button>
            ) : (
              <span className="cursor-not-allowed bg-grafite/10 px-9 py-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-grafite-muted">
                Confirmar e enviar
              </span>
            )}
            <button
              type="button"
              onClick={onVoltar}
              className="border border-[var(--launch-cream)] px-6 py-4 font-display text-[11px] uppercase tracking-[0.15em] text-grafite-muted transition-colors hover:border-[var(--launch-primary)] hover:text-[var(--launch-primary)]"
            >
              Voltar
            </button>
            <span className="font-display text-xs text-grafite-muted/70">
              {aceito ? "Vai para o corretor pelo WhatsApp" : "Marque o termo de consentimento para liberar o envio."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
