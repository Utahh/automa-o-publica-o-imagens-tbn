// Migração única: prepara os imóveis já publicados pelo fluxo antigo
// (Google Drive) pro painel novo — atribui um `code` sequencial (ex:
// "TB-0001") pra quem ainda não tem, e marca `published: true` (já que
// tudo que veio do Drive estava, por definição, no ar). Roda uma vez só,
// localmente, com um `service-account.json` válido na raiz do projeto.
//
//   npm run migrate-admin-fields
import { initFirebase, firestore, getNextPropertyCode, FIRESTORE_COLLECTION } from "./lib/pipeline.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // arquivo opcional
}

async function main() {
  initFirebase();
  const db = firestore();

  const snapshot = await db.collection(FIRESTORE_COLLECTION).orderBy("updatedAt", "asc").get();
  if (snapshot.empty) {
    console.log("Nenhum imóvel encontrado — nada pra migrar.");
    return;
  }

  console.log(`Encontrados ${snapshot.size} imóvel(is). Verificando...\n`);

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const patch = {};

    if (!data.code) {
      patch.code = await getNextPropertyCode(db);
    }
    if (data.published === undefined) {
      patch.published = true;
    }

    if (Object.keys(patch).length === 0) {
      console.log(`= ${doc.id}: já está com os campos novos, pulando.`);
      continue;
    }

    await doc.ref.set(patch, { merge: true });
    console.log(`✓ ${doc.id}: ${JSON.stringify(patch)}`);
    updated += 1;
  }

  console.log(`\n✅ Migração concluída — ${updated} imóvel(is) atualizado(s).`);
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  process.exit(1);
});
