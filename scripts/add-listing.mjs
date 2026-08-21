// Processa imóveis novos colocados em incoming/ e publica no Firebase.
// Fluxo manual, para o desenvolvedor testar um imóvel localmente antes
// de subir para o Google Drive (onde o sync-drive.mjs pega automaticamente).
//
// Estrutura esperada de cada pasta em incoming/ — ver GUIA-CORRETOR.md:
//
//   incoming/
//     nome-da-pasta/
//       imovel.md              <- título + tags (Tipo, Bairro, Endereço, Valor, Descrição...)
//       capa.jpg                <- foto de capa
//       1 - Entrada.jpg
//       2 - Sala de estar.jpg
//       ...
//
// Depois rode:  npm run add-listing
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  cpSync,
  rmSync,
  statSync,
} from "fs";
import path from "path";
import { setTimeout as sleep } from "timers/promises";

import {
  initFirebase,
  initCloudinary,
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

// Credenciais do Cloudinary em desenvolvimento local: crie um
// ".env.local" (já ignorado pelo git) com CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.
try {
  process.loadEnvFile(".env.local");
} catch {
  // arquivo opcional — em CI as credenciais vêm dos secrets do GitHub
}

const INCOMING_DIR = "incoming";
const PROCESSED_DIR = path.join(INCOMING_DIR, "processed");
const DATA_FILE = "src/data/properties.json";

// OneDrive às vezes trava um arquivo por uma fração de segundo logo após
// ele ser criado (sincronização em andamento). Tenta de novo antes de
// desistir, e cai para copiar+apagar se o "rename" direto não for possível.
async function safeMove(src, dest) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      renameSync(src, dest);
      return;
    } catch (err) {
      if (err.code !== "EPERM" && err.code !== "EBUSY") throw err;
      await sleep(400);
    }
  }
  cpSync(src, dest, { recursive: true });
  rmSync(src, { recursive: true, force: true });
}

async function processListing(folderName) {
  const folderPath = path.join(INCOMING_DIR, folderName);
  const fileNames = readdirSync(folderPath).filter((f) =>
    statSync(path.join(folderPath, f)).isFile()
  );
  const classified = classifyListingFiles(fileNames);

  if (!classified.mdFile) {
    console.log(`✗ ${folderName}: faltando "${MD_FILENAME}" — pulando esta pasta.`);
    return null;
  }
  if (!classified.coverFile && classified.photos.length === 0) {
    console.log(`✗ ${folderName}: nenhuma foto encontrada (nem capa, nem fotos numeradas). Pulando.`);
    return null;
  }
  if (!classified.coverFile) {
    console.log(`  ⚠ ${folderName}: sem arquivo "capa.*" — usando a primeira foto numerada como capa.`);
  }
  if (classified.ignored.length > 0) {
    console.log(`  ⚠ ${folderName}: arquivo(s) ignorado(s) (nome não reconhecido): ${classified.ignored.join(", ")}`);
  }

  const raw = readFileSync(path.join(folderPath, classified.mdFile), "utf-8");
  const parsed = parseListingMarkdown(raw);
  if (!parsed.title) {
    console.log(`✗ ${folderName}: "${MD_FILENAME}" precisa começar com "# Título do imóvel". Pulando.`);
    return null;
  }

  const id = slugify(folderName);
  const tmpDir = makeTempDir(`tbn-listing-${id}-`);

  try {
    console.log(`  ↳ Convertendo e enviando ${1 + classified.photos.length} foto(s)...`);

    const gallery = [];
    const coverEntry = classified.coverFile
      ? await processPhoto({
          input: path.join(folderPath, classified.coverFile),
          id,
          num: "00",
          label: "Capa",
          title: parsed.title,
          tmpDir,
        })
      : null;

    let n = 1;
    const photoEntries = [];
    for (const photo of classified.photos) {
      const num = String(n).padStart(2, "0");
      console.log(`  ↳ ${photo.file} → ${num}`);
      photoEntries.push(
        await processPhoto({
          input: path.join(folderPath, photo.file),
          id,
          num,
          label: photo.label,
          title: parsed.title,
          tmpDir,
        })
      );
      n += 1;
    }

    if (coverEntry) gallery.push(coverEntry);
    else if (photoEntries.length > 0) gallery.push(photoEntries.shift());
    gallery.push(...photoEntries);

    const property = buildPropertyFromMarkdown({ id, parsed, gallery });

    console.log(`  ↳ Salvando no Firestore...`);
    await upsertProperty(property);

    return property;
  } finally {
    cleanupTempDir(tmpDir);
  }
}

async function main() {
  mkdirSync(INCOMING_DIR, { recursive: true });
  mkdirSync(PROCESSED_DIR, { recursive: true });

  const folders = readdirSync(INCOMING_DIR).filter((name) => {
    if (name === "processed") return false;
    return statSync(path.join(INCOMING_DIR, name)).isDirectory();
  });

  if (folders.length === 0) {
    console.log(`Nenhum imóvel novo encontrado em "${INCOMING_DIR}/".`);
    console.log("Crie uma pasta por imóvel ali dentro e rode este comando de novo.");
    return;
  }

  console.log(`\nInicializando Firebase e Cloudinary...`);
  initFirebase();
  initCloudinary();

  console.log(`\nProcessando ${folders.length} pasta(s) em "${INCOMING_DIR}/"...\n`);

  const existing = existsSync(DATA_FILE) ? JSON.parse(readFileSync(DATA_FILE, "utf-8")) : [];

  let changed = false;
  const toArchive = [];

  for (const folderName of folders) {
    console.log(`📁 ${folderName}`);
    const property = await processListing(folderName);
    if (!property) {
      console.log("");
      continue;
    }

    const existingIndex = existing.findIndex((p) => p.id === property.id);
    if (existingIndex >= 0) {
      existing[existingIndex] = property;
      console.log(`✓ ${folderName} → atualizado no Firestore (${property.gallery.length} foto(s))`);
    } else {
      existing.push(property);
      console.log(`✓ ${folderName} → adicionado ao Firestore (${property.gallery.length} foto(s))`);
    }
    changed = true;
    toArchive.push(folderName);
    console.log("");
  }

  if (changed) {
    writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2) + "\n");
    console.log(`📄 ${DATA_FILE} atualizado (fallback local).`);
  }

  for (const folderName of toArchive) {
    try {
      await safeMove(path.join(INCOMING_DIR, folderName), path.join(PROCESSED_DIR, folderName));
    } catch (err) {
      console.log(
        `Aviso: não consegui mover "${folderName}" para incoming/processed/ (${err.code || err.message}). ` +
          "Os dados já foram salvos normalmente — pode mover essa pasta manualmente depois."
      );
    }
  }

  if (changed) {
    console.log("\n✅ Prontinho!");
    console.log("   • Fotos: Firebase Storage");
    console.log("   • Dados: Firestore");
    console.log("   • Fallback local: src/data/properties.json");
    console.log('\nRode "npm run dev" para conferir, ou "npm run publish" para publicar.');
  }
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  process.exit(1);
});
