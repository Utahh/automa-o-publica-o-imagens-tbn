// Núcleo compartilhado da ingestão de imóveis: parsing do imovel.md,
// classificação dos arquivos da pasta, conversão/upload de fotos e
// upsert no Firestore. Usado tanto por add-listing.mjs (pasta local,
// fluxo manual do desenvolvedor) quanto por sync-drive.mjs (Google
// Drive, fluxo automático via GitHub Actions).
//
// Fotos ficam no Cloudinary (não no Firebase Storage — desde fev/2026 o
// Storage do Firebase exige o plano pago Blaze mesmo dentro da cota
// grátis; o Cloudinary tem plano grátis real, sem cartão). Os dados do
// imóvel continuam no Firestore (plano Spark, grátis, não afetado).
//
// Ver docs/ARQUITETURA.md e GUIA-CORRETOR.md para o contrato de pastas.
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";

// Firebase Admin SDK (só Firestore)
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const FIREBASE_PROJECT_ID = "tbn-imoveis-site";
export const FIRESTORE_COLLECTION = "imoveis";
export const CLOUDINARY_FOLDER = "imoveis";

export const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
export const MD_FILENAME = "imovel.md";
export const COVER_BASENAME = "capa";
export const READY_MARKER = "PRONTO.txt";

const MAX_WIDTH = 1920;
const QUALITY = 78;

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

// ─── Cloudinary (fotos) ─────────────────────────────────────────────────────
// Credenciais via variáveis de ambiente: CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (GitHub Secrets em produção,
// .env.local em desenvolvimento — ver GUIA-CORRETOR.md / ARQUITETURA.md).
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

// ─── Helpers de texto ───────────────────────────────────────────────────────
export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(raw) {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// "R$ 480.000,00" | "480.000" | "480000" -> 480000
export function parseMoney(raw) {
  if (!raw) return 0;
  let s = String(raw).replace(/[^\d.,]/g, "");
  if (!s) return 0;
  s = s.replace(/[.,]\d{2}$/, ""); // descarta centavos, se houver
  s = s.replace(/[.,]/g, ""); // remove separador de milhar
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

// "1 - Entrada.jpg" -> { order: 1, label: "Entrada" }
export function parsePhotoName(filename) {
  const base = filename.replace(/\.[^/.]+$/, "");
  const match = base.match(/^(\d+)\s*[-–—_.]*\s*(.*)$/);
  if (match && match[2]) {
    return { order: parseInt(match[1], 10), label: match[2].trim() };
  }
  return { order: null, label: base.trim() };
}

// ─── imovel.md ──────────────────────────────────────────────────────────────
// Formato (ver GUIA-CORRETOR.md para o modelo completo):
//
//   # Título do imóvel
//
//   ## Tipo
//   Casa | Apartamento | Cobertura | Sobrado
//
//   ## Negócio
//   Venda | Aluguel
//
//   ## Bairro
//   Jardim das Acácias
//
//   ## Endereço
//   Rua das Flores, 123 - Botucatu/SP
//
//   ## Valor
//   R$ 480.000
//
//   ## Descrição
//   Texto livre, pode ter vários parágrafos.
//
//   ## O que só quem mora perto sabe
//   Uma informação de bairro que só o corretor saberia.
//
// Seções extras opcionais: Status (Disponível/Em negociação, padrão
// Disponível), Quartos, Banheiros, Vagas, Área, Destaque (Sim/Não).
const VALID_TYPES = ["Casa", "Apartamento", "Cobertura", "Sobrado"];

export function parseListingMarkdown(raw) {
  const lines = raw.replace(/\r\n/g, "\n").trim().split("\n");

  let title = "";
  if (lines[0]?.startsWith("# ")) {
    title = lines.shift().slice(2).trim();
  }

  const body = lines.join("\n");
  const sections = {};
  const chunks = body.split(/\n(?=##\s+)/);
  for (const chunk of chunks) {
    const m = chunk.match(/^##\s+(.+?)\s*\n([\s\S]*)$/);
    if (!m) continue;
    sections[normalizeKey(m[1])] = m[2].trim();
  }

  const description = (sections.descricao || "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return {
    title,
    tipo: sections.tipo || "",
    negocio: sections.negocio || "",
    status: sections.status || "",
    bairro: sections.bairro || "",
    endereco: sections.endereco || "",
    valor: sections.valor || "",
    description,
    neighborhoodFact: sections["o que so quem mora perto sabe"] || "",
    quartos: sections.quartos || "",
    banheiros: sections.banheiros || "",
    vagas: sections.vagas || "",
    area: sections.area || "",
    destaque: sections.destaque || "",
  };
}

function parseInt0(raw) {
  const n = parseInt(String(raw || "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseBoolPt(raw) {
  return /^(sim|s|yes|true|1)$/i.test(String(raw || "").trim());
}

// Monta o objeto final salvo no Firestore a partir do markdown já parseado.
// Formato alinhado ao tipo `Property` do frontend (src/types.ts).
export function buildPropertyFromMarkdown({ id, parsed, gallery }) {
  const type = VALID_TYPES.includes(parsed.tipo) ? parsed.tipo : "Casa";
  const dealType = /alug/i.test(parsed.negocio) ? "Aluguel" : "Venda";
  const status = /negocia/i.test(parsed.status) ? "Em negociação" : "Disponível";

  // Bairro/cidade/estado aparecem publicamente no site; o endereço completo
  // fica salvo no banco (uso interno/CRM) mas não é exibido na página do
  // imóvel — é prática comum no mercado imobiliário evitar publicar o
  // endereço exato antes do contato com o corretor.
  const cityState = parseCityState(parsed.endereco);

  const galleryUrls = gallery.map((g) => g.src);

  return {
    id,
    slug: id,
    title: parsed.title || "Imóvel sem título",
    type,
    dealType,
    status,
    neighborhood: parsed.bairro || "",
    street: parsed.endereco || "",
    city: cityState.city,
    state: cityState.state,
    price: parseMoney(parsed.valor),
    areaM2: parseInt0(parsed.area),
    bedrooms: parseInt0(parsed.quartos),
    bathrooms: parseInt0(parsed.banheiros),
    parking: parseInt0(parsed.vagas),
    featured: parseBoolPt(parsed.destaque),
    neighborhoodFact: parsed.neighborhoodFact || "",
    description: parsed.description,
    cover: galleryUrls[0] || "",
    gallery: galleryUrls,
    updatedAt: new Date().toISOString(),
  };
}

function parseCityState(endereco) {
  // Tenta extrair "Cidade/UF" do final do endereço, ex:
  // "Rua das Flores, 123 - Botucatu/SP"
  const m = (endereco || "").match(/([\p{L}\s]+)\/([A-Za-z]{2})\s*$/u);
  if (m) return { city: m[1].trim(), state: m[2].toUpperCase() };
  return { city: "Botucatu", state: "SP" };
}

// ─── Classificação dos arquivos de uma pasta de imóvel ─────────────────────
// Recebe só os nomes dos arquivos (a leitura do conteúdo é feita pelo
// chamador, que sabe se a fonte é o disco local ou o Google Drive).
export function classifyListingFiles(fileNames) {
  const result = {
    mdFile: null,
    coverFile: null,
    readyFile: null,
    photos: [], // { file, order, label }
    ignored: [],
  };

  for (const name of fileNames) {
    const ext = path.extname(name).toLowerCase();
    // Sem extensão reconhecida, o nome inteiro é a "base" — cobre o caso de
    // alguém subir a capa como um arquivo chamado só "Capa", sem .jpg/.png.
    const base = IMAGE_EXT.includes(ext) ? path.basename(name, ext) : name;

    if (name === MD_FILENAME) {
      result.mdFile = name;
      continue;
    }
    if (name === READY_MARKER) {
      result.readyFile = name;
      continue;
    }
    // A capa é reconhecida pelo nome, com ou sem extensão de imagem —
    // checa isso antes de descartar por extensão desconhecida.
    if (base.toLowerCase() === COVER_BASENAME) {
      result.coverFile = name;
      continue;
    }
    if (!IMAGE_EXT.includes(ext)) {
      result.ignored.push(name);
      continue;
    }
    const { order, label } = parsePhotoName(name);
    if (order === null) {
      result.ignored.push(name);
      continue;
    }
    result.photos.push({ file: name, order, label });
  }

  result.photos.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));
  return result;
}

// ─── Processamento e upload de imagens ─────────────────────────────────────
// `input` pode ser um caminho de arquivo (string) ou um Buffer.
export async function convertToWebp(input, outFilePath) {
  await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outFilePath);
}

export async function uploadToCloudinary(localPath, publicId) {
  const result = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
}

// Diretório temporário isolado para conversão de imagens de uma execução.
export function makeTempDir(prefix) {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

export function cleanupTempDir(dir) {
  rmSync(dir, { recursive: true, force: true });
}

// Converte, faz upload e devolve a entrada de galeria de uma foto.
export async function processPhoto({ input, id, num, label, title, tmpDir }) {
  const labelSlug = slugify(label) || `foto-${num}`;
  const outFile = `${num}-${labelSlug}.webp`;
  const localPath = path.join(tmpDir, outFile);

  await convertToWebp(input, localPath);
  const publicId = `${CLOUDINARY_FOLDER}/${id}/${num}-${labelSlug}`;
  const src = await uploadToCloudinary(localPath, publicId);

  return {
    src,
    alt: label ? `${title} - ${label}` : title,
    caption: label,
  };
}

export async function upsertProperty(property) {
  const db = firestore();
  await db.collection(FIRESTORE_COLLECTION).doc(property.id).set(property);
}
