// Núcleo compartilhado do painel de cadastro: inicialização do
// Firebase/Cloudinary, geração de slug/código do imóvel e upsert no
// Firestore. Usado tanto pelas funções serverless (api/properties/*)
// quanto pelo script de migração (scripts/migrate-admin-fields.mjs).
//
// Fotos e vídeo são enviados direto do navegador pro Cloudinary (upload
// preset unsigned) — este arquivo não processa mais imagem/vídeo no
// servidor. O que ainda precisa do Admin SDK é só a escrita no Firestore
// (a coleção `imoveis` só aceita escrita via Admin SDK, nunca do cliente
// — ver firestore.rules) e a limpeza de assets no Cloudinary ao excluir
// um imóvel (precisa da API secret, por isso continua no servidor).
import { v2 as cloudinary } from "cloudinary";
import { existsSync, readFileSync } from "fs";
import path from "path";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const FIREBASE_PROJECT_ID = "tbn-imoveis-site";
export const FIRESTORE_COLLECTION = "imoveis";
export const CLOUDINARY_FOLDER = "imoveis";
const COUNTERS_COLLECTION = "_meta";
const COUNTERS_DOC = "counters";

// ─── Firebase (Firestore) ───────────────────────────────────────────────────
export function initFirebase(serviceAccountJson) {
  if (getApps().length > 0) return;

  if (serviceAccountJson) {
    initializeApp({ credential: cert(serviceAccountJson), projectId: FIREBASE_PROJECT_ID });
    return;
  }

  const serviceAccountPath = path.resolve("service-account.json");
  if (existsSync(serviceAccountPath)) {
    initializeApp({
      credential: cert(JSON.parse(readFileSync(serviceAccountPath, "utf-8"))),
      projectId: FIREBASE_PROJECT_ID,
    });
  } else {
    // Application Default Credentials (ex.: `firebase login` local)
    initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }
}

export function firestore() {
  return getFirestore();
}

// ─── Cloudinary (fotos/vídeo) ───────────────────────────────────────────────
// Upload é feito direto do navegador (unsigned upload preset). O servidor
// só usa a API secret pra apagar assets (Admin API), nunca pra subir.
export function initCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Credenciais do Cloudinary não encontradas. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

// Extrai o public_id de uma secure_url do Cloudinary (inclui a pasta),
// ex: ".../upload/v1699999999/imoveis/abc123/foto1.webp" -> "imoveis/abc123/foto1"
function publicIdFromUrl(url) {
  const m = String(url || "").match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return m ? m[1] : null;
}

// Apaga as fotos + o vídeo de um imóvel no Cloudinary a partir das URLs
// salvas no doc (não de um prefixo de pasta) — funciona mesmo que alguma
// foto tenha sido enviada antes do imóvel ganhar seu id definitivo.
// Chamado ao excluir um imóvel pelo painel, evita lixo consumindo a cota
// grátis.
export async function deletePropertyAssets(urls) {
  const images = [];
  const videos = [];
  for (const url of urls) {
    const publicId = publicIdFromUrl(url);
    if (!publicId) continue;
    if (/\/video\/upload\//.test(url)) videos.push(publicId);
    else images.push(publicId);
  }

  await Promise.all([
    images.length > 0 ? cloudinary.api.delete_resources(images, { resource_type: "image" }).catch(() => null) : null,
    videos.length > 0 ? cloudinary.api.delete_resources(videos, { resource_type: "video" }).catch(() => null) : null,
  ]);
}

// ─── Helpers de texto ───────────────────────────────────────────────────────
export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Gera um slug único pra um título novo, desambiguando com sufixo -2,
// -3... se já existir um imóvel com o mesmo slug (dois títulos parecidos).
export async function generateUniqueSlug(db, title) {
  const base = slugify(title) || "imovel";
  let candidate = base;
  let suffix = 2;
  while ((await db.collection(FIRESTORE_COLLECTION).doc(candidate).get()).exists) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

// Gera o próximo código sequencial do imóvel (ex: "TB-0042") via
// transação atômica — evita corrida entre os dois usuários do painel.
export async function getNextPropertyCode(db) {
  const ref = db.collection(COUNTERS_COLLECTION).doc(COUNTERS_DOC);
  const next = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? snap.data().propertyCode || 0 : 0;
    const value = current + 1;
    tx.set(ref, { propertyCode: value }, { merge: true });
    return value;
  });
  return `TB-${String(next).padStart(4, "0")}`;
}

export async function upsertProperty(property) {
  const db = firestore();
  await db.collection(FIRESTORE_COLLECTION).doc(property.id).set(property, { merge: false });
}

export async function updateProperty(id, patch) {
  const db = firestore();
  await db
    .collection(FIRESTORE_COLLECTION)
    .doc(id)
    .set({ ...patch, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteProperty(id) {
  const db = firestore();
  await db.collection(FIRESTORE_COLLECTION).doc(id).delete();
}

// ─── Geocodificação (mapa da página do imóvel) ─────────────────────────────
// O ponto nunca vem da rua/número (só CEP, bairro, cidade, estado) e nunca é
// exibido como pino exato — sempre um círculo de raio aproximado por cima
// (ver LocationCard.tsx) — mesma regra de privacidade já aplicada ao
// endereço completo (salvo, nunca exibido publicamente). Dentro dessa regra,
// tenta a fonte mais precisa primeiro e vai caindo pra mais genérica:
//   1) CEP (BrasilAPI, gratuita, sem chave) — normalmente o mais preciso.
//   2) bairro + cidade + UF (Nominatim/OpenStreetMap, gratuita, sem chave).
//   3) só cidade + UF — quando o bairro é pequeno demais pra existir no OSM.
const NOMINATIM_USER_AGENT = "tbn-imoveis-site/1.0 (contato: cauan.delimabtu@gmail.com)";

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": NOMINATIM_USER_AGENT } });
  if (!res.ok) return null;
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  const lat = parseFloat(results[0].lat);
  const lng = parseFloat(results[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

// BrasilAPI agrega Correios/ViaCEP/OpenCEP e, quando a fonte tem o dado,
// devolve `location.coordinates` já pronto pro CEP — evita depender só de
// bairro (que o OpenStreetMap às vezes nem tem cadastrado).
async function cepSearch(zipCode) {
  const digits = String(zipCode || "").replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (!res.ok) return null;
    const body = await res.json();
    const coords = body?.location?.coordinates;
    if (!coords) return null;
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function geocodeApproximateLocation({ zipCode, neighborhood, city, state }) {
  if (!zipCode && !neighborhood && !city) return null;

  const byCep = await cepSearch(zipCode).catch(() => null);
  if (byCep) return byCep;

  const withNeighborhood = [neighborhood, city, state ? `${state}, Brasil` : "Brasil"].filter(Boolean).join(", ");
  const cityOnly = [city, state ? `${state}, Brasil` : "Brasil"].filter(Boolean).join(", ");

  try {
    if (neighborhood || city) {
      const result = await nominatimSearch(withNeighborhood);
      if (result) return result;
    }
    if (!city) return null;
    return await nominatimSearch(cityOnly);
  } catch {
    return null;
  }
}
