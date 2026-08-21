import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { agency, broker } from "../data/property";
import styles from "./Navbar.module.css";

const links = [
  { href: "/#imoveis", label: "Imóveis" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#localizacao", label: "Localização" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = () => setOpen(false);

  return (
    <motion.header
      className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img src={agency.logo} alt={`Logo ${agency.name}`} />
          <span>
            {agency.name}
            <small>{broker.name}</small>
          </span>
        </Link>

        <nav className={styles.links}>
          {links.map((link) => (
            <Link key={link.href} to={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            href={`https://wa.me/${broker.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Falar com corretor
          </a>
        </div>

        <button
          className={styles.burger}
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={open ? styles.burgerOpen : ""} />
        </button>
      </div>

      <motion.nav
        className={styles.mobileMenu}
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {links.map((link) => (
          <Link key={link.href} to={link.href} onClick={handleLinkClick}>
            {link.label}
          </Link>
        ))}
        <a
          href={`https://wa.me/${broker.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          onClick={handleLinkClick}
        >
          Falar com corretor
        </a>
      </motion.nav>
    </motion.header>
  );
}
