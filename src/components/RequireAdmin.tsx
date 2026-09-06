import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/** Protege as rotas /admin — redireciona pro login se ninguém estiver
 *  logado, ou se a conta logada não tiver a claim de admin (ex: alguém
 *  entrou com uma conta do Google que não é a do Cauan/Toninho). Isso é
 *  só UX: a autorização de verdade mora no backend
 *  (ALLOWED_ADMIN_EMAILS) e nas regras do Firestore (custom claim). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location, denied: true }} />;

  return <>{children}</>;
}
