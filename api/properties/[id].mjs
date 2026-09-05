// PUT /api/properties/:id     — edição parcial (inclui toggle de
//                                Destaque e publicar/despublicar: tudo é
//                                só um patch no mesmo doc).
// DELETE /api/properties/:id  — remove o imóvel e limpa as fotos/vídeo
//                                dele no Cloudinary.
import { requireAdmin } from "../_lib/auth.mjs";
import {
  deleteProperty,
  deletePropertyAssets,
  firestore,
  FIRESTORE_COLLECTION,
  initCloudinary,
  updateProperty,
} from "../../scripts/lib/pipeline.mjs";

const IMMUTABLE_FIELDS = ["id", "slug", "code", "updatedAt"];

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: "Id do imóvel não informado." });
    return;
  }

  if (req.method === "PUT") {
    const patch = { ...(req.body || {}) };
    for (const field of IMMUTABLE_FIELDS) delete patch[field];

    if (Array.isArray(patch.gallery) && patch.gallery.length > 0) {
      patch.cover = patch.gallery[0];
    }
    if (Array.isArray(patch.description) === false && patch.description !== undefined) {
      patch.description = String(patch.description)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    }

    await updateProperty(id, patch);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === "DELETE") {
    try {
      const snap = await firestore().collection(FIRESTORE_COLLECTION).doc(id).get();
      if (snap.exists) {
        const data = snap.data();
        initCloudinary();
        await deletePropertyAssets([...(data.gallery || []), data.video].filter(Boolean));
      }
    } catch (err) {
      console.error(`Falha ao apagar assets do Cloudinary pra "${id}":`, err.message || err);
    }
    await deleteProperty(id);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Método não permitido." });
}
