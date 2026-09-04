// Sincroniza imóveis do Google Drive para o Firebase. Roda sozinho via
// GitHub Actions (a cada 5 min de verdade, via cron-job.org — ver
// docs/ARQUITETURA.md, o `schedule` nativo do GitHub atrasa demais).
//
// Duas pastas no Drive são lidas em pé de igualdade — ver GUIA-CORRETOR.md:
//
//   "Envio" (DRIVE_ENVIO_FOLDER_ID, admin organiza aqui)
//   "Casas - Site" (DRIVE_FOLDER_ID, corretor também cria pasta aqui direto)
//
// O robô procura pastas de imóvel nas DUAS e publica dali mesmo — não
// copia nada de uma pra outra. (Tentamos copiar via service account, mas
// o Google bloqueia: "Service Accounts do not have storage quota" — só
// funciona em Shared Drives do Workspace, que é pago. Ler as duas
// diretamente resolve o mesmo problema sem esse custo.)
//
// Uma pasta só é (re)processada quando tem PRONTO.txt e algo dentro dela
// mudou desde a última publicação — estado em Firestore (coleção
// driveSync), não no Drive, então o service account só precisa de acesso
// de LEITURA nas duas pastas.
//
// findDuplicate() (scripts/lib/pipeline.mjs) é quem evita que a mesma
// pasta criada nas duas pastas-fonte publique como dois imóveis.
import { GoogleAuth } from "google-auth-library";
import { readFileSync, existsSync } from "fs";

import {
  initFirebase,
  initCloudinary,
  firestore,
  parseListingMarkdown,
  buildPropertyFromMarkdown,
  classifyListingFiles,
  processPhoto,
  upsertProperty,
  findDuplicate,
  slugify,
  makeTempDir,
  cleanupTempDir,
  MD_FILENAME,
} from "./lib/pipeline.mjs";

// Permite testar este script localmente com um ".env.local" (ignorado
// pelo git). No GitHub Actions as credenciais vêm dos secrets/vars.
try {
  process.loadEnvFile(".env.local");
} catch {
  // arquivo opcional
}

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const SYNC_STATE_COLLECTION = "driveSync";
const FOLDER_MIME = "application/vnd.google-apps.folder";

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  const localPath = "service-account.json";
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8"));
  }
  throw new Error(
    "Credenciais não encontradas. Defina FIREBASE_SERVICE_ACCOUNT_JSON (CI) ou crie service-account.json (local)."
  );
}

// Duas pastas-fonte, lidas em pé de igualdade. DRIVE_ENVIO_FOLDER_ID é
// opcional — sem ela, o robô só lê DRIVE_FOLDER_ID.
function getSourceFolders() {
  const sources = [];
  if (process.env.DRIVE_FOLDER_ID) sources.push({ label: "Casas - Site", id: process.env.DRIVE_FOLDER_ID });
  if (process.env.DRIVE_ENVIO_FOLDER_ID) sources.push({ label: "Envio", id: process.env.DRIVE_ENVIO_FOLDER_ID });
  if (sources.length === 0) {
    throw new Error("Defina DRIVE_FOLDER_ID (e opcionalmente DRIVE_ENVIO_FOLDER_ID) com o(s) ID(s) da(s) pasta(s) do Drive.");
  }
  return sources;
}

// ─── Cliente Drive (REST, sem depender do pacote googleapis inteiro) ───────
class DriveClient {
  constructor(auth) {
    this.auth = auth;
  }

  async token() {
    const client = await this.auth.getClient();
    const { token } = await client.getAccessToken();
    return token;
  }

  async listChildren(folderId) {
    const token = await this.token();
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime)");
    const url = `${DRIVE_API}/files?q=${q}&fields=${fields}&pageSize=1000`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Drive list falhou (${res.status}): ${await res.text()}`);
    const data = await res.json();
    return data.files || [];
  }

  async downloadText(fileId) {
    const buf = await this.downloadBuffer(fileId);
    return buf.toString("utf-8");
  }

  async downloadBuffer(fileId) {
    const token = await this.token();
    const url = `${DRIVE_API}/files/${fileId}?alt=media`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Drive download falhou (${res.status}): ${await res.text()}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

async function getSyncState(folderId) {
  const snap = await firestore().collection(SYNC_STATE_COLLECTION).doc(folderId).get();
  return snap.exists ? snap.data() : null;
}

async function saveSyncState(folderId, { propertyId, latestModified }) {
  await firestore().collection(SYNC_STATE_COLLECTION).doc(folderId).set({
    propertyId,
    latestModified,
    publishedAt: new Date().toISOString(),
  });
}

function computeLatestModified(fileChildren) {
  return fileChildren.reduce((max, f) => Math.max(max, new Date(f.modifiedTime).getTime()), 0);
}

async function processDriveFolder(drive, folder) {
  const children = await drive.listChildren(folder.id);
  const fileChildren = children.filter((f) => f.mimeType !== FOLDER_MIME);
  const classified = classifyListingFiles(fileChildren.map((f) => f.name));

  if (!classified.readyFile) {
    console.log(`⏳ ${folder.name}: ainda sem PRONTO.txt — aguardando.`);
    return;
  }
  if (!classified.mdFile) {
    console.log(`✗ ${folder.name}: faltando "${MD_FILENAME}" — pulando.`);
    return;
  }
  if (!classified.coverFile && classified.photos.length === 0) {
    console.log(`✗ ${folder.name}: nenhuma foto encontrada. Pulando.`);
    return;
  }

  const latestModified = computeLatestModified(fileChildren);

  const state = await getSyncState(folder.id);
  if (state && state.latestModified >= latestModified) {
    console.log(`= ${folder.name}: sem mudanças desde a última publicação.`);
    return;
  }

  if (!classified.coverFile) {
    console.log(`  ⚠ ${folder.name}: sem arquivo "capa.*" — usando a primeira foto numerada como capa.`);
  }
  if (classified.ignored.length > 0) {
    console.log(`  ⚠ ${folder.name}: arquivo(s) ignorado(s) (nome não reconhecido): ${classified.ignored.join(", ")}`);
  }

  const byName = new Map(fileChildren.map((f) => [f.name, f]));
  const mdRaw = await drive.downloadText(byName.get(classified.mdFile).id);
  const parsed = parseListingMarkdown(mdRaw);
  if (!parsed.title) {
    console.log(`✗ ${folder.name}: "${MD_FILENAME}" precisa começar com "# Título do imóvel". Pulando.`);
    return;
  }

  const id = slugify(folder.name);

  const duplicate = await findDuplicate({ id, title: parsed.title, sourceFolderId: folder.id });
  if (duplicate) {
    console.log(`🚫 ${folder.name}: possível duplicidade — ${duplicate.message}. Publicação cancelada.`);
    console.log(`   Renomeie uma das duas pastas no Drive (ou apague a que não deve existir) e rode de novo.`);
    return;
  }

  const tmpDir = makeTempDir(`tbn-drive-${id}-`);

  try {
    console.log(`  ↳ Convertendo e enviando ${1 + classified.photos.length} foto(s)...`);

    let coverEntry = null;
    if (classified.coverFile) {
      const buf = await drive.downloadBuffer(byName.get(classified.coverFile).id);
      coverEntry = await processPhoto({
        input: buf,
        id,
        num: "00",
        label: "Capa",
        title: parsed.title,
        tmpDir,
      });
    }

    const photoEntries = [];
    let n = 1;
    for (const photo of classified.photos) {
      const num = String(n).padStart(2, "0");
      console.log(`  ↳ ${photo.file} → ${num}`);
      const buf = await drive.downloadBuffer(byName.get(photo.file).id);
      photoEntries.push(
        await processPhoto({ input: buf, id, num, label: photo.label, title: parsed.title, tmpDir })
      );
      n += 1;
    }

    const gallery = [];
    if (coverEntry) gallery.push(coverEntry);
    else if (photoEntries.length > 0) gallery.push(photoEntries.shift());
    gallery.push(...photoEntries);

    const property = buildPropertyFromMarkdown({ id, parsed, gallery });

    console.log(`  ↳ Salvando no Firestore...`);
    await upsertProperty(property);
    await saveSyncState(folder.id, { propertyId: id, latestModified });

    console.log(`✓ ${folder.name} → publicado (${gallery.length} foto(s)).`);
  } finally {
    cleanupTempDir(tmpDir);
  }
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const sources = getSourceFolders();

  initFirebase(serviceAccount);
  initCloudinary();

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = new DriveClient(auth);

  for (const source of sources) {
    console.log(`\n=== Lendo pasta "${source.label}" (${source.id}) ===`);
    const children = await drive.listChildren(source.id);
    const folders = children.filter((f) => f.mimeType === FOLDER_MIME);

    if (folders.length === 0) {
      console.log(`Nenhuma pasta de imóvel encontrada em "${source.label}".`);
      continue;
    }

    console.log(`Encontradas ${folders.length} pasta(s) de imóvel.\n`);

    for (const folder of folders) {
      console.log(`📁 ${folder.name}`);
      try {
        await processDriveFolder(drive, folder);
      } catch (err) {
        console.error(`✗ ${folder.name}: erro inesperado — ${err.message || err}`);
      }
      console.log("");
    }
  }

  console.log("✅ Sincronização concluída.");
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  process.exit(1);
});
