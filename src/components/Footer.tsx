import { Link } from "react-router-dom";
import { AtSign, Mail, Phone } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { agent } from "../data/agent";

export function Footer() {
  return (
    <footer id="contato" className="bg-grafite-noite pb-16 pt-16 text-cinza-papel">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center">
            <BrandMark mode="wordmark" variant="negativo" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-sm font-display text-sm leading-relaxed text-papel-muted">
            {agent.bio}
          </p>
          <p className="mt-5 font-mono text-xs tracking-wide text-papel-muted">{agent.creci}</p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-papel-muted">Navegar</h3>
          <ul className="mt-4 space-y-2.5 font-display text-sm">
            <li><Link to="/" className="text-cinza-papel/85 transition-colors hover:text-azul-sinal">Início</Link></li>
            <li><Link to="/imoveis" className="text-cinza-papel/85 transition-colors hover:text-azul-sinal">Imóveis</Link></li>
            <li><a href="/#sobre" className="text-cinza-papel/85 transition-colors hover:text-azul-sinal">Sobre o Toninho</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-papel-muted">Contato</h3>
          <ul className="mt-4 space-y-3 font-mono text-sm">
            <li>
              <a href={`https://wa.me/${agent.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cinza-papel/85 transition-colors hover:text-azul-sinal">
                <Phone className="h-4 w-4 shrink-0" /> {agent.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-cinza-papel/85 transition-colors hover:text-azul-sinal">
                <Mail className="h-4 w-4 shrink-0" /> {agent.email}
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${agent.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cinza-papel/85 transition-colors hover:text-azul-sinal">
                <AtSign className="h-4 w-4 shrink-0" /> {agent.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-cinza-papel/10 px-6 pt-6 sm:px-8">
        <p className="font-mono text-[11px] text-papel-muted">
          © {new Date().getFullYear()} Toninho Bomnome · {agent.creci}
        </p>
      </div>
    </footer>
  );
}
