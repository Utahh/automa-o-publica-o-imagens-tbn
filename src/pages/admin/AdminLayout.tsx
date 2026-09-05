import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { BrandMark } from "../../components/BrandMark";
import { useAuth } from "../../hooks/useAuth";

export function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-cinza-papel">
      <header className="border-b border-grafite/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <BrandMark mode="symbol" className="h-9 w-9" />
            <nav className="flex items-center gap-5">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `font-display text-sm font-medium ${isActive ? "text-azul-escritura" : "text-grafite-muted"}`
                }
              >
                Imóveis
              </NavLink>
              <NavLink
                to="/admin/imoveis/novo"
                className={({ isActive }) =>
                  `font-display text-sm font-medium ${isActive ? "text-azul-escritura" : "text-grafite-muted"}`
                }
              >
                + Novo imóvel
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[12px] text-grafite-muted sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 font-display text-sm font-medium text-grafite-muted transition-colors hover:text-azul-escritura"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
