// Cliente das funções serverless de escrita (api/properties/*.mjs) — a
// única forma de criar/editar/excluir imóvel, já que o Firestore só
// aceita escrita via Admin SDK (ver firestore.rules). Cada chamada leva
// o ID token do Firebase Auth da sessão atual; quem decide se esse
// e-mail pode escrever é o backend (ALLOWED_ADMIN_EMAILS), não o cliente.
import { auth } from "./firebase";
import type { Property } from "../types";

async function authedFetch(path: string, init: RequestInit) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sessão expirada. Faça login de novo.");
  const token = await user.getIdToken();

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro inesperado (${res.status}).`);
  }

  return res.json();
}

export type NewPropertyInput = Omit<Property, "id" | "slug" | "code" | "updatedAt">;

export async function createProperty(data: NewPropertyInput): Promise<Property> {
  return authedFetch("/api/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id: string, patch: Partial<Property>): Promise<Property> {
  return authedFetch(`/api/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function deleteProperty(id: string): Promise<void> {
  await authedFetch(`/api/properties/${id}`, { method: "DELETE" });
}
