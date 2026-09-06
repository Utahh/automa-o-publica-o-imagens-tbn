import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { BrandMark } from "./BrandMark";
import { WhatsAppButton } from "./WhatsAppButton";
import { useScrolled } from "../hooks/useScrolled";

const links = [
  { to: "/", label: "Início" },
  { to: "/imoveis", label: "Imóveis" },
  { to: "/#sobre", label: "Sobre" },
  { to: "/#contato", label: "Contato" },
];

interface NavbarProps {
  transparentAtTop?: boolean;
}

export function Navbar({ transparentAtTop = false }: NavbarProps) {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const solid = !transparentAtTop || scrolled || open;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "bg-grafite-noite/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(239,240,241,0.08)]" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
          <BrandMark mode="symbol" variant="negativo" className="h-10 w-10 shrink-0 sm:hidden" />
          <BrandMark mode="wordmark" variant="negativo" className="hidden h-9 w-auto sm:block" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "font-display text-sm font-medium tracking-tight text-papel-muted transition-colors hover:text-cinza-papel",
                  isActive && link.to === "/imoveis" && "text-cinza-papel",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <WhatsAppButton variant="solid" label="WhatsApp" className="px-5 py-2.5 text-[13px]" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-cinza-papel [touch-action:manipulation] md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-cinza-papel/10 bg-grafite-noite md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 font-display text-base font-medium text-cinza-papel/90 active:bg-cinza-papel/5"
                >
                  {link.label}
                </NavLink>
              ))}
              <WhatsAppButton className="mt-2 w-full justify-center" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
