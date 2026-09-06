// Concede a custom claim `admin: true` pras contas autorizadas a entrar
// no painel (ALLOWED_ADMIN_EMAILS) — é essa claim que as regras do
// Firestore usam pra decidir quem pode ler um rascunho (ver
// firestore.rules). Sem isso, como o login por conta do Google aceita
// qualquer conta, não teria como diferenciar "alguém autenticado" de
// "Cauan/Toninho autenticados".
//
// Rode uma vez pra cada pessoa, depois que ela já tiver entrado pelo
// menos uma vez no painel (e-mail/senha criado no console, ou primeiro
// login com o Google — os dois já criam o registro no Firebase Auth):
//
//   npm run set-admin-claims
//
// Depois de rodar, a pessoa precisa sair e entrar de novo no painel
// (ou esperar até 1h) pra claim valer — o app já força atualizar o
// token no login (ver src/hooks/useAuth.tsx), então normalmente nem
// precisa fazer nada.
import { getAuth } from "firebase-admin/auth";
import { initFirebase } from "./lib/pipeline.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // arquivo opcional
}

async function main() {
  initFirebase();

  const emails = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (emails.length === 0) {
    console.log(
      'Defina ALLOWED_ADMIN_EMAILS (em ".env.local" ou nas env vars) com os e-mails autorizados, separados por vírgula.'
    );
    return;
  }

  for (const email of emails) {
    try {
      const user = await getAuth().getUserByEmail(email);
      await getAuth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`✓ ${email}: acesso de admin concedido.`);
    } catch (err) {
      console.log(
        `✗ ${email}: ${err.message || err} — essa pessoa já entrou pelo menos uma vez no painel (e-mail/senha ou Google)?`
      );
    }
  }
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message || err);
  process.exit(1);
});
