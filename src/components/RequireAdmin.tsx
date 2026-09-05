import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/** Protege as rotas /admin — redireciona pro login se ninguém estiver logado.
 *  Isso é só UX: a autorização de verdade mora no backend (ALLOWED_ADMIN_EMAILS). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location }} />;

  return <>{children}</>;
}
