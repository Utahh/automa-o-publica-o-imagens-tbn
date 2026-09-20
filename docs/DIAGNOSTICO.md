# Diagnóstico do site (Fase 0 do `instruções.MD`)

Site analisado: https://toninho-bomnome.vercel.app (desktop 1920px, Chrome) + código em `src/`.
Data: 2026-09-20.

## Tabela

| Ponto | Bom/Ruim | Evidência | Decisão |
|---|---|---|---|
| Identidade "Planta aberta" (símbolo, grafite/azul, Archivo + Plex Mono) | Bom | Hero, cards, rótulos mono; passa no teste de unicidade | **Manter** |
| Desempenho de carga | Bom | DOMContentLoaded 205 ms, load 558 ms, 13 requisições na home, sem erro no console, sem rolagem horizontal | **Manter** |
| Regras do Firestore, chave de serviço fora do git | Bom | `firestore.rules`; `service-account.json` ignorado | **Manter** |
| Movimento respeitando "reduzir movimento" | Bom | 22 usos de `useReducedMotion`/media query | **Manter** |
| Fotos dos imóveis sem otimização | Ruim | Cloudinary entrega o original: 1200–1280 px em slot de 389 px, sem `f_auto,q_auto,w_`, sem `srcset`; foto do Move (1200×1600) pesa 266 KB para 300×240 | **Refazer**: transformar a URL (largura, WebP/AVIF, qualidade) |
| Link compartilhado sem prévia | Ruim | 0 tags `og:`, sem canonical, mesmo `<title>` em todas as páginas; SPA sem pré-renderização; 404 responde 200 pelo rewrite | **Refazer**: título/descrição/OG por página. Para um corretor que vive de WhatsApp, é o maior ganho |
| Home mostra tudo duas vezes | Ruim | 6 destaques + carrossel de 4 = os mesmos 10 imóveis de `/imoveis`; carrossel de 4 cards deixa vazio à direita e um vão grande abaixo | **Refazer**: remover o carrossel (ou só exibir quando houver mais imóveis que os destaques) |
| Blocos de valores repetidos | Ruim | "Planta aberta / sem parede escondida" aparece no Hero, em ValuesSection, em AboutSection ("Negócio" repete o card "Planta aberta") e no CTA | **Refazer**: fundir Values + About em uma seção |
| Primeira dobra sem imóvel | Neutro | Hero ocupa 100svh; primeiro imóvel só após rolar; lançamento e oportunidade (blocos escuros) vêm antes dos imóveis | **Repaginar**: hero mais baixo, imóveis logo abaixo, banners depois |
| Títulos dos cards vindos do portal | Ruim | "Oportunidade Única próxima a Major Mateus - VILA CARMELO", "JARDIM DONA NICOTA DE…" truncado; bairro em caixa alta repetido na linha de localização; a palavra "Oportunidade" colide com a seção Oportunidades | **Melhorar**: título gerado por tipo + bairro, ou campo de título curto no painel |
| Quatro famílias de fonte no `<head>` | Ruim | Archivo, Plex Mono, Montserrat e Playfair carregadas em toda página; as duas últimas só servem às páginas de lançamento | **Melhorar**: carregar Montserrat/Playfair só em `/lancamentos` |
| Dois botões de WhatsApp na tela | Neutro | Botão no menu e botão flutuante juntos no desktop | **Repaginar**: manter só o flutuante no celular, o do menu no desktop |
| Alvos de toque pequenos | Neutro | Links do menu 20 px de altura, "Ver todos" 16 px (medido no desktop; celular não testado) | **Melhorar**: área de toque ≥ 44 px |
| Textos no hero das seções escuras | Neutro | Títulos "Lançamento/Oportunidade em destaque" aparecem em cinza baixo contraste durante o Reveal; conferir contraste final | **Verificar** |
| Afirmações sem prova | Verificar com o cliente | "há mais de doze anos", "preço justo com base em quem realmente vendeu nos últimos meses", "testo o sinal de internet" | **Confirmar** com o Toninho, senão remover |

## Prioridades

1. Otimizar URLs do Cloudinary (rápido, alto ganho).
2. SEO/OG por página e prévia no WhatsApp.
3. Enxugar a home (tirar carrossel redundante, fundir Values + About, imóveis mais cedo).
4. Títulos dos cards e fontes só onde usadas.
5. Área de toque e botões duplicados.

## Não testado

Celular real (o redimensionamento da janela não alterou o viewport), tema claro/escuro, teclado, formulário de lançamento, páginas de detalhe, painel `/admin` (há alterações não commitadas nele) e LCP (o navegador não expôs a métrica).

## Skills do playbook

`impeccable`, `design-taste-frontend`, `redesign-existing-projects`, Figma etc. não estão instaladas neste ambiente. Os critérios do documento foram aplicados manualmente; `vercel:react-best-practices` e `code-review` estão disponíveis para as fases seguintes.
