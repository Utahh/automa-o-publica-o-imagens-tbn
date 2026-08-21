import { Link } from "react-router-dom";
import { LuPhone, LuInstagram, LuMapPin } from "react-icons/lu";
import { agency, broker } from "../data/property";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <img src={agency.logo} alt={`Logo ${agency.name}`} />
          <div>
            <strong>{agency.name}</strong>
            <p>
              {broker.name} · {broker.creci}
            </p>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Navegação</h4>
          <Link to="/#imoveis">Imóveis</Link>
          <Link to="/#sobre">Sobre a {agency.name}</Link>
          <Link to="/#localizacao">Onde atuamos</Link>
        </div>

        <div className={styles.col}>
          <h4>Contato</h4>
          <a href={`tel:${broker.phone.replace(/\D/g, "")}`}>
            <LuPhone /> {broker.phone}
          </a>
          <a
            href={`https://wa.me/${broker.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LuInstagram /> {broker.instagram}
          </a>
          <p className={styles.address}>
            <LuMapPin /> Botucatu/SP e região
          </p>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {new Date().getFullYear()} {agency.name}. Página de exemplo criada para fins de
          demonstração.
        </p>
      </div>
    </footer>
  );
}
