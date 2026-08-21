# Arquitetura — TBN Imóveis

Este documento explica **como o sistema funciona por trás**, as decisões
tomadas e **o passo a passo de setup** que só você consegue fazer (contas
Google/GitHub/Vercel). Depois de configurado uma vez, o dia a dia é só o
`GUIA-CORRETOR.md`.

## Visão geral

```
Você organiza a pasta   Google Drive          GitHub Actions           Firebase                 Vercel
   do imóvel        ──▶  (arquivos)   ──▶   (roda a cada 15min)  ──▶  Firestore + Storage  ──▶  Site (React)
 (imovel.md, capa,        │                  scripts/sync-drive.mjs      (dados + fotos)         lê os dados
  fotos, PRONTO.txt)      │                                                                       ao vivo
                          └── continua sendo SEU Drive, o robô só lê (permissão de Leitor)
```

- **Ingestão**: você (ou futuramente o corretor) organiza uma pasta por
  imóvel no Google Drive, seguindo o contrato descrito em
  `GUIA-CORRETOR.md`.
- **Automação**: um workflow do GitHub Actions (`.github/workflows/sync-drive.yml`)
  roda `scripts/sync-drive.mjs` a cada ~15 minutos (ou sob demanda, pelo
  botão "Run workflow"). Ele lê a pasta raiz do Drive, encontra pastas com
  `PRONTO.txt`, converte as fotos para `.webp` (mais leve), sobe pro
  Firebase Storage e grava os dados no Firestore.
- **Estado de sincronização**: para saber o que já foi publicado (e
  suportar edições depois), o robô guarda no Firestore (coleção
  `driveSync`) a data de modificação mais recente de cada pasta já
  processada. Isso evita reprocessar tudo a cada execução e permite que o
  service account do Drive tenha **só permissão de leitura** — ele nunca
  precisa escrever nada no seu Drive.
- **Site**: o frontend (`src/`) já lia os imóveis **ao vivo** do Firestore
  (`src/data/property.js` → `useProperties()`), então **não precisa fazer
  novo deploy no Vercel a cada imóvel publicado** — só quando o código do
  site muda.
- **Fallback local**: `npm run add-listing` continua existindo para você
  testar uma pasta localmente (formato idêntico ao do Drive, dentro de
  `incoming/`) antes de subir pro Drive de verdade.

## Por que essas escolhas (trade-offs)

| Decisão | Por quê |
|---|---|
| **GitHub Actions** em vez de Firebase Cloud Functions agendada | Cloud Functions agendadas exigem o plano Blaze (cartão cadastrado, mesmo cobrando R$0 dentro da cota grátis). GitHub Actions é grátis sem cartão, com minutos de sobra para rodar um script curto a cada 15 min (~50h/mês de uso real, dentro do limite de 2.000 min/mês do plano gratuito). |
| **GitHub Actions** em vez de Vercel Cron | O Vercel Hobby (grátis) limita cron jobs a 1x por dia — um imóvel novo podia demorar até 24h para aparecer. |
| **Estado de sync no Firestore**, não no Drive | Evita precisar dar permissão de **escrita** ao service account no seu Drive. Ele só precisa ser "Leitor" da pasta — mais seguro, e mais simples de configurar. |
| **`PRONTO.txt` como marcador** | Sem isso, o robô podia publicar um imóvel pela metade enquanto as fotos ainda estão subindo (Drive sincroniza arquivo por arquivo). |
| **Endereço completo salvo mas não exibido publicamente** | Prática comum no mercado imobiliário: evita visitas "espontâneas" sem o corretor. Fácil de reverter (ver abaixo). |
| **`gallery[0]` = foto de capa** | O frontend já usava `gallery[0]` como capa em todo lugar (cards, banner da página, lightbox) — ao colocar a capa como primeiro item da galeria, **zero mudança de UI foi necessária**. |

## Custos (mantendo tudo dentro do free tier)

| Serviço | Uso | Custo |
|---|---|---|
| Vercel (Hobby) | Hospedagem do site | R$ 0 |
| Firebase Firestore (Spark) | Dados dos imóveis | R$ 0 (até 1 GiB armazenado / 50k leituras por dia — bem acima do necessário) |
| Firebase Storage (Spark) | Fotos dos imóveis | R$ 0 (até 5 GB armazenados / 1 GB de download por dia) |
| GitHub Actions | Roda o sync a cada 15 min | R$ 0 (2.000 min/mês grátis; o job usa poucos segundos a minutos por execução) |
| Google Drive | Onde você organiza as fotos | R$ 0 (usa o seu Drive pessoal já existente) |
| **Domínio** | O único custo real | ~R$ 40–60/ano, dependendo do registrador |

Se o volume de imóveis/fotos crescer muito (centenas de imóveis em alta
resolução), o Firebase Storage pode eventualmente passar da cota grátis —
é só monitorar no console do Firebase; hoje está muito longe disso.

## Setup — o que só você pode fazer

Isso é feito **uma única vez**. Depois disso, o dia a dia é só seguir o
`GUIA-CORRETOR.md`.

### 0. ⚠️ Ativar o Firebase Storage (bloqueio atual)

Ao testar o pipeline, o upload falhou com `"The specified bucket does not
exist"` — nem `tbn-imoveis-site.firebasestorage.app` nem
`tbn-imoveis-site.appspot.com` existem. Isso significa que o **Storage
nunca foi inicializado** neste projeto Firebase (é um passo manual único,
com escolha de região, por isso não dá pra automatizar com segurança).
Sem isso, nenhum upload de foto funciona — nem o `add-listing.mjs` antigo,
nem o novo `sync-drive.mjs`.

**Como resolver:**

1. Acesse o [Firebase Console](https://console.firebase.google.com/project/tbn-imoveis-site/storage)
   → **Build → Storage**.
2. Clique em **"Vamos começar" / "Get started"**.
3. Escolha **modo de produção** (as regras já estão prontas em
   `storage.rules` — leitura pública, escrita só via Admin SDK).
4. Escolha uma região (recomendado: `southamerica-east1`, mais perto do
   Brasil — mas qualquer uma funciona).
5. Confirme. Em seguida rode `npm run add-listing` de novo (com a pasta
   `incoming/imovel-teste/` já preparada) para validar que o upload
   funciona.

### 1. Google Drive — pasta de envio

1. Crie uma pasta no seu Google Drive, ex: **"TBN Imóveis — Envio"**.
2. Abra a pasta, copie o **ID dela** da URL:
   `https://drive.google.com/drive/folders/`**`ESTE-PEDAÇO-AQUI-É-O-ID`**
3. Guarde esse ID — vai virar a variável `DRIVE_FOLDER_ID` no GitHub (passo 4).

### 2. Habilitar a API do Google Drive no mesmo projeto do Firebase

O service account que já existe (`service-account.json`, projeto
`tbn-imoveis-site`) pode ser reaproveitado — só precisa liberar a API:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/library/drive.googleapis.com)
   com o mesmo projeto `tbn-imoveis-site` selecionado.
2. Clique em **"Ativar"** na API do Google Drive.

### 3. Compartilhar a pasta do Drive com o service account

1. Abra `service-account.json` e copie o valor do campo `"client_email"`
   (algo como `firebase-adminsdk-xxxxx@tbn-imoveis-site.iam.gserviceaccount.com`).
2. No Google Drive, clique com o botão direito na pasta **"TBN Imóveis — Envio"**
   → **Compartilhar** → cole esse e-mail → permissão **Leitor** → Enviar.

### 4. Criar o repositório no GitHub e subir o código

O projeto ainda não tem controle de versão — isso também resolve esse
ponto (backup do código, histórico de mudanças).

```bash
git init
git add .
git commit -m "Setup inicial do site TBN Imóveis"
```

Crie um repositório **privado** no GitHub (ex: `tbn-imoveis-site`) e
depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/tbn-imoveis-site.git
git branch -M main
git push -u origin main
```

> ⚠️ **Nunca** commite `service-account.json` — ele já está no
> `.gitignore`, confirme que não aparece em `git status` antes do push.

### 5. Configurar os secrets/variáveis do GitHub Actions

No repositório, vá em **Settings → Secrets and variables → Actions**:

- Aba **Secrets** → **New repository secret**:
  - Nome: `FIREBASE_SERVICE_ACCOUNT_JSON`
  - Valor: cole o **conteúdo inteiro** do arquivo `service-account.json`
- Aba **Variables** → **New repository variable**:
  - Nome: `DRIVE_FOLDER_ID`
  - Valor: o ID copiado no passo 1

### 6. Testar

Na aba **Actions** do repositório, escolha o workflow
**"Sincronizar imóveis do Google Drive"** → **Run workflow** → rodar
manualmente. Acompanhe o log — ele mostra pasta por pasta o que foi
publicado, ignorado ou está aguardando o `PRONTO.txt`.

Depois disso, o cron (`*/15 * * * *`) assume sozinho.

### 7. Vercel (sem mudanças)

O deploy do site continua manual, só quando o **código** muda:

```bash
npm run build
vercel --prod --yes --project tbn-imoveis
```

Imóveis novos **não** precisam disso — eles aparecem via Firestore em
tempo real.

## Onde mexer se quiser mudar algo

- **Frequência do sync**: `.github/workflows/sync-drive.yml`, linha do `cron`.
- **Exibir o endereço completo na página do imóvel**: `src/pages/PropertyPage.jsx`
  (o dado já vem em `property.address.street`, só falta renderizar).
- **Formato/tags aceitas no `imovel.md`**: `scripts/lib/pipeline.mjs`,
  função `parseListingMarkdown`.
- **Regras de quais arquivos viram capa/foto/são ignorados**:
  `scripts/lib/pipeline.mjs`, função `classifyListingFiles`.
