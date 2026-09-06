# Arquitetura — TBN Imóveis

Este documento explica **como o sistema funciona por trás**, as decisões
tomadas e **o passo a passo de setup** que só você consegue fazer (contas
Firebase/Cloudinary/Vercel). Depois de configurado uma vez, o dia a dia é
só o `GUIA-CORRETOR.md`.

> **Nota histórica**: até setembro de 2026, o cadastro era feito
> organizando pastas no Google Drive, lidas por um robô (GitHub Actions)
> a cada 5 minutos. Esse fluxo foi **desativado e removido** — sem tela,
> sem validação amigável, sem jeito de editar "Destaque" sem reprocessar
> tudo. Se precisar consultar como funcionava, o código e os docs
> antigos continuam no histórico do Git (`git log --all -- scripts/sync-drive.mjs`).

## Visão geral

```
 Navegador (painel /admin)
   │
   ├─ upload de foto/vídeo ──────────────▶ Cloudinary (unsigned upload preset)
   │                                        já devolve a URL otimizada
   │
   └─ criar/editar/excluir imóvel ───────▶ Vercel Functions (api/properties/*)
                                             confere o login (Firebase Auth)
                                             grava no Firestore (Admin SDK)
                                                   │
                                                   ▼
                                             Firestore (dados dos imóveis)
                                                   │
                                                   ▼
                                             Site (React) lê ao vivo
```

- **Autenticação**: Firebase Auth, só duas contas — Cauan e o corretor
  Toninho —, cada uma podendo entrar com e-mail/senha ou com a conta do
  Google. É o mesmo Firebase que já hospeda o Firestore, sem custo
  adicional. Como o provedor do Google aceita **qualquer** conta do
  Google (não só as duas autorizadas), quem realmente marca "essa conta
  pode usar o painel" é uma *custom claim* (`admin: true`), concedida
  uma vez via `npm run set-admin-claims` (ver Setup) — sem ela, a pessoa
  até consegue autenticar, mas não enxerga nada além da tela de login.
- **Escrita**: as regras do Firestore negam escrita de **qualquer**
  cliente (`allow write: if false` em `firestore.rules`) — só o Admin
  SDK grava, e só as funções em `api/properties/` usam o Admin SDK. Cada
  função confere o token do Firebase Auth de quem chamou e recusa quem
  não estiver na lista `ALLOWED_ADMIN_EMAILS` (ver `api/_lib/auth.mjs`).
  Essa checagem de e-mail — não a tela de login — é o limite de
  segurança real, e não depende da custom claim (funciona mesmo se
  alguém esquecer de rodar `set-admin-claims`).
- **Leitura**: pública pra quem está `published: true`; um rascunho só é
  lido por quem tem a custom claim `admin: true`
  (`request.auth.token.admin == true`) — protege imóvel incompleto/com
  preço não decidido de aparecer numa consulta direta ao Firestore por
  alguém de fora, inclusive por qualquer conta aleatória do Google que
  só passou pela tela de login.
- **Fotos e vídeo**: o navegador sobe **direto pro Cloudinary**, sem
  passar pelo servidor — usando um *upload preset unsigned* (configurado
  uma vez no Dashboard do Cloudinary, ver Setup abaixo) que já limita
  resolução/qualidade na entrada. Isso evita o limite de tamanho de
  payload das funções serverless e elimina a necessidade de converter
  imagem no servidor (não tem mais `sharp` no projeto).
- **Código do imóvel**: um contador atômico (`_meta/counters`, incrementado
  numa transação do Firestore) gera `TB-0001`, `TB-0002`... na criação —
  evita corrida entre os dois usuários cadastrando ao mesmo tempo.
- **Exclusão**: ao excluir um imóvel, a função também apaga as fotos e o
  vídeo dele no Cloudinary (a partir das URLs salvas no próprio doc, não
  de um nome de pasta) — evita lixo consumindo a cota grátis.
- **Site**: continua lendo o Firestore **ao vivo**
  (`useProperties()`/`useAllProperties()` em `src/hooks/useProperties.ts`)
  — publicar/editar um imóvel não exige novo deploy no Vercel, só quando
  o **código** do site muda.

## Por que essas escolhas (trade-offs)

| Decisão | Por quê |
|---|---|
| **Vercel Functions** em vez de Firebase Cloud Functions | Cloud Functions (2ª geração) também exigem o plano pago Blaze. Vercel Functions rodam no plano Hobby (grátis) sem cartão, e o projeto já está hospedado lá. |
| **Upload direto do navegador pro Cloudinary** em vez de rotear pela função serverless | Evita o limite de tamanho de payload das funções e dispensa reimplementar no servidor o que o preset do Cloudinary já faz na entrada (limitar largura, `quality:auto`, `format:auto`). A API secret nunca sai do servidor — só o `cloud_name` e o nome do preset aparecem no cliente, e isso não é segredo (é assim que upload unsigned sempre funciona). |
| **Regras do Firestore continuam `write: if false`** | Preserva a decisão de segurança já existente (só Admin SDK escreve) em vez de afrouxar pra "qualquer usuário autenticado" — a superfície de ataque fica menor: mesmo que alguém descubra um jeito de se autenticar, ainda precisa estar na lista `ALLOWED_ADMIN_EMAILS` checada no servidor. |
| **Rascunho vira invisível pra quem não tem a custom claim de admin** | Antes, toda a coleção era de leitura pública — aceitável quando só existia "publicado", mas um rascunho não deveria vazar numa consulta direta ao Firestore. Checar só `request.auth != null` deixaria de proteger isso assim que o login por Google foi liberado (qualquer conta do Google autentica) — por isso a claim. |
| **Login por Google além de e-mail/senha** | Pedido explícito: menos fricção pro corretor (não precisa lembrar mais uma senha). O trade-off é que o provedor do Google não tem como restringir "só estas 2 contas" no próprio Firebase (não é um domínio corporativo comum) — resolvido com a custom claim em vez de tentar restringir no provedor. |
| **Reordenação de foto por botões, não arrastar** | HTML5 drag-and-drop nativo não funciona em touch (celular/tablet), e o corretor provavelmente cadastra pelo celular. Setas de mover + "definir como capa" funcionam em qualquer dispositivo, sem dependência nova. |
| **Vídeo por upload de arquivo, não link externo** | Decisão do corretor/Cauan: mais simples pro corretor (não precisa hospedar em outro lugar), ao custo de consumir a cota do Cloudinary mais rápido — por isso o teto de 100 MB por vídeo. |
| **Cloudinary** em vez de Firebase Storage | Firebase Storage exige o plano pago Blaze (cartão) mesmo dentro da cota grátis, desde fev/2026. Cloudinary tem plano grátis real (sem cartão), com upload unsigned e otimização de imagem/vídeo embutida. |

## Custos (mantendo tudo dentro do free tier)

| Serviço | Uso | Custo |
|---|---|---|
| Vercel (Hobby) | Hospedagem do site + funções de escrita (`api/`) | R$ 0 |
| Firebase Auth (Spark) | Login do painel (2 contas) | R$ 0 |
| Firebase Firestore (Spark) | Dados dos imóveis | R$ 0 (até 1 GiB armazenado / 50k leituras por dia — bem acima do necessário) |
| Cloudinary (Free) | Fotos e vídeos dos imóveis | R$ 0 (25 créditos/mês — 1 crédito = 1 GB de armazenamento OU 1 GB de banda OU 1.000 transformações; sem cartão) |
| **Domínio** | O único custo real | ~R$ 40–60/ano, dependendo do registrador |

Vídeo consome a cota do Cloudinary bem mais rápido que foto — vale
acompanhar o painel do Cloudinary de vez em quando se o uso de vídeo
crescer.

## Setup — o que só você pode fazer

Isso é feito **uma única vez**. Depois disso, o dia a dia é só seguir o
`GUIA-CORRETOR.md`.

### 1. Cloudinary — presets de upload unsigned

1. Se ainda não tem, crie uma conta grátis em
   [cloudinary.com](https://cloudinary.com/users/register/free) (sem cartão).
2. No Dashboard, copie o **Cloud name** (vai virar `VITE_CLOUDINARY_CLOUD_NAME`
   e `CLOUDINARY_CLOUD_NAME`) e a **API Key**/**API Secret** (só
   `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, servidor).
3. Vá em **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing Mode**: Unsigned.
   - **Folder**: deixe em branco (o painel já manda a pasta certa em cada upload).
   - Em **Incoming Transformations**, adicione: largura máxima 1920px,
     `Quality: auto`, `Format: auto` — isso substitui o que antes era
     feito com `sharp` no servidor.
   - Salve e copie o **nome do preset** — vira `VITE_CLOUDINARY_UPLOAD_PRESET`.
4. (Opcional, recomendado) Crie um segundo preset só pra vídeo, com uma
   transformação de entrada limitando a 720p — ajuda a seu vídeo comum
   consumir menos da cota grátis. Se não quiser complicar, o mesmo preset
   do passo 3 funciona pros dois tipos de arquivo.

### 2. Firebase Auth — habilitar login e criar as 2 contas

1. No [console do Firebase](https://console.firebase.google.com/), projeto
   `tbn-imoveis-site` → **Authentication** → **Sign-in method** → habilite
   **E-mail/senha** e também **Google**.
2. Ainda em **Sign-in method**, na aba **Settings → Authorized domains**,
   confirme que `toninho-bomnome.vercel.app` está na lista (o Firebase já
   adiciona `localhost` sozinho) — sem isso, o login com Google falha em
   produção.
3. Pra quem vai usar e-mail/senha: em **Users**, clique **Add user** e
   crie a conta (e-mail + senha). Pra quem vai usar Google: não precisa
   criar nada aqui — a conta aparece em **Users** sozinha, assim que a
   pessoa entrar pela primeira vez em `/admin/login` com **Entrar com o
   Google**.
4. Guarde os e-mails de quem vai ter acesso (Cauan e Toninho) — eles vão
   pra variável `ALLOWED_ADMIN_EMAILS` no passo 3, e é com eles que o
   passo 5 concede a claim de admin.

### 3. Variáveis de ambiente na Vercel

No projeto na Vercel → **Settings → Environment Variables**, adicione:

| Variável | Onde pegar |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Conteúdo inteiro do `service-account.json` (já existente — mesmo usado antes pelo GitHub Actions) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Dashboard do Cloudinary (passo 1) |
| `ALLOWED_ADMIN_EMAILS` | Os 2 e-mails do passo 2, separados por vírgula |
| `VITE_CLOUDINARY_CLOUD_NAME` | Mesmo Cloud name do passo 1 |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Nome do preset do passo 1 |

Pra testar localmente, copie `.env.local.example` pra `.env.local` e
preencha os mesmos valores; use `vercel dev` (não `npm run dev`) quando
quiser testar as funções em `api/` também, não só o frontend.

### 4. Migrar os imóveis já publicados

Se já existem imóveis no Firestore (publicados pelo fluxo antigo do
Drive), rode uma vez:

```bash
npm run migrate-admin-fields
```

Isso dá um `code` (`TB-0001`, `TB-0002`...) pra quem ainda não tem e
marca `published: true` em tudo que já estava no ar.

### 5. Conceder acesso de admin (custom claim)

Depois que o site estiver publicado (passo 7) e a pessoa tiver entrado
**pelo menos uma vez** em `/admin/login` (com Google ou e-mail/senha —
as duas formas já criam o registro dela no Firebase Auth sozinhas),
rode:

```bash
npm run set-admin-claims
```

Isso lê `ALLOWED_ADMIN_EMAILS` (passo 3) e concede a claim `admin: true`
pra cada e-mail da lista — é essa claim, não só "estar logado", que as
regras do Firestore usam pra liberar a leitura de rascunho (ver
`firestore.rules`). Rode de novo sempre que adicionar alguém novo à
lista.

### 6. Regras do Firestore

```bash
npm run deploy:rules
```

Publica `firestore.rules` (leitura só do publicado, ou de quem tem a
claim de admin + índice em `firestore.indexes.json`).

### 7. Vercel — deploy

```bash
npm run build
vercel --prod --yes --project toninho-bomnome
```

Só é necessário quando o **código** do site muda — publicar/editar um
imóvel pelo painel não exige isso.

## O frontend (React + TypeScript + Tailwind)

O contrato de dados entre as funções de escrita e o frontend é o tipo
`Property` em `src/types.ts`. Qualquer campo novo precisa existir dos
dois lados: em `api/properties/*.mjs` (quem escreve no Firestore) e nos
componentes que exibem esse campo.

## Onde mexer se quiser mudar algo

- **Lista de tipos aceitos** (Casa, Apartamento...): `src/types.ts`, `PROPERTY_TYPES`.
- **Quem tem acesso ao painel**: variável `ALLOWED_ADMIN_EMAILS` na Vercel (controla escrita) + `npm run set-admin-claims` (controla o que a pessoa consegue ler/ver no painel — precisa rodar de novo depois de mudar a lista).
- **Tamanho máximo de foto/vídeo**: `src/lib/cloudinaryUpload.ts`, `MAX_PHOTO_SIZE_MB`/`MAX_VIDEO_SIZE_MB`.
- **Exibir o endereço completo na página do imóvel**: `src/pages/PropertyDetail.tsx` (o dado já vem em `property.street`, só falta renderizar).
- **Faixas de preço do filtro/busca**: `src/pages/Imoveis.tsx` e `src/components/HeroSearch.tsx`, objeto `priceRanges`.
- **Formato do código do imóvel** (`TB-0001`): `scripts/lib/pipeline.mjs`, função `getNextPropertyCode`.
