# Toninho Bomnome — Corretor de Imóveis

Site (venda/aluguel de imóveis) em React + TypeScript + Tailwind, com a
identidade visual "Planta aberta" do corretor Toninho Bomnome (CRECI
247711-F, Botucatu/SP). Publicado em produção via Vercel, em
[toninho-bomnome.vercel.app](https://toninho-bomnome.vercel.app).

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).

## Como cadastrar um imóvel novo

Cadastro é feito direto pelo site, em **`/admin`** (login restrito ao
Cauan e ao corretor Toninho — sem essa conta, a tela não abre). Passo a
passo completo, em português simples, em
**[`GUIA-CORRETOR.md`](GUIA-CORRETOR.md)**.

Resumo rápido: `/admin` → **+ Novo imóvel** → preencher os campos, subir
fotos (a primeira da lista é a capa) e, opcionalmente, um vídeo →
**Publicar**. Dá pra editar, tirar/colocar em destaque e despublicar a
qualquer momento, sem precisar de deploy novo — o site lê o Firestore em
tempo real.

Arquitetura completa (Firebase Auth, funções serverless, Cloudinary,
regras de segurança) em **[`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)**.

## Documentação

| Documento | Para quem | Conteúdo |
|---|---|---|
| Este README | Quem mexe no código | Rodar o site localmente, formato de dados, deploy manual |
| [`GUIA-CORRETOR.md`](GUIA-CORRETOR.md) | Quem cadastra imóvel | Passo a passo do painel `/admin` |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Quem mantém a infra | Como tudo se conecta, decisões/trade-offs, custos, runbook de setup |

## Estrutura de dados

O tipo `Property` (`src/types.ts`) é o contrato entre as funções de
escrita (`api/properties/*.mjs`) e o frontend — os dois lados devem
concordar com esse formato.

- `src/data/agent.ts` — dados fixos do corretor (nome, CRECI, contato,
  bio). Edite manualmente quando precisar.
- `src/data/properties.ts` — só funções auxiliares (`getFeaturedProperties`,
  `getPropertyBySlug`, `getRelatedProperties`), sem dados fixos.
- `src/data/properties.json` — **fallback local**, usado pelo site só se
  o Firestore estiver inacessível no momento do carregamento. Fica vazio
  (`[]`) por padrão — os imóveis de verdade vivem no Firestore, não
  aqui. Não é mais atualizado automaticamente (isso era coisa do fluxo
  antigo via Drive) — não precisa editar à mão.
- `src/hooks/useProperties.ts` — `useProperties()` busca só os imóveis
  **publicados** (uso do site público); `useAllProperties()` busca todos,
  incluindo rascunho (uso exclusivo do painel `/admin`).
- Coleção Firestore `imoveis` — os dados reais dos imóveis. Coleção
  `_meta` — contador interno do código sequencial dos imóveis (`TB-0001`,
  `TB-0002`...), não usado pelo frontend.

A paleta/tipografia da marca ficam em `src/index.css` (`@theme` do
Tailwind v4). Os SVGs da marca (logotipo, símbolo) ficam em
`src/assets/brand/`.

## Alterando as regras de segurança do Firestore

`firestore.rules` e `firestore.indexes.json` descrevem as regras do
banco (leitura pública só do que está publicado; escrita só via Admin
SDK, a partir das funções em `api/`). Depois de editar `firestore.rules`,
publique com:

```bash
npm run deploy:rules
```

(não precisa instalar nada globalmente — usa `npx` por baixo, que baixa
a CLI do Firebase na hora.)

## Deploy manual do site (sem passar pelo painel)

```bash
npm run build
vercel --prod --yes --project toninho-bomnome
```

Só é necessário quando o **código** do site muda — publicar um imóvel
novo não exige deploy (ver `docs/ARQUITETURA.md`).
