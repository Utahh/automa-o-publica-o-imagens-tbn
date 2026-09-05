// POST /api/properties — cria um imóvel novo a partir do formulário do
// painel. Fotos/vídeo já chegam aqui como URLs (o navegador subiu direto
// pro Cloudinary antes) — este endpoint só valida e grava no Firestore.
import { requireAdmin } from "../_lib/auth.mjs";
import { firestore, generateUniqueSlug, getNextPropertyCode, upsertProperty } from "../../scripts/lib/pipeline.mjs";

const REQUIRED_FIELDS = [
  "title",
  "type",
  "dealType",
  "neighborhood",
  "city",
  "state",
  "neighborhoodFact",
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const body = req.body || {};

  for (const field of REQUIRED_FIELDS) {
    if (!body[field]) {
      res.status(400).json({ error: `Campo obrigatório faltando: ${field}` });
      return;
    }
  }
  if (!Array.isArray(body.gallery) || body.gallery.length === 0) {
    res.status(400).json({ error: "Adicione pelo menos uma foto antes de salvar." });
    return;
  }

  const description = Array.isArray(body.description)
    ? body.description
    : String(body.description || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

  const db = firestore();
  const id = await generateUniqueSlug(db, body.title);
  const code = await getNextPropertyCode(db);

  const property = {
    id,
    slug: id,
    code,
    title: body.title,
    type: body.type,
    dealType: body.dealType,
    status: body.status || "Disponível",
    published: Boolean(body.published),
    neighborhood: body.neighborhood,
    city: body.city,
    state: body.state,
    street: body.street || "",
    zipCode: body.zipCode || "",
    price: Number(body.price) || 0,
    areaM2: Number(body.areaM2) || 0,
    bedrooms: Number(body.bedrooms) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    parking: Number(body.parking) || 0,
    featured: Boolean(body.featured),
    neighborhoodFact: body.neighborhoodFact,
    description,
    cover: body.gallery[0],
    gallery: body.gallery,
    video: body.video || "",
    updatedAt: new Date().toISOString(),
  };

  await upsertProperty(property);
  res.status(201).json(property);
}
