// Sincroniza imóveis do Google Drive para o Firebase. Roda sozinho via
// GitHub Actions (.github/workflows/sync-drive.yml) a cada ~15 minutos.
//
// Estrutura esperada no Drive — ver GUIA-CORRETOR.md:
//
//   <pasta raiz compartilhada com o service account, como Leitor>
//     Casa Rua das Flores/         <- uma pasta por imóvel
//       imovel.md                   <- título + tags (Bairro, Endereço, Valor, Descrição...)
//       capa.jpg                    <- foto de capa
//       1 - Entrada.jpg
//       2 - Sala de estar.jpg
//       PRONTO.txt                  <- arquivo vazio: sinaliza "pode publicar"
//
// Uma pasta só é (re)processada quando tem PRONTO.txt e quando algum
// arquivo dentro dela foi modificado depois da última publicação. O estado
// de "já publicado" fica salvo no Firestore (coleção driveSync), não no
// Drive — assim o service account só precisa de acesso de leitura.
import { GoogleAuth } from "google-auth-library";
import { readFileSync, existsSync } from "fs";

import {
  initFirebase,
  firestore,
  parseListingMarkdown,
  buildPropertyFromMarkdown,
  classifyListingFiles,
  processPhoto,
  upsertProperty,
  slugify,
  makeTempDir,
  cleanupTempDir,
  MD_FILENAME,
} from "./lib/pipeline.mjs";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const SYNC_STATE_COLLECTION = "driveSync";

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

function getRootFolderId() {
  const id = process.env.DRIVE_FOLDER_ID;
  if (!id) throw new Error("Defina a variável de ambiente DRIVE_FOLDER_ID com o ID da pasta raiz do Drive.");
  return id;
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

const FOLDER_MIME = "application/vnd.google-apps.folder";

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

  const latestModified = fileChildren.reduce(
    (max, f) => Math.max(max, new Date(f.modifiedTime).getTime()),
    0
  );

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
  const rootFolderId = getRootFolderId();

  initFirebase(serviceAccount);

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = new DriveClient(auth);

  console.log(`Lendo pasta raiz do Drive (${rootFolderId})...`);
  const children = await drive.listChildren(rootFolderId);
  const folders = children.filter((f) => f.mimeType === FOLDER_MIME);

  if (folders.length === 0) {
    console.log("Nenhuma pasta de imóvel encontrada na pasta raiz do Drive.");
    return;
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

  console.log("✅ Sincronização concluída.");
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  process.exit(1);
});
