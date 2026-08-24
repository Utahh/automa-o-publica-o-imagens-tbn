# TBN Imóveis — Página de exemplo

Site (venda/aluguel de imóveis) em React + Vite, inspirado no layout do
QuintoAndar, com a identidade visual da TBN Imóveis e do corretor Toninho
Bomnome. Publicado em produção via Vercel.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).

## Como adicionar um imóvel novo

Existem dois jeitos, com o **mesmo formato de pasta**:

- **Automático (produção)**: organize a pasta do imóvel no Google Drive.
  Um robô (GitHub Actions) publica sozinho em até ~5-10 minutos, sem precisar
  rodar nada aqui. Veja o passo a passo em **[`GUIA-CORRETOR.md`](GUIA-CORRETOR.md)**.
- **Manual (para testar localmente antes de subir pro Drive)**:

  1. Crie uma pasta dentro de `incoming/` com o nome do imóvel.
  2. Dentro dela, direto (sem subpastas), coloque:
     - **`imovel.md`** — título + tags (Tipo, Bairro, Endereço, Valor,
       Descrição...). Modelo completo em `GUIA-CORRETOR.md`.
     - **`capa.jpg`** — a foto de capa.
     - **`1 - Entrada.jpg`, `2 - Sala.jpg`, ...** — fotos numeradas.
  3. Rode:

     ```bash
     npm run add-listing
     ```

     Isso otimiza as fotos (`.webp`, redimensionadas), sobe pro Firebase
     Storage, grava no Firestore e atualiza `src/data/properties.json`
     (fallback local). A pasta processada é arquivada em `incoming/processed/`.
  4. Para conferir antes de publicar: `npm run dev`.

Rodar `npm run add-listing` (ou o sync automático do Drive) de novo com o
mesmo nome de pasta **atualiza** o imóvel existente (não duplica).

Publicar um imóvel **não exige novo deploy** — o site lê os dados do
Firestore em tempo real. `npm run publish` (ou `npm run build` + deploy) só
é necessário quando o **código** do site muda. Arquitetura completa e
runbook de setup (Drive, GitHub Actions, custos) em
**[`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)**.

## Estrutura de dados

- `src/data/property.js` — dados fixos do site: agência, corretor,
  diferenciais, áreas de atuação. Edite manualmente quando precisar.
- `src/data/properties.json` — lista de imóveis. **Gerado automaticamente**
  pelo `npm run add-listing` — não edite à mão (a próxima execução do
  script sobrescreve).

A cor do site segue a paleta definida em `src/styles/variables.css`.

## Deploy manual (sem usar add-listing)

```bash
npm run build
vercel --prod --yes --project tbn-imoveis
```
