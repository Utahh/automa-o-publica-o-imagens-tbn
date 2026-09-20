import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { BrandMark } from "../../components/BrandMark";
import { useAuth } from "../../hooks/useAuth";
import { useInactivityLogout } from "../../hooks/useInactivityLogout";

const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

const NAV_ITEMS = [
  { to: "/admin", label: "Painel", end: true },
  { to: "/admin/imoveis", label: "Imóveis", end: false },
  { to: "/admin/imoveis/novo", label: "+ Novo imóvel", end: true },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // "Imóveis" fica ativo na lista e na edição, mas não no cadastro novo
  // (que tem o próprio item no menu).
  function isActive(item: (typeof NAV_ITEMS)[number], routerActive: boolean) {
    if (item.to === "/admin/imoveis") return pathname.startsWith("/admin/imoveis") && pathname !== "/admin/imoveis/novo";
    return routerActive;
  }

  useInactivityLogout(SESSION_TIMEOUT_MS, () => {
    signOut();
    navigate("/login", { replace: true, state: { expired: true } });
  });

  return (
    <div className="min-h-screen bg-cinza-papel">
      <header className="border-b border-grafite/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <BrandMark mode="symbol" className="h-9 w-9" />
            <nav className="flex items-center gap-5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive: routerActive }) =>
                    `font-display text-sm font-medium ${isActive(item, routerActive) ? "text-azul-escritura" : "text-grafite-muted"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
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
