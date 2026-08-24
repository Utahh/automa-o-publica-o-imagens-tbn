import { NavLink } from "react-router-dom";
import { Home, Building2, MessageCircle, Info } from "lucide-react";
import clsx from "clsx";
import { buildWhatsappLink } from "../data/agent";

const tabs = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/imoveis", label: "Imóveis", icon: Building2, end: false },
  { to: "/#sobre", label: "Sobre", icon: Info, end: false },
];

export function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-grafite/10 bg-cinza-papel/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex flex-col items-center gap-1 py-2.5 font-display text-[11px] font-medium transition-colors",
                isActive ? "text-azul-escritura" : "text-grafite-muted",
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2.1} />
            {label}
          </NavLink>
        ))}
        <a
          href={buildWhatsappLink("Olá, Toninho! Vi o site e queria saber mais sobre um imóvel.")}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 font-display text-[11px] font-medium text-grafite-muted transition-colors active:text-azul-escritura"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2.1} />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
