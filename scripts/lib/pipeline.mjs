// Núcleo compartilhado da ingestão de imóveis: parsing do imovel.md,
// classificação dos arquivos da pasta, conversão/upload de fotos e
// upsert no Firestore. Usado tanto por add-listing.mjs (pasta local,
// fluxo manual do desenvolvedor) quanto por sync-drive.mjs (Google
// Drive, fluxo automático via GitHub Actions).
//
// Ver docs/ARQUITETURA.md e GUIA-CORRETOR.md para o contrato de pastas.
import sharp from "sharp";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";

// Firebase Admin SDK
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export const FIREBASE_PROJECT_ID = "tbn-imoveis-site";
export const FIREBASE_STORAGE_BUCKET = "tbn-imoveis-site.firebasestorage.app";
export const FIRESTORE_COLLECTION = "imoveis";

export const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp"];
export const MD_FILENAME = "imovel.md";
export const COVER_BASENAME = "capa";
export const READY_MARKER = "PRONTO.txt";

const MAX_WIDTH = 1920;
const QUALITY = 78;

// ─── Firebase ───────────────────────────────────────────────────────────────
export function initFirebase(serviceAccountJson) {
  if (getApps().length > 0) return;

  if (serviceAccountJson) {
    initializeApp({
      credential: cert(serviceAccountJson),
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
    });
    return;
  }

  const serviceAccountPath = path.resolve("service-account.json");
  if (existsSync(serviceAccountPath)) {
    initializeApp({
      credential: cert(JSON.parse(readFileSync(serviceAccountPath, "utf-8"))),
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Application Default Credentials (ex.: `firebase login` local)
    initializeApp({
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
    });
  }
}

export function firestore() {
  return getFirestore();
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
//   Venda
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
// Seções extras opcionais: Quartos, Banheiros, Vagas, Área, Comodidades.
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
    bairro: sections.bairro || "",
    endereco: sections.endereco || "",
    valor: sections.valor || "",
    description,
    quartos: sections.quartos || "",
    banheiros: sections.banheiros || "",
    vagas: sections.vagas || "",
    area: sections.area || "",
    comodidades: sections.comodidades || "",
  };
}

// Monta o objeto final salvo no Firestore a partir do markdown já parseado.
export function buildPropertyFromMarkdown({ id, parsed, gallery }) {
  const dealType = /alug/i.test(parsed.tipo) ? "Aluguel" : "Venda";

  const specs = [];
  if (parsed.quartos) specs.push({ label: "Quartos", value: parsed.quartos, icon: "bed" });
  if (parsed.banheiros) specs.push({ label: "Banheiros", value: parsed.banheiros, icon: "bath" });
  if (parsed.vagas) specs.push({ label: "Vagas", value: parsed.vagas, icon: "car" });
  if (parsed.area) specs.push({ label: "Área construída", value: parsed.area, icon: "ruler" });

  const amenities = parsed.comodidades
    ? parsed.comodidades.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Bairro/cidade/estado aparecem publicamente no site; o endereço completo
  // fica salvo no banco (uso interno/CRM) mas não é exibido na página do
  // imóvel — é prática comum no mercado imobiliário evitar publicar o
  // endereço exato antes do contato com o corretor.
  const cityState = parseCityState(parsed.endereco);

  return {
    id,
    title: parsed.title || "Imóvel sem título",
    dealType,
    price: parseMoney(parsed.valor),
    address: {
      neighborhood: parsed.bairro || "",
      street: parsed.endereco || "",
      city: cityState.city,
      state: cityState.state,
    },
    description: parsed.description,
    specs,
    amenities,
    gallery,
    coverUrl: gallery[0]?.src || "",
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
    const base = path.basename(name, ext);

    if (name === MD_FILENAME) {
      result.mdFile = name;
      continue;
    }
    if (name === READY_MARKER) {
      result.readyFile = name;
      continue;
    }
    if (!IMAGE_EXT.includes(ext)) {
      result.ignored.push(name);
      continue;
    }
    if (base.toLowerCase() === COVER_BASENAME) {
      result.coverFile = name;
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

export async function uploadToStorage(localPath, storagePath) {
  const bucket = getStorage().bucket();
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { contentType: "image/webp" },
    predefinedAcl: "publicRead",
  });
  return `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/${storagePath}`;
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
  const storagePath = `imoveis/${id}/${outFile}`;
  const src = await uploadToStorage(localPath, storagePath);

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
