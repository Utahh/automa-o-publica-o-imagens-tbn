// GET /api/share?slug=... — HTML mínimo com Open Graph para robôs de
// prévia (WhatsApp, Facebook, Telegram...) que não executam o JavaScript
// do site. O vercel.json só encaminha pra cá os pedidos desses robôs em
// /imoveis/:slug; pessoas continuam recebendo o site normal.
import { firestore, initFirebase } from "../scripts/lib/pipeline.mjs";

const SITE = "https://toninho-bomnome.vercel.app";

function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function optimize(url, width) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  const [head, tail] = url.split("/image/upload/");
  return /^v\d+\//.test(tail) ? `${head}/image/upload/f_jpg,q_auto,c_limit,w_${width}/${tail}` : url;
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").slice(0, 200);
  let p = null;
  try {
    initFirebase(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : undefined);
    const snap = await firestore().collection("imoveis").doc(slug).get();
    if (snap.exists && snap.data().published === true) p = snap.data();
  } catch (err) {
    console.warn("share: Firestore indisponível:", err.message);
  }

  const url = `${SITE}/imoveis/${encodeURIComponent(slug)}`;
  const title = p ? `${p.type} em ${p.neighborhood}, ${p.city} · Toninho Bomnome` : "Toninho Bomnome · Corretor de Imóveis";
  const price = p ? Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) : "";
  const description = p
    ? `${p.title}. ${price}${p.dealType === "Aluguel" ? "/mês" : ""} · ${p.bedrooms} quartos · ${p.areaM2} m².`
    : "Corretor de imóveis em Botucatu/SP. Casas e apartamentos com planta aberta.";
  const image = p?.cover ? optimize(p.cover, 1200) : `${SITE}/og-image.png`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Toninho Bomnome">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
</head><body><a href="${esc(url)}">${esc(title)}</a></body></html>`);
}
