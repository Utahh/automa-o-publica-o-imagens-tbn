# Instruções: como melhorar um site (playbook reutilizável)

Guia para pegar **qualquer site existente** e entregar uma versão melhor, mais rápida e com **identidade própria**, sem cara de "feito por IA". Foi extraído do projeto Robuste (Botucatu/SP), em que tudo abaixo foi aplicado e testado.

> Como usar: cole a **Instrução 1** (abaixo) no início da conversa, informe o endereço do site e siga as fases na ordem. Cada fase diz quais skills e ferramentas usar e o que entregar.

---

## Instrução 1 (a primeira, sempre)

> **Analise o site e veja os pontos bons e ruins. Liste eles, pegue o que for de ruim e melhore e o que for bom só dê uma repaginada se caso for necessário. Depois entra no fluxo das skills.**

O que isso significa na prática:

1. **Analisar** o site de verdade: navegar, raspar, tirar prints (desktop e celular), medir carregamento, ler o HTML, as chamadas de API e os formulários. Não opinar sem evidência.
2. **Listar** em uma tabela, com prova (print, número ou trecho):

   | Ponto | Bom ou ruim | Evidência | Decisão |
   |---|---|---|---|
   | ex.: menu some ao rolar | Ruim | print do site rolado | **Refazer**: menu fixo |
   | ex.: paleta verde da marca | Bom | logo e botões | **Repaginar**: manter a cor, unificar os tons |
   | ex.: formulário simples | Neutro | sem validação | **Melhorar**: etapas e validação |

3. **Decidir por item**, sempre uma destas três:
   - **Refazer**: o que é ruim (lento, confuso, ilegível, redundante, quebrado). Aqui está o maior ganho.
   - **Repaginar**: o que é bom, só se precisar (mesma ideia, execução mais fina). **Não mexer no que já funciona e o cliente ama.**
   - **Manter**: o que é bom e está bem feito. Registrar e seguir.
4. **Só depois** entrar no fluxo de fases e skills. Entregável desta etapa: `README.md` de diagnóstico com a tabela e a lista de prioridades.

Regra de ouro: **nada de redesenhar antes de listar o que existe.** É isso que impede o resultado de virar um "template" genérico.

---

## Princípios (valem para todas as fases)

1. **Único por site.** Todo projeto tem que responder "isto poderia ser o site de outra empresa?". Se a resposta for sim, refaça.
2. **Conteúdo real primeiro.** Textos, fotos, endereços, corretores, preços e dados do próprio cliente. Nunca texto de enchimento nem números inventados.
3. **Evidência antes de opinião.** Print, medição e teste no navegador para cada afirmação ("está lento", "está quebrado", "ficou melhor").
4. **Um ponto focal por tela.** Menos blocos, mais respiro. Se a home reclamada era "poluída", a nova tem poucas seções, cada uma com um trabalho claro.
5. **Desempenho é design.** Imagem lenta é defeito visual. Medir antes e depois.
6. **Testar como usuário**, não só ler o código: clicar, rolar, digitar, redimensionar, trocar de tema, usar o teclado.
7. **Não enviar nada para fora** sem autorização (formulários, leads, publicação). Conteúdo copiado pertence ao cliente.
8. **Anotar o que ficou de fora** em `BACKLOG.md` em vez de fingir que está pronto.

---

## Como não ter cara de "feito por IA"

Sinais que denunciam e o que fazer no lugar:

| Sinal de IA | Faça em vez disso |
|---|---|
| Degradê roxo/azul, "glassmorphism" em tudo | Usar **a paleta real da marca**; efeitos só onde têm função (ex.: menu translúcido) |
| Fonte padrão (Inter) sem critério | Fonte que combine com a marca (na Robuste, Poppins, já usada por eles) e escala tipográfica definida |
| Grade de 3 cards com ícone genérico e texto vago | Blocos com **dados do negócio** (preço, metragem, bairro, corretor) |
| Título "Transforme seu negócio", "solução completa" | Texto do cliente, reescrito com a voz dele ("Menos uma imobiliária igual") |
| Tudo centralizado e simétrico | Composição pensada por seção; assimetria onde ajuda a leitura |
| Sombras e bordas iguais em todo lugar | Poucas elevações, com regra (cartão em repouso vs. em foco) |
| Emojis e ícones de cliparts | Um único conjunto de ícones, usado com moderação |
| Animação em tudo | Movimento **curto, com propósito**, só em `transform`/`opacity`, respeitando "reduzir movimento" |
| Depoimentos e métricas inventados | Só o que existir; senão, não colocar |
| Estados vazios genéricos | Estados vazios que **ajudam** ("nenhum imóvel com esses filtros: amplie o preço ou fale com um corretor") |
| Mapa e listas "de catálogo" | **Detalhes do domínio**: pins com preço, agrupamento por região, balão com foto e descrição |

**Assinatura do site:** escolha 1 ou 2 elementos memoráveis e específicos (na Robuste: menu transparente sobre vídeos dos empreendimentos, mapa com preços nos pins, seletores de filtro próprios). É isso que faz cada site ser único.

**Teste de unicidade** antes de entregar: cubra o logo e mostre uma tela. Dá para saber de quem é o site? Se não, falta identidade.

---

## Fluxo por fases (com skills e ferramentas)

### Fase 0: Diagnóstico (Instrução 1)
- **Fazer:** raspar o site inteiro (páginas, imagens, vídeos, textos, formulários, chamadas de API), tirar prints em desktop e celular, medir tempo de carregamento, listar bom/ruim/decisão.
- **Ferramentas:** Playwright (script de raspagem com `chromium`), `curl`/`fetch` para testar a API, leitura de `__NEXT_DATA__` quando o site for Next.js.
- **Skills:** `redesign-existing-projects` (auditoria antes de redesenhar), `impeccable` (crítica e auditoria de UX/acessibilidade), `design-taste-frontend` (auditar antes de propor).
- **Entrega:** `branding/README.md` (diagnóstico), `branding/data/`, `branding/assets/`, `branding/screenshots/`.

### Fase 1: Direção de design (identidade única)
- **Fazer:** extrair a marca (logo, cores, fonte), listar 3 a 5 referências boas do mercado, escolher **um conceito** e definir tokens (cores, espaçamento, raio, tipografia, sombras) em claro e escuro.
- **Skills:** `design-taste-frontend` (referências e regras anti-genérico), `high-end-visual-design` (tipografia, espaço, profundidade), `impeccable` (regras de tipografia, espaçamento, layout e cor), `brandkit` (quando faltar sistema de marca), `minimalist-ui` ou `industrial-brutalist-ui` **só se o estilo combinar com a marca**, `stitch-design-taste` (gerar um `DESIGN.md` com as regras).
- **Entrega:** paleta e tokens, escolha de fonte, "assinatura" do site, lista do que fica proibido (anti-IA).

### Fase 2: Projeto no Figma
- **Fazer:** criar o arquivo, variáveis (cores claro/escuro, espaçamento, raio) e telas-chave (home primeiro). Conferir cada tela por captura.
- **Ferramentas:** Figma MCP: `whoami` (achar o time), `create_new_file`, `use_figma` (JavaScript da Plugin API), `get_screenshot`.
- **Skill:** `figma-use` (obrigatória antes de `use_figma`; lê-se pelo recurso `skill://figma/figma-use/SKILL.md`). Outras: `figma-generate-design` (telas a partir do código), `figma-generate-library` (design system), `figma-code-connect`.
- **Cuidados aprendidos:** plano Starter permite **1 modo por coleção** (use duas coleções `Color/Light` e `Color/Dark`); frames de auto-layout nascem com fundo branco (remova); `padding` não existe como propriedade única; não há inserção de imagens pela API (use marcadores de imagem).
- **Entrega:** arquivo Figma + prints em `branding/figma/`.

### Fase 3: Construção
- **Stack usada:** Next.js + React + TypeScript, dados da API pública do site atual (cache), CSS com variáveis.
- **Skills:** `vercel:nextjs`, `vercel:react-best-practices`, `vercel:next-cache-components` (cache), `vercel:ai-sdk` (só se houver IA), `pick-ui-library` (se precisar de biblioteca de componentes), `image-to-code` (quando partir de uma imagem/mock), `prototype` (validar uma ideia de interface rápido), `full-output-enforcement` (impedir código cortado ou com "...").
- **Estrutura de pastas:** `branding/` (diagnóstico, dados, prints), `scraper/` (raspagem e testes), `site/` (o projeto).
- **Regras de código:** formulários com validação no cliente **e** no servidor; erros com espaço reservado (para o layout não pular); textos em português; acessibilidade desde o começo (rótulos, foco, contraste, teclado).

### Fase 4: Movimento e interação
- **Fazer:** decidir **se** anima, depois o quê, com qual curva e duração; hovers com propósito; carrosséis lentos; transições curtas.
- **Skills:** `emil-design-eng` (polimento e detalhes invisíveis), `animate` (decidir e implementar), `animation-vocabulary` (nomear o efeito desejado), `apple-design` (gestos, molas, materiais), `mobile-native` (cara de app no celular: toque, 100vh, área segura), `find-animation-opportunities` (onde falta movimento), `review-animations` e `improve-animations` (revisar/auditar o que existe).
- **Regras que funcionaram:** animar só `transform`/`opacity`; ≤ 260 ms nos hovers; `hover` só em dispositivos com mouse; mesmo destaque no foco do teclado; respeitar `prefers-reduced-motion`; alvos de toque ≥ 44 px.

### Fase 5: Desempenho (imagens e dados)
- **Medir antes e depois** (tempo até as imagens da primeira tela, LCP), sempre com navegador "limpo".
- **O que deu resultado:** cache longo para imagens com hash no nome; só WebP; poucos tamanhos; prioridade nas primeiras fotos; brilho enquanto carrega; script de **aquecimento** do cache; listas com rolagem infinita até um limite e botão depois; carregar vídeo/pesos só após a página abrir.
- **Skills:** `vercel:nextjs`, `vercel:runtime-cache`, `vercel:cdn-caching`, `vercel:turbopack` (quando fizer sentido).

### Fase 6: Teste e prints (obrigatório)
- **Fazer:** script Playwright que percorre fluxos reais e falha se algo quebrar: filtros e ordenação, formulários (vazio, inválido, válido), teclado, tema claro e escuro, celular, console sem erros, sem rolagem horizontal, imagens sem quebra.
- **Regra:** cada bug real achado no teste vira correção **e** uma verificação no script. Exemplos que o teste pegou na Robuste: clique no botão "perdido" quando a mensagem de erro sumia e o layout pulava; menu estourando com a logo maior; CSS de biblioteca (Leaflet) sobrescrevendo o do site.
- **Entrega:** prints em `branding/site-screenshots/`.

### Fase 7: Publicação e revisão
- **Ferramentas:** CLI da Vercel (`npx vercel link`, `deploy`, `curl` com bypass de proteção).
- **Skills:** `vercel:deploy`, `vercel:vercel-cli`, `vercel:env-vars`, `vercel:status`, `vercel:verification`.
- **Cuidados:** o **primeiro deploy vira produção** e o endereço `*.vercel.app` pode ficar público: **ligar a proteção "todos os deploys" antes de divulgar**; gerar **link de compartilhamento com validade** para o cliente; em ambiente sem disco gravável, formulários não podem falhar por causa disso; conferir que a API de origem responde a partir dos servidores da Vercel.
- **Entrega:** endereço protegido + link privado com prazo.

### Fase 8: Documentação e continuidade
- `README.md` (diagnóstico), `BACKLOG.md` (o que ficou para depois, com motivo), e a memória do projeto (decisões, comandos, armadilhas).
- Sempre listar **pendências que dependem do cliente** (logo em vetor, datas, destino dos formulários, autorização de uso do conteúdo).

---

## Catálogo de skills

Fontes instaladas neste ambiente: `emilkowalski/skills`, `Leonxlnx/taste-skill`, `impeccable` e as skills de Vercel/Figma/ferramentas.

**Legenda de uso na Robuste:** **Ferramenta** = usada de fato; **Princípios** = as regras da skill orientaram as decisões (sem chamá-la formalmente); **Não** = não usada.

### Design, marca e gosto
| Skill | Para que serve | Fase | Na Robuste |
|---|---|---|---|
| `impeccable` | Regras de tipografia, espaçamento, layout, cor e movimento; crítica, auditoria, polimento; detecta problemas de design automaticamente | 0, 1, 4, 6 | **Ferramenta** (verificação automática ao gravar CSS/componentes, exceções registradas com `hooks ignore-value`) |
| `design-taste-frontend` | Anti-genérico: lê o briefing, infere a direção e exige um resultado que não pareça template | 0, 1 | Princípios |
| `design-taste-frontend-v1` | Versão original do anterior (só para compatibilidade) | 1 | Não |
| `redesign-existing-projects` | Melhora um site existente: audita primeiro, corrige padrões genéricos, sem quebrar funções | 0 | Princípios |
| `high-end-visual-design` | Fontes, espaços, sombras e cartões com acabamento "caro" | 1 | Princípios |
| `minimalist-ui` | Estilo editorial limpo, monocromático | 1 | Não (só se combinar com a marca) |
| `industrial-brutalist-ui` | Estilo bruto, tipográfico, denso | 1 | Não |
| `stitch-design-taste` | Gera `DESIGN.md` com as regras visuais para agentes | 1 | Não |
| `brandkit` | Prancha de identidade, logo e sistema de marca | 1 | Não (a marca já existia) |
| `gpt-taste` | Layout com movimento forte (GSAP), seções longas | 1, 4 | Não (pesado demais para o caso) |
| `imagegen-frontend-web` / `imagegen-frontend-mobile` | Gera imagens de referência de tela por seção, antes de codar | 1 | Não |
| `image-to-code` | Constrói o site a partir das imagens de referência | 3 | Não |
| `dataviz` | Gráficos e painéis com paleta consistente | 3 | Não (sem gráficos) |

### Movimento e interação (Emil Kowalski)
| Skill | Para que serve | Fase | Na Robuste |
|---|---|---|---|
| `emil-design-eng` | Filosofia de polimento: detalhes que fazem o software parecer bom | 4 | Princípios |
| `animate` | Decidir e escrever a animação na ordem certa (deve animar? qual propriedade? curva? interrupção?) | 4 | Princípios |
| `animation-vocabulary` | Traduz "aquele efeito de..." para o nome técnico | 4 | Não |
| `apple-design` | Molas, gestos, materiais e restrição visual ao estilo Apple para a web | 4 | Princípios |
| `mobile-native` | Deixa o site com jeito de app no celular (toque, 100vh, área segura, sem zoom em campos) | 4 | Princípios |
| `find-animation-opportunities` | Acha onde falta movimento e propõe valores exatos | 4 | Não |
| `review-animations` | Critica animações existentes | 4, 6 | Não |
| `improve-animations` | Auditoria de todo o movimento do projeto com plano de melhoria | 4, 6 | Não |
| `animate-expo` | Animação em React Native/Expo | — | Não |
| `ask-sonner` | Guia da biblioteca de avisos (toasts) Sonner | 3 | Não |
| `pick-ui-library` | Escolher biblioteca de componentes | 3 | Não |
| `prototype` | Protótipo descartável para validar uma ideia | 3 | Não |
| `write-swift` | Swift moderno | — | Não |

### Figma
| Skill / ferramenta | Para que serve | Fase | Na Robuste |
|---|---|---|---|
| `figma-use` | **Obrigatória** antes de escrever no Figma (regras da Plugin API) | 2 | **Ferramenta** |
| Figma MCP (`whoami`, `create_new_file`, `use_figma`, `get_screenshot`) | Criar arquivo, variáveis e telas; conferir por captura | 2 | **Ferramenta** |
| `figma-generate-design`, `figma-generate-library`, `figma-code-connect` | Telas a partir do código, design system, mapear componentes | 2 | Não |

### Publicação e plataforma (Vercel)
| Skill / ferramenta | Para que serve | Fase | Na Robuste |
|---|---|---|---|
| CLI da Vercel (`npx vercel`) | Vincular, publicar, proteger e gerar link privado | 7 | **Ferramenta** |
| `vercel:deploy`, `vercel:vercel-cli`, `vercel:env-vars`, `vercel:status`, `vercel:verification` | Fluxos de deploy, variáveis, estado e verificação | 7 | Princípios |
| `vercel:nextjs`, `vercel:react-best-practices`, `vercel:next-cache-components`, `vercel:runtime-cache`, `vercel:cdn-caching` | Boas práticas de Next.js, cache e desempenho | 3, 5 | Princípios |
| `vercel:ai-sdk`, `vercel:ai-gateway`, `vercel:auth`, `vercel:vercel-storage`, `vercel:workflow`, `vercel:vercel-functions` | Recursos extras (IA, login, banco, filas, funções) | 3 | Não |

### Testes, código e qualidade
| Skill / ferramenta | Para que serve | Fase | Na Robuste |
|---|---|---|---|
| Playwright (biblioteca `playwright`) | Raspagem, testes de fluxo, medições e prints | 0, 5, 6 | **Ferramenta** |
| `claude-in-chrome` | Automatizar o Chrome do usuário (páginas com login, etc.) | 0, 6 | Não |
| `mattpocock-skills:diagnosing-bugs` | Método para bugs difíceis e regressões de desempenho | 6 | Princípios |
| `mattpocock-skills:tdd` | Desenvolver com testes primeiro | 3, 6 | Não |
| `mattpocock-skills:code-review`, `code-review`, `simplify`, `security-review` | Revisão de qualidade, simplificação e segurança | 6, 7 | Não (recomendado antes de publicar de verdade) |
| `mattpocock-skills:research` | Pesquisar em fontes confiáveis e registrar em arquivo | 0 | Não |
| `mattpocock-skills:grilling` | "Sabatina" para estressar um plano ou decisão | 1 | Não |
| `mattpocock-skills:codebase-design`, `domain-modeling`, `writing-for-agents` | Arquitetura, modelo de domínio, documentos para agentes | 3, 8 | Não |
| `full-output-enforcement` | Evita respostas/código truncados | 3 | Não |
| Memória do projeto | Registrar decisões, comandos e armadilhas entre sessões | 8 | **Ferramenta** |

> **Observação honesta sobre o uso:** na Robuste, as skills de design (Emil Kowalski e Taste) orientaram as decisões, mas **não foram chamadas uma a uma** com `/nome-da-skill`; a única verificação automática ativa foi a do `impeccable`. **No próximo site, invoque cada skill na fase indicada** para que as regras dela sejam carregadas por completo.

---

## Modelo de instrução para colar no início de cada projeto

```
Site: <endereço>
Cliente/segmento: <quem é e o que vende>
Objetivo: <o que precisa melhorar: velocidade, conversão, imagem, navegação...>
Marca (se houver): <logo, cores, fonte>
Restrições: <o que não pode mudar, o que não pode ser enviado para fora>

1. Analise o site e veja os pontos bons e ruins. Liste eles, pegue o que for de ruim
   e melhore e o que for bom só dê uma repaginada se caso for necessário.
   Depois entra no fluxo das skills.
2. Siga as fases de "instruções.MD": diagnóstico, direção de design, Figma,
   construção, movimento, desempenho, testes com prints, publicação protegida,
   documentação e backlog.
3. O resultado tem que ser ÚNICO: use o conteúdo real do cliente, a paleta e o tom
   dele, e uma "assinatura" própria. Evite os sinais de "cara de IA" listados.
4. Antes de dizer que terminou: teste no navegador (fluxos, celular, tema escuro,
   teclado), mostre prints e diga o que NÃO foi testado.
```

---

## Checklist final (antes de entregar)

- [ ] Tabela de diagnóstico feita e cada ponto ruim tratado (ou anotado no backlog).
- [ ] O que era bom foi mantido ou só repaginado, sem trocar por gosto.
- [ ] Passou no **teste de unicidade** e na lista de "sinais de IA".
- [ ] Paleta, fonte e tokens da marca; claro e escuro consistentes.
- [ ] Menu sempre acessível; contraste legível sobre imagens (usar véu/degradê).
- [ ] Filtros, formulários e mapas testados com clique, teclado e celular.
- [ ] Imagens rápidas (medido antes e depois); sem rolagem horizontal; console sem erros.
- [ ] Nada enviado para fora sem autorização; proteção de acesso ligada antes de divulgar.
- [ ] `README.md`, `BACKLOG.md` e prints atualizados; pendências do cliente listadas.

---

## Lições aprendidas (armadilhas reais)

- **Teste com clique real:** um erro que some ao sair do campo faz o layout pular e o clique no botão se perder. Reserve o espaço da mensagem.
- **Plano gratuito do Figma:** 1 modo por coleção; use coleções separadas para claro/escuro.
- **Bibliotecas de terceiros (mapas, calendários):** o CSS delas costuma ter prioridade sobre o seu; reforce a especificidade e teste nos dois temas.
- **`backdrop-filter` em um pai** prende elementos `position: fixed` dentro dele (folhas de baixo no celular).
- **Vídeo de fundo:** carregar só depois da página, com foto no lugar, botão de pausar e desligado com "reduzir movimento".
- **Rolagem infinita:** limite automático e depois botão, senão o rodapé nunca é alcançado; manter a paginação para quem não tem JavaScript.
- **Zoom por rolagem em mapas:** só depois de clicar no mapa; caso contrário ele "prende" a página.
- **Git Bash no Windows:** converte `/rota` em caminho do disco; use `MSYS_NO_PATHCONV=1` em comandos com caminhos de URL. Heredocs grandes com aspas falham: prefira escrever arquivos pela ferramenta de edição.
- **Vercel:** primeiro deploy vira produção; proteger antes de divulgar; disco somente leitura em funções.
- **Datas e dados do site antigo podem estar vencidos** (ex.: "entrega em 2024"): não exibir sem confirmar.
