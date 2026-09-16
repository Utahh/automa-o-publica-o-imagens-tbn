import { agent } from "../data/agent";
import type { Launch } from "../data/launches";

/** Campos da ficha de cadastro — mesma ordem da ficha impressa da construtora. */
export interface LaunchFormValues {
  nome: string;
  cpf: string;
  rg: string;
  orgao: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  telefone: string;
  celular: string;
  comercial: string;
  email: string;
  obs: string;
  p0e: string;
  p0p: string;
  p0s: string;
  p1e: string;
  p1p: string;
  p1s: string;
  p2e: string;
  p2p: string;
  p2s: string;
}

export const emptyLaunchFormValues: LaunchFormValues = {
  nome: "",
  cpf: "",
  rg: "",
  orgao: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  cep: "",
  telefone: "",
  celular: "",
  comercial: "",
  email: "",
  obs: "",
  p0e: "",
  p0p: "",
  p0s: "",
  p1e: "",
  p1p: "",
  p1s: "",
  p2e: "",
  p2p: "",
  p2s: "",
};

const dadosClientePares: [string, keyof LaunchFormValues][] = [
  ["Nome", "nome"],
  ["CPF/CNPJ", "cpf"],
  ["RG", "rg"],
  ["Órgão Expedidor", "orgao"],
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

/** Linhas [entrada, parcelas, semestrais] da tabela de sugestão de pagamento. */
export function pagamentoLinhas(v: LaunchFormValues): [string, string, string][] {
  return ([0, 1, 2] as const).map((i) => [
    v[`p${i}e` as keyof LaunchFormValues],
    v[`p${i}p` as keyof LaunchFormValues],
    v[`p${i}s` as keyof LaunchFormValues],
  ]);
}

/** Monta a mensagem que o corretor recebe no WhatsApp — campos vazios não entram. */
export function buildLaunchMessage(launch: Launch, v: LaunchFormValues, dataAceite: string): string {
  const linhas: string[] = [];
  linhas.push(`*FICHA DE CADASTRO DO LANÇAMENTO ${launch.builderName.toUpperCase()}*`);
  linhas.push("");
  linhas.push(`*${agent.name} · ${agent.role}*`);
  linhas.push(`${agent.creci} · ${agent.phone}`);
  linhas.push("");
  linhas.push("*DADOS DO CLIENTE*");
  dadosClientePares.forEach(([rotulo, chave]) => {
    const valor = v[chave].trim();
    if (valor) linhas.push(`${rotulo}: ${valor}`);
  });

  const pagamento = pagamentoLinhas(v).filter((linha) => linha.some((campo) => campo.trim()));
  if (pagamento.length > 0) {
    linhas.push("");
    linhas.push("*SUGESTÃO DE PAGAMENTO*");
    pagamento.forEach(([entrada, parcelas, semestrais]) => {
      linhas.push(
        `• Entrada: ${entrada.trim() || "não informado"} | Parcelas: ${parcelas.trim() || "não informado"} | Semestrais: ${semestrais.trim() || "não informado"}`,
      );
    });
  }

  if (v.obs.trim()) {
    linhas.push("");
    linhas.push("*OBSERVAÇÕES*");
    linhas.push(v.obs.trim());
  }

  linhas.push("");
  linhas.push(`_Consentimento LGPD aceito pelo cliente em ${dataAceite}._`);

  return linhas.join("\n");
}

export function buildLaunchWhatsappLink(launch: Launch, message: string): string {
  const numero = launch.whatsappNumber ?? agent.whatsappNumber;
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}
