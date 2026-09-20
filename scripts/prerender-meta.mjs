// Roda depois do `vite build`: gera um index.html por rota pública com o
// título, a descrição e o Open Graph certos já no HTML (robôs de busca e de
// prévia não executam o JavaScript do site), e um 404.html para a Vercel
// responder 404 de verdade nas rotas que não existem. Os imóveis
// (/imoveis/:slug) ficam por conta de api/share.mjs, porque vêm do Firestore.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = "https://toninho-bomnome.vercel.app";
const DIST = "dist";
const SUFFIX = "Toninho Bomnome";

const routes = [
  {
    path: "/",
    title: `${SUFFIX} · Corretor de Imóveis`,
    description:
      "Toninho Bomnome, corretor de imóveis CRECI 247711-F em Botucatu/SP. Casas e apartamentos à venda e para alugar, com a planta toda na mesa antes da visita.",
  },
  {
    path: "/imoveis",
    title: `Imóveis à venda e para alugar em Botucatu · ${SUFFIX}`,
    description: "Casas e apartamentos em Botucatu/SP, com preço, metragem e bairro. Filtre por região, tipo e valor.",
  },
  {
    path: "/lancamentos",
    title: `Lançamentos em Botucatu · ${SUFFIX}`,
    description: "Empreendimentos em lançamento em Botucatu/SP, com plantas, lazer e condições especiais.",
  },
  {
    path: "/oportunidades",
    title: `Oportunidades em Botucatu · ${SUFFIX}`,
    description: "Últimas unidades e oportunidades de empreendimentos prontos para morar em Botucatu/SP.",
  },
  {
    path: "/lancamentos/luiz-targa-engenharia",
    title: `Luiz Targa Engenharia · ${SUFFIX}`,
    description:
      "Apartamentos de 1 e 2 dormitórios com varanda, entre 40 e 60 m², em duas torres de 14 andares com área de lazer completa.",
  },
  {
    path: "/oportunidades/edificio-move",
    title: `Edifício Move · ${SUFFIX}`,
    description:
      "Pronto para morar, a cinco minutos do centro. Apartamentos de 1, 2 e 3 dormitórios a partir de 107 m², com lazer completo, rooftop e vista panorâmica.",
  },
];

const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function withMeta(html, { path, title, description, noindex }) {
  const url = `${SITE}${path === "/" ? "" : path}`;
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  const set = (re, tag) => {
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n  </head>`);
  };
  if (description) {
    set(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
    set(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}" />`);
  }
  set(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  set(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  set(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  set(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${noindex ? "noindex" : "index,follow"}" />`);
  return out;
}

const base = readFileSync(join(DIST, "index.html"), "utf8");

for (const route of routes) {
  const file = route.path === "/" ? join(DIST, "index.html") : join(DIST, route.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, withMeta(base, route));
}

writeFileSync(
  join(DIST, "404.html"),
  withMeta(base, { path: "/404", title: `Página não encontrada · ${SUFFIX}`, noindex: true }),
);

console.log(`prerender-meta: ${routes.length} rotas + 404.html`);
